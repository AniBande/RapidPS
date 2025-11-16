import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bell, Globe, Shield, LogOut, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [language, setLanguage] = useState('English');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'English' ? 'हिंदी' : 'English');
  };

  return (
    <header className="police-gradient text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">RPS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-police-gold transition-colors">Home</Link>
            <Link to="/complaint/new" className="hover:text-police-gold transition-colors">File Complaint</Link>
            <Link to="/complaint/track" className="hover:text-police-gold transition-colors">Track Case</Link>
            <Link to="/sos" className="hover:text-police-gold transition-colors">Emergency SOS</Link>
            <Link to="/learn" className="hover:text-police-gold transition-colors">Law Learning</Link>
            <Link to="/heatmap" className="hover:text-police-gold transition-colors">Safety Map</Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-white hover:bg-white/20">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Toggle Language</span>
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={toggleNotifications} className="text-white hover:bg-white/20">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-police-saffron text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
                <span className="sr-only">Notifications</span>
              </Button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 animate-fade-in">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-police-navy">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">Complaint #{123+i} under review</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="flex items-center text-white hover:bg-white/20 space-x-1">
                <span>Profile</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="absolute right-0 w-48 mt-1 bg-white rounded-md shadow-lg invisible group-hover:visible transition-all opacity-0 group-hover:opacity-100 z-50">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                <Link to="/profile/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                <div className="border-t border-gray-100"></div>
                <button className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleNotifications} className="text-white hover:bg-white/20">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 bg-police-saffron text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </Button>
            <Button onClick={toggleMenu} variant="ghost" size="icon" className="text-white hover:bg-white/20">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-police-navy border-t border-white/10 animate-fade-in">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link to="/" className="block py-2 hover:text-police-gold transition-colors">Home</Link>
            <Link to="/complaint/new" className="block py-2 hover:text-police-gold transition-colors">File Complaint</Link>
            <Link to="/complaint/track" className="block py-2 hover:text-police-gold transition-colors">Track Case</Link>
            <Link to="/sos" className="block py-2 hover:text-police-gold transition-colors">Emergency SOS</Link>
            <Link to="/learn" className="block py-2 hover:text-police-gold transition-colors">Law Learning</Link>
            <Link to="/heatmap" className="block py-2 hover:text-police-gold transition-colors">Safety Map</Link>
            <Link to="/profile" className="block py-2 hover:text-police-gold transition-colors">Profile</Link>
            <div className="border-t border-white/10 py-2 mt-2 flex justify-between">
              <button onClick={toggleLanguage} className="flex items-center hover:text-police-gold transition-colors">
                <Globe className="h-4 w-4 mr-2" /> {language}
              </button>
              <button className="flex items-center text-red-400 hover:text-red-300 transition-colors">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar; 