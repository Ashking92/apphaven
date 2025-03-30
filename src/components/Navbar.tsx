
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate('/');
    } catch (error: any) {
      toast.error("Error signing out: " + error.message);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">AppStore</span>
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Categories
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 hidden md:flex md:items-center md:ml-4 md:space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-muted-foreground">
                      {user?.email}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary ml-1"
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            to="/categories"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
            onClick={toggleMenu}
          >
            Categories
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
              onClick={toggleMenu}
            >
              Admin Dashboard
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          {isAuthenticated ? (
            <div className="space-y-1">
              <div className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400">
                {user?.email}
              </div>
              <button
                onClick={() => {
                  handleSignOut();
                  toggleMenu();
                }}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 w-full text-left"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                to="/auth"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                onClick={toggleMenu}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
