import React, { useState } from 'react';
import './QuoteWidget.css';
import chemistryQuotes from '../../../assets/chemistryQuotes.js';

const QuoteWidget = () => {
  // Use lazy initializers so the random math only runs exactly once when the widget mounts
  const [quote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * chemistryQuotes.length);
    return chemistryQuotes[randomIndex];
  });
  
  const [quoteTheme] = useState(() => {
    return Math.random() > 0.5 ? 'theme-industrial' : 'theme-quantum';
  });

  // Fallback in case chemistryQuotes is empty or malformed
  if (!quote || quote.length < 2) return null;

  return (
    <div className={`neo-quote-wrapper ${quoteTheme}`}>
      <div className="neo-quote-card"></div>
      <div className="neo-quote-content">
        <div className="neo-quote-text">&ldquo;{quote[0]}&rdquo;</div>
        <div className="neo-quote-author">&mdash; {quote[1]}</div>
      </div>
    </div>
  );
};

export default QuoteWidget;
