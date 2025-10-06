import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    {
      text: "Un libro es un sueño que tienes en tus manos",
      author: "Neil Gaiman"
    },
    {
      text: "La lectura es el viaje de quienes no pueden tomar el tren",
      author: "Francis de Croisset"
    },
    {
      text: "Los libros son espejos: solo ves en ellos lo que ya tienes dentro",
      author: "Carlos Ruiz Zafón"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className={`landing-page ${isVisible ? 'visible' : ''}`}>
      {/* Elementos decorativos de fondo */}
      <div className="landing-bg-elements">
        <div className="floating-book book-1">📚</div>
        <div className="floating-book book-2">📖</div>
        <div className="floating-book book-3">📕</div>
        <div className="floating-book book-4">📗</div>
        <div className="floating-book book-5">📘</div>
      </div>

      {/* Contenido principal */}
      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-icon">
            <span className="main-book-icon">📚</span>
          </div>
          
          <h1 className="landing-title">
            Biblioteca Digital
          </h1>
          
          <p className="landing-subtitle">
            Descubre, explora y guarda tus libros favoritos en un solo lugar
          </p>

          {/* Frases rotativas */}
          <div className="quotes-container">
            {quotes.map((quote, index) => (
              <div 
                key={index}
                className={`quote ${index === currentQuote ? 'active' : ''}`}
              >
                <p className="quote-text">"{quote.text}"</p>
                <span className="quote-author">— {quote.author}</span>
              </div>
            ))}
          </div>

          {/* Botón principal */}
          <button 
            className="enter-btn"
            onClick={onEnter}
            aria-label="Entrar a la biblioteca"
          >
            <span className="btn-text">Explorar Biblioteca</span>
            <span className="btn-icon">→</span>
          </button>

          {/* Características */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Buscar</h3>
              <p>Encuentra cualquier libro por título, autor o género</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Favoritos</h3>
              <p>Guarda tus libros preferidos en tu lista personal</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Accede desde cualquier dispositivo, en cualquier momento</p>
            </div>
          </div>
        </div>

        {/* Footer minimalista */}
        <div className="landing-footer">
          <p>Hecho con ❤️ para los amantes de la lectura</p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-arrow">↓</div>
      </div>
    </div>
  );
};

export default LandingPage;