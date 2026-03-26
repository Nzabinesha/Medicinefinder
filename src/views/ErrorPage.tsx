import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{error.status}</h1>
          <h2 className="text-xl text-gray-700 mb-4">{error.statusText || 'Page Not Found'}</h2>
          <p className="text-gray-600 mb-8">
            {error.status === 404 
              ? "The page you're looking for doesn't exist."
              : "Something went wrong. Please try again later."}
          </p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unexpected Error</h1>
        <p className="text-gray-600 mb-8">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}

