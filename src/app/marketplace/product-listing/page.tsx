const products = [
  { id: 1, name: "Product 1", price: 10 },
  { id: 2, name: "Product 2", price: 20 },
  { id: 3, name: "Product 3", price: 30 },
];

import Link from "next/link";

export default function ProductListingPage() {
  return (
    <div>
      <h1>Product Listing</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/marketplace/product-listing/${product.id}`}>
              {product.name} - ${product.price}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
