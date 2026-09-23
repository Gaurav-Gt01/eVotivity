import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard({ elections, voters, createElection, updatePhase, addCandidate, approveVoter, selectElectionForResults }) {
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('evotivity_admin_token') || '';
  });

  // 2FA Admin Login States
  const [loginStep, setLoginStep] = useState(1); // 1: Email/Password, 2: 2FA OTP
  const [adminEmail, setAdminEmail] = useState('gauravtatpate@gmail.com');
  const [adminPassword, setAdminPassword] = useState('gauravtatpate01');
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Pending Requests State
  const [pendingVoters, setPendingVoters] = useState([]);
  const [pendingCandidates, setPendingCandidates] = useState([]);

  // Election Creation States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contractAddress, setContractAddress] = useState('');

  // Candidate Modal States
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [candName, setCandName] = useState('');
  const [candParty, setCandParty] = useState('');
  const [candSymbolUrl, setCandSymbolUrl] = useState('');
  const [candBio, setCandBio] = useState('');
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  useEffect(() => {
    if (adminToken) {
      fetchPendingRequests();
    }
  }, [adminToken]);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get('/api/admin/pending', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.data) {
        setPendingVoters(res.data.pendingVoters || []);
        setPendingCandidates(res.data.pendingCandidates || []);
      }
    } catch (err) {
      console.warn("Error fetching pending requests:", err.message);
    }
  };

  // Step 1: Login with Email & Password
  const handleStep1Login = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setOtpCooldown(30);
    try {
      const res = await axios.post('/api/auth/admin/login-step1', {
        email: adminEmail,
        password: adminPassword
      });
      if (res.data.success) {
        setLoginStep(2);
        setDevOtp(res.data.otpCode || '');
        setAuthMessage(`2FA OTP code dispatched to ${adminEmail}`);
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid Admin credentials.');
    }
  };

  // Step 2: Verify 2FA OTP & Get JWT Token
  const handleStep2VerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post('/api/auth/admin/login-step2', {
        email: adminEmail,
        otpCode
      });
      if (res.data.success) {
        setAdminToken(res.data.accessToken);
        localStorage.setItem('evotivity_admin_token', res.data.accessToken);
        if (res.data.refreshToken) {
          localStorage.setItem('evotivity_admin_refresh_token', res.data.refreshToken);
        }
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid or expired 2FA OTP code.');
    }
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    localStorage.removeItem('evotivity_admin_token');
    localStorage.removeItem('evotivity_admin_refresh_token');
    setLoginStep(1);
  };

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

  const handleApproveCandidate = async (candidateId) => {
    try {
      await axios.post('/api/admin/candidates/approve', { candidateId, approved: true });
      fetchPendingRequests();
      alert("Candidate request approved.");
    } catch (err) {
      alert("Approval error: " + err.message);
    }
  };

  // 🔒 ADMIN AUTHENTICATION GUARD (2FA LOGIN SCREEN)
  if (!adminToken) {
    return (
      <div className="container" style={{ maxWidth: '480px', marginTop: '3rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem' }}>Admin 2FA Authentication</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Restricted Area. Login with administrator credentials and complete 2FA verification.
            </p>
          </div>

          {authError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          {authMessage && (
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#059669', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
              {authMessage}
            </div>
          )}

          {/* STEP 1: EMAIL / PASSWORD */}
          {loginStep === 1 && (
            <form onSubmit={handleStep1Login}>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  placeholder="gauravtatpate@gmail.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  placeholder="gauravtatpate01" 
                  required 
                />
              </div>

              <div style={{ background: '#f1f5f9', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Default Credentials:</strong><br />
                Email: <code>gauravtatpate@gmail.com</code><br />
                Password: <code>gauravtatpate01</code>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Step 1: Authenticate & Request 2FA OTP
              </button>
            </form>
          )}

          {/* STEP 2: 2FA OTP VERIFICATION */}
          {loginStep === 2 && (
            <form onSubmit={handleStep2VerifyOtp}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit 2FA OTP Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  placeholder="123456" 
                  maxLength={6} 
                  style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2rem' }}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
                Step 2: Verify 2FA & Access Dashboard
              </button>

              <button 
                type="button" 
                onClick={() => handleStep1Login()} 
                disabled={otpCooldown > 0} 
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.85rem', opacity: otpCooldown > 0 ? 0.65 : 1, cursor: otpCooldown > 0 ? 'not-allowed' : 'pointer' }}
              >
                {otpCooldown > 0 ? `Resend 2FA OTP in ${otpCooldown}s` : 'Resend 2FA OTP'}
              </button>

              <button type="button" onClick={() => setLoginStep(1)} className="btn btn-secondary" style={{ width: '100%' }}>
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 🔓 AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Admin Control Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Logged in as: <strong>Gaurav Tatpate</strong> (gauravtatpate@gmail.com) | Secured via JWT & 2FA
          </p>
        </div>
        <button onClick={handleAdminLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Sign Out Admin
        </button>
      </div>

      {/* Stats Summary Header */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <small style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Sepolia Contract</small>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-primary)', wordBreak: 'break-all', marginTop: '0.5rem' }}>
            0x71C7656EC7ab88b098defB751B7401B5f6d8976F
          </div>
        </div>
        <div className="card">
          <small style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Elections</small>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{elections.length}</div>
        </div>
        <div className="card">
          <small style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Registered Voters</small>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{voters.length}</div>
        </div>
      </div>

      {/* Pending Approval Requests Panel */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.35rem' }}>Pending Requests for Approval</h2>
        
        {pendingVoters.length === 0 && pendingCandidates.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending approval requests at this time.</p>
        ) : (
          <div className="grid-2">
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Pending Voters ({pendingVoters.length})</h4>
              {pendingVoters.map((v) => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong>{v.fullName}</strong> ({v.email})
                  </div>
                  <button onClick={() => approveVoter(v.id, v.walletAddress)} className="btn btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                    Approve
                  </button>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Pending Candidate Applications ({pendingCandidates.length})</h4>
              {pendingCandidates.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong>{c.name}</strong> ({c.party})
                  </div>
                  <button onClick={() => handleApproveCandidate(c.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create New Election */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.35rem' }}>Create New Election</h2>
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Election Title</label>
              <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. National Senate Election 2026" required />
            </div>
            <div className="form-group">
              <label className="form-label">Sepolia Smart Contract Address</label>
              <input type="text" className="form-control" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} placeholder="0x..." />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description & Guidelines</label>
            <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter election overview..." />
          </div>
          <button type="submit" className="btn btn-primary">Create & Register Election</button>
        </form>
      </div>

      {/* Elections Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.25rem', fontSize: '1.35rem' }}>Manage Elections & Phase Control</h2>
        {elections.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No elections registered.</p>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.75rem' }}>Title</th>
                  <th style={{ padding: '0.75rem' }}>Phase</th>
                  <th style={{ padding: '0.75rem' }}>Contract Address</th>
                  <th style={{ padding: '0.75rem' }}>Phase Control</th>
                  <th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election) => (
                  <tr key={election.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{election.title}</strong>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${election.phase === 'VOTING' ? 'badge-success' : election.phase === 'COMPLETED' ? 'badge-info' : 'badge-warning'}`}>
                        {election.phase}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                      {election.contractAddress ? `${election.contractAddress.substring(0, 10)}...` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => updatePhase(election.id, 'REGISTRATION')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>REG</button>
                        <button onClick={() => updatePhase(election.id, 'VOTING')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>VOTING</button>
                        <button onClick={() => updatePhase(election.id, 'COMPLETED')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>COMPLETE</button>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => { setSelectedElectionId(election.id); setShowCandidateModal(true); }}
                          className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          + Candidate
                        </button>
                        <button onClick={() => selectElectionForResults(election)} className="btn btn-outline" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                          Results
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--accent-primary)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add Candidate to Election #{selectedElectionId}</h3>
          <form onSubmit={handleCandidateSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Candidate Name</label>
                <input type="text" className="form-control" value={candName} onChange={(e) => setCandName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Political Party</label>
                <input type="text" className="form-control" value={candParty} onChange={(e) => setCandParty(e.target.value)} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Party Symbol Image URL</label>
                <input type="text" className="form-control" value={candSymbolUrl} onChange={(e) => setCandSymbolUrl(e.target.value)} placeholder="/images/symbol.png" />
              </div>
              <div className="form-group">
                <label className="form-label">Candidate Bio</label>
                <input type="text" className="form-control" value={candBio} onChange={(e) => setCandBio(e.target.value)} placeholder="Overview of key platform policies..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">Add Candidate</button>
              <button type="button" onClick={() => setShowCandidateModal(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Voter List */}
      <div className="card">
        <h2 style={{ marginBottom: '1.25rem', fontSize: '1.35rem' }}>Voter Directory & Status</h2>
        {voters.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No voters registered.</p>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.75rem' }}>Full Name</th>
                  <th style={{ padding: '0.75rem' }}>Username</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>National ID</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem' }}>{voter.fullName}</td>
                    <td style={{ padding: '0.75rem' }}>{voter.username || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>{voter.email}</td>
                    <td style={{ padding: '0.75rem' }}>{voter.nationalId || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${voter.isApproved ? 'badge-success' : 'badge-warning'}`}>
                        {voter.isApproved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

