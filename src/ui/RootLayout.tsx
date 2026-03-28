import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const linkClass =
  'block px-3 py-2.5 rounded-lg text-gray-800 hover:bg-primary-50 hover:text-primary-700 text-sm font-medium transition-colors';
const desktopLinkClass =
  'text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors';

export function RootLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    closeMobile();
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <nav className="bg-white shadow-md border-b border-gray-200 relative z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-2 sm:gap-4 h-14 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
              <Link
                to="/"
                className="flex items-center shrink-0"
                onClick={closeMobile}
              >
                <span className="text-xl sm:text-2xl font-bold text-primary-600">Medifinder</span>
              </Link>

              {!user && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className={desktopLinkClass}>
                    Login
                  </Link>
                  <Link to="/signup" className={desktopLinkClass}>
                    Sign Up
                  </Link>
                  <Link to="/pharmacy/login" className={desktopLinkClass}>
                    Pharmacy Login
                  </Link>
                  <Link to="/admin/login" className={desktopLinkClass}>
                    Admin Login
                  </Link>
                </div>
              )}

              <div className="hidden md:flex flex-wrap items-center gap-x-2 gap-y-1">
                {user && user.role === 'user' && (
                  <Link to="/pharmacies" className={desktopLinkClass}>
                    Find Medicine
                  </Link>
                )}
                {user && user.role === 'user' && (
                  <>
                    <Link to="/cart" className={desktopLinkClass}>
                      Cart
                    </Link>
                    <Link to="/orders" className={desktopLinkClass}>
                      My Orders
                    </Link>
                    <Link to="/notifications" className={desktopLinkClass}>
                      Notifications
                    </Link>
                  </>
                )}
                {user && user.role === 'pharmacy' && (
                  <>
                    <Link to="/dashboard" className={desktopLinkClass}>
                      Dashboard
                    </Link>
                    <Link to="/notifications" className={desktopLinkClass}>
                      Notifications
                    </Link>
                  </>
                )}
                {user && user.role === 'admin' && (
                  <Link to="/admin" className={desktopLinkClass}>
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              {user && (
                <span className="text-sm text-gray-700 hidden lg:block max-w-[10rem] truncate">
                  {user.name}
                </span>
              )}
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4 hidden md:inline-flex"
                >
                  Logout
                </button>
              )}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <div
              id="mobile-nav"
              className="absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white shadow-lg md:hidden max-h-[min(75dvh,28rem)] overflow-y-auto overscroll-contain"
            >
              <div className="px-3 py-3 space-y-1">
                {user && (
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Signed in as <span className="text-gray-800 normal-case font-medium">{user.name}</span>
                  </p>
                )}

                {!user && (
                  <>
                    <Link to="/login" className={linkClass} onClick={closeMobile}>
                      Login
                    </Link>
                    <Link to="/signup" className={linkClass} onClick={closeMobile}>
                      Sign Up
                    </Link>
                    <Link to="/pharmacy/login" className={linkClass} onClick={closeMobile}>
                      Pharmacy Login
                    </Link>
                    <Link to="/admin/login" className={linkClass} onClick={closeMobile}>
                      Admin Login
                    </Link>
                  </>
                )}

                {user && user.role === 'user' && (
                  <>
                    <Link to="/pharmacies" className={linkClass} onClick={closeMobile}>
                      Find Medicine
                    </Link>
                    <Link to="/cart" className={linkClass} onClick={closeMobile}>
                      Cart
                    </Link>
                    <Link to="/orders" className={linkClass} onClick={closeMobile}>
                      My Orders
                    </Link>
                    <Link to="/notifications" className={linkClass} onClick={closeMobile}>
                      Notifications
                    </Link>
                  </>
                )}

                {user && user.role === 'pharmacy' && (
                  <>
                    <Link to="/dashboard" className={linkClass} onClick={closeMobile}>
                      Dashboard
                    </Link>
                    <Link to="/notifications" className={linkClass} onClick={closeMobile}>
                      Notifications
                    </Link>
                  </>
                )}

                {user && user.role === 'admin' && (
                  <Link to="/admin" className={linkClass} onClick={closeMobile}>
                    Admin
                  </Link>
                )}

                {user && (
                  <button type="button" className={`${linkClass} w-full text-left text-red-700 hover:bg-red-50`} onClick={handleLogout}>
                    Log out
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </nav>

      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>

      <footer className="bg-white text-gray-900 py-8 mt-auto sm:mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">MediFinder</h3>
              <p className="text-gray-600 text-sm">
                Helping residents of Kigali find their prescribed medicines quickly and easily.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="/pharmacies" className="hover:text-primary-600 transition-colors">
                    Find Medicine
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-primary-600 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-primary-600 transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-4 text-gray-900">Contact</h4>
              <p className="text-gray-600 text-sm">Serving Kigali, Rwanda</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 MediFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
