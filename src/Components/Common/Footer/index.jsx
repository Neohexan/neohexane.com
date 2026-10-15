import React from 'react';
import './style.css'; 
import logo from '../../../assets/logo.jpg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="neo-global-footer-wrapper">
      <div className="neo-footer-container">
        {/* Left Side: Brand and Copyright */}
        <div className="neo-footer-brand">
          <img 
            src={logo.src} 
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

        {/* Right Side: Cleaned Navigation matching our Astro structure */}
        <nav className="neo-footer-navigation" aria-label="Footer Navigation">
          <ul className="neo-footer-nav-list">
            <li className="menu-item">
              <a href="/about">ABOUT NEOHEXANE</a>
            </li>
            <li className="menu-item">
              <a href="/contact">CONTACT US</a>
            </li>
            <li className="menu-item">
              <a href="/legal/disclaimer">DISCLAIMER</a>
            </li>
            <li className="menu-item">
              <a href="/legal/privacy">PRIVACY POLICY</a>
            </li>
            <li className="menu-item">
              <a href="/legal/terms">TERMS OF SERVICE</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
