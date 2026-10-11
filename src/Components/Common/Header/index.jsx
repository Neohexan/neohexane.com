import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import api from '../../../api/axiosClient'; // Assuming this is your Axios instance
import './Header.css';

// Point directly to your remote Payload server
const API_URL = 'https://backspace.neohexane.com/api'; 


const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", avatarUrl: "" });
  const [savedArticles, setSavedArticles] = useState([]);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  
  const lastScrollY = useRef(0);
  const activeMenuRef = useRef(activeMenu);
  const menuOpenScrollY = useRef(0); 

  // URL Detection for Archive Page
  const location = useLocation();
  const isArchivePage = 
    location.pathname.toLowerCase().includes('archive') || 
    window.location.href.toLowerCase().includes('archive');

  useEffect(() => {
    activeMenuRef.current = activeMenu;
    if (activeMenu) {
      menuOpenScrollY.current = window.scrollY;
    }
  }, [activeMenu]);

  // Load session from browser storage on mount
  useEffect(() => {
    const token = localStorage.getItem('payload-token');
    const storedUser = localStorage.getItem('payload-user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Corrupted local storage data. Clearing session.");
        localStorage.removeItem('payload-token');
        localStorage.removeItem('payload-user');
      }
    }
  }, []);

  // Fetch the user's populated bookmarks from Payload CMS
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!isLoggedIn) return;
      try {
        const token = localStorage.getItem('payload-token');
        
        // Payload's built-in /me endpoint returns the full user object
        const response = await api.get(`${API_URL}/users/me`, {
          headers: { Authorization: `JWT ${token}` } // Payload uses JWT prefix for auth headers
        });
        
        if (response.data?.user?.bookmarks) {
          setSavedArticles(response.data.user.bookmarks);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      }
    };

    fetchBookmarks();
  }, [isLoggedIn]);

  // Handle the Google popup success response
  const handleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      
      // Send Google token to our custom Payload endpoint
      const response = await api.post(`${API_URL}/users/google-login`, { 
        token: googleToken 
      });

      // Map Payload's user database fields to UI state
      const userInfo = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        avatarUrl: response.data.user.profilePicture || `https://ui-avatars.com/api/?name=${response.data.user.name.charAt(0)}&background=0D8ABC&color=fff`
      };

      // Save the native Payload token
      localStorage.setItem('payload-token', response.data.token);
      localStorage.setItem('payload-user', JSON.stringify(userInfo));
      
      setUser(userInfo);
      setIsLoggedIn(true);
      
      // If the custom endpoint returned bookmarks instantly, populate them
      if (response.data.user.bookmarks) {
        setSavedArticles(response.data.user.bookmarks);
      }
      
      closeMenus(); 
    } catch (error) {
      console.error("Backend authentication failed:", error);
    }
  };

  const handleLogout = () => {
    googleLogout(); 
    localStorage.removeItem('payload-token'); 
    localStorage.removeItem('payload-user'); 
    
    setIsLoggedIn(false);
    setUser({ name: "", email: "", avatarUrl: "" });
    setSavedArticles([]); 
    closeMenus();
  };

  const toggleMenu = (menuName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const closeMenus = () => setActiveMenu(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          setIsScrolled(currentScrollY > 20);

          if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            setIsScrollingUp(false);
          } else if (currentScrollY < lastScrollY.current) {
            setIsScrollingUp(true);
          }
          
          lastScrollY.current = currentScrollY;

          if (activeMenuRef.current !== null) {
            if (e.target === document || e.target === window) {
              if (Math.abs(currentScrollY - menuOpenScrollY.current) > 15) {
                setActiveMenu(null);
              }
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  return (
    <>
      <div 
        id="nh-page-overlay" 
        className={activeMenu ? 'active' : ''} 
        onClick={closeMenus}
      ></div>

      <header className={`nh-floating-header ${isScrolled ? 'is-scrolled' : ''} ${isArchivePage ? 'nh-header-archive' : ''}`}>
        
        <div className={`nh-segment-left nh-glass-pill ${!isScrollingUp && !isArchivePage ? 'hidden-pill' : ''}`}>
          <div className="neo-header-item">
            <button 
              className={`nh-plus-btn ${activeMenu === 'nav' ? 'icon-rotated' : ''}`} 
              onClick={(e) => toggleMenu('nav', e)}
              aria-label="Toggle Navigation Menu"
            >
              <svg className="nh-plus-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            
            <div className={`neo-dropdown-window neo-minimal-menu ${activeMenu === 'nav' ? 'active' : ''}`}>
              <div className="nh-dropdown-header">Portal Navigation</div>
              <ul>
                <li><Link to="/periodic-table" onClick={closeMenus}>Periodic Table</Link></li>
                <li><Link to="/archive" onClick={closeMenus}>Archives</Link></li>
                <li><Link to="/about" onClick={closeMenus}>About</Link></li>
              </ul>
            </div>
          </div>
          
          <Link to="/" className="nh-brand-logo-text" onClick={closeMenus}>
            NEOHEXANE
          </Link>
        </div>

        <div className="nh-segment-right">
          
          <div className="neo-header-item">
            <button 
              className={`nh-svg-only-btn ${activeMenu === 'bookmark' ? 'active' : ''}`} 
              onClick={(e) => toggleMenu('bookmark', e)}
              title="Saved Items"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#d4d4d4" stroke="none">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            </button>
            
            <div className={`neo-dropdown-window neo-bookmark-menu ${activeMenu === 'bookmark' ? 'active' : ''}`}>
              <div className="nh-popup-body">
                <div className="nh-bookmark-header">
                  <div className="nh-bookmark-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    <span>Saved Articles</span>
                  </div>
                  <span className="nh-bookmark-count">{isLoggedIn ? savedArticles.length : 0} SAVED</span>
                </div>

                {!isLoggedIn ? (
                  <div className="nh-bookmark-empty">
                    <button className="neo-switch-to-login-link" onClick={(e) => toggleMenu('auth', e)}>
                      login in to see or save bookmark &rarr;
                    </button>
                  </div>
                ) : savedArticles.length === 0 ? (
                  <div className="nh-bookmark-empty-state">
                    <button className="neo-switch-to-login-link" onClick={closeMenus}>
                      No articles saved yet &rarr;
                    </button>
                  </div>
                ) : (
                  <ul className="nh-bookmark-scroll-list">
                    {savedArticles.map(article => (
                      <li key={article.id}>
                        {/* Payload returns slugs for linked articles, not full URLs */}
                        <Link to={`/article/${article.slug}`} onClick={closeMenus}>
                          <span className="nh-article-title">{article.title}</span>
                          <span className="nh-read-article">READ ARTICLE &rarr;</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="neo-header-item">
            <button 
              className={`nh-glass-circle ${activeMenu === 'auth' ? 'active' : ''}`} 
              onClick={(e) => toggleMenu('auth', e)}
              title="Account"
              style={{ overflow: 'hidden', padding: 0 }}
            >
              {isLoggedIn ? (
                <img src={user.avatarUrl} alt="User Profile" className="nh-avatar-small" />
              ) : (
                <img width="48" height="48" src="https://img.icons8.com/doodle/48/user.png" alt="user" className="nh-avatar-small" />
              )}
            </button>
            
            <div className={`neo-dropdown-window neo-auth-menu ${activeMenu === 'auth' ? 'active' : ''}`}>
              <div className="nh-popup-body">
                {isLoggedIn ? (
                  <>
                    <div className="nh-auth-profile-header">
                      <div className="nh-auth-avatar-box">
                        <img src={user.avatarUrl} alt="Profile" />
                      </div>
                      <div className="nh-auth-profile-info">
                        <span className="nh-auth-name">{user.name}</span>
                        <span className="nh-auth-email">{user.email}</span>
                      </div>
                    </div>
                    <button className="nh-logout-btn" onClick={handleLogout}>
                      <span className="nh-logout-icon">[&rarr;</span> Log Out Account
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="nh-auth-title">NEOHEXANE ACCESS</h4>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => console.error('Google Login Failed')}
                        theme="filled_black" 
                        shape="pill"
                        width="100%"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default Header;
