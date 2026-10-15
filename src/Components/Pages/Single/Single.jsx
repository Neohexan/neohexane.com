import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Single.css';
import ArticleSidebar from '../../Widgets/ArticleSidebar'; 
import ArticleComments from './ArticleComments'; 
import { marked } from 'marked';

import katex from 'katex';
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/dist/contrib/auto-render.js';

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

const TagFan = ({ text, textColor = '#FFFFFF', finalColor, layers, delay = 0, canReveal = true, className = '' }) => {
  const intermediateLayers = layers.slice(0, -1);
  return (
    <span data-can-reveal={canReveal ? 'true' : 'false'} style={{ '--delay': `${delay}s` }} className={`mr-tag-fan ${className}`}>
      <span className="mr-tag-base" aria-hidden="true" />
      {intermediateLayers.map((color, index) => (
        <span key={index} className="mr-tag-layer" style={{ backgroundColor: color, '--index': index }} aria-hidden="true" />
      ))}
      <span className="mr-tag-layer mr-text-layer" style={{ backgroundColor: finalColor, color: textColor, '--index': intermediateLayers.length }}>
        <span>{text}</span>
      </span>
    </span>
  );
};

const WordReveal = ({ text, baseDelay, wordInterval = 0.12, canReveal = true, className = '' }) => {
  const words = text.split(' ').filter(w => w.trim().length > 0);
  return (
    <span className={`mr-word-reveal ${className}`}>
      {words.map((word, idx) => {
        const delay = baseDelay + idx * wordInterval;
        return (
          <span key={idx} className={`mr-word-span ${canReveal ? 'revealed' : ''}`} style={{ transitionDelay: `${delay}s` }}>
            {word}
          </span>
        );
      })}
    </span>
  );
};

