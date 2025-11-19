
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-police-navy text-white pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight">SAMARTH</span>
            </div>
            <p className="text-gray-300 text-sm">
              The SAMARTH is dedicated to streamlining police-citizen interactions,
              ensuring swift responses, and providing transparent case tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-police-gold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-police-gold transition-colors">Home</Link></li>
              <li><Link to="/complaint/new" className="hover:text-police-gold transition-colors">File Complaint</Link></li>
              <li><Link to="/complaint/track" className="hover:text-police-gold transition-colors">Track Case</Link></li>
              <li><Link to="/sos" className="hover:text-police-gold transition-colors">Emergency SOS</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-police-gold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/learn" className="hover:text-police-gold transition-colors">Law Learning</Link></li>
              <li><Link to="/heatmap" className="hover:text-police-gold transition-colors">Safety Map</Link></li>
              <li><Link to="/help" className="hover:text-police-gold transition-colors">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-police-gold transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-police-gold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-police-gold transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-police-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/accessibility" className="hover:text-police-gold transition-colors">Accessibility</Link></li>
              <li><Link to="/contact" className="hover:text-police-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom section with copyright and ministry seal */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Rapid Police System. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center">
            {/* Ashoka Chakra styled seal */}
            <div className="ashoka-chakra w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
              <div className="w-6 h-6 rounded-full border-2 border-white rotate-45"></div>
            </div>
            <span className="text-sm text-gray-400">Indian Safety Ministry</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
