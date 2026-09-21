import React, { useState } from 'react';

export default function Navbar({ activePage, setActivePage, walletAddress, connectWallet }) {
  return (
    <nav className="navbar">
      <div className="brand" onClick={() => setActivePage('home')}>
        <div className="brand-icon">🗳️</div>
        <div className="brand-text">Evo<span>Tivity</span></div>
      </div>
      <div className="nav-links">
        <span 
          className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => setActivePage('home')}
        >
          Home
        </span>
        <span 
          className={`nav-link ${activePage === 'voter' ? 'active' : ''}`}
          onClick={() => setActivePage('voter')}
        >
          Voter Portal
        </span>
        <span 
          className={`nav-link ${activePage === 'admin' ? 'active' : ''}`}
          onClick={() => setActivePage('admin')}
        >
          Admin Dashboard
        </span>
        <button onClick={connectWallet} className="btn btn-outline">
          🦊 {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Connect MetaMask'}
        </button>
      </div>
    </nav>
  );
}
