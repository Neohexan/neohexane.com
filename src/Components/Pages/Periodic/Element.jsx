import React from 'react';
import Periodic from './Periodic';
import './Element.css';

const Element = ({ localData, cmsData }) => {
  // Safe fallback
  if (!localData) return <div className="neo-el-error">Element data not found.</div>;

  return (
    <div className="neo-element-page-wrapper">
      
      {/* 1. TOP HALF: The complete, identical Periodic Table Dashboard */}
      {/* Passing localData here sets it as the active element on load */}
      <Periodic initialElement={localData} />

      {/* 2. BOTTOM HALF: The Payload CMS Deep Dive Data */}
      {cmsData && (
        <div className="neo-el-cms-container">
          
          <div className="neo-el-divider">
            <span>[ SYSTEM: INITIATING DEEP DATA RETRIEVAL ]</span>
            <hr />
          </div>

          <section className="neo-el-cms-section">
            
            {cmsData.featuredImage && (
              <div className="neo-el-cms-image">
                <img src={cmsData.featuredImage} alt={localData.name} />
              </div>
            )}

            <div className="neo-el-cms-grid">
              
              {/* Thermodynamics Block */}
              {cmsData.thermodynamics && (
                <div className="neo-el-cms-card">
                  <h3>THERMODYNAMICS</h3>
                  <div className="neo-el-cms-stats">
                    <div className="neo-el-stat">
                      <label>Boiling Point</label>
                      <span>{cmsData.thermodynamics.boilingPoint} K</span>
                    </div>
                    <div className="neo-el-stat">
                      <label>Melting Point</label>
                      <span>{cmsData.thermodynamics.meltingPoint} K</span>
                    </div>
                    <div className="neo-el-stat">
                      <label>Density</label>
                      <span>{cmsData.thermodynamics.density}</span>
                    </div>
                    <div className="neo-el-stat">
                      <label>Specific Heat</label>
                      <span>{cmsData.thermodynamics.specificHeat}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* History Block */}
              {cmsData.history && (
                <div className="neo-el-cms-card">
                  <h3>DISCOVERY & ORIGIN</h3>
                  <div className="neo-el-history-meta">
                    <span className="neo-el-tag">By: {cmsData.history.discoveredBy}</span>
                    <span className="neo-el-tag">Year: {cmsData.history.discoveryYear}</span>
                  </div>
                  <p className="neo-el-history-text">{cmsData.history.originOfName}</p>
                  
                  {/* Rich Text from Payload */}
                  {cmsData.history.historicalNotes && (
                    <div 
                      className="neo-el-rich-text" 
                      dangerouslySetInnerHTML={{ __html: cmsData.history.historicalNotes }} 
                    />
                  )}
                </div>
              )}

            </div>
          </section>
        </div>
      )}

    </div>
  );
};

export default Element;
