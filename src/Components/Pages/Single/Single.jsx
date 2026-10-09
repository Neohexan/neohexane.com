import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../api/axiosClient';
import './Single.css';
import ArticleSidebar from '../../Widgets/ArticleSidebar';
import RetroTVError from '../../Widgets/RetroTVError/RetroTVError'; 


// ==========================================
// 1. REUSABLE TAG FAN COMPONENT (Main H1)
// ==========================================
const TagFan = ({ text, textColor = '#FFFFFF', finalColor, layers, delay = 0, canReveal = true, className = '' }) => {
  const intermediateLayers = layers.slice(0, -1);
  return (
    <span
      data-can-reveal={canReveal ? 'true' : 'false'}
      style={{ '--delay': `${delay}s` }}
      className={`mr-tag-fan ${className}`}
    >
      <span className="mr-tag-base" aria-hidden="true" />
      {intermediateLayers.map((color, index) => (
        <span
          key={index}
          className="mr-tag-layer"
          style={{ backgroundColor: color, '--index': index }}
          aria-hidden="true"
        />
      ))}
      <span
        className="mr-tag-layer mr-text-layer"
        style={{ backgroundColor: finalColor, color: textColor, '--index': intermediateLayers.length }}
      >
        <span>{text}</span>
      </span>
    </span>
  );
};