// ADDED: currentUser prop to the Single component
const Single = ({ post, currentUser }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false); 
  const [savedArticles, setSavedArticles] = useState([]);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [canReveal, setCanReveal] = useState(false); 
  
  const lastScrollY = useRef(0);
  const articleRef = useRef(null); 

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => setCanReveal(true), 150);

    const savedTheme = localStorage.getItem('neo_theme');
    const prefersLight = savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches);
    
    if (prefersLight) {
      setIsLightMode(true);
      document.body.classList.add('neo-light-mode');
      document.documentElement.classList.add('neo-light-mode');
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolledDown(currentScrollY > lastScrollY.current && currentScrollY > 100);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dynamicTitle = useMemo(() => {
    if (!post || !post.title) return null;

    const cleanText = post.title.replace(/<[^>]+>/g, '').trim();
    const words = cleanText.split(/\s+/).filter(w => w.trim().length > 0);
    
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
  }, [post, canReveal]);

  // ==========================================
  // MATHEMATICS PRE-PROCESSOR & COMPILER
  // ==========================================
  const parsedContentHtml = useMemo(() => {
    if (!post || !post.content) return '';
    let rawContent = post.content;
    
    rawContent = rawContent.replace(/[b1]([\s\S]*?)\[\/b1\]/g, '<div class="neo-custom-box neo-box-1">$1</div>');
    
    const displayMath = [];
    const inlineMath = [];

    // Extract Display Math safely
    rawContent = rawContent.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      displayMath.push(math);
      return `NEODISPLAYMATH${displayMath.length - 1}NEO`;
    });
    rawContent = rawContent.replace(/\\\[([\s\S]+?)\\\]/g, (match, math) => {
      displayMath.push(math);
      return `NEODISPLAYMATH${displayMath.length - 1}NEO`;
    });

    // Extract Inline Math safely
    rawContent = rawContent.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      inlineMath.push(math);
      return `NEOINLINEMATH${inlineMath.length - 1}NEO`;
    });
    rawContent = rawContent.replace(/\\\(([^\n]+?)\\\)/g, (match, math) => {
      inlineMath.push(math);
      return `NEOINLINEMATH${inlineMath.length - 1}NEO`;
    });

    let html = marked.parse(rawContent);

    // Re-inject Rendered KaTeX Display Math (Strips out buggy marked.js <p> tags)
    displayMath.forEach((math, i) => {
      try {
        const rendered = katex.renderToString(math, { displayMode: true, throwOnError: false });
        const exactPRegex = new RegExp(`<p>\\s*NEODISPLAYMATH${i}NEO\\s*</p>`, 'g');
        const fallbackRegex = new RegExp(`NEODISPLAYMATH${i}NEO`, 'g');
        
        if (exactPRegex.test(html)) {
          html = html.replace(new RegExp(`<p>\\s*NEODISPLAYMATH${i}NEO\\s*</p>`, 'g'), () => `<div class="neo-math-display">${rendered}</div>`);
        } else {
          html = html.replace(fallbackRegex, () => `<div class="neo-math-display">${rendered}</div>`);
        }
      } catch (err) { console.error(err); }
    });

    // Re-inject Rendered KaTeX Inline Math
    inlineMath.forEach((math, i) => {
      try {
        const rendered = katex.renderToString(math, { displayMode: false, throwOnError: false });
        const plainRegex = new RegExp(`NEOINLINEMATH${i}NEO`, 'g');
        html = html.replace(plainRegex, () => `<span class="neo-math-inline">${rendered}</span>`);
      } catch (err) { console.error(err); }
    });

    html = html.replace(
      /<img([^>]+)>/g, 
      '<span class="neo-img-skeleton-wrapper"><img$1 loading="lazy" onload="this.parentElement.classList.add(\'loaded\')" /></span>'
    );

    return html;
  }, [post]);

  useEffect(() => {
    if (!isMounted || !articleRef.current) return;

    renderMathInElement(articleRef.current, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '[', right: ']', display: true }
      ],
      throwOnError: false 
    });

    const headings = articleRef.current.querySelectorAll('h2, h3, h4, h5, h6');
    if (headings.length === 0) return;

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
      if (heading.dataset.gooeyApplied === "true") return;
      heading.dataset.gooeyApplied = "true";

      const text = heading.textContent.trim();
      const words = text.split(/\s+/).filter(w => w.trim().length > 0);
      if (words.length === 0) return;

      const originalTag = heading.tagName.toLowerCase();
      const wrapper = document.createElement('div');
      wrapper.className = `neo-interior-wrapper is-${originalTag}-wrapper observed`; 
      
      heading.parentNode.insertBefore(wrapper, heading);

      const theme = dotPalettes[hIndex % dotPalettes.length];
      const dot = document.createElement('span');
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
        const span = document.createElement('span');
        span.className = 'neo-gooey-word';
        span.style.transitionDelay = `${index * 0.08}s`;
        span.innerText = word;
        heading.appendChild(span);
        heading.appendChild(document.createTextNode(' '));
      });

      wrapper.appendChild(heading);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            setTimeout(() => {
              heading.style.filter = 'none'; 
            }, (0.8 + (words.length * 0.08)) * 1000 + 50);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

      observer.observe(wrapper);
    });
  }, [parsedContentHtml, isLightMode, isMounted]);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('neo_theme', newMode ? 'light' : 'dark');
    document.body.classList.toggle('neo-light-mode', newMode);
    document.documentElement.classList.toggle('neo-light-mode', newMode);
  };

  const toggleBookmark = (id) => {
    if (savedArticles.includes(id)) {
      setSavedArticles(savedArticles.filter(savedId => savedId !== id));
    } else {
      setSavedArticles([...savedArticles, id]);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url: window.location.href }); } 
      catch (err) { console.log('Share cancelled'); }
    } else {
      navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!');
    }
  };

  const getFeaturedImage = (p) => {
    return p.featuredImageUrl ? p.featuredImageUrl : null;
  };

  const getAuthorImage = (authorData) => {
    if (!authorData) return 'https://ui-avatars.com/api/?name=Neohexane&background=0D8ABC&color=fff';
    if (authorData.avatar?.url) return authorData.avatar.url;
    if (authorData.profilePicture?.url) return authorData.profilePicture.url;
    if (authorData.image?.url) return authorData.image.url;
    if (authorData.imageUrl) return authorData.imageUrl;
    
    const fallbackName = encodeURIComponent(authorData.name || 'User');
    return `https://ui-avatars.com/api/?name=${fallbackName}&background=0D8ABC&color=fff`;
  };

  if (!post) return null;

  const mainImage = getFeaturedImage(post);
  const author = post.author?.name || 'Neohexane Team'; 
  const avatar = getAuthorImage(post.author);
  const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const categoryName = post.category?.name || post.category?.title || null;
  
  const subtitle = post.subtitle || "";
  const references = post.references || [];
  const keywords = post.tags || [];

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
          {categoryName && (
            <div className="neo-article-cat">{categoryName}</div>
          )}
          
          <div className="neo-title-row">
            {dynamicTitle}
          </div>

          {subtitle && <p className="neo-article-subtitle" dangerouslySetInnerHTML={{ __html: subtitle }}></p>}
          
          <div className="neo-article-meta">
            <span className="neo-by-text">BY</span>
            <LazyImage src={avatar} alt={author} className="neo-author-avatar-wrapper" />
            <span className="neo-author-name">{author}</span>
            <span className="neo-meta-divider">|</span>
            <span className="neo-meta-date">{date}</span>
          </div>
        </header>

        <div className="neo-content-sidebar-grid">
          <main className="neo-main-content">
            {mainImage && <LazyImage src={mainImage} alt="Featured" className="neo-featured-image-wrapper" />}
            
            <article 
              ref={articleRef} 
              className="neo-post-content" 
              dangerouslySetInnerHTML={{ __html: parsedContentHtml }} 
            />

            {(references.length > 0 || keywords.length > 0) && (
              <div className="neo-article-subs">
                {references.length > 0 && (
                  <details className="neo-sub-details">
                    <summary className="neo-sub-summary">
                      <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> References
                    </summary>
                    <div className="neo-sub-content">
                      <ul>
                        {references.map((ref, i) => (
                          <li key={i}>
                            <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.sourceName}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
                
                {keywords.length > 0 && (
                  <details className="neo-sub-details">
                    <summary className="neo-sub-summary">
                      <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> Keywords
                    </summary>
                    <div className="neo-sub-content neo-keywords-content">
                      {keywords.map((tag, i) => (
                        <a key={i} href={`/articles/?search=${tag.tagName}`} className="neo-keyword-tag">
                          {tag.tagName}
                        </a>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
            
            {/* ADDED: Passes the currentUser prop directly to the comments */}
            <ArticleComments postId={post.id} currentUser={currentUser} />

          </main>

          <ArticleSidebar />
        </div>
      </div>

      <div className={`neo-mobile-action-bar ${isScrolledDown ? 'hidden' : ''}`}>
        <a href="/archive" className="neo-action-btn"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></a>
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

export default Single;
