import React, { useState } from 'react';

export default function VoterDashboard({ elections, user, loginVoter, selectElectionForVoting, selectElectionForResults }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginVoter({ fullName, email, password });
    setShowLoginModal(false);
  };

  return (
    <div className="container">
      {/* Auth Banner */}
      <div className="card" style={{ marginBottom: '2.5rem', background: 'var(--gradient-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: '#fff' }}>👤 {user ? `Welcome, ${user.fullName}!` : 'Voter Authentication & Profile'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {user ? `Account: ${user.email} | ID: #${user.userId}` : 'Register once to participate in multiple decentralized elections.'}
            </p>
          </div>
          {!user && (
            <button onClick={() => setShowLoginModal(true)} className="btn btn-primary">
              Voter Login / Signup
            </button>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🗳️ Available Elections Catalog</h2>

      <div className="grid-3">
        {elections.map((election) => (
          <div key={election.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className={`badge ${election.phase === 'VOTING' ? 'badge-success' : 'badge-warning'}`}>
                {election.phase}
              </span>
              <small style={{ color: 'var(--text-dim)' }}>Sepolia</small>
            </div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{election.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{election.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
              {election.phase === 'VOTING' && (
                <button onClick={() => selectElectionForVoting(election)} className="btn btn-primary" style={{ width: '100%' }}>
                  ⚡ Enter 5-Step Voting Process &rarr;
                </button>
              )}
              {election.phase === 'COMPLETED' && (
                <button onClick={() => selectElectionForResults(election)} className="btn btn-outline" style={{ width: '100%' }}>
                  🏆 View Winner & Official Results
                </button>
              )}
              {election.phase === 'REGISTRATION' && (
                <button onClick={() => alert("Registered for election! Waiting for admin approval.")} className="btn btn-secondary" style={{ width: '100%' }}>
                  📝 Register for Election
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '450px', zIndex: 2000, borderColor: 'var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>👤 Voter Login & Account Setup</h3>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voter@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Login / Continue</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="btn btn-secondary">Close</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
