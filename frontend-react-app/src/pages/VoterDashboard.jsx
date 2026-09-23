import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function VoterDashboard({ elections, user, loginVoter, selectElectionForVoting, selectElectionForResults }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'signup', 'forgot'
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Signup states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [faceImageBase64, setFaceImageBase64] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Connect MetaMask Wallet for Signup
  const handleConnectWallet = async () => {
    try {
      const { requestMetaMaskAccount } = await import('../utils/web3Utils');
      const account = await requestMetaMaskAccount();
      setWalletAddress(account);
      alert("MetaMask Wallet connected: " + account);
    } catch (err) {
      const manual = prompt(
        `${err.message}\n\nWould you like to manually enter your Sepolia MetaMask wallet address?`,
        walletAddress || ""
      );
      if (manual && manual.startsWith('0x')) {
        setWalletAddress(manual);
        alert("Wallet address set manually: " + manual);
      }
    }
  };

  // Handle Direct MetaMask Login
  const handleMetaMaskLogin = async () => {
    try {
      let targetAddr = walletAddress;
      if (!targetAddr) {
        const { requestMetaMaskAccount } = await import('../utils/web3Utils');
        targetAddr = await requestMetaMaskAccount();
      }
      const res = await axios.post('/api/auth/login', { walletAddress: targetAddr });
      if (res.data.success) {
        loginVoter(res.data);
        setShowAuthModal(false);
      }
    } catch (err) {
      const manual = prompt(
        `${err.message || 'MetaMask login error'}\n\nEnter your registered Sepolia wallet address to log in:`,
        walletAddress || ""
      );
      if (manual && manual.startsWith('0x')) {
        try {
          const res = await axios.post('/api/auth/login', { walletAddress: manual });
          if (res.data.success) {
            loginVoter(res.data);
            setShowAuthModal(false);
          }
        } catch (apiErr) {
          alert(apiErr.response?.data?.message || 'Login failed for this wallet address.');
        }
      }
    }
  };

  // Webcam Capture for Signup
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Webcam error: " + err.message);
    }
  };

  const captureFaceSnapshot = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      const b64 = canvasRef.current.toDataURL('image/jpeg');
      setFaceImageBase64(b64);
      alert("Facial biometric scan captured successfully!");
    }
  };

  // Handle Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { identifier, password });
      if (res.data.success) {
        loginVoter(res.data);
        setShowAuthModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid login credentials.');
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/signup', {
        fullName,
        username,
        email,
        password: regPassword,
        nationalId,
        walletAddress,
        faceImagePath: faceImageBase64
      });
      if (res.data.success) {
        alert("Registration successful! You may now log in.");
        loginVoter(res.data);
        setShowAuthModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    }
  };

  // Handle Forgot Password Request OTP
  const handleRequestRecoveryOtp = async () => {
    setOtpCooldown(30);
    try {
      const res = await axios.post('/api/auth/forgot-password-otp', { email: forgotEmail });
      if (res.data.success) {
        setOtpSent(true);
        setDevOtp(res.data.otpCode || '');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send recovery OTP.');
    }
  };

  // Handle Reset Credentials
  const handleResetCredentials = async () => {
    try {
      const res = await axios.post('/api/auth/reset-credentials', {
        email: forgotEmail,
        otpCode: otpInput,
        newPassword
      });
      if (res.data.success) {
        alert(`Credentials updated! Your registered username is: ${res.data.username}`);
        setActiveTab('login');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset credentials.');
    }
  };

  return (
    <div className="container">
      {/* Voter Banner */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-main)' }}>{user ? `Welcome, ${user.fullName}!` : 'Voter Portal & Identity Verification'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {user ? `Account: ${user.email} | Username: ${user.username || 'N/A'}` : 'Sign up or log in to participate in decentralized elections.'}
            </p>
          </div>
          {!user ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setActiveTab('login'); setShowAuthModal(true); }} className="btn btn-primary">
                Voter Login
              </button>
              <button onClick={() => { setActiveTab('signup'); setShowAuthModal(true); }} className="btn btn-secondary">
                Register New Voter
              </button>
            </div>
          ) : (
            <button onClick={() => loginVoter(null)} className="btn btn-secondary">
              Sign Out
            </button>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Available Elections</h2>

      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No elections are currently registered in the database.</p>
          <p style={{ fontSize: '0.9rem' }}>Please wait for an admin to create an election.</p>
        </div>
      ) : (
        <div className="grid-3">
          {elections.map((election) => (
            <div key={election.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className={`badge ${election.phase === 'VOTING' ? 'badge-success' : election.phase === 'COMPLETED' ? 'badge-info' : 'badge-warning'}`}>
                  {election.phase}
                </span>
                <small style={{ color: 'var(--text-dim)' }}>Ethereum Sepolia</small>
              </div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{election.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{election.description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {election.phase === 'VOTING' && (
                  <button onClick={() => selectElectionForVoting(election)} className="btn btn-primary" style={{ width: '100%' }}>
                    Proceed to Voting Process &rarr;
                  </button>
                )}
                {election.phase === 'COMPLETED' && (
                  <button onClick={() => selectElectionForResults(election)} className="btn btn-outline" style={{ width: '100%' }}>
                    View Official Results
                  </button>
                )}
                {election.phase === 'REGISTRATION' && (
                  <button onClick={() => alert("Registration confirmed for this election.")} className="btn btn-secondary" style={{ width: '100%' }}>
                    Register for Election
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                onClick={() => setActiveTab('login')} 
                style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: activeTab === 'login' ? '2px solid var(--accent-primary)' : 'none', fontWeight: 600, color: activeTab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
              >
                Voter Login
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('signup')} 
                style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: activeTab === 'signup' ? '2px solid var(--accent-primary)' : 'none', fontWeight: 600, color: activeTab === 'signup' ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
              >
                Sign Up
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('forgot')} 
                style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: activeTab === 'forgot' ? '2px solid var(--accent-primary)' : 'none', fontWeight: 600, color: activeTab === 'forgot' ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
              >
                Forgot Password
              </button>
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Username or Email</label>
                  <input type="text" className="form-control" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="voter@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                  Log In
                </button>

                <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>OR</div>

                <button type="button" onClick={handleMetaMaskLogin} className="btn btn-outline" style={{ width: '100%', marginBottom: '1.5rem' }}>
                  Log In via Connected MetaMask Wallet
                </button>

                <div style={{ textAlign: 'right' }}>
                  <button type="button" onClick={() => setShowAuthModal(false)} className="btn btn-secondary">Close</button>
                </div>
              </form>
            )}

            {/* SIGNUP FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voter@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">National ID Number</label>
                  <input type="text" className="form-control" value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="NAT-98402" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" required />
                </div>

                {/* MetaMask Connect */}
                <div className="form-group">
                  <label className="form-label">MetaMask Wallet Address</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="form-control" value={walletAddress} readOnly placeholder="0x..." />
                    <button type="button" onClick={handleConnectWallet} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                      Connect Wallet
                    </button>
                  </div>
                </div>

                {/* Face Capture */}
                <div className="form-group">
                  <label className="form-label">Registration Face Scan</label>
                  {!cameraActive ? (
                    <button type="button" onClick={startCamera} className="btn btn-secondary" style={{ width: '100%' }}>
                      Start Camera for Face Scan
                    </button>
                  ) : (
                    <div>
                      <div className="camera-container" style={{ marginBottom: '0.5rem' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '180px', background: '#000' }}></video>
                        <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }}></canvas>
                      </div>
                      <button type="button" onClick={captureFaceSnapshot} className="btn btn-primary" style={{ width: '100%' }}>
                        Capture Face Photo
                      </button>
                    </div>
                  )}
                  {faceImageBase64 && (
                    <span className="badge badge-success" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                      Face Scan Stored
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register Account</button>
                  <button type="button" onClick={() => setShowAuthModal(false)} className="btn btn-secondary">Close</button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {activeTab === 'forgot' && (
              <div>
                {!otpSent ? (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Enter Registered Email</label>
                      <input type="email" className="form-control" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="voter@example.com" required />
                    </div>
                    <button onClick={handleRequestRecoveryOtp} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                      Send Recovery OTP
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      Recovery OTP sent to registered email.
                      {devOtp && (
                        <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem', color: '#15803d' }}>
                          (Dev mode preview: {devOtp})
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Enter 6-Digit OTP Code</label>
                      <input type="text" className="form-control" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="123456" maxLength={6} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required />
                    </div>
                    <button onClick={handleResetCredentials} className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
                      Reset Credentials
                    </button>
                    <button 
                      onClick={handleRequestRecoveryOtp} 
                      disabled={otpCooldown > 0} 
                      className="btn btn-secondary"
                      style={{ width: '100%', marginBottom: '1rem', fontSize: '0.85rem', opacity: otpCooldown > 0 ? 0.65 : 1, cursor: otpCooldown > 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                )}
                <div style={{ textAlign: 'right' }}>
                  <button type="button" onClick={() => setShowAuthModal(false)} className="btn btn-secondary">Close</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
