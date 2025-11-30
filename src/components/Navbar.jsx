import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calculator, Phone, Menu, X, Flame } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <img 
                src="/logo-gym-cafe.png" 
                alt="AFTERBURN" 
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                AFTERBURN
              </span>
              <div className="text-xs text-gray-400 font-medium">Premium Meal Plans</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => navigate('/calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/calculator' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span className="font-semibold">Calculator</span>
            </button>

            {/* Call Button */}
            <a 
              href="tel:8899175788"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
            >
              <Phone className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-2">8899175788</span>
              <span className="absolute transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">8899175788</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-white/10 animate-fadeIn">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/calculator');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/calculator' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span className="font-semibold">Calculator</span>
            </button>

            <a 
              href="tel:8899175788"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition"
            >
              <Phone className="w-5 h-5" />
              Call: 8899175788
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
