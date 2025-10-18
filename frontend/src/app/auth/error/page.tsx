export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Login Failed</h1>
        <p className="text-gray-600">Please try again or contact support.</p>
        <a href="/api/auth/github" className="px-4 py-2 bg-black text-white rounded">Retry GitHub Login</a>
      </div>
    </div>
  );
}