// ==========================================
// 2. SMOOTH STAGGERED WORD REVEAL (Main H1)
// ==========================================
const WordReveal = ({ text, baseDelay, wordInterval = 0.12, canReveal = true, className = '' }) => {
  const words = text.split(' ').filter(w => w.trim().length > 0);
  return (
    <span className={`mr-word-reveal ${className}`}>
      {words.map((word, idx) => {
        const delay = baseDelay + idx * wordInterval;
        return (
          <span
            key={idx}
            className={`mr-word-span ${canReveal ? 'revealed' : ''}`}
            style={{ transitionDelay: `${delay}s` }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

// ==========================================
// 3. MEMOIZED CONTENT FIREWALL
// ==========================================
const MemoizedArticleContent = React.memo(({ html }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const wrappers = contentRef.current.querySelectorAll('.neo-interior-wrapper');
    if (wrappers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-visible');

          const gooeyHeading = el.querySelector('.neo-gooey-heading');
          const wordCount = el.querySelectorAll('.neo-gooey-word').length;
          const totalTime = (0.8 + (wordCount * 0.08)) * 1000;

          setTimeout(() => {
            if (gooeyHeading) gooeyHeading.style.filter = 'none'; 
          }, totalTime + 50);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    wrappers.forEach(w => observer.observe(w));
    return () => observer.disconnect();
  }, [html]); 

  return (
    <article 
      ref={contentRef}
      className="neo-post-content" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
});

// ==========================================
// MAIN POST COMPONENT
// ==========================================
const Post = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [canReveal, setCanReveal] = useState(false); 
  const lastScrollY = useRef(0);
  const scrollerRef = useRef(null);

  const [isLightMode, setIsLightMode] = useState(() => {
    const savedTheme = localStorage.getItem('neo_theme');
    if (savedTheme) return savedTheme === 'light';
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('neo-light-mode');
      document.documentElement.classList.add('neo-light-mode');
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.classList.add('neo-light-mode');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('neo_theme', newMode ? 'light' : 'dark');
    document.body.classList.toggle('neo-light-mode', newMode);
    document.documentElement.classList.toggle('neo-light-mode', newMode);
    
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.classList.toggle('neo-light-mode', newMode);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsScrolledDown(true); 
      } else {
        setIsScrolledDown(false); 
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoading(true);
    setCanReveal(false); 
    window.scrollTo(0, 0); 

    api.get(`/posts?slug=${slug}&_embed`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setPost(res.data[0]);
          return api.get(`/posts?per_page=10&exclude=${res.data[0].id}&_embed`);
        } else {
          throw new Error("Article not found in database.");
        }
      })
      .then((res) => {
        if(res) setRelatedPosts(res.data);
        setLoading(false);
        setTimeout(() => setCanReveal(true), 150);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  // ==========================================
  // BULLETPROOF H1 TITLE ENGINE
  // ==========================================
  const dynamicTitle = useMemo(() => {
    if (!post) return null;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.title.rendered;
    const cleanText = tempDiv.textContent || tempDiv.innerText || "";
    const words = cleanText.trim().split(/\s+/).filter(w => w.trim().length > 0);

    if (words.length === 0) return null;
    const elements = [];
    
    if (words.length < 3) {
        elements.push(<WordReveal key="naked-all" text={cleanText} baseDelay={0.0} wordInterval={0.15} canReveal={canReveal} />);
    } else {
        let index = 0;
        let delaySeq = 0.0;
        let currentPillIdx = 0;

        const addTeal = (text) => { elements.push(<TagFan key={`teal-${index}`} text={text} textColor="#FFFFFF" finalColor="#299093" layers={['#061A1E', '#A5A096', '#299093']} delay={delaySeq} canReveal={canReveal} />); delaySeq += 0.2; };
        const addWhite = (text) => { elements.push(<TagFan key={`white-${index}`} text={text} textColor="#000000" finalColor="#FFFFFF" layers={['#EF6156', '#299093', '#A5A096', '#FFFFFF']} delay={delaySeq} canReveal={canReveal} className="mr-tag-white" />); delaySeq += 0.2; };
        const addCoral = (text) => { elements.push(<TagFan key={`coral-${index}`} text={text} textColor="#FFFFFF" finalColor="#EF6156" layers={['#EF6156', '#299093', '#A5A096', '#EF6156']} delay={delaySeq} canReveal={canReveal} />); delaySeq += 0.2; };
        const addNaked = (text) => { elements.push(<WordReveal key={`naked-${index}`} text={text} baseDelay={delaySeq} canReveal={canReveal} />); delaySeq += 0.2; };

        while (index < words.length) {
            const word = words[index];
            const letterCount = word.replace(/[^a-zA-Z0-9]/g, '').length;

            if (letterCount <= 3) {
                addNaked(word);
                index++;
                continue;
            }

            if (currentPillIdx === 0) {
                if (index + 1 < words.length && words[index+1].replace(/[^a-zA-Z0-9]/g, '').length > 3) {
                    addTeal(words.slice(index, index + 2).join(' '));
                    index += 2;
                } else {
                    addTeal(word);
                    index++;
                }
                currentPillIdx++;
            } else if (currentPillIdx === 1) {
                addNaked(word);
                currentPillIdx++;
                index++;
            } else if (currentPillIdx === 2) {
                addWhite(word);
                currentPillIdx++;
                index++;
            } else if (currentPillIdx === 3) {
                addCoral(word);
                currentPillIdx++;
                index++;
            } else {
                const remaining = words.slice(index).join(' ');
                addNaked(remaining);
                break; 
            }
        }
    }

    return (
      <h1 className="neo-article-title neo-pill-heading">
        {elements}
      </h1>
    );
  }, [post, isLightMode, canReveal]);

  // ==========================================
  // PURE HTML GOOEY + 5-COLOR ANIMATED DOT PARSER
  // ==========================================
  const parsedContentHtml = useMemo(() => {
    if (!post) return { __html: '' };

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.content.rendered, 'text/html');
      const headings = doc.querySelectorAll('h2, h3, h4, h5, h6');

      const dotPalettes = isLightMode ? [
        ['#EF6156', '#FFBD00', '#299093', '#EF6156', '#FFBD00'], 
        ['#299093', '#EF6156', '#FFBD00', '#299093', '#EF6156'], 
        ['#FFBD00', '#299093', '#EF6156', '#FFBD00', '#299093'], 
      ] : [
        ['#A5A096', '#EF6156', '#FFBD00', '#299093', '#A5A096'], 
        ['#299093', '#A5A096', '#EF6156', '#FFBD00', '#299093'], 
        ['#FFBD00', '#299093', '#A5A096', '#EF6156', '#FFBD00'], 
        ['#EF6156', '#FFBD00', '#299093', '#A5A096', '#EF6156'], 
      ];

      headings.forEach((heading, hIndex) => {
        const text = heading.textContent.trim();
        const words = text.split(/\s+/).filter(w => w.trim().length > 0);
        if (words.length === 0) return;

        const originalTag = heading.tagName.toLowerCase();
        
        const wrapper = doc.createElement('div');
        wrapper.className = `neo-interior-wrapper is-${originalTag}-wrapper`;
        heading.parentNode.insertBefore(wrapper, heading);

        const theme = dotPalettes[hIndex % dotPalettes.length];
        const dot = doc.createElement('span');
        dot.className = 'mr-animated-dot';
        
        let layersHtml = `<span class="mr-dot-base"></span>`;
        theme.forEach((color, i) => {
           layersHtml += `<span class="mr-dot-layer" style="background-color: ${color}; --index: ${i};"></span>`;
        });
        dot.innerHTML = layersHtml;
        wrapper.appendChild(dot);

        heading.innerHTML = ''; 
        heading.className = `neo-gooey-heading is-${originalTag}`;

        words.forEach((word, index) => {
          const span = doc.createElement('span');
          span.className = 'neo-gooey-word';
          span.style.transitionDelay = `${index * 0.08}s`;
          span.innerText = word;
          heading.appendChild(span);
          heading.appendChild(doc.createTextNode(' '));
        });

        wrapper.appendChild(heading);
      });

      return { __html: doc.body.innerHTML };
    } catch (e) {
      console.error("Content parser failed", e);
      return { __html: post.content.rendered };
    }
  }, [post, isLightMode]);

  const toggleBookmark = (id) => {
    if (savedArticles.includes(id)) {
      setSavedArticles(savedArticles.filter(savedId => savedId !== id));
    } else {
      setSavedArticles([...savedArticles, id]);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post.title.rendered, url: window.location.href }); } 
      catch (err) { console.log('Share cancelled'); }
    } else {
      navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!');
    }
  };

  const scrollCarousel = (dir) => {
    if (scrollerRef.current) scrollerRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const getFeaturedImage = (p) => {
    let img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (!img) {
      const match = p.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
      img = match ? match[1] : null;
    }
    return img;
  };

  if (loading) {
    return (
      <div className="neo-loading-screen">
        <div className="loader">
          <span><span></span><span></span><span></span><span></span></span>
          <div className="base">
            <span></span>
            <div className="face"></div>
          </div>
        </div>
        <div className="longfazers">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
    );
  }

    if (error) {
    return (
      <div className="neo-layout-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', marginTop: '40px' }}>
        <RetroTVError message="Check Your Network :(" />
      </div>
    );
  }

  if (!post) return null;

  const mainImage = getFeaturedImage(post);
  const avatar = post._embedded?.author?.[0]?.avatar_urls?.['48'] || 'https://ui-avatars.com/api/?name=N&background=0D8ABC&color=fff';
  const author = post._embedded?.author?.[0]?.name || 'Neohexane Team';
  const date = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const subtitle = post.meta?.subtitle || post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "");
  const references = post.meta?.references || null;
  const keywords = post._embedded?.['wp:term']?.[1] || [];

  return (
    <>
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <defs>
          <filter id="gooey-threshold" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceGraphic" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
          </filter>
        </defs>
      </svg>

      <button className="neo-desktop-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {isLightMode ? (
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        )}
      </button>

      <div className="neo-layout-wrapper">
        <header className="neo-article-header">
          <div className="neo-title-row">
            {dynamicTitle}
          </div>

          <p className="neo-article-subtitle" dangerouslySetInnerHTML={{ __html: subtitle }}></p>
          
          <div className="neo-article-meta">
            <span className="neo-by-text">BY</span>
            <img src={avatar} className="neo-author-avatar" alt={author} />
            <span className="neo-author-name">{author}</span>
            <span className="neo-meta-divider">|</span>
            <span className="neo-meta-date">{date}</span>
          </div>
        </header>

        <div className="neo-content-sidebar-grid">
          <main className="neo-main-content">
            {mainImage && <img src={mainImage} className="neo-featured-image" alt="Featured" />}
            
            <MemoizedArticleContent html={parsedContentHtml.__html} />

            {(references || keywords.length > 0) && (
              <div className="neo-article-subs">
                {references && (
                  <details className="neo-sub-details">
                    <summary className="neo-sub-summary">
                      <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> References
                    </summary>
                    <div className="neo-sub-content" dangerouslySetInnerHTML={{ __html: references }} />
                  </details>
                )}
                {keywords.length > 0 && (
                  <details className="neo-sub-details">
                    <summary className="neo-sub-summary">
                      <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> Keywords
                    </summary>
                    <div className="neo-sub-content neo-keywords-content">
                      {keywords.map(tag => (
                        <Link key={tag.id} to={`/articles/?search=${tag.name}`} className="neo-keyword-tag">{tag.name}</Link>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </main>

          {/* Reserved slot for the future <ArticleSidebar /> Component */}
          <ArticleSidebar />
        </div>
      </div>

      {relatedPosts.length > 2 && (
        <section className="neo-scroller-section">
          <header className="neo-scroller-header">
            <span className="neo-scroller-header-muted">Further Reading</span>
            <h2 className="neo-scroller-header-main">Discover More Articles</h2>
          </header>
          <div className="neo-scroller-wrapper">
            <div className="neo-scroller-container" ref={scrollerRef}>
              {relatedPosts.slice(2).map(rp => (
                <div key={rp.id} className="neo-scroller-card">
                  <img src={getFeaturedImage(rp)} alt={rp.title.rendered} />
                  <h3><Link to={`/post/${rp.slug}`} dangerouslySetInnerHTML={{ __html: rp.title.rendered }} /></h3>
                  <Link to={`/post/${rp.slug}`} className="neo-read-more-arrow">
                    Read Article <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </Link>
                </div>
              ))}
            </div>
            <div className="neo-scroller-controls">
              <button className="neo-scroll-btn" onClick={() => scrollCarousel(-1)}><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
              <button className="neo-scroll-btn" onClick={() => scrollCarousel(1)}><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
          </div>
        </section>
      )}

      {/* MOBILE ACTION BAR */}
      <div className={`neo-mobile-action-bar ${isScrolledDown ? 'hidden' : ''}`}>
        <Link to="/archive" className="neo-action-btn"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></Link>
        <button className={`neo-action-btn ${savedArticles.includes(post.id) ? 'saved' : ''}`} onClick={() => toggleBookmark(post.id)}>
          <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <button className="neo-action-btn" onClick={handleShare}><svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></button>
        <button className="neo-action-btn" onClick={toggleTheme}>
          {isLightMode ? (
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
          ) : (
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>
      </div>
    </>
  );
};

export default Post;
