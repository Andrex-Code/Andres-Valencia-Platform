'use client';

import { useEffect } from 'react';

/** Progressive enhancement: all content remains visible without JavaScript. */
export function PortfolioMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;

    const configure = () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      if (preference.matches || !('IntersectionObserver' in window)) return;

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          const animation = entry.target.animate(
            [{ opacity: 0.25, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }, { threshold: 0.08 });

      document.querySelectorAll('.section-heading, .main-offer, .supporting-offers article, .real-project-head, .real-gallery figure, .featured-project, .project-card, .internal-work, .business-section, .about-grid, .stack-grid, .process-grid article, .contact-section').forEach((element) => observer?.observe(element));
    };

    configure();
    preference.addEventListener('change', configure);
    return () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener('change', configure);
    };
  }, []);

  return null;
}
