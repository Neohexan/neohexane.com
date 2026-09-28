import React, { useEffect, useRef, useState, useMemo } from 'react';
import './style.css';
import { Link } from 'react-router-dom';

const CHEMISTRY_CONCEPTS = [
    { id: "organic", name: "Organic Chemistry", abbr: "C₆", description: "Structure, properties, and reactions of carbon-based compounds.", category: "Carbon Chemistry", color: "#7C3AED", colorAlpha: "rgba(124, 58, 237, 0.15)", colorGlow: "rgba(124, 58, 237, 0.5)", formula: "C_nH_{2n+2}" },
    { id: "mechanisms", name: "Reaction Mechanisms", abbr: "E_a", description: "Step-by-step molecular collisions and transition states.", category: "Kinetics", color: "#00E5FF", colorAlpha: "rgba(0, 229, 255, 0.15)", colorGlow: "rgba(0, 229, 255, 0.5)", formula: "A + B → C*" },
    { id: "thermo", name: "Thermodynamics", abbr: "ΔG", description: "Enthalpy, entropy, and Gibbs free energy of reactions.", category: "Energetics", color: "#7C3AED", colorAlpha: "rgba(124, 58, 237, 0.15)", colorGlow: "rgba(124, 58, 237, 0.5)", formula: "ΔG = ΔH - TΔS" },
    { id: "quantum", name: "Quantum Chemistry", abbr: "Ψ", description: "Wave-particle duality, electron probability clouds, and orbitals.", category: "Quantum Mechanics", color: "#3B82F6", colorAlpha: "rgba(59, 130, 246, 0.15)", colorGlow: "rgba(59, 130, 246, 0.5)", formula: "Ĥψ = Eψ" },
    { id: "trends", name: "Periodic Trends", abbr: "Z*", description: "Electronegativity, ionization energy, and atomic radii.", category: "Periodic Law", color: "#10B981", colorAlpha: "rgba(16, 185, 129, 0.15)", colorGlow: "rgba(16, 185, 129, 0.5)", formula: "Z_eff = Z - S" },
    { id: "biochem", name: "Biochemistry", abbr: "ATP", description: "Enzymatic kinetics and macromolecular synthesis.", category: "Biological", color: "#3B82F6", colorAlpha: "rgba(59, 130, 246, 0.15)", colorGlow: "rgba(59, 130, 246, 0.5)", formula: "DNA/RNA" },
    { id: "nuclear", name: "Nuclear Chemistry", abbr: "α", description: "Alpha/beta/gamma decay, fission, fusion, and isotope half-lives.", category: "Nuclear Physics", color: "#00E5FF", colorAlpha: "rgba(0, 229, 255, 0.15)", colorGlow: "rgba(0, 229, 255, 0.5)", formula: "E = mc²" }
];

const RINGS_CONFIG = [
    { radius: 85, speed: 0.0018, dir: 1, items: ["organic", "quantum"] },
    { radius: 145, speed: 0.0012, dir: -1, items: ["thermo", "nuclear"] },
    { radius: 205, speed: 0.0008, dir: 1, items: ["mechanisms"] },
    { radius: 265, speed: 0.0005, dir: -1, items: ["trends", "biochem"] }
];

