export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Login to TalentHive
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              placeholder="••••••••"
            />
          </div>
          <button
            type="button"
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
