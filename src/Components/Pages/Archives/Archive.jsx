import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../../api/axiosClient';
import logo from '../../../assets/logo.jpg';
import './Archive.css';

const Archive = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Now tracks IDs synced from the database
  const [savedArticles, setSavedArticles] = useState([]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ search: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // --- SYNC BOOKMARKS FROM BACKEND ---
  const fetchUserBookmarks = async () => {
    const token = localStorage.getItem('neo_token');
    if (!token) return;

    try {
      const response = await api.get('/neohexane/v1/bookmarks', {
        baseURL: 'https://neohexane.com/wp-json',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.bookmarks) {
        // Extract just the IDs for the Archive card highlighting logic
        setSavedArticles(response.data.bookmarks.map(b => b.id));
      }
    } catch (err) {
      console.error("Failed to sync archive bookmarks:", err);
    }
  };

  // Fetch bookmarks on mount and listen for updates from the Header
  useEffect(() => {
    fetchUserBookmarks();
    
    // Listen for global bookmark changes (e.g., if user clears bookmarks in header)
    window.addEventListener('neoBookmarkUpdated', fetchUserBookmarks);
    // Listen for login success from Header
    window.addEventListener('neoLoginSuccess', fetchUserBookmarks);
    
    return () => {
      window.removeEventListener('neoBookmarkUpdated', fetchUserBookmarks);
      window.removeEventListener('neoLoginSuccess', fetchUserBookmarks);
    };
  }, []);

  useEffect(() => {
    api.get('/posts?_embed&per_page=100')
      .then((response) => {
        const fetchedArticles = response.data.map(post => {
          const categories = post._embedded?.['wp:term']?.[0] || [];
          const catName = categories.length > 0 ? categories[0].name : 'Article';
          
          const authorObj = post._embedded?.author?.[0];
          const author = authorObj?.name || 'Neohexane';
          const avatar = authorObj?.avatar_urls?.['96'] || authorObj?.avatar_urls?.['48'] || `https://ui-avatars.com/api/?name=${author.charAt(0)}&background=0D8ABC&color=fff`;
          
          let featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
          const contentString = post.content.rendered || '';

          const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
          let extractedImages = [];
          let match;
          
          while ((match = imgRegex.exec(contentString)) !== null) {
            extractedImages.push(match[1]);
          }

          let finalImages = [];
          if (featuredImg) finalImages.push(featuredImg);
          
          extractedImages.forEach(img => {
            if (!finalImages.includes(img)) {
              finalImages.push(img);
            }
          });

          if (finalImages.length === 0) {
            finalImages.push('https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop');
          }

          const cleanTextContent = contentString
            .replace(/<[^>]*>?/gm, ' ') 
            .replace(/\s+/g, ' ')       
            .toLowerCase();             

          const dateObj = new Date(post.date);
          const now = new Date();
          const diffTime = Math.abs(now - dateObj);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const timeAgo = diffDays > 30 ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `${diffDays}d`;

          return {
            id: post.id,
            title: post.title.rendered,
            slug: post.slug,
            link: `/article/${post.slug}`,
            cat: catName,
            images: finalImages, 
            author: author,
            avatar: avatar,
            timeAgo: timeAgo,
            searchableContent: cleanTextContent 
          };
        });

        setArticles(fetchedArticles);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load archive data.');
        setLoading(false);
      });
  }, []);

  // --- API DRIVEN BOOKMARK TOGGLE ---
  const toggleBookmark = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('neo_token');
    
    // If logged out, fire event to open Header Auth Window
    if (!token) {
      window.dispatchEvent(new CustomEvent('neoOpenAuthMenu'));
      return;
    }

    // Optimistic UI Update (Instant visual feedback)
    const isSaved = savedArticles.includes(id);
    if (isSaved) {
      setSavedArticles(prev => prev.filter(savedId => savedId !== id));
    } else {
      setSavedArticles(prev => [...prev, id]);
    }

    // Backend Sync
    try {
      await api.post('/neohexane/v1/bookmarks/toggle', 
        { post_id: id },
        { 
          baseURL: 'https://neohexane.com/wp-json',
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      // Tell the Header to refresh its dropdown list
      window.dispatchEvent(new CustomEvent('neoBookmarkUpdated'));
    } catch (error) {
      console.error("Failed to sync bookmark with database", error);
      // Revert optimistic update on failure
      if (isSaved) setSavedArticles(prev => [...prev, id]);
      else setSavedArticles(prev => prev.filter(savedId => savedId !== id));
    }
  };

  const handleShare = async (e, title, link) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = window.location.origin + link;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: title, url: shareUrl });
      } catch (err) {
        console.log('Share window closed or failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const filteredArticles = articles.filter(art => {
    if (searchTerms.length === 0) return true;
    const combinedText = `${art.title} ${art.cat} ${art.searchableContent}`.toLowerCase();
    return searchTerms.every(term => combinedText.includes(term));
  });

  return (
    <div className="discover-wrapper">
      <div className="discover-search-pill">
        <img src={logo} alt="Neohexane Logo" className="discover-pill-logo" />
        <input 
          type="text" 
          placeholder="Search" 
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="discover-feed">
        {loading && (
          <div className="discover-loading-container">
            <div className="wrapper">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="shadow"></div>
                <div className="shadow"></div>
                <div className="shadow"></div>
            </div>
          </div>
        )}
        
        {!loading && filteredArticles.length === 0 && <p className="discover-empty">No results found.</p>}

        {filteredArticles.map(art => {
          const isSaved = savedArticles.includes(art.id);
          const hasMultipleImages = art.images.length > 1;

          return (
            <Link to={art.link} className="discover-card" key={art.id}>
              
              <div className="discover-media-container">
                {hasMultipleImages ? (
                  <>
                    <div className="discover-image-slider">
                      {art.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Slide ${idx + 1}`} loading="lazy" />
                      ))}
                    </div>
                    <div className="discover-slider-indicator">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      1 / {art.images.length}
                    </div>
                  </>
                ) : (
                  <img src={art.images[0]} className="discover-single-image" alt={art.title} loading="lazy" />
                )}
              </div>

              <div className="discover-content">
                <h2 className="discover-title" dangerouslySetInnerHTML={{ __html: art.title }} />
                
                <div className="discover-meta-row">
                  <div className="discover-meta-left">
                    <img src={art.avatar} alt="Author" className="discover-avatar" />
                    <span className="discover-author">{art.author}</span>
                    <span className="discover-dot">•</span>
                    <span className="discover-time">{art.timeAgo}</span>
                  </div>
                  
                  <div className="discover-meta-right">
                    <button className="discover-action-btn" onClick={(e) => handleShare(e, art.title, art.link)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>
                    {/* Dynamic Saved State */}
                    <button className={`discover-action-btn ${isSaved ? 'saved' : ''}`} onClick={(e) => toggleBookmark(e, art.id)}>
                      <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Archive;
