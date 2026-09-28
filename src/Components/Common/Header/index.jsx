import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  // State to track which dropdown is currently open ('nav', 'bookmark', 'auth', or null)
  const [activeMenu, setActiveMenu] = useState(null);

  // Mock Authentication & Data (Replace these with your actual auth/state management later)
  const isLoggedIn = false; 
  const user = {
    name: "Ritin",
    email: "qwertyritin@gmail.com",
    avatarUrl: "https://ui-avatars.com/api/?name=Ritin&background=0D8ABC&color=fff"
  };
  const savedArticles = [
    // Example data: { id: 1, title: 'The Quantum Properties of Hexane', url: '/articles/hexane' }
  ];

  const toggleMenu = (menuName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const closeMenus = () => setActiveMenu(null);

  // Close menus on scroll
  useEffect(() => {
    const handleScroll = (e) => {
      // Ignore scroll events originating from inside the dropdowns
      if (e.target && e.target.closest && e.target.closest('.neo-dropdown-window')) {
        return;
      }
      if (activeMenu !== null) {
        closeMenus();
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [activeMenu]);

  return (
    <header className="nh-global-header">
      
      {/* Cinematic Blur Overlay */}
      <div 
        id="nh-page-overlay" 
        className={activeMenu ? 'active' : ''} 
        onClick={closeMenus}
      ></div>

      <div className="nh-header-container">
        
        {/* LEFT: Brand & Primary Navigation */}
        <div className="nh-brand-capsule-wrap">
          <div className="neo-header-item">
            <button 
              className={`nh-plus-btn ${activeMenu === 'nav' ? 'icon-rotated' : ''}`} 
              onClick={(e) => toggleMenu('nav', e)}
              aria-label="Toggle Navigation Menu"
            >
              <svg className="nh-plus-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            
            <div className={`neo-dropdown-window neo-minimal-menu ${activeMenu === 'nav' ? 'active' : ''}`} style={{ left: 0, right: 'auto' }}>
              <div className="nh-dropdown-header">Portal Navigation</div>
              <ul>
                <li><Link to="/periodic-table" onClick={closeMenus}>Periodic Table Page</Link></li>
                <li><Link to="/study-notes" onClick={closeMenus}>Lab Study Notes</Link></li>
                <li><Link to="/articles" onClick={closeMenus}>Articles Archive</Link></li>
              </ul>
            </div>
          </div>
          
          <Link to="/" className="nh-brand-logo-text" onClick={closeMenus}>
            neohexane
          </Link>
        </div>

        {/* RIGHT: Secondary Nav, Bookmarks, and Profile */}
        <div className="nh-header-right">
          
          <nav className="nh-navigation-secondary">
            <ul className="nh-nav-list-secondary">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>

          <div className="nh-auth-container">
            
            {/* Bookmark Dropdown */}
            <div className="neo-header-item">
              <button 
                className={`nh-bookmark-btn ${activeMenu === 'bookmark' ? 'active' : ''}`} 
                onClick={(e) => toggleMenu('bookmark', e)}
                title="Saved Items"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>
              
              <div className={`neo-dropdown-window neo-bookmark-menu ${activeMenu === 'bookmark' ? 'active' : ''}`}>
                <div className="nh-popup-body">
                  <div className="nh-bookmark-header">
                    <div className="nh-bookmark-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                      <span>Saved Articles</span>
                    </div>
                    <span className="nh-bookmark-count">{isLoggedIn ? savedArticles.length : 0} SAVED</span>
                  </div>

                  {!isLoggedIn ? (
                    <div className="nh-bookmark-empty">
                      <button className="neo-switch-to-login" onClick={(e) => toggleMenu('auth', e)}>
                        login in to see or save bookmark &rarr;
                      </button>
                    </div>
                  ) : savedArticles.length === 0 ? (
                    <div className="nh-bookmark-empty-state">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                      <p>Your bookmark vault is empty. Keep track of interesting chemical research from our archive!</p>
                      <Link to="/articles" className="nh-browse-link" onClick={closeMenus}>Browse Blog Posts &rarr;</Link>
                    </div>
                  ) : (
                    <ul className="nh-bookmark-scroll-list">
                      {savedArticles.map(article => (
                        <li key={article.id}>
                          <Link to={article.url} onClick={closeMenus}>
                            <span className="nh-article-title">{article.title}</span>
                            <span className="nh-read-link">Read Article &rarr;</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Auth/Profile Dropdown */}
            <div className="neo-header-item">
              <button 
                className={`nh-profile-btn ${activeMenu === 'auth' ? 'active' : ''}`} 
                onClick={(e) => toggleMenu('auth', e)}
                title="Account"
                style={{ overflow: 'hidden', padding: isLoggedIn ? 0 : '' }}
              >
                {isLoggedIn ? (
                  <img src={user.avatarUrl} alt="User Profile" className="nh-avatar-small" />
                ) : (
                  <svg className="nh-user-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
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
                      <button className="nh-logout-btn" onClick={() => {/* Handle Logout */ closeMenus();}}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Log Out Account
                      </button>
                    </>
                  ) : (
                    <>
                      <h4 className="nh-auth-title">NEOHEXANE ACCESS</h4>
                      {/* Placeholder for your actual Auth provider (Firebase, Supabase, etc.) */}
                      <button className="nh-mock-google-btn" onClick={() => {/* Handle Login */ closeMenus();}}>
                        Sign in with Google
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
