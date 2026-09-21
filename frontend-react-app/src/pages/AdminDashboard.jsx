import React, { useState } from 'react';

export default function AdminDashboard({ elections, voters, createElection, updatePhase, addCandidate, approveVoter, selectElectionForResults }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contractAddress, setContractAddress] = useState('');

  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [candName, setCandName] = useState('');
  const [candParty, setCandParty] = useState('');
  const [candSymbolUrl, setCandSymbolUrl] = useState('');
  const [candBio, setCandBio] = useState('');
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    createElection({ title, description, contractAddress });
    setTitle('');
    setDescription('');
    setContractAddress('');
  };

  const handleCandidateSubmit = (e) => {
    e.preventDefault();
    addCandidate({ electionId: selectedElectionId, name: candName, party: candParty, symbolUrl: candSymbolUrl, bio: candBio });
    setCandName('');
    setCandParty('');
    setCandSymbolUrl('');
    setCandBio('');
    setShowCandidateModal(false);
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>👨‍💼 Administrator Control Panel</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Manage multi-election lifecycles, deploy Sepolia smart contracts, add candidates, approve voters, and control election phases.
      </p>

      {/* Stats Header */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <small style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Factory Contract</small>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginTop: '0.5rem' }}>
            0x71C7656EC7ab88b098defB751B7401B5f6d8976F
          </div>
        </div>
        <div className="card">
          <small style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Elections</small>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{elections.length}</div>
        </div>
        <div className="card">
          <small style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Registered Voters</small>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{voters.length}</div>
        </div>
      </div>

      {/* Form 1: Deploy New Election */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#fff' }}>🏭 Deploy & Create New Election</h2>
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Election Title</label>
              <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Presidential Election 2026" required />
            </div>
            <div className="form-group">
              <label className="form-label">Sepolia Smart Contract Address</label>
              <input type="text" className="form-control" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} placeholder="0x... (Auto-generated via Factory if blank)" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description & Rules</label>
            <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter election details..." />
          </div>
          <button type="submit" className="btn btn-primary">🚀 Deploy & Save Election</button>
        </form>
      </div>

      {/* Table: Manage Elections */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>🗳️ Manage Elections & Phase Control</h2>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Phase</th>
                <th style={{ padding: '1rem' }}>Contract Address</th>
                <th style={{ padding: '1rem' }}>Phase Control</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.map((election) => (
                <tr key={election.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem' }}>
                    <strong style={{ color: '#fff' }}>{election.title}</strong>
                    <br />
                    <small style={{ color: 'var(--text-dim)' }}>{election.description}</small>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${election.phase === 'VOTING' ? 'badge-success' : 'badge-warning'}`}>
                      {election.phase}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                    {election.contractAddress ? `${election.contractAddress.substring(0, 10)}...` : 'Deploying...'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => updatePhase(election.id, 'REGISTRATION')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>REG</button>
                      <button onClick={() => updatePhase(election.id, 'VOTING')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>VOTING</button>
                      <button onClick={() => updatePhase(election.id, 'COMPLETED')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>COMPLETE</button>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => { setSelectedElectionId(election.id); setShowCandidateModal(true); }}
                        className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        + Candidate
                      </button>
                      <button onClick={() => selectElectionForResults(election)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                        Results
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="card" style={{ marginBottom: '2.5rem', borderColor: 'var(--accent-primary)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>👤 Register Candidate for Election #{selectedElectionId}</h3>
          <form onSubmit={handleCandidateSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Candidate Name</label>
                <input type="text" className="form-control" value={candName} onChange={(e) => setCandName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Party Affiliation</label>
                <input type="text" className="form-control" value={candParty} onChange={(e) => setCandParty(e.target.value)} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Party Symbol URL</label>
                <input type="text" className="form-control" value={candSymbolUrl} onChange={(e) => setCandSymbolUrl(e.target.value)} placeholder="/images/logo.png" />
              </div>
              <div className="form-group">
                <label className="form-label">Candidate Bio</label>
                <input type="text" className="form-control" value={candBio} onChange={(e) => setCandBio(e.target.value)} placeholder="Political platform..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Candidate</button>
              <button type="button" onClick={() => setShowCandidateModal(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Voter Approval Table */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>👤 Manage Voter Approvals & Wallet Binding</h2>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem' }}>Voter Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>National ID</th>
                <th style={{ padding: '1rem' }}>Approval Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((voter) => (
                <tr key={voter.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem', color: '#fff' }}>{voter.fullName}</td>
                  <td style={{ padding: '1rem' }}>{voter.email}</td>
                  <td style={{ padding: '1rem' }}>{voter.nationalId || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${voter.isApproved ? 'badge-success' : 'badge-warning'}`}>
                      {voter.isApproved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => {
                        const wallet = prompt("Enter voter's Sepolia Ethereum wallet address:", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
                        if (wallet) approveVoter(voter.id, wallet);
                      }}
                      className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Approve & Bind Wallet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
