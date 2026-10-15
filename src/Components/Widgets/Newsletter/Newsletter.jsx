import React, { useState } from 'react';
import './NewsletterWidget.css';

const NewsletterWidget = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate a brief network request for realism
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
    }, 600);
  };

  return (
    <div className="neo-sidebar-box neo-sidebar-newsletter">
      <h2 className="neo-news-bold-title">Get our chemistry newsletter</h2>
      <p className="neo-news-desc">Filter out the noise and nurture your inbox with analytical insights and molecular science.</p>
      
      {!isSubscribed ? (
        <form className="mailpoet_form_inner" onSubmit={handleSubscribe}>
          <input 
            type="email" 
            className="mailpoet_text" 
            placeholder="Email Address *" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required 
          />
          <button 
            type="submit" 
            className={`mailpoet_submit ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'SUBSCRIBE!'}

          </button>
        </form>
      ) : (
        <div className="neo-news-success-card">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="success-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div>
            <strong>Subscription Confirmed</strong>
            <p>Welcome to the Neohexane network.</p>
          </div>
        </div>
      )}
      
      <p className="neo-privacy">
        Your <a heref="/legal/privacy">privacy</a> is important to us
      </p>
    </div>
  );
};

export default NewsletterWidget;
