import React, { useState } from 'react';
import './PeriodicWidgets.css';
import elementsData from '../../../assets/elements_data.js';

// --- HELPER FUNCTION ---
// Extracts just the protons and neutrons (e.g. "79p+118n")
const getSubatomicLabel = (str) => {
  if (!str) return '';
  const parts = str.split(' / ');
  const p = parts[0] ? parts[0].trim().split(' ')[0] : '';
  const n = parts[1] ? parts[1].trim().split(' ')[0] : '';
  return `${p}p+${n}n`;
};

const BohrSpin = ({ element }) => {
  const [isPaused, setIsPaused] = useState(false);
  
  // Use a lazy initializer function so it picks a random element 
  // on the very first render instead of defaulting to Carbon!
  const [standaloneElement, setStandaloneElement] = useState(() => {
    const randomIndex = Math.floor(Math.random() * elementsData.length);
    return elementsData[randomIndex];
  }); 

  // Check if the widget is running independently or being controlled by a parent page
  const isStandalone = !element;
  
  let targetElement;
  if (isStandalone) {
    targetElement = {
      symbol: standaloneElement.symbol,
      subatomic: getSubatomicLabel(standaloneElement.subatomic),
      shells: standaloneElement.shells
    };
  } else {
    targetElement = {
      symbol: element.symbol,
      subatomic: getSubatomicLabel(element.subatomic),
      shells: element.shells
    };
  }

  // Pick a truly random element from the full 119 array when tapped
  const handleWidgetClick = () => {
    if (isStandalone) {
      const randomIndex = Math.floor(Math.random() * elementsData.length);
      setStandaloneElement(elementsData[randomIndex]);
    }
  };

  return (
    <div className="neo-bohr-panel">
      <div className="neo-bohr-header">
        <h3>BOHR ELECTRON SHELL MODEL</h3>
        <button onClick={(e) => { 
          e.stopPropagation(); // Prevents click from accidentally changing the atom
          setIsPaused(!isPaused); 
        }}>
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      <div 
        className="neo-bohr-container" 
        onClick={handleWidgetClick}
        style={{ 
          cursor: isStandalone ? 'pointer' : 'default',
          WebkitTapHighlightColor: 'transparent', /* Kills the blue mobile tap flash */
          userSelect: 'none',                     /* Prevents text selection on rapid tapping */
          outline: 'none'
        }}
        title={isStandalone ? "Tap to randomize element" : ""}
      >
        <div className="neo-nucleus">
          <span>{targetElement.symbol}</span>
          <small>{targetElement.subatomic}</small>
        </div>

        <div className="neo-bohr-orbits">
          {targetElement.shells.map((electrons, shellIndex) => {
            const size = 80 + (shellIndex * 35);
            const speed = 8 + (shellIndex * 2);

            return (
              <div key={shellIndex} className="neo-orbit" style={{ width: size, height: size }}>
                <div 
                  className="neo-orbit-ring" 
                  style={{ 
                    animationDuration: `${speed}s`, 
                    animationPlayState: isPaused ? 'paused' : 'running' 
                  }}
                >
                  {Array.from({ length: electrons }).map((_, i) => {
                    const angle = (i / electrons) * 2 * Math.PI;
                    const cx = 50 + 50 * Math.cos(angle);
                    const cy = 50 + 50 * Math.sin(angle);
                    return (
                      <div 
                        key={i} 
                        className="neo-electron" 
                        style={{ left: `${cx}%`, top: `${cy}%` }} 
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BohrSpin;
