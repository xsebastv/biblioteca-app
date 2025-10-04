import React from 'react';

const Header = ({ favoritesCount = 0, dark, setDark }) => {
  return (
    <header className="header" style={{
      background: dark
        ? 'linear-gradient(135deg, #232a3a 0%, #3a2a4d 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '24px',
      boxShadow: dark
        ? '0 8px 30px rgba(30,30,40,0.22)'
        : '0 8px 30px rgba(0,0,0,0.12)',
      padding: '40px 0 32px 0',
      marginBottom: '32px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background .3s',
    }}>
      <div style={{position: 'absolute', left: 32, top: 32, fontSize: '3.5rem', filter: 'drop-shadow(0 2px 8px #764ba2)'}}>
        <span role="img" aria-label="libros">📚</span>
      </div>
      <h1 style={{fontSize: '3rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '10px', fontFamily: 'Poppins, sans-serif', textShadow: dark ? '0 2px 8px #232a3a' : '0 2px 8px #667eea'}}>
        Biblioteca Digital <span style={{fontSize:'1.2rem', fontWeight:400}}>({favoritesCount} favoritos)</span>
      </h1>
      <p style={{fontSize: '1.3rem', fontWeight: 400, marginBottom: '0', color: dark ? '#e5eaf1' : '#f7fafc', textShadow: dark ? '0 1px 4px #3a2a4d' : '0 1px 4px #764ba2'}}>Descubre, guarda y organiza tus libros favoritos en un entorno profesional y elegante.</p>
      <button
        onClick={() => setDark(d => !d)}
        style={{
          position: 'absolute',
          right: 32,
          top: 32,
          padding: '10px 18px',
          borderRadius: '10px',
          border: 'none',
          background: dark ? '#232a3a' : '#fafafa',
          color: dark ? '#eee' : '#333',
          fontWeight: 600,
          fontSize: '1.1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'background .3s',
        }}
        aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {dark ? '☀️ Claro' : '🌙 Oscuro'}
      </button>
    </header>
  );
};

export default Header;