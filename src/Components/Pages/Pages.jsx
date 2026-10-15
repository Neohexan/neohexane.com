import React from 'react'; 
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import Home from './Home';
import About from './Infopages/About';
import Accessibility from './Infopages/Accessibility';
import Contact from './Infopages/Contact';
import Disclaimer from './Infopages/Disclaimer';
import PrivacyPolicy from './Infopages/PrivacyPolicy';
import TermsOfService from './Infopages/TermsOfService';
import Archive from './Archives/Archive';
import Single from './Single/Single';


const Pages = () => {
  // Added the return statement and parentheses
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/article/:slug" element={<Single />} />
        <Route path="/about" element={<About />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <Footer />
    </>
  );
};

// Added the missing export
export default Pages;
