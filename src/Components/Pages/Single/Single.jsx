import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../api/axiosClient';
import './Single.css';

// --- DATA CONSTANTS ---
const chemistryQuotes = [
  ["Chemistry is the melody you can play on vibrating strings.", "Michio Kaku"],
  ["Nothing exists except atoms and empty space; everything else is opinion.", "Democritus"],
  ["The meeting of two personalities is like the contact of two chemical substances.", "Carl Jung"],
  ["Every aspect of the world today is affected by chemistry.", "Linus Pauling"],
  ["Biochemistry is the science of life. All our life processes are essentially chemical reactions.", "Aaron Ciechanover"],
  ["A chemist in his laboratory is not a mere technician: he is also a child confronting natural phenomena.", "Marie Curie"],
  ["Chemistry begins in the stars. The stars are the source of the chemical elements.", "Carl Sagan"]
];

const bohrElements = [
  { sym: 'Na', sub: '11p+12n', shells: [2, 8, 1] },
  { sym: 'Ar', sub: '18p+22n', shells: [2, 8, 8] },
  { sym: 'K',  sub: '19p+20n', shells: [2, 8, 8, 1] },
  { sym: 'Fe', sub: '26p+30n', shells: [2, 8, 14, 2] },
  { sym: 'Cu', sub: '29p+35n', shells: [2, 8, 18, 1] },
  { sym: 'Au', sub: '79p+118n', shells: [2, 8, 18, 32, 18, 1] }
];

// FULL 118 Element Array Restored (x, y coordinates fixed)
const ptData = [
  ['H',0,0,'#007AFF'], ['He',0,17,'#5856D6'],
  ['Li',1,0,'#FF3B30'], ['Be',1,1,'#FF9500'], ['B',1,12,'#34C759'], ['C',1,13,'#007AFF'], ['N',1,14,'#007AFF'], ['O',1,15,'#007AFF'], ['F',1,16,'#007AFF'], ['Ne',1,17,'#5856D6'],
  ['Na',2,0,'#FF3B30'], ['Mg',2,1,'#FF9500'], ['Al',2,12,'#5AC8FA'], ['Si',2,13,'#34C759'], ['P',2,14,'#007AFF'], ['S',2,15,'#007AFF'], ['Cl',2,16,'#007AFF'], ['Ar',2,17,'#5856D6'],
  ['K',3,0,'#FF3B30'], ['Ca',3,1,'#FF9500'], ['Sc',3,2,'#FFCC00'], ['Ti',3,3,'#FFCC00'], ['V',3,4,'#FFCC00'], ['Cr',3,5,'#FFCC00'], ['Mn',3,6,'#FFCC00'], ['Fe',3,7,'#FFCC00'], ['Co',3,8,'#FFCC00'], ['Ni',3,9,'#FFCC00'], ['Cu',3,10,'#FFCC00'], ['Zn',3,11,'#FFCC00'], ['Ga',3,12,'#5AC8FA'], ['Ge',3,13,'#34C759'], ['As',3,14,'#34C759'], ['Se',3,15,'#007AFF'], ['Br',3,16,'#007AFF'], ['Kr',3,17,'#5856D6'],
  ['Rb',4,0,'#FF3B30'], ['Sr',4,1,'#FF9500'], ['Y',4,2,'#FFCC00'], ['Zr',4,3,'#FFCC00'], ['Nb',4,4,'#FFCC00'], ['Mo',4,5,'#FFCC00'], ['Tc',4,6,'#FFCC00'], ['Ru',4,7,'#FFCC00'], ['Rh',4,8,'#FFCC00'], ['Pd',4,9,'#FFCC00'], ['Ag',4,10,'#FFCC00'], ['Cd',4,11,'#FFCC00'], ['In',4,12,'#5AC8FA'], ['Sn',4,13,'#5AC8FA'], ['Sb',4,14,'#34C759'], ['Te',4,15,'#34C759'], ['I',4,16,'#007AFF'], ['Xe',4,17,'#5856D6'],
  ['Cs',5,0,'#FF3B30'], ['Ba',5,1,'#FF9500'], ['*',5,2,'#999999'], ['Hf',5,3,'#FFCC00'], ['Ta',5,4,'#FFCC00'], ['W',5,5,'#FFCC00'], ['Re',5,6,'#FFCC00'], ['Os',5,7,'#FFCC00'], ['Ir',5,8,'#FFCC00'], ['Pt',5,9,'#FFCC00'], ['Au',5,10,'#FFCC00'], ['Hg',5,11,'#FFCC00'], ['Tl',5,12,'#5AC8FA'], ['Pb',5,13,'#5AC8FA'], ['Bi',5,14,'#5AC8FA'], ['Po',5,15,'#5AC8FA'], ['At',5,16,'#34C759'], ['Rn',5,17,'#5856D6'],
  ['Fr',6,0,'#FF3B30'], ['Ra',6,1,'#FF9500'], ['**',6,2,'#999999'], ['Rf',6,3,'#FFCC00'], ['Db',6,4,'#FFCC00'], ['Sg',6,5,'#FFCC00'], ['Bh',6,6,'#FFCC00'], ['Hs',6,7,'#FFCC00'], ['Mt',6,8,'#FFCC00'], ['Ds',6,9,'#FFCC00'], ['Rg',6,10,'#FFCC00'], ['Cn',6,11,'#FFCC00'], ['Nh',6,12,'#5AC8FA'], ['Fl',6,13,'#5AC8FA'], ['Mc',6,14,'#5AC8FA'], ['Lv',6,15,'#5AC8FA'], ['Ts',6,16,'#34C759'], ['Og',6,17,'#5856D6'],
  ['La',7.5,2,'#FF2D55'], ['Ce',7.5,3,'#FF2D55'], ['Pr',7.5,4,'#FF2D55'], ['Nd',7.5,5,'#FF2D55'], ['Pm',7.5,6,'#FF2D55'], ['Sm',7.5,7,'#FF2D55'], ['Eu',7.5,8,'#FF2D55'], ['Gd',7.5,9,'#FF2D55'], ['Tb',7.5,10,'#FF2D55'], ['Dy',7.5,11,'#FF2D55'], ['Ho',7.5,12,'#FF2D55'], ['Er',7.5,13,'#FF2D55'], ['Tm',7.5,14,'#FF2D55'], ['Yb',7.5,15,'#FF2D55'], ['Lu',7.5,16,'#FFCC00'],
  ['Ac',8.5,2,'#FF6482'], ['Th',8.5,3,'#FF6482'], ['Pa',8.5,4,'#FF6482'], ['U',8.5,5,'#FF6482'], ['Np',8.5,6,'#FF6482'], ['Pu',8.5,7,'#FF6482'], ['Am',8.5,8,'#FF6482'], ['Cm',8.5,9,'#FF6482'], ['Bk',8.5,10,'#FF6482'], ['Cf',8.5,11,'#FF6482'], ['Es',8.5,12,'#FF6482'], ['Fm',8.5,13,'#FF6482'], ['Md',8.5,14,'#FF6482'], ['No',8.5,15,'#FF6482'], ['Lr',8.5,16,'#FFCC00']
];