const Home = () => {
    const [headlineText, setHeadlineText] = useState("");
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, concept: null });
    const [hoveredRing, setHoveredRing] = useState(null);

    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const requestRef = useRef(null);
    const lastTimeRef = useRef(performance.now());
    const accumulatedAnglesRef = useRef([0, 0, 0, 0]);
    const hoveredConceptRef = useRef(null);
    const nodeRefs = useRef([]);

    // 1. 3D Starfield Warp Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const stars = [];
        const numStars = 800;
        const depth = 2000;

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * depth
            });
        }

        let lastScrollY = window.scrollY;
        let warpVelocity = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const delta = Math.abs(currentScrollY - lastScrollY);
            warpVelocity = Math.min(warpVelocity + delta * 0.3, 40);
            lastScrollY = currentScrollY;
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        const renderStars = () => {
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;
            
            warpVelocity *= 0.92; 
            const currentSpeed = 0.5 + warpVelocity; 

            for (let i = 0; i < numStars; i++) {
                const star = stars[i];
                star.z -= currentSpeed;

                if (star.z <= 0) {
                    star.z = depth;
                    star.x = (Math.random() - 0.5) * width * 2;
                    star.y = (Math.random() - 0.5) * height * 2;
                }

                const k = 256 / star.z;
                const px = star.x * k + centerX;
                const py = star.y * k + centerY;
                
                // MAKE STARS SMALLER: Changed multiplier from 3 to 1.2
                const size = Math.max(0.1, (1 - star.z / depth) * 1.2);
                
                // MAKE STARS DIMMER: Fades stars in from 5% to a maximum of 40% opacity
                const opacity = Math.max(0.05, (1 - star.z / depth) * 0.4);

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    // Use dynamic rgba for transparency instead of solid white
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fill();
                }
            }
            animationFrameId = requestAnimationFrame(renderStars);
        };

        renderStars();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // 2. Headline Typewriter
    useEffect(() => {
        const fullText = "The Next Evolution of Learning.";
        let i = 0;
        const timer = setInterval(() => {
            i++;
            setHeadlineText(fullText.slice(0, i));
            if (i === fullText.length) clearInterval(timer);
        }, 85);
        return () => clearInterval(timer);
    }, []);

    // 3. Orbital Nodes Setup
    const orbitalNodes = useMemo(() => {
        let allNodes = [];
        RINGS_CONFIG.forEach((ring, ringIdx) => {
            const itemCount = ring.items.length;
            ring.items.forEach((conceptId, itemIdx) => {
                const concept = CHEMISTRY_CONCEPTS.find(c => c.id === conceptId);
                const baseOffset = (Math.PI * 2 / itemCount) * itemIdx;
                allNodes.push({ concept, ringIdx, itemIdx, radius: ring.radius, angleOffset: baseOffset });
            });
        });
        return allNodes;
    }, []);

    // 4. Orbital Physics Loop
    useEffect(() => {
        const tick = (now) => {
            const delta = now - lastTimeRef.current;
            lastTimeRef.current = now;
            const frameFactor = Math.min(delta, 32); 

            RINGS_CONFIG.forEach((ring, idx) => {
                let speedMult = 1;
                if (hoveredConceptRef.current) {
                    const isRingHovered = orbitalNodes.some(n => n.ringIdx === idx && n.concept.id === hoveredConceptRef.current);
                    speedMult = isRingHovered ? 0.05 : 0.4;
                }
                accumulatedAnglesRef.current[idx] += ring.speed * ring.dir * speedMult * frameFactor;
            });

            nodeRefs.current.forEach((nodeEl, idx) => {
                if (!nodeEl) return;
                const nodeData = orbitalNodes[idx];
                const ringAngle = accumulatedAnglesRef.current[nodeData.ringIdx];
                const totalAngle = ringAngle + nodeData.angleOffset;
                const isHovered = hoveredConceptRef.current === nodeData.concept.id;
                const bobOffset = isHovered ? 0 : Math.sin(ringAngle * 3 + nodeData.itemIdx * 2) * 4;

                const x = 300 + nodeData.radius * Math.cos(totalAngle);
                const y = 300 + nodeData.radius * Math.sin(totalAngle);
                
                nodeEl.style.left = `calc(50% + ${x - 300}px)`;
                nodeEl.style.top = `calc(50% + ${y - 300 + bobOffset}px)`;
            });

            requestRef.current = requestAnimationFrame(tick);
        };
        requestRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(requestRef.current);
    }, [orbitalNodes]);

    // 5. Tooltip Handlers
    const handleNodeEnter = (e, nodeData) => {
        hoveredConceptRef.current = nodeData.concept.id;
        setHoveredRing(nodeData.ringIdx);
        
        const btnRect = e.currentTarget.getBoundingClientRect();
        const stageRect = stageRef.current.getBoundingClientRect();
        
        const relX = btnRect.left - stageRect.left + (btnRect.width / 2);
        const relY = btnRect.top - stageRect.top + btnRect.height + 15;
        
        const tooltipWidth = 210;
        const tooltipHeight = 110; 
        
        let finalX = relX - (tooltipWidth / 2);
        let finalY = relY;

        if (finalX < 10) finalX = 10;
        if (finalX + tooltipWidth > stageRect.width - 10) finalX = stageRect.width - tooltipWidth - 10;
        if (finalY + tooltipHeight > stageRect.height) finalY = btnRect.top - stageRect.top - tooltipHeight - 15;

        setTooltip({ show: true, x: finalX, y: finalY, concept: nodeData.concept });
    };

    const handleNodeLeave = () => {
        hoveredConceptRef.current = null;
        setHoveredRing(null);
        setTooltip((prev) => ({ ...prev, show: false }));
    };

    return (
        <div className="neo-homepage-root">
            {/* The 3D Starfield Background */}
            <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />

            <div className="hero-container">
                <div className="content-wrapper">
                    <h1 className="headline">
                        <span>{headlineText}</span>
                        <span className="cursor"></span>
                    </h1>
                    <p className="subtext">
                        Beyond static textbooks and generic courses. Neohexane merges advanced web technology with deep analytical data to create laboratory-grade educational tools for the modern web. Dive into our extensive library of tech and science articles, or experience data like never before with our interactive Quantum Periodic Table.
                    </p>
                    <div className="button-group">
                        <a href="https://neohexane.com/periodic-table/" className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 20.191c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                            Periodic Table
                        </a>
                        <Link to="/archive" className="btn btn-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Explore Articles
                        </Link>
                    </div>
                </div>
            </div>

            <div className="nh-hero-visualizer" aria-label="Interactive Orbital Chemistry Visualizer">
                <div className="nh-orbital-stage" ref={stageRef}>
                    <div className="nh-orbital-glow bg-cyan" aria-hidden="true"></div>
                    <div className="nh-orbital-glow bg-violet" aria-hidden="true"></div>

                    <div className="nh-orbital-particles" aria-hidden="true">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="nh-particle-dot" style={{
                                width: `${Math.random() * 2 + 1}px`,
                                height: `${Math.random() * 2 + 1}px`,
                                left: `${Math.random() * 100}%`,
                                backgroundColor: i % 2 === 0 ? '#00E5FF' : '#7C3AED',
                                boxShadow: `0 0 4px ${i % 2 === 0 ? '#00E5FF' : '#7C3AED'}`,
                                animationDuration: `${Math.random() * 6 + 4}s`,
                                animationDelay: `${Math.random() * 4}s`
                            }}></div>
                        ))}
                    </div>

                    <svg className="nh-orbital-rings-svg" viewBox="0 0 600 600" width="100%" height="100%" aria-hidden="true">
                        {[85, 145, 205, 265].map((r, idx) => (
                            <circle 
                                key={idx}
                                className={`nh-ring-line ring-line-${idx} ${hoveredRing === idx ? 'active' : ''}`} 
                                cx="300" cy="300" r={r} 
                            />
                        ))}
                    </svg>

                    <div className="nh-nucleus-core" aria-hidden="true">
                        <div className="nh-nucleus-glow"></div>
                        <div className="nh-nucleus-protons">
                            <div className="proton pr-1"></div>
                            <div className="proton pr-2"></div>
                            <div className="proton pr-3"></div>
                            <div className="proton pr-4"></div>
                            <svg className="nh-nucleus-svg animate-spin-slow" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/>
                                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"/>
                                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"/>
                            </svg>
                        </div>
                    </div>

                    <div className="nh-orbiting-elements">
                        {orbitalNodes.map((node, idx) => (
                            <div 
                                key={node.concept.id} 
                                className="nh-orbit-node-anchor"
                                ref={el => nodeRefs.current[idx] = el}
                            >
                                <button
                                    type="button"
                                    className="nh-node-btn"
                                    style={{
                                        '--node-color': node.concept.color,
                                        '--node-color-alpha': node.concept.colorGlow
                                    }}
                                    onMouseEnter={(e) => handleNodeEnter(e, node)}
                                    onMouseLeave={handleNodeLeave}
                                >
                                    <div className="nh-node-glow-trail"></div>
                                    <div className="nh-node-inner">{node.concept.abbr}</div>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div 
                        className={`nh-orbital-tooltip ${tooltip.show ? 'visible' : ''}`}
                        style={{
                            left: `${tooltip.x}px`,
                            top: `${tooltip.y}px`,
                            borderTop: tooltip.concept ? `2.5px solid ${tooltip.concept.color}` : 'none'
                        }}
                    >
                        {tooltip.concept && (
                            <>
                                <div className="nh-tooltip-header">
                                    <span className="nh-tooltip-category" style={{ color: tooltip.concept.color }}>
                                        {tooltip.concept.category}
                                    </span>
                                    <span className="nh-tooltip-formula">{tooltip.concept.formula}</span>
                                </div>
                                <span className="nh-tooltip-title">{tooltip.concept.name}</span>
                                <p className="nh-tooltip-desc">{tooltip.concept.description}</p>
                                <div className="nh-tooltip-action">Click to Launch Lab 🧪</div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
