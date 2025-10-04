import React from 'react';

const Header = ({ favoritesCount = 0 }) => {
  return (
    <header className="header" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '24px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      padding: '40px 0 32px 0',
      marginBottom: '32px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{position: 'absolute', left: 32, top: 32, fontSize: '3.5rem', filter: 'drop-shadow(0 2px 8px #764ba2)'}}>
        <span role="img" aria-label="libros">📚</span>
      </div>
      <h1 style={{fontSize: '3rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '10px', fontFamily: 'Poppins, sans-serif', textShadow: '0 2px 8px #667eea'}}>
        Biblioteca Digital <span style={{fontSize:'1.2rem', fontWeight:400}}>({favoritesCount} favoritos)</span>
      </h1>
      <p style={{fontSize: '1.3rem', fontWeight: 400, marginBottom: '0', color: '#f7fafc', textShadow: '0 1px 4px #764ba2'}}>Descubre, guarda y organiza tus libros favoritos en un entorno profesional y elegante.</p>
    </header>
  );
};

export default Header;