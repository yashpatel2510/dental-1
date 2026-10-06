import React, { useState } from 'react';

export default function Section1Storefront({ isVisible, onScrollDown }) {
  const [isWobbling, setIsWobbling] = useState(false);

  const handleSignInteract = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 2400);
  };

  return (
    <section 
      id="section-1" 
      className="section section-storefront full-page-hero"
      aria-label="Smile Dental Clinic Storefront & Opening Soon"
    >
      <div className="ambient-shadow-overlay" aria-hidden="true" />
      
      {/* Semantic H1 heading for SEO and accessibility */}
      <h1 className="visually-hidden">
        Smile Dental Clinic — Opening Soon
      </h1>

      {/* Horizontal "OPENING SOON" Belt (Building Area Only, Top of Building) */}
      <div 
        className="building-belt-container" 
        aria-label="Opening Soon building banner ribbon"
      >
        <div className="building-belt-strip">
          <div className="building-belt-track">
            <div className="belt-marquee-group">
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
            </div>
            <div className="belt-marquee-group" aria-hidden="true">
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
              <span className="belt-item">OPENING SOON</span>
              <span className="belt-star">✦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hanging "Opening Soon" Sign Board at Center Top with Left-Right Motion */}
      <div 
        className="hanging-sign-container"
        onClick={handleSignInteract}
        onTouchStart={handleSignInteract}
        role="button"
        tabIndex={0}
        aria-label="Opening Soon hanging sign board. Click to swing."
      >
        <picture>
          <source type="image/webp" srcSet="/hanging_opening_soon.webp" />
          <img 
            src="/hanging_opening_soon.png" 
            alt="Opening Soon Hanging Sign Board" 
            className={`hanging-sign-board ${isWobbling ? 'is-wobbling' : ''}`}
            loading="eager"
          />
        </picture>
      </div>

      {/* Full Page Edge-to-Edge Hero Image with Responsive Mobile, Tablet & Laptop Picture */}
      <div className={`hero-fullpage-media ${isVisible ? 'is-visible' : ''}`}>
        <picture className="hero-fullpage-picture">
          {/* Mobile view (smartphones <= 767px): portrait storefront */}
          <source 
            media="(max-width: 767px)" 
            srcSet="/storefront_mobile@2x.jpg 2x, /storefront_mobile.jpg 1x" 
          />
          {/* Laptop and Tablet view (>= 768px): modern architectural storefront */}
          <source 
            type="image/webp"
            media="(min-width: 768px)" 
            srcSet="/storefront_laptop_tablet@2x.webp 2x, /storefront_laptop_tablet.webp 1x" 
          />
          <source 
            media="(min-width: 768px)" 
            srcSet="/storefront_laptop_tablet@2x.jpg 2x, /storefront_laptop_tablet.jpg 1x" 
          />
          <img 
            src="/storefront_laptop_tablet@2x.jpg" 
            alt="Smile Dental Clinic Storefront — Modern Architectural View"
            className="hero-fullpage-img"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>

      {/* Subtle floating luxury scroll indicator */}
      <button 
        className="scroll-hint fullpage-scroll-hint" 
        onClick={onScrollDown}
        aria-label="Scroll to Doctor profile"
      >
        <span className="scroll-hint-pill">EXPLORE</span>
        <svg 
          className="scroll-hint-icon" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </section>
  );
}
