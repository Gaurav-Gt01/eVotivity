import React from 'react';

export default function Home({ setActivePage, elections, selectElectionForVoting }) {
  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '4rem 1rem 3rem 1rem' }}>
        <div className="badge badge-info" style={{ marginBottom: '1rem' }}>
          ⛓️ Ethereum Sepolia Smart Contracts + DeepFace AI + Email OTP
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Decentralized Multi-Election <span style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Blockchain Voting</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '760px', margin: '0 auto 2.5rem auto' }}>
          Secure, transparent, and tamper-resistant voting workflow using Factory Pattern smart contracts,
          Python DeepFace facial verification, MetaMask Web3 authentication, and instant Etherscan verification.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={() => setActivePage('voter')} className="btn btn-primary">🗳️ Enter Voter Dashboard</button>
          <button onClick={() => setActivePage('admin')} className="btn btn-secondary">👨‍💼 Admin Panel</button>
        </div>
      </div>

      {/* Triple Security Section */}
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>🔐 Core Security & Triple Authentication</h2>
        <div className="grid-3">
          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🦊</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>1. MetaMask Wallet Auth</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Web3 identity authentication where each election supports unique registered wallet bindings directly on Ethereum Sepolia.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>2. Python DeepFace AI</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Biometric facial feature vector comparison using OpenCV & DeepFace embeddings prior to ballot submission.
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔑</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>3. Email OTP Verification</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Time-bound 6-digit one-time passcode verification dispatched to registered voter email accounts.
            </p>
          </div>
        </div>
      </div>

      {/* High-Availability Architecture Showcase */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏛️ Enterprise High-Availability Concurrent Architecture</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
            Built for massive scale with WAF Ingress, Kubernetes Cluster pods, Redis caching, Kafka async vote queueing, Primary/Replica MySQL persistence, and Sepolia Blockchain peer validator nodes.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontFamily: 'monospace' }}>
              <div style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid var(--accent-primary)', padding: '1rem 1.5rem', borderRadius: '8px' }}>🌐 WAF + API Gateway</div>
              <div style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid var(--accent-cyan)', padding: '1rem 1.5rem', borderRadius: '8px' }}>⚙️ App / Web Server Pods</div>
              <div style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid var(--accent-purple)', padding: '1rem 1.5rem', borderRadius: '8px' }}>⚡ Redis Cache + Kafka Queue</div>
              <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid var(--accent-emerald)', padding: '1rem 1.5rem', borderRadius: '8px' }}>🐬 Primary MySQL DB + Replicas</div>
              <div style={{ background: 'rgba(244,63,94,0.2)', border: '1px solid var(--accent-rose)', padding: '1rem 1.5rem', borderRadius: '8px' }}>⛓️ Sepolia Blockchain Nodes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Elections Grid */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>🗳️ Live Elections Catalog</h2>
          <button onClick={() => setActivePage('voter')} className="btn btn-outline">View All Elections &rarr;</button>
        </div>

        <div className="grid-3">
          {elections.map((election) => (
            <div key={election.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className={`badge ${election.phase === 'VOTING' ? 'badge-success' : 'badge-info'}`}>
                  {election.phase}
                </span>
                <small style={{ color: 'var(--text-dim)' }}>Sepolia</small>
              </div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{election.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{election.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                <div>
                  <small style={{ color: 'var(--text-dim)', display: 'block' }}>Total Votes</small>
                  <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>{election.totalVotesCast}</strong>
                </div>
                <button onClick={() => selectElectionForVoting(election)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Cast Vote &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
