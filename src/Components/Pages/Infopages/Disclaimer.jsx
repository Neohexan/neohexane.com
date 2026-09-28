import React from 'react';
import './InfoPages.css';


const Disclaimer = () => {
  return (
    <div className="neo-page-container">
      <div className="neo-page-content">
        <h1>Educational & Medical Disclaimer</h1>
        
        <h2>Educational Purposes Only</h2>
        <p>All content, data, 3D models, and interactive tools provided on Neohexane are strictly for general educational and informational purposes. They do not constitute professional scientific, academic, or laboratory advice.</p>
        
        <h2>Not Medical Advice</h2>
        <p>Information regarding chemical elements, biological roles, toxicity, or compounds must never be interpreted as medical advice. Users must consult a qualified healthcare professional for medical diagnoses or treatments.</p>
        
        <h2>Lab Safety & Assumption of Risk</h2>
        <p>Neohexane is a virtual, theoretical environment. We do not endorse or encourage users to physically replicate chemical reactions or handle hazardous materials without professional supervision in a certified laboratory setting. Neohexane assumes no liability for any accidents, injuries, or damages resulting from the misuse of information found on this site.</p>
        
        <h2>Accuracy of Data</h2>
        <p>While we strive to provide highly accurate atomic and chemical data, scientific models are constantly evolving. Neohexane makes no guarantees regarding the absolute accuracy or completeness of the data provided and should not be used as the sole reference for critical engineering or laboratory research.</p>
      </div>
    </div>
  );
};

export default Disclaimer;
