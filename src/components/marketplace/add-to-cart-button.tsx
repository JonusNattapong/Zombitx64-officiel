'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  productType: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName,
  price,
  productType
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/marketplace/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      setIsAdded(true);
      toast({
        title: "Added to cart!",
        description: `${productName} has been added to your cart.`,
      });

      // Reset the added state after 3 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setIsLoading(true);
    
    try {
      // Add to cart first
      await fetch('/api/marketplace/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productType
        }),
      });
      
      // Then redirect to checkout
      router.push('/marketplace/checkout');
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      toast({
        title: "Error",
        description: "Could not proceed to checkout. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        onClick={handleAddToCart}
        disabled={isLoading || isAdded}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isAdded ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
      
      <Button
        onClick={handleBuyNow}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Buy Now
      </Button>
    </div>
  );
};

export default AddToCartButton;
