import React, { useState } from 'react';
import PeriodicTable from './PeriodicTable/PeriodicTable';
import BohrSpin from './PeriodicTable/BohrSpin';
import QuoteWidget from './chemistryQuotes/Quote';
import NewsletterWidget from './Newsletter/Newsletter';
import './ArticleSidebar.css';

const ArticleSidebar = () => {
  const [selectedElement, setSelectedElement] = useState(null);

  return (
    <aside className="neo-sidebar" id="neo-fixed-sidebar">
      
      {/* 1. TOP WIDGET (Fixed at the start) */}
      <div className="neo-sidebar-top-group">
        <div className="neo-sidebar-box neo-pt-widget">
          <h2 className="neo-sidebar-title">Discover the Elements</h2>
          <PeriodicTable 
            onElementClick={(el) => setSelectedElement(el)} 
            activeElement={selectedElement} 
          />
          <hr className="neo-widget-divider" />
          <BohrSpin element={selectedElement} />
        </div>
      </div>

      {/* 2. MIDDLE GROUP (Empty space for future 'Also Read' cards) */}
      <div className="neo-sidebar-middle-group">
         {/* Future cards will go here */}
      </div>

            {/* 3. BOTTOM GROUP (Quotes + Newsletter) */}
      <div className="neo-sidebar-bottom-group">
        <div className="neo-sidebar-widget-wrapper">
          <QuoteWidget />
        </div>
        <div className="neo-sidebar-widget-wrapper">
          <NewsletterWidget />
        </div>
      </div>


    </aside>
  );
};

export default ArticleSidebar;
