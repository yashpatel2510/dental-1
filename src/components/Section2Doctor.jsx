import React from 'react';

export default function Section2Doctor({ isVisible }) {
  return (
    <section 
      id="section-2" 
      className="section section-doctor"
      aria-label="Doctor Profile — Dr. Deep Arvindbhai Patel"
    >
      <div className="section2-inner section2-centered">
        {/* 3-Column Desktop Composition matching Luxury Reference Design */}
        <div className="doctor-layout-grid">
          
          {/* LEFT COLUMN: Large Name Only */}
          <div className={`doctor-col-left ${isVisible ? 'is-visible' : ''}`}>
            <h2 className="doctor-main-name">
              <span className="name-line">Dr. Deep</span>
              <span className="name-line">Arvindbhai</span>
              <span className="name-line">Patel</span>
            </h2>
          </div>

          {/* CENTER COLUMN: Doctor Portrait (New Uploaded Image) */}
          <div className={`doctor-col-center ${isVisible ? 'is-visible' : ''}`}>
            <div className="doctor-portrait-frame">
              <img 
                src="/dr_deep_patel.jpg" 
                alt="Dr. Deep Arvindbhai Patel — BDS (Dental Surgeon)" 
                className="doctor-img"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Only BDS (DENTAL SURGEON) */}
          <div className={`doctor-col-right ${isVisible ? 'is-visible' : ''}`}>
            <div className="doctor-qualification-box">
              <span className="doctor-degree-title">BDS (DENTAL SURGEON)</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
