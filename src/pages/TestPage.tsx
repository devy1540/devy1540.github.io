export function TestPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">Test Page</h1>
      <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Card Test</h2>
        <p className="text-muted-foreground">
          이 카드가 제대로 보이나요? 배경색과 텍스트가 보여야 합니다.
        </p>
        <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Primary Button
        </button>
        <button className="ml-2 mt-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-md">
          Secondary Button  
        </button>
      </div>
    </div>
  );
}