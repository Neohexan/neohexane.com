import React from 'react';
import './InfoPages.css';


const Accessibility = () => {
  return (
    <div className="neo-page-container">
      <div className="neo-page-content">
        <h1>Accessibility Statement</h1>
        
        <h2>Commitment to Accessibility</h2>
        <p>Neohexane is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards (WCAG).</p>
        
        <h2>Conformance Status</h2>
        <p>We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1.</p>
        
        <h2>Known Limitations</h2>
        <p>Because Neohexane relies heavily on advanced, interactive graphical elements (such as the interactive Periodic Table and potentially 3D chemical models), full screen-reader compatibility and complete keyboard-only navigation for these specific modules are actively in development.</p>
        
        <h2>Visual Sensitivities</h2>
        <p>Our "Dark Quantum" interface uses high-contrast neon elements and subtle animations. We advise users that they may utilize browser-level settings to reduce motion or override high-contrast colors if needed.</p>
        
        <h2>Feedback & Support</h2>
        <p>We welcome feedback on the accessibility of Neohexane. If you encounter accessibility barriers or need assistance navigating the platform, please contact us at <a href="mailto:qwertyritin@gmail.com">qwertyritin@gmail.com</a>, and we will try to respond within a reasonable timeframe.</p>
      </div>
    </div>
  );
};

export default Accessibility;
