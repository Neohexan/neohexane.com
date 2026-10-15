import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosClient';
import logo from '../../../assets/logo.jpg';
import './Archive.css';

// --- AUTO-CAROUSEL COMPONENT ---
const ImageCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); 
    
    return () => clearInterval(timer);
  }, [images]);

  if (images.length <= 1) {
    return <img src={images[0]} className="discover-single-image" alt={title} loading="lazy" />;
  }

  return (
    <>
      <div className="discover-image-slider" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {images.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            alt={`${title} - Slide ${idx + 1}`} 
            loading="lazy" 
            style={{
              position: idx === 0 ? 'relative' : 'absolute',
              top: 0, left: 0, width: '100%', height: '100%', 
              objectFit: 'cover',
              opacity: currentIndex === idx ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out'
            }}
          />
        ))}
      </div>
      <div className="discover-slider-indicator" style={{ zIndex: 2, position: 'absolute', bottom: '10px', right: '10px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        {currentIndex + 1} / {images.length}
      </div>
    </>
  );
};

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);

  // --- SYNC URL SEARCH PARAMS ON MOUNT (SSR SAFE) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('search');
      if (query) {
        setSearchQuery(query);
      }
    }
  }, []);

  // --- HANDLE SEARCH & UPDATE URL NATIVELY ---
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (val) {
        url.searchParams.set('search', val);
      } else {
        url.searchParams.delete('search');
      }
      window.history.replaceState({}, '', url);
    }
  };

  // --- SYNC BOOKMARKS ---
  const fetchUserBookmarks = async () => {
    const token = localStorage.getItem('payload-token');
    if (!token) {
      setSavedArticles([]);
      return;
    }

    try {
      const response = await api.get('/users/me');
      
      if (response.data?.user?.bookmarks) {
        // Extract IDs and ensure they are ready for comparison
        const bkmkIds = response.data.user.bookmarks.map(b => 
          typeof b === 'object' && b !== null ? b.id : b
        );
        setSavedArticles(bkmkIds);
      }
    } catch (err) {
      console.error("Failed to sync archive bookmarks:", err);
    }
  };

  useEffect(() => {
    fetchUserBookmarks();
    window.addEventListener('neoBookmarkUpdated', fetchUserBookmarks);
    window.addEventListener('neoLoginSuccess', fetchUserBookmarks);
    
    return () => {
      window.removeEventListener('neoBookmarkUpdated', fetchUserBookmarks);
      window.removeEventListener('neoLoginSuccess', fetchUserBookmarks);
    };
  }, []);

  // --- FETCH ARTICLES ---
  useEffect(() => {
    api.get('/articles?limit=100')
      .then((response) => {
        const fetchedDocs = response.data.docs || [];
        
        const formattedArticles = fetchedDocs.map(doc => {
          let extractedImages = [];
          const extractImageUrls = (node) => {
            if (!node) return;
            if (node.type === 'upload' && node.value?.url) extractedImages.push(node.value.url);
            if (node.type === 'upload' && node.url) extractedImages.push(node.url);
            if (typeof node === 'string') {
              const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
              let match;
              while ((match = imgRegex.exec(node)) !== null) extractedImages.push(match[1]);
            }
            if (Array.isArray(node.children)) node.children.forEach(extractImageUrls);
            if (Array.isArray(node.root?.children)) node.root.children.forEach(extractImageUrls);
          };
          
          extractImageUrls(doc.content);

          let finalImages = [];
          const featImgUrl = doc.featuredImage?.url || (typeof doc.featuredImage === 'string' ? doc.featuredImage : null);
          
          if (featImgUrl) finalImages.push(featImgUrl);
          
          extractedImages.forEach(img => {
            if (!finalImages.includes(img)) finalImages.push(img);
          });

          if (finalImages.length === 0) {
            finalImages.push('https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop');
          }

          let plainText = "";
          const extractText = (node) => {
            if (typeof node === 'string') plainText += ` ${node}`;
            else if (typeof node === 'object' && node !== null) Object.values(node).forEach(extractText);
          };
          extractText(doc.content);
          
          const catName = doc.category?.title || doc.categories?.[0]?.title || 'Article';
          const author = doc.author?.name || 'Neohexane';
          const avatar = doc.author?.profilePicture || `https://ui-avatars.com/api/?name=${author.charAt(0)}&background=0D8ABC&color=fff`;

          const dateObj = new Date(doc.createdAt);
          const now = new Date();
          const diffDays = Math.ceil(Math.abs(now - dateObj) / (1000 * 60 * 60 * 24));
          const timeAgo = diffDays > 30 ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `${diffDays}d`;

          const searchableContent = `${doc.title} ${catName} ${plainText}`.toLowerCase().replace(/[^a-z0-9 ]/g, '');

          return {
            id: doc.id,
            title: doc.title,
            slug: doc.slug,
            link: `/articles/${doc.slug}`,
            cat: catName,
            images: finalImages, 
            author: author,
            avatar: avatar,
            timeAgo: timeAgo,
            searchableContent: searchableContent 
          };
        });

        setArticles(formattedArticles);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load archive data.');
        setLoading(false);
      });
  }, []);

  // --- TOGGLE BOOKMARK ---
  const toggleBookmark = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('payload-token');
    const storedUser = localStorage.getItem('payload-user');
    
    if (!token || !storedUser) {
      window.dispatchEvent(new CustomEvent('neoOpenAuthMenu'));
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error("Session corrupted, logging out.");
      return;
    }

    const targetId = String(id);
    const isSaved = savedArticles.some(savedId => String(savedId) === targetId);
    
    const updatedBookmarks = isSaved 
      ? savedArticles.filter(savedId => String(savedId) !== targetId)
      : [...savedArticles, id];

    const previousBookmarks = [...savedArticles];

    setSavedArticles(updatedBookmarks);

    try {
      await api.patch(`/users/${user.id}`, { bookmarks: updatedBookmarks });
      window.dispatchEvent(new CustomEvent('neoBookmarkUpdated'));
    } catch (error) {
      console.error("Failed to sync bookmark with Payload database", error);
      setSavedArticles(previousBookmarks);
    }
  };

  const handleShare = async (e, title, link) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = window.location.origin + link;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: title, url: shareUrl });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const filteredArticles = articles.filter(art => {
    if (searchTerms.length === 0) return true;
    return searchTerms.every(term => art.searchableContent.includes(term));
  });

  return (
    <div className="discover-wrapper">
      <div className="discover-search-pill">
        <img src={logo.src} alt="Neohexane Logo" className="discover-pill-logo" />
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
          const isSaved = savedArticles.some(savedId => String(savedId) === String(art.id));

          return (
            <a href={art.link} className="discover-card" key={art.id}>
              
              <div className="discover-media-container" style={{ position: 'relative' }}>
                <ImageCarousel images={art.images} title={art.title} />
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
                    <button className={`discover-action-btn ${isSaved ? 'saved' : ''}`} onClick={(e) => toggleBookmark(e, art.id)}>
                      <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default Archive;
