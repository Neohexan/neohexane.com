import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axiosClient'; // Adjust path based on your folder structure
import './Archive.css';

const Archive = () => {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock state for bookmarks (to maintain your UI design until backend is connected)
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    // Fetch posts with embedded media and categories 
    api.get('/posts?_embed&per_page=100')
      .then((response) => {
        const fetchedArticles = response.data.map(post => {
          // Extract category name safely
          const categories = post._embedded?.['wp:term']?.[0] || [];
          const catName = categories.length > 0 ? categories[0].name : 'Uncategorized';
          
          // 1. Try to get the official WordPress Featured Image
          let imgUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

          // 2. Fallback: Extract the first image from the post content 
          if (!imgUrl) {
            const contentString = post.content.rendered;
            const imgMatch = contentString.match(/<img[^>]+src=["']([^"']+)["']/i);
            
            if (imgMatch && imgMatch[1]) {
              imgUrl = imgMatch[1];
            } else {
              // 3. Final Fallback: Unsplash default
              imgUrl = 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop';
            }
          }

          // Format the date
          const dateObj = new Date(post.date);
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          return {
            id: post.id,
            title: post.title.rendered,
            slug: post.slug, // Grab the slug provided by WordPress for SEO routing
            link: `/article/${post.slug}`, // Use the slug for the URL
            cat: catName,
            img: imgUrl,
            date: formattedDate
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

  const toggleBookmark = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    // Temporary client-side logic to toggle the active class
    if (savedArticles.includes(id)) {
      setSavedArticles(savedArticles.filter(savedId => savedId !== id));
    } else {
      setSavedArticles([...savedArticles, id]);
    }
  };

  // Filter articles based on the AI search bar input
  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    art.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="neo-archive-wrapper">
      <div className="neo-archive-glass-panel">
        
        <div className="neo-search-bar">
          <h2>Articles Archive</h2>
          <div className="neo-search-wrapper">
            <input 
              type="text" 
              placeholder="Search database..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="neo-archive-scroll-area">
          {loading && <p style={{ color: '#00FFCC', textAlign: 'center' }}>Syncing data modules...</p>}
          {error && <p style={{ color: '#f43f5e', textAlign: 'center' }}>Error: {error}</p>}
          
          {!loading && !error && filteredArticles.length === 0 && (
            <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>
              No matching data found.
            </p>
          )}

          <div className="neo-articles-grid">
            {filteredArticles.map(art => {
              const isSaved = savedArticles.includes(art.id);
              
              return (
                <div className="neo-article-card" key={art.id}>
                  <Link to={art.link}>
                    <img src={art.img} className="neo-card-image" alt="Article Thumbnail" />
                  </Link>
                  <div className="neo-card-body">
                    <span className="neo-card-cat">{art.cat}</span>
                    <h3 className="neo-card-title">
                      {/* dangerouslySetInnerHTML handles WP's HTML entity encoding (e.g. &#8217;) */}
                      <Link to={art.link} dangerouslySetInnerHTML={{ __html: art.title }} />
                    </h3>
                    <div className="neo-card-footer">
                      <span className="neo-card-date">{art.date}</span>
                      <button 
                        className={`neo-bookmark-btn ${isSaved ? 'saved' : ''}`}
                        onClick={(e) => toggleBookmark(e, art.id)}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!loading && filteredArticles.length > 0 && (
              <div className="neo-archive-end-message">
                &bull; New Data Modules Integrated Daily &bull;
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;
