import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-indigo-600">404</p>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">Page not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
