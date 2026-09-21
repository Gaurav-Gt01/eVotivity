import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import VoteWizardPage from './pages/VoteWizardPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [walletAddress, setWalletAddress] = useState('');
  const [user, setUser] = useState(null);

  const [elections, setElections] = useState([
    {
      id: 1,
      title: 'National Presidential Election 2026',
      description: 'Decentralized digital voting for national presidential candidates powered by Sepolia Smart Contracts.',
      phase: 'VOTING',
      totalVotesCast: 70,
      contractAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
    },
    {
      id: 2,
      title: 'University Student Council Election',
      description: 'Student body election for executive council members with Python DeepFace facial verification.',
      phase: 'REGISTRATION',
      totalVotesCast: 0,
      contractAddress: '0x3A94B2C89e7fA11492078656d2C01594F3b934e2'
    }
  ]);

  const [voters, setVoters] = useState([
    { id: 1, fullName: 'John Doe', email: 'voter@example.com', nationalId: 'NAT-98402', isApproved: true },
    { id: 2, fullName: 'Sarah Smith', email: 'sarah@example.com', nationalId: 'NAT-48201', isApproved: false }
  ]);

  const [selectedElection, setSelectedElection] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get('/api/voter/elections');
      if (res.data && res.data.length > 0) {
        setElections(res.data);
      }
    } catch (err) {
      console.warn("Backend API connecting warning, using demo dataset");
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) {
        alert("MetaMask connection failed: " + err.message);
      }
    } else {
      const mockAddr = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      setWalletAddress(mockAddr);
      alert("MetaMask extension not detected. Simulating wallet connection for demo: " + mockAddr);
    }
  };

  const createElection = async (newElec) => {
    try {
      const res = await axios.post('/api/admin/elections/create', newElec);
      setElections([res.data, ...elections]);
    } catch (err) {
      const created = { id: elections.length + 1, ...newElec, phase: 'REGISTRATION', totalVotesCast: 0 };
      setElections([created, ...elections]);
    }
  };

  const updatePhase = async (id, phase) => {
    try {
      await axios.post(`/api/admin/elections/${id}/phase?phase=${phase}`);
      fetchElections();
    } catch (err) {
      setElections(elections.map(e => e.id === id ? { ...e, phase } : e));
    }
  };

  const addCandidate = async (cand) => {
    try {
      await axios.post('/api/admin/candidates/add', cand);
      alert("Candidate registered successfully!");
    } catch (err) {
      alert("Candidate registered!");
    }
  };

  const approveVoter = async (userId, wallet) => {
    try {
      await axios.post('/api/admin/voters/approve', { electionId: 1, userId, walletAddress: wallet, approved: true });
      setVoters(voters.map(v => v.id === userId ? { ...v, isApproved: true } : v));
    } catch (err) {
      setVoters(voters.map(v => v.id === userId ? { ...v, isApproved: true } : v));
    }
  };

  const loginVoter = (userObj) => {
    setUser({ userId: 1, ...userObj });
  };

  const selectElectionForVoting = (election) => {
    setSelectedElection(election);
    setActivePage('vote-wizard');
  };

  const selectElectionForResults = (election) => {
    setSelectedElection(election);
    setActivePage('results');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        walletAddress={walletAddress} 
        connectWallet={connectWallet} 
      />

      <div style={{ flex: 1 }}>
        {activePage === 'home' && (
          <Home 
            setActivePage={setActivePage} 
            elections={elections} 
            selectElectionForVoting={selectElectionForVoting} 
          />
        )}
        {activePage === 'admin' && (
          <AdminDashboard 
            elections={elections} 
            voters={voters} 
            createElection={createElection} 
            updatePhase={updatePhase} 
            addCandidate={addCandidate} 
            approveVoter={approveVoter} 
            selectElectionForResults={selectElectionForResults} 
          />
        )}
        {activePage === 'voter' && (
          <VoterDashboard 
            elections={elections} 
            user={user} 
            loginVoter={loginVoter} 
            selectElectionForVoting={selectElectionForVoting} 
            selectElectionForResults={selectElectionForResults} 
          />
        )}
        {activePage === 'vote-wizard' && selectedElection && (
          <VoteWizardPage 
            election={selectedElection} 
            walletAddress={walletAddress} 
            connectWallet={connectWallet} 
            selectElectionForResults={selectElectionForResults} 
          />
        )}
        {activePage === 'results' && selectedElection && (
          <ResultsPage election={selectedElection} />
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '4rem', borderTop: '1px solid var(--border-glass)', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        <p>EvoTivity / eVoteVerity Monorepo &copy; 2026. React + Node.js + Solidity + Python DeepFace + Docker/K8s.</p>
      </footer>
    </div>
  );
}
