const products = [
  { id: 1, name: "Product 1", price: 10, description: "Description of product 1" },
  { id: 2, name: "Product 2", price: 20, description: "Description of product 2" },
  { id: 3, name: "Product 3", price: 30, description: "Description of product 3" },
];

interface PageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const product = products.find((p) => p.id.toString() === params.id);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
      <p>{product.description}</p>
    </div>
  );
}
