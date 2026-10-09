import React, { useEffect, useRef, useState } from 'react';
import './PeriodicWidgets.css';
import elementsData from '../../../assets/elements_data.js';

const getCategoryColor = (category) => {
  const map = {
    'diatomic nonmetal': '#007AFF', 
    'polyatomic nonmetal': '#007AFF',
    'noble gas': '#5856D6',
    'alkali metal': '#FF3B30',
    'alkaline earth metal': '#FF9500',
    'metalloid': '#34C759',
    'post-transition metal': '#5AC8FA',
    'transition metal': '#FFCC00',
    'lanthanide': '#FF2D55',
    'actinide': '#FF6482',
    'unknown, probably transition metal': '#FFCC00',
    'unknown, predicted to be noble gas': '#5856D6',
    'unknown, but predicted to be an alkali metal': '#FF3B30',
    'unknown, probably post-transition metal': '#5AC8FA',
    'unknown, probably metalloid': '#34C759'
  };
  return map[category?.toLowerCase()] || '#ffffff';
};

const PeriodicTable = ({ activeCategory = null, activeElement = null, searchTerm = '', onElementClick }) => {
  const containerRef = useRef(null);
  const [isTableFocused, setIsTableFocused] = useState(false);

  // Global listeners for clicks outside and page scrolling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsTableFocused(false); 
      }
    };

    const handlePageScroll = () => {
      setIsTableFocused(false);
    };

    // Listen for clicks/taps
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    // Listen for vertical page scrolling
    window.addEventListener('scroll', handlePageScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handlePageScroll);
    };
  }, []);
  
  const getOpacityStatus = (el) => {
    if (activeElement && isTableFocused) {
      return el.number === activeElement.number ? 'active-cat' : 'dimmed';
    }

    if (activeCategory) {
      return el.category === activeCategory ? 'active-cat' : 'dimmed';
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = el.name.toLowerCase().includes(term) || 
                    el.symbol.toLowerCase() === term || 
                    el.number.toString() === term;
      return match ? 'active-cat' : 'dimmed';
    }

    return '';
  };

  return (
    <div 
      className="neo-pt-outer-container" 
      ref={containerRef}
      onClick={() => setIsTableFocused(false)} 
    >
      <div 
        className="neo-pt-scroll-wrapper"
        /* Instantly removes focus if the user swipes the table horizontally */
        onScroll={() => setIsTableFocused(false)} 
      >
        <div className="neo-pt-grid">
          
          <div className="neo-pt-swipe-hint" style={{ gridRow: 1, gridColumn: '2 / 10' }}>
            ← Swipe horizontally to view full table →
          </div>
          
          <div className="neo-pt-placeholder" style={{ gridRow: 6, gridColumn: 3 }}>
            <div className="s">57-71</div>
            <div className="nm">*</div>
          </div>

          <div className="neo-pt-placeholder" style={{ gridRow: 7, gridColumn: 3 }}>
            <div className="s">89-103</div>
            <div className="nm">**</div>
          </div>

          <div style={{ gridRow: 8, gridColumn: '1 / span 18', height: '20px' }}></div>

          {elementsData.map((el) => {
            let r = el.period;
            let c = el.group;

            if (el.category === 'lanthanide') {
              r = 9;
              c = (el.number - 57) + 4;
            } else if (el.category === 'actinide') {
              r = 10;
              c = (el.number - 89) + 4;
            }

            const color = getCategoryColor(el.category);
            const statusClass = getOpacityStatus(el);

            return (
              <div
                key={el.number}
                className={`neo-pt-element ${statusClass}`}
                style={{ gridRow: r, gridColumn: c }}
                onClick={(e) => {
                  e.stopPropagation(); 
                  setIsTableFocused(true); 
                  onElementClick && onElementClick(el); 
                }}
              >
                <div className="n">{el.number}</div>
                <div className="s" style={{ color: color }}>{el.symbol}</div>
                <div className="nm">{el.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PeriodicTable;
