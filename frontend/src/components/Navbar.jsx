import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, Menu, X, LogOut, User, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor';
    return '/patient';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Book Exam', path: '/book' },
    { label: 'Eye Test', path: '/va-test' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="glass sticky top-0 w-full z-50 transition-all border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center group-hover:bg-teal-500 transition-colors shadow-lg shadow-teal-500/20">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-black text-md tracking-tight leading-none">MECO</span>

            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all ${isActive(link.path)
                  ? 'text-black font-semibold border-b-2 border-teal-500 pb-1'
                  : 'text-black hover:text-white hover:translate-y-[-1px]'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Auth Info / Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-950/40 border border-teal-800/40 text-black hover:bg-teal-900/40 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 border-l border-slate-900 pl-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-teal-600 leading-none">{user.name}</span>
                    <span className="text-[9px] text-slate-400 capitalize mt-0.5">{user.role}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
                    <User className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/30 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-500/10 hover:shadow-teal-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-slate-850 px-4 pt-2 pb-4 space-y-2 animate-pulse-soft">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                ? 'bg-teal-950/40 text-teal-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-800 pt-4 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-none">{user.name}</h4>
                    <span className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</span>
                  </div>
                </div>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold bg-teal-950/40 border border-teal-800/40 text-teal-400 text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-red-950/30 border border-red-900/30 text-red-400 hover:bg-red-900/30"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2 rounded-xl text-center text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800/40"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="py-2 rounded-xl text-center text-sm font-bold bg-teal-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
