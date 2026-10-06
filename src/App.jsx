import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Section1Storefront from './components/Section1Storefront';
import Section2Merged from './components/Section2Merged';

export default function App() {
  const [activeSection, setActiveSection] = useState(0); // 0 = Storefront, 1 = Doctor & Clinic
  const lenisRef = useRef(null);

  // Initialize Lenis for authentic, silky-smooth inertial scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Update active section state based on scroll position
    const handleScroll = ({ scroll }) => {
      const vh = window.innerHeight;
      if (scroll < vh * 0.45) {
        setActiveSection(0);
      } else {
        setActiveSection(1);
      }
    };

    lenis.on('scroll', handleScroll);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth glide to target section on button click
  const scrollToSection = (targetIndex) => {
    const targetSelector = targetIndex === 0 ? '#section-1' : '#section-2';
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetSelector, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <main 
      className="app-container" 
      id="main-scroller"
    >
      {/* Luxury 2-Page Floating Smooth Tracker (Desktop) */}
      <nav 
        className={`luxury-side-tracker ${activeSection === 1 ? 'theme-dark' : 'theme-light'}`} 
        aria-label="Section navigation"
      >
        <div className="tracker-track">
          <div 
            className="tracker-slider-pill" 
            style={{ transform: `translateY(${activeSection * 38}px)` }}
            aria-hidden="true"
          />
          <button 
            type="button"
            className={`tracker-item-btn ${activeSection === 0 ? 'is-active' : ''}`}
            onClick={() => scrollToSection(0)}
            aria-label="Navigate to Storefront"
          >
            <span className="tracker-number">01</span>
            <span className="tracker-label-tooltip">STOREFRONT</span>
          </button>
          <button 
            type="button"
            className={`tracker-item-btn ${activeSection === 1 ? 'is-active' : ''}`}
            onClick={() => scrollToSection(1)}
            aria-label="Navigate to Doctor & Clinic"
          >
            <span className="tracker-number">02</span>
            <span className="tracker-label-tooltip">DOCTOR & CLINIC</span>
          </button>
        </div>
      </nav>

      {/* SECTION 1: Storefront & Opening Soon */}
      <Section1Storefront 
        isVisible={activeSection === 0}
        onScrollDown={() => scrollToSection(1)}
      />

      {/* SECTION 2: Doctor Profile + Address & Leaflet Map (Merged) */}
      <Section2Merged 
        isVisible={activeSection === 1}
        onScrollTop={() => scrollToSection(0)}
      />
    </main>
  );
}