const Post = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [savedArticles, setSavedArticles] = useState([]);
  
  // Widgets State
  const [quote] = useState(chemistryQuotes[Math.floor(Math.random() * chemistryQuotes.length)]);
  const [quoteTheme] = useState(Math.random() > 0.5 ? 'theme-industrial' : 'theme-quantum');
  const [bohrIndex, setBohrIndex] = useState(Math.floor(Math.random() * bohrElements.length));
  
  const scrollerRef = useRef(null);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('neo_theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const shouldBeLight = savedTheme === 'light' || (!savedTheme && systemPrefersLight);
    
    setIsLightMode(shouldBeLight);
    if (shouldBeLight) {
      document.body.classList.add('neo-light-mode');
      document.documentElement.classList.add('neo-light-mode');
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.classList.add('neo-light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('neo_theme', newMode ? 'light' : 'dark');
    document.body.classList.toggle('neo-light-mode', newMode);
    document.documentElement.classList.toggle('neo-light-mode', newMode);
    
    // Explicitly target the React #root div to prevent index.css black background bleeding through
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.classList.toggle('neo-light-mode', newMode);
  };

  // Fetch Post Data
  useEffect(() => {
    setLoading(true);
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
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  const toggleBookmark = (id) => {
    if (savedArticles.includes(id)) {
      setSavedArticles(savedArticles.filter(savedId => savedId !== id));
    } else {
      setSavedArticles([...savedArticles, id]);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title.rendered, url: window.location.href });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const scrollCarousel = (dir) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  const getFeaturedImage = (p) => {
    let img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (!img) {
      const match = p.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
      img = match ? match[1] : 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop';
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

  if (error) return <div className="neo-layout-wrapper"><h2 style={{color: '#f43f5e', textAlign: 'center'}}>{error}</h2></div>;
  if (!post) return null;

  const mainImage = getFeaturedImage(post);
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Article';
  const author = post._embedded?.author?.[0]?.name || 'Neohexane Team';
  const avatar = post._embedded?.author?.[0]?.avatar_urls?.['48'] || 'https://ui-avatars.com/api/?name=N&background=0D8ABC&color=fff';
  const date = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const subtitle = post.meta?.subtitle || post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "");
  const references = post.meta?.references || null;
  const keywords = post._embedded?.['wp:term']?.[1] || [];

  return (
    <>
      <button className="neo-desktop-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {isLightMode ? (
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        )}
      </button>

      <div className="neo-layout-wrapper">
        <header className="neo-article-header">
          <Link to="/articles" className="neo-article-cat">{category}</Link>
          
          <div className="neo-title-row">
            <h1 className="neo-article-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            <button className={`neo-desktop-bookmark-btn ${savedArticles.includes(post.id) ? 'saved' : ''}`} onClick={() => toggleBookmark(post.id)}>
              <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
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
            
            <article className="neo-post-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />

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

          <aside className="neo-sidebar" id="neo-fixed-sidebar">
            <div className="neo-sidebar-top-group">
              
              {/* PERIODIC TABLE WIDGET */}
              <div className="neo-sidebar-box neo-pt-widget">
                <h2 className="neo-sidebar-title">Discover the Elements</h2>
                <svg className="neo-pt-svg" viewBox="0 0 324 190">
                  {ptData.map((el, i) => {
                    // FIX: el[2] is the column (X), el[1] is the row (Y)
                    const x = el[2] * 18; 
                    const y = el[1] * 20; 
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width="16" height="18" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                        <text x={x + 8} y={y + 11.5} fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" fill={el[3]} textAnchor="middle">{el[0]}</text>
                      </g>
                    );
                  })}
                </svg>

                {/* BOHR ORBITAL ENGINE */}
                <div className="bohr-container-side" onClick={() => setBohrIndex((bohrIndex + 1) % bohrElements.length)}>
                  <div className="nucleus-side">
                    <span>{bohrElements[bohrIndex].sym}</span>
                    <small>{bohrElements[bohrIndex].sub}</small>
                  </div>
                  {bohrElements[bohrIndex].shells.map((electrons, sIdx) => {
                    const size = 60 + (sIdx * 22);
                    const speed = 8 + (sIdx * 2);
                    const dir = (sIdx % 2 === 0) ? 'spin-side' : 'spin-side-ccw';
                    
                    return (
                      <div key={sIdx} className="orbit-side" style={{ width: size, height: size }}>
                        <div className="orbit-ring-side" style={{ animation: `${dir} ${speed}s linear infinite` }}>
                          {Array.from({ length: electrons }).map((_, i) => {
                            const angle = (i / electrons) * 2 * Math.PI;
                            const cx = 50 + 50 * Math.cos(angle);
                            const cy = 50 + 50 * Math.sin(angle);
                            return <div key={i} className="electron-side" style={{ left: `${cx}%`, top: `${cy}%` }} />;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="neo-sidebar-pt-text">Dive deeper into our data environment. Explore the interactive Periodic Table to filter, sort, and analyze elements natively within the Neohexane framework.</p>
                <div className="neo-btn-center-wrapper">
                  <Link to="/periodic-table" className="learn-more">
                    <span className="circle" aria-hidden="true"><span className="icon arrow"></span></span>
                    <span className="button-text">View interactive Table</span>
                  </Link>
                </div>
              </div>

              {/* SIDEBAR CARDS */}
              <div className="neo-desktop-sidebar-cards">
                {relatedPosts.slice(0, 2).map(rp => (
                  <article key={rp.id} className="neo-side-card">
                    <section className="neo-side-card__hero" style={{ '--bg-img': `url('${getFeaturedImage(rp)}')` }}>
                      <header className="neo-side-card__hero-header">
                        <span>{rp._embedded?.['wp:term']?.[0]?.[0]?.name || 'Article'}</span>
                        <button className={`neo-side-card__icon neo-side-card-bookmark ${savedArticles.includes(rp.id) ? 'saved' : ''}`} onClick={() => toggleBookmark(rp.id)}>
                          <svg height="20" width="20" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" strokeLinejoin="round" strokeLinecap="round"></path></svg>
                        </button>
                      </header>
                      <p className="neo-side-card__job-title" dangerouslySetInnerHTML={{ __html: rp.title.rendered.substring(0, 45) + '...' }} />
                    </section>
                    <footer className="neo-side-card__footer">
                      <div className="neo-side-card__job-summary">
                        <div className="neo-side-card__job"><p className="neo-side-card__job-subtitle">Read Insight</p></div>
                      </div>
                      <Link to={`/post/${rp.slug}`} className="neo-side-card__btn">READ</Link>
                    </footer>
                  </article>
                ))}
              </div>
            </div>

            <div className="neo-sidebar-bottom-group neo-desktop-newsletter">
              <div className="neo-desktop-quote">
                <div className={`neo-quote-wrapper ${quoteTheme}`}>
                  <div className="neo-quote-card"></div>
                  <div className="neo-quote-content">
                    <div className="neo-quote-text">&ldquo;{quote[0]}&rdquo;</div>
                    <div className="neo-quote-author">&mdash; {quote[1]}</div>
                  </div>
                </div>
              </div>

              <div className="neo-sidebar-box neo-sidebar-newsletter">
                <h2 className="neo-news-bold-title">Get our chemistry newsletter</h2>
                <p className="neo-news-desc">Filter out the noise and nurture your inbox with analytical insights and molecular science.</p>
                <div className="mailpoet_form_inner">
                  <input type="email" className="mailpoet_text" placeholder="Email Address *" />
                  <button className="mailpoet_submit">Subscribe</button>
                </div>
                <p className="neo-privacy">Your <Link to="/privacy">privacy</Link> is important to us</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* BOTTOM CAROUSEL */}
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
      <div className="neo-mobile-action-bar">
        <Link to="/articles" className="neo-action-btn"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></Link>
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
