import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Section2Merged({ isVisible, onScrollTop }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const googleMapsUrl = 'https://maps.app.goo.gl/8MdWsGwiL8TVMZ6R8';
  const clinicLat = 20.7666713;
  const clinicLng = 72.9787998;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map centered on Bilimora clinic
    const map = L.map(mapContainerRef.current, {
      center: [clinicLat, clinicLng],
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    // Dark Luxury Basemap & Labels
    const darkBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, attribution: '' }
    );
    const darkLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, attribution: '' }
    );

    darkBase.addTo(map);
    darkLabels.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Custom pulsing pin marker
    const customPinIcon = L.divIcon({
      className: 'leaflet-custom-pin',
      html: `
        <div class="real-map-pin-inner">
          <div class="pin-pulse"></div>
          <svg width="30" height="36" viewBox="0 0 24 30" fill="none">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12z" fill="#e73838"/>
            <circle cx="12" cy="11" r="4.5" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [30, 36],
      iconAnchor: [15, 36],
      popupAnchor: [0, -36],
    });

    const marker = L.marker([clinicLat, clinicLng], { icon: customPinIcon }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px; line-height: 1.45; color: #111; padding: 2px;">
        <strong style="display: block; font-size: 14px; margin-bottom: 4px; color: #111;">Smile Dental Clinic</strong>
        <span style="color: #444; display: block; font-size: 12px; margin-bottom: 8px;">1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA</span>
        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #18869b; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 11px; text-decoration: none; letter-spacing: 0.05em;">
          OPEN IN GOOGLE MAPS ↗
        </a>
      </div>
    `);

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isVisible && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
    }
  }, [isVisible]);

  return (
    <section 
      id="section-2" 
      className="section section-merged-split"
      aria-label="Doctor Profile, Clinic Address and Location"
    >
      {/* UPPER HALF: DOCTOR INFORMATION (DARK BACKGROUND) */}
      <div className="merged-doctor-half">
        <div className={`merged-doctor-inner ${isVisible ? 'is-visible' : ''}`}>
          <div className="merged-doctor-grid">
            {/* Left: Doctor Name */}
            <div className="merged-doctor-name-col">
              <h2 className="doctor-main-name">
                <span className="name-line">Dr. Deep</span>
                <span className="name-line">Arvindbhai</span>
                <span className="name-line">Patel</span>
              </h2>
            </div>

            {/* Center: Doctor Portrait */}
            <div className="merged-doctor-portrait-col">
              <div className="merged-portrait-frame">
                <img 
                  src="/dr_deep_patel.jpg" 
                  alt="Dr. Deep Arvindbhai Patel — BDS (Dental Surgeon)" 
                  className="doctor-img"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right: Qualification */}
            <div className="merged-doctor-qual-col">
              <div className="doctor-qualification-box">
                <span className="doctor-degree-title">BDS (DENTAL SURGEON)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER HALF: ADDRESS & DARK LUXURY MAP (rgb(236, 228, 222) BACKGROUND) */}
      <div className="merged-contact-half">
        <div className={`merged-contact-inner ${isVisible ? 'is-visible' : ''}`}>
          <div className="merged-contact-grid">
            {/* Left: Contact Details */}
            <div className="merged-contact-info-col">
              <h3 className="merged-contact-heading">ADDRESS</h3>

              <div className="merged-contact-list">
                <a href="mailto:casmileatbilimora@gmail.com" className="merged-link-item">
                  casmileatbilimora@gmail.com
                </a>
                <address className="merged-address-item">
                  1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA
                </address>
                <a href="tel:+917226098074" className="merged-link-item merged-phone-item">
                  +91 72260 98074
                </a>
              </div>

              {/* Social Icons: Instagram & WhatsApp */}
              <div className="social-icons-group merged-socials" aria-label="Social media links">
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/_i_deep.7?stkn=c3Rhcmk3aHE4bjBw" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-circle-btn" 
                  aria-label="Instagram"
                  title="Follow on Instagram"
                >
                  <svg className="social-icon-svg" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a 
                  href="https://wa.me/917226098074" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-circle-btn whatsapp-btn" 
                  aria-label="WhatsApp"
                  title="Chat on WhatsApp (+91 72260 98074)"
                >
                  <svg className="social-icon-svg" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.511 2 2.016 6.496 2.016 12.016c0 1.988.583 3.842 1.6 5.41L2 22l4.734-1.57c1.517.925 3.3 1.458 5.297 1.458 5.52 0 10.016-4.496 10.016-10.016 0-5.52-4.496-10.016-10.016-10.016zm5.83 14.184c-.244.686-1.22 1.258-1.789 1.341-.534.079-1.23.112-3.568-.857-2.986-1.237-4.912-4.28-5.06-4.48-.148-.2-1.21-1.61-1.21-3.07 0-1.46.764-2.179 1.037-2.474.272-.294.595-.368.794-.368.198 0 .397.002.57.01.183.009.43-.07.671.509.248.594.845 2.062.92 2.21.074.15.124.325.025.522-.099.198-.149.323-.298.497-.148.173-.312.387-.446.52-.148.148-.303.31-.13.608.173.298.77 1.268 1.651 2.052 1.134 1.01 2.09 1.323 2.388 1.472.298.148.472.124.646-.075.174-.198.744-.866.942-1.164.198-.298.397-.248.67-.148.272.099 1.737.82 2.035.968.298.149.496.223.57.347.075.124.075.72-.169 1.406z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Leaflet Dark Luxury Map */}
            <div className="merged-map-col">
              <div 
                className="map-visual-wrapper real-map-wrapper dark-luxury-map-frame merged-map-frame"
                data-lenis-prevent="true"
              >
                <div 
                  ref={mapContainerRef} 
                  className="real-map-leaflet-container" 
                  data-lenis-prevent="true"
                  tabIndex={0}
                  aria-label="Dark luxury map of Bilimora, Gujarat"
                />
                <div className="map-tooltip-card map-tooltip-dark">
                  <span className="tooltip-loc-text">
                    📍 1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA
                  </span>
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-open-link"
                  >
                    OPEN MAP ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL FULL-WIDTH COMING SOON BANNER (COVERS FULL PAGE HORIZONTALLY, NOT A CARD, COMPACT) */}
      <div className="editorial-coming-soon-strip" aria-label="Website launch announcement">
        <div className="editorial-cs-content">
          <p className="editorial-cs-subtitle">
            casmiledentalclinic.com website is
          </p>
          <h4 className="editorial-cs-title">
            COMING SOON!
          </h4>
          <div className="editorial-cs-divider" aria-hidden="true" />
          <p className="editorial-cs-description">
            The website is currently being built. The launch date will be announced soon.
          </p>

          {onScrollTop && (
            <div className="editorial-cs-action">
              <button 
                type="button"
                onClick={onScrollTop}
                className="back-to-storefront-btn"
                aria-label="Scroll back up to storefront"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span>BACK TO TOP</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
