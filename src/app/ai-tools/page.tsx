export const metadata = {
  title: "AI Tools - ZombitX64",
  description: "Advanced AI development tools and services",
}

export default function AIToolsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">AI Development Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Model Training</h2>
          <p className="text-gray-600">Train and fine-tune AI models with our cloud infrastructure</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Dataset Management</h2>
          <p className="text-gray-600">Organize, clean, and prepare your datasets</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Model Evaluation</h2>
          <p className="text-gray-600">Test and evaluate your models&apos; performance</p>
        </div>
      </div>
    </div>
  );
}
