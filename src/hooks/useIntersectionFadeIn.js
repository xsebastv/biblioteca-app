import { useEffect, useRef, useState } from 'react';

export function useIntersectionFadeIn(options = { threshold:0.15, rootMargin:'60px' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(()=>{
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if (e.isIntersecting){ setVisible(true); obs.unobserve(el); } });
    }, options);
    obs.observe(el);
    return ()=> obs.disconnect();
  }, [options.threshold, options.rootMargin]);
  return { ref, visible };
}