// Test environment variables
console.log('Environment check:');
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

export default function EnvTest() {
  return (
    <div className="p-4">
      <h1>Environment Test</h1>
      <p>Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'}</p>
      <p>Check console for more details</p>
    </div>
  );
}
