import React, { useState, useEffect } from 'react';
import PeriodicTable from '../../Widgets/PeriodicTable/PeriodicTable';
import BohrSpin from '../../Widgets/PeriodicTable/BohrSpin';
import elementsData from '../../../assets/elements_data.js';
import './Periodic.css';

const categoriesMap = {
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

const uniqueCategories = [
  'diatomic nonmetal', 'noble gas', 'alkali metal', 'alkaline earth metal', 
  'metalloid', 'polyatomic nonmetal', 'post-transition metal', 'transition metal', 
  'lanthanide', 'actinide'
];

const Periodic = ({ initialElement, cmsData }) => {
  // Initialize with the prop or default to Carbon to prevent SSR hydration errors
  const [activeElement, setActiveElement] = useState(initialElement || elementsData[5]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If loaded standalone (no initialElement), select a random element on client mount
  useEffect(() => {
    if (!initialElement) {
      const randomIndex = Math.floor(Math.random() * elementsData.length);
      setActiveElement(elementsData[randomIndex]);
    } else {
      setActiveElement(initialElement);
    }
  }, [initialElement]);

  const handleCategoryToggle = (cat) => {
    setActiveCategory(prev => prev === cat ? null : cat);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Centralized routing logic: The grid widget calls this function when an atom is clicked
  const handleElementClick = (el) => {
    // Navigate to the dynamic detail page
    window.location.href = `/periodic-table/${el.name.toLowerCase()}`;
  };

  const activeColor = categoriesMap[activeElement?.category?.toLowerCase()] || '#ffffff';

  return (
    <div className="neo-pt-container">
      
      {/* SECTION 1: HEADER */}
      <header className="neo-pt-section-intro">
        <div className="neo-pt-badge-wrapper">
          <div className="neo-pt-badge">ELEMENTS</div>
        </div>
        <h1>Periodic Table</h1>
        <p>Elemental trends, electronegativity, and orbital shielding.</p>
        <div className="neo-pt-core-principles">
          <h3>CORE PRINCIPLES</h3>
          <ul>
            <li><strong>Fundamental Organization:</strong> Elements are ordered by atomic number, with rows (periods) indicating the number of electron shells and columns (groups) dictating valence electrons.</li>
            <li><strong>Quantum Layout:</strong> The table's physical structure maps directly to quantum mechanics, dividing elements into <em>s, p, d, f</em> blocks based on electron energy levels.</li>
            <li><strong>Predictable Trends:</strong> Key chemical properties shift consistently across rows and down columns due to changes in nuclear pull and electron shielding.</li>
          </ul>
          <div className="neo-pt-model-rev">MODEL REVISION: 2026.06</div>
        </div>
      </header>

      {/* SECTION 2: GRID & CONTROLS */}
      <section className="neo-pt-section-table">
        <div className="neo-pt-table-header">
          <h3>LABORATORY EXPERIMENTATION SCREEN</h3>
          <span className="neo-pt-workspace-id">WORKSPACE ID: 0XPERIODIC</span>
        </div>
        
        <div className="neo-pt-search-container">
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={isMobile ? "Search symbol, name, or no..." : "Search by symbol, name, or number (e.g. Au, Carbon, 79)..."} 
          />
        </div>

        <div className="neo-pt-category-filters">
          {uniqueCategories.map(cat => (
            <button 
              key={cat}
              className={`neo-pt-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryToggle(cat)}
            >
              <div className="neo-pt-filter-dot" style={{ background: categoriesMap[cat] }}></div> 
              {cat}
            </button>
          ))}
        </div>

        <PeriodicTable 
          activeCategory={activeCategory}
          activeElement={activeElement}
          searchTerm={searchTerm}
          onElementClick={handleElementClick} // Passed directly to the widget
        />
      </section>

      {/* SECTION 3: BASE DATA & BOHR */}
      <section className="neo-pt-section-details">
        {activeElement && (
          <div className="neo-pt-data-panel">
            <div className="neo-pt-panel-header">
              <span 
                className="neo-pt-category-badge" 
                style={{ 
                  color: activeColor, 
                  backgroundColor: `color-mix(in srgb, ${activeColor} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${activeColor} 30%, transparent)`
                }}
              >
                {activeElement.category.toUpperCase()}
              </span>
              <div className="neo-pt-atomic-no">
                <span>{activeElement.number}</span><br />
                <small>ATOMIC NO.</small>
              </div>
            </div>
            
            <h2>{activeElement.name}</h2>
            
            <div className="neo-pt-data-grid">
              <div className="neo-pt-data-item"><label>SYMBOL:</label><div className="val blue">{activeElement.symbol}</div></div>
              <div className="neo-pt-data-item"><label>ATOMIC MASS:</label><div className="val">{activeElement.mass}</div></div>
              <div className="neo-pt-data-item"><label>STP STATE:</label><div className="val">{activeElement.stp_state}</div></div>
              <div className="neo-pt-data-item"><label>ELECTRONEGATIVITY:</label><div className="val">{activeElement.electronegativity}</div></div>
              <div className="neo-pt-data-item"><label>PERIOD & GROUP:</label><div className="val">P{activeElement.period} • G{activeElement.group}</div></div>
              <div className="neo-pt-data-item"><label>VALENCE ELECTRONS:</label><div className="val cyan">{activeElement.valence_electrons}</div></div>
              <div className="neo-pt-data-item"><label>BLOCK:</label><div className="val purple">{activeElement.block}</div></div>
              <div className="neo-pt-data-item"><label>SUBATOMIC PARTICLES:</label><div className="val" style={{fontSize: '11px'}}>{activeElement.subatomic}</div></div>
            </div>
          </div>
        )}
        
        {/* BOHR WIDGET & DATA FOOTER */}
        {activeElement && (
          <div className="neo-pt-bohr-column">
            <BohrSpin element={activeElement} />
            <div className="neo-pt-bohr-footer">
              <div className="neo-pt-bohr-stat">
                <label>Shell Layout:</label>
                <span>{activeElement.shells.join(' • ')}</span>
              </div>
              <div className="neo-pt-bohr-stat">
                <label>Electron Config:</label>
                <span className="cyan-text">{activeElement.electronic_configuration}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4: CMS DEEP DIVE DATA */}
      {cmsData && (
        <section className="neo-pt-cms-data" style={{ marginTop: '30px' }}>
          
          {cmsData.featuredImage && (
            <div className="neo-pt-cms-image" style={{ marginBottom: '20px' }}>
              <img 
                src={cmsData.featuredImage} 
                alt={cmsData.name} 
                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }} 
              />
            </div>
          )}

          <div className="neo-pt-cms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {cmsData.thermodynamics && (
              <div className="neo-pt-cms-card" style={{ background: '#0C101A', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ color: '#00FFCC', fontSize: '13px', letterSpacing: '2px', marginBottom: '20px' }}>THERMODYNAMICS</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#ddd' }}>
                  <li><strong style={{ color: '#666', marginRight: '8px' }}>Boiling Point:</strong> {cmsData.thermodynamics.boilingPoint} K</li>
                  <li><strong style={{ color: '#666', marginRight: '8px' }}>Melting Point:</strong> {cmsData.thermodynamics.meltingPoint} K</li>
                  <li><strong style={{ color: '#666', marginRight: '8px' }}>Density:</strong> {cmsData.thermodynamics.density}</li>
                </ul>
              </div>
            )}

            {cmsData.history && (
              <div className="neo-pt-cms-card" style={{ background: '#0C101A', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ color: '#00FFCC', fontSize: '13px', letterSpacing: '2px', marginBottom: '20px' }}>HISTORY & DISCOVERY</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#ddd' }}>
                  <li><strong style={{ color: '#666', marginRight: '8px' }}>Discovered By:</strong> {cmsData.history.discoveredBy}</li>
                  <li><strong style={{ color: '#666', marginRight: '8px' }}>Year:</strong> {cmsData.history.discoveryYear}</li>
                </ul>
                <p className="neo-pt-origin-note" style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {cmsData.history.originOfName}
                </p>
              </div>
            )}

          </div>
        </section>
      )}

    </div>
  );
};

export default Periodic;
