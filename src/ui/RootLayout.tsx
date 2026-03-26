import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function RootLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary-600">Medifinder</span>
              </Link>
              {!user && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Sign Up
                  </Link>
                  <Link to="/pharmacy/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Pharmacy Login
                  </Link>
                  <Link to="/admin/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Admin Login
                  </Link>
                </div>
              )}
              <div className="hidden md:flex space-x-4">
                {user && user.role === 'user' && (
                  <Link to="/pharmacies" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Find Medicine
                  </Link>
                )}
                {user && user.role === 'user' && (
                  <>
                    <Link to="/cart" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Cart
                    </Link>
                    <Link to="/orders" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      My Orders
                    </Link>
                    <Link to="/notifications" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Notifications
                    </Link>
                  </>
                )}
                {user && user.role === 'pharmacy' && (
  <>
    <Link 
      to="/dashboard" 
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      Dashboard
    </Link>

    <Link 
      to="/notifications" 
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      Notifications
    </Link>
  </>
)}
                {user && user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Admin
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 hidden md:block">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="md:hidden flex items-center gap-2 flex-wrap justify-end">
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                  <Link to="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white text-gray-900 py-8 mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">MediFinder</h3>
              <p className="text-gray-600 text-sm">
                Helping residents of Kigali find their prescribed medicines quickly and easily.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/pharmacies" className="hover:text-primary-600 transition-colors">Find Medicine</Link></li>
                <li><Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-primary-600 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Contact</h4>
              <p className="text-gray-600 text-sm">
                Serving Kigali, Rwanda
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 MediFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

