import React from 'react';
import './style.css'; 
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="neo-global-footer-wrapper">
      <div className="neo-footer-container">
        {/* Left Side: Brand and Copyright */}
        <div className="neo-footer-brand">
          <img 
            src="http://neohexane.com/wp-content/uploads/2026/07/IMG_20210807_150534-1.jpg" 
            alt="Neohexane Logo" 
            className="neo-footer-logo" 
            loading="lazy" 
            referrerPolicy="no-referrer" 
          />
          <div className="neo-footer-brand-info">
            <span className="neo-footer-brand-title">NEOHEXANE ACADEMIC PORTAL</span>
            <span className="neo-footer-copyright">
              &copy; {currentYear} Neohexane. All rights reserved.
            </span>
          </div>
        </div>

        {/* Right Side: Standard HTML Menu */}
        <nav className="neo-footer-navigation" aria-label="Footer Navigation">
          <ul className="neo-footer-nav-list">
            <li className="menu-item">
              < Link to="/about" >ABOUT NEOHEXANE</Link>
            </li>
            <li className="menu-item">
              < Link to="/contact-us" >CONTACT US</Link>
            </li>
            <li className="menu-item">
              < Link to="/accessibility">ACCESSIBILITY</Link>
            </li>
            <li className="menu-item">
              < Link to="/disclaimer" >DISCLAIMER</Link>
            </li>
            <li className="menu-item">
              < Link to="/privacy-policy" >PRIVACY POLICY</Link>
            </li>
            <li className="menu-item">
              < Link to="/terms" >TERMS OF SERVICE</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
