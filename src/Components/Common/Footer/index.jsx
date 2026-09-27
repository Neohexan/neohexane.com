import React from 'react';
import './style.css'; 

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
              <a href="/">Home</a>
            </li>
            <li className="menu-item">
              <a href="/about">About</a>
            </li>
            <li className="menu-item">
              <a href="/privacy-policy">Privacy Policy</a>
            </li>
            <li className="menu-item">
              <a href="/disclaimer">Disclaimer</a>
            </li>
            <li className="menu-item">
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
