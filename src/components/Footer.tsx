
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="text-primary font-bold text-xl">AppHaven</span>
              <span className="text-gray-800 dark:text-white font-bold text-xl ml-1">Hub</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your ultimate destination for app discovery and distribution.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/categories" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/featured" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Featured Apps
                </Link>
              </li>
              <li>
                <Link to="/popular" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Popular Apps
                </Link>
              </li>
              <li>
                <Link to="/new" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  New Releases
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Developers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/upload" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Upload App
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Developer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Submission Guidelines
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AppHaven Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
