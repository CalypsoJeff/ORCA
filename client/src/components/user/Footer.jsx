import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-600">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
          {/* Brand Section */}
          <div>
            <Link
              to="/"
              className="text-3xl font-display font-bold text-gray-900 tracking-tight inline-block mb-3 no-underline hover:text-orca-600 transition-colors"
            >
              ORCA
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Simplicity is the ultimate sophistication in digital experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
                { name: "FAQ", path: "/faq" },
                { name: "Support", path: "/support" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-orca-600 transition-colors text-sm inline-flex items-center gap-2 group no-underline"
                  >
                    <span className="w-1 h-1 bg-orca-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Legal & Connect</h3>
            <ul className="space-y-2 mb-6">
              {[
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "Terms & Conditions", path: "/terms-and-conditions" },
                { name: "Refund Policy", path: "/refund-policy" },
                { name: "Shipping Policy", path: "/shipping-policy" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-orca-600 transition-colors text-sm inline-flex items-center gap-2 group no-underline"
                  >
                    <span className="w-1 h-1 bg-orca-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { name: "twitter", icon: "M22 4.01C21 4.5 20.02 4.69 19 5C17.879 3.735 16 3.665 14.14 4.482C12.28 5.3 11.142 7.235 11.5 9.5C8.14 9.3 5.18 7.68 3 5C3 5 -1 13.37 8 17C6 18 4 19 1 19C4 21 7 22 10 22C17.1 22 22 16.47 22 9.5C22 9.22 21.97 8.94 21.92 8.67C21.97 8.4 22 8.15 22 7.87C22 6.73 21.45 5.61 20.5 5C21.5 5 22 4.01 22 4.01Z" },
                { name: "facebook", icon: "M18 2H15C12.791 2 11 3.791 11 6V9H7V13H11V22H15V13H19L20 9H15V6C15 5.448 15.448 5 16 5H18V2Z" },
                { name: "instagram", icon: "M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 7C14.761 7 17 9.239 17 12C17 14.761 14.761 17 12 17C9.239 17 7 14.761 7 12C7 9.239 9.239 7 12 7ZM18 6C18.552 6 19 6.448 19 7C19 7.552 18.552 8 18 8C17.448 8 17 7.552 17 7C17 6.448 17.448 6 18 6Z" },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-orca-600 flex items-center justify-center transition-all duration-200 group"
                  aria-label={`${social.name} link`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-500 group-hover:text-white transition-colors"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ORCA. Crafted with care for exceptional experiences.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
