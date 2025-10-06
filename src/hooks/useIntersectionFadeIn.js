import { useEffect, useRef, useState } from 'react';

// Hook mejorado para efectos de animación al hacer scroll
export function useIntersectionFadeIn(options = { threshold:0.15, rootMargin:'60px' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(()=>{
    const el = ref.current;
    if (!el) return;
    
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ 
        if (e.isIntersecting){ 
          setVisible(true); 
          obs.unobserve(el); 
        } 
      });
    }, options);
    
    obs.observe(el);
    return ()=> obs.disconnect();
  }, [options.threshold, options.rootMargin]);
  
  return { ref, visible, animationClass: visible ? 'fade-in-visible' : 'fade-in-hidden' };
}

// Hook para animar elementos secuencialmente mientras se hace scroll
export function useSequentialFadeIn(itemsCount, delay = 100, options = { threshold: 0.1, rootMargin: '20px' }) {
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState([]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Mostrar elementos secuencialmente cuando el contenedor es visible
        const newVisibleItems = [];
        for (let i = 0; i < itemsCount; i++) {
          setTimeout(() => {
            setVisibleItems(prev => {
              if (prev.includes(i)) return prev;
              return [...prev, i];
            });
          }, delay * i);
        }
        observer.unobserve(container);
      }
    }, options);
    
    observer.observe(container);
    return () => observer.disconnect();
  }, [itemsCount, delay, options.threshold, options.rootMargin]);
  
  return { containerRef, isItemVisible: (index) => visibleItems.includes(index) };
}