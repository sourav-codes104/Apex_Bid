import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">PropBid</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Find your dream property or bid on exclusive auctions. Your trusted
              property marketplace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/properties" className="hover:text-foreground transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="hover:text-foreground transition-colors">
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/properties?type=apartment" className="hover:text-foreground transition-colors">
                  Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?type=villa" className="hover:text-foreground transition-colors">
                  Villas
                </Link>
              </li>
              <li>
                <Link to="/properties?type=house" className="hover:text-foreground transition-colors">
                  Houses
                </Link>
              </li>
              <li>
                <Link to="/properties?type=commercial" className="hover:text-foreground transition-colors">
                  Commercial
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Business Hub, Mumbai</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@propbid.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PropBid. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
