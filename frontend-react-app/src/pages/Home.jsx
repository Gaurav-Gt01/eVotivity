import React from 'react';

export default function Home({ setActivePage, elections, selectElectionForVoting }) {
  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '4rem 1rem 3rem 1rem', background: '#ffffff', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="badge badge-info" style={{ marginBottom: '1rem' }}>
          Ethereum Sepolia Smart Contracts + DeepFace AI + Email OTP
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          Decentralized Multi-Election Blockchain Voting
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '760px', margin: '0 auto 2.5rem auto' }}>
          A secure, transparent, and tamper-resistant digital voting platform using Factory Pattern smart contracts,
          Python DeepFace facial verification, real MetaMask Web3 wallet authentication, and Etherscan transaction audit receipts.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
          <button onClick={() => setActivePage('voter')} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Voter Portal
          </button>
          <button onClick={() => setActivePage('admin')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Admin Portal
          </button>
        </div>
      </div>

      {/* Triple Security Section */}
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', color: 'var(--text-main)' }}>
          Core Security Architecture
        </h2>
        <div className="grid-3">
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)' }}>1. MetaMask Wallet Auth</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Web3 identity authentication linking unique registered Ethereum wallet addresses directly on the Sepolia testnet.
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)' }}>2. Facial AI Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Biometric facial feature vector comparison matching live webcam snapshots against registered face embeddings stored in the database.
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)' }}>3. Email OTP Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Time-bound 6-digit one-time passcode verification dispatched to voter email accounts prior to ballot unlock.
            </p>
          </div>
        </div>
      </div>

      {/* Active Elections Grid */}
      <div className="container" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem' }}>Active Elections</h2>
          <button onClick={() => setActivePage('voter')} className="btn btn-outline">View Voter Portal &rarr;</button>
        </div>

        {elections.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No active elections found.</p>
            <p style={{ fontSize: '0.9rem' }}>Log in to the Admin Portal to create a new election.</p>
          </div>
        ) : (
          <div className="grid-3">
            {elections.map((election) => (
              <div key={election.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className={`badge ${election.phase === 'VOTING' ? 'badge-success' : 'badge-info'}`}>
                    {election.phase}
                  </span>
                  <small style={{ color: 'var(--text-dim)' }}>Ethereum Sepolia</small>
                </div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{election.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{election.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div>
                    <small style={{ color: 'var(--text-dim)', display: 'block' }}>Total Votes Cast</small>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{election.totalVotesCast || 0}</strong>
                  </div>
                  <button onClick={() => selectElectionForVoting(election)} className="btn btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}>
                    Cast Vote &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

