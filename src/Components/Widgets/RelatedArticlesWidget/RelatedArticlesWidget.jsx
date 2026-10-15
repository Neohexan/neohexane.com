import React, { useRef, useState } from 'react';
import './RelatedArticlesWidget.css';

const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`neo-lazy-wrapper ${className} ${loaded ? 'loaded' : ''}`}>
      <img 
        src={src} 
        alt={alt} 
        loading="lazy" 
        onLoad={() => setLoaded(true)} 
        className="neo-lazy-img"
      />
    </div>
  );
};

const RelatedArticlesWidget = ({ relatedPosts = [] }) => {
  const scrollerRef = useRef(null);

  const scrollCarousel = (dir) => {
    if (scrollerRef.current) scrollerRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const getFeaturedImage = (p) => {
    return p.featuredImageUrl ? p.featuredImageUrl : null;
  };

  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section className="neo-scroller-section">
      <header className="neo-scroller-header">
        <span className="neo-scroller-header-muted">Further Reading</span>
        <h2 className="neo-scroller-header-main">Discover More Articles</h2>
      </header>
      <div className="neo-scroller-wrapper">
        <div className="neo-scroller-container" ref={scrollerRef}>
          {relatedPosts.map(rp => (
            <div key={rp.id} className="neo-scroller-card">
              {getFeaturedImage(rp) && (
                <LazyImage src={getFeaturedImage(rp)} alt={rp.title} className="neo-scroller-img-wrapper" />
              )}
              <h3><a href={`/articles/${rp.slug}`}>{rp.title}</a></h3>
              <a href={`/articles/${rp.slug}`} className="neo-read-more-arrow">
                Read Article <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>
          ))}
        </div>
        <div className="neo-scroller-controls">
          <button className="neo-scroll-btn" onClick={() => scrollCarousel(-1)}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button className="neo-scroll-btn" onClick={() => scrollCarousel(1)}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RelatedArticlesWidget;
