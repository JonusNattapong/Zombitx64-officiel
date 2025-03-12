import { db } from "@/lib/db";
import Link from "next/link";

export default async function ProductListingPage() {
  const products = await db.product.findMany({
    select: {
      id: true,
      title: true,
      price: true,
    },
  });

  return (
    <div>
      <h1>Product Listing</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/marketplace/product-listing/${product.id}`}>
              {product.title} - ${product.price}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
