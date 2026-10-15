import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { useStore } from '@nanostores/react';
import { $user } from '../../../store/userStore'; // <-- Update path if necessary
import api from '../../../api/axiosClient'; 
import './Header.css';

const API_URL = import.meta.env.PUBLIC_API_URL;

// HELPER: Safely extracts the avatar URL whether it's from Payload or Google directly
const getAvatarUrl = (userObj) => {
  if (!userObj) return "";
  
  if (userObj.profilePicture && typeof userObj.profilePicture === 'object' && userObj.profilePicture.url) {
    return userObj.profilePicture.url;
  }
  if (typeof userObj.profilePicture === 'string') {
    return userObj.profilePicture;
  }
  if (typeof userObj.avatarUrl === 'string') {
    return userObj.avatarUrl;
  }
  
  const initial = (userObj.name || "U").charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=0D8ABC&color=fff`;
};

const Header = ({ currentUser }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  
  // 1. MAGIC: Subscribe to the nanostore. This auto-updates when anyone calls $user.set()
  const activeStoreUser = useStore($user);
  
  // 2. Combine Astro's SSR prop with the client-side store
  const displayUser = activeStoreUser || currentUser;
  const isLoggedIn = Boolean(displayUser && (displayUser.id || displayUser.email || displayUser.name));

  const userProfile = {
    name: displayUser?.name || "",
    email: displayUser?.email || "",
    avatarUrl: getAvatarUrl(displayUser)
  };

  const [savedArticles, setSavedArticles] = useState(displayUser?.bookmarks || []);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  
  const lastScrollY = useRef(0);
  const activeMenuRef = useRef(activeMenu);
  const menuOpenScrollY = useRef(0); 

  const isArchivePage = typeof window !== 'undefined' ? 
    window.location.pathname.toLowerCase().includes('archive') || 
    window.location.href.toLowerCase().includes('archive') : false;

  useEffect(() => {
    activeMenuRef.current = activeMenu;
    if (activeMenu) {
      menuOpenScrollY.current = window.scrollY;
    }
  }, [activeMenu]);

  // Ensure SSR data syncs into the store on initial load if needed
  useEffect(() => {
    if (currentUser && !activeStoreUser) {
      $user.set(currentUser);
    }
  }, [currentUser, activeStoreUser]);

  // Listens for the UI event to open the login modal (triggered by ArticleComments)
  useEffect(() => {
    const handleOpenLogin = () => setActiveMenu('auth');
    window.addEventListener('neo-open-login', handleOpenLogin);
    return () => window.removeEventListener('neo-open-login', handleOpenLogin);
  }, []);

  // Sync bookmarks quietly in the background if logged in
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!isLoggedIn) return;
      try {
        const token = localStorage.getItem('payload-token');
        if (!token) return;
        
        const response = await api.get(`${API_URL}/users/me`, {
          headers: { Authorization: `JWT ${token}` }
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

  const handleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      
      const response = await api.post(`${API_URL}/users/google-login`, { 
        token: googleToken 
      });

      const userInfo = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        avatarUrl: getAvatarUrl(response.data.user),
        role: response.data.user.role || 'user',
        bookmarks: response.data.user.bookmarks || []
      };

      // 3. MAGIC: Set the store. This auto-saves to localStorage AND instantly updates ArticleComments
      $user.set(userInfo);
      localStorage.setItem('payload-token', response.data.token);
      
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
    
    // 4. MAGIC: Clear the store. Instantly logs out across all components.
    $user.set(null); 
    localStorage.removeItem('payload-token'); 
    
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
                <li><a href="/periodic-table" onClick={closeMenus}>Periodic Table</a></li>
                <li><a href="/archive" onClick={closeMenus}>Archives</a></li>
                <li><a href="/about" onClick={closeMenus}>About</a></li>
              </ul>
            </div>
          </div>
          
          <a href="/" className="nh-brand-logo-text" onClick={closeMenus}>
            NEOHEXANE
          </a>
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
                        <a href={`/article/${article.slug}`} onClick={closeMenus}>
                          <span className="nh-article-title">{article.title}</span>
                          <span className="nh-read-article">READ ARTICLE &rarr;</span>
                        </a>
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
                <img src={userProfile.avatarUrl} alt="User Profile" className="nh-avatar-small" referrerPolicy="no-referrer" />
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
                        <img src={userProfile.avatarUrl} alt="Profile" referrerPolicy="no-referrer" />
                      </div>
                      <div className="nh-auth-profile-info">
                        <span className="nh-auth-name">{userProfile.name}</span>
                        <span className="nh-auth-email">{userProfile.email}</span>
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
                      <GoogleOAuthProvider clientId={import.meta.env.PUBLIC_GOOGLE_CLIENT_ID}>
                        <GoogleLogin
                          onSuccess={handleSuccess}
                          onError={() => console.error('Google Login Failed')}
                          theme="filled_black" 
                          shape="pill"
                          width="100%"
                        />
                      </GoogleOAuthProvider>
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
