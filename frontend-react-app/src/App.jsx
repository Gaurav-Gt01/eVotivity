import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import VoteWizardPage from './pages/VoteWizardPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    const saved = localStorage.getItem('evotivity_active_page');
    if (!saved || saved === 'undefined' || saved === 'null') return 'home';
    return saved;
  });

  const [walletAddress, setWalletAddress] = useState('');
  const [user, setUser] = useState(null);

  const [elections, setElections] = useState([]);
  const [voters, setVoters] = useState([]);
  const [selectedElection, setSelectedElection] = useState(() => {
    try {
      const saved = localStorage.getItem('evotivity_selected_election');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const navigateTo = (page) => {
    setActivePage(page);
    localStorage.setItem('evotivity_active_page', page);
  };

  useEffect(() => {
    fetchElections();
    fetchVoters();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get('/api/voter/elections');
      if (res.data) {
        setElections(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch elections from API:", err.message);
      setElections([]);
    }
  };

  const fetchVoters = async () => {
    try {
      const res = await axios.get('/api/admin/voters/all');
      if (res.data) {
        setVoters(res.data);
      }
    } catch (err) {
      setVoters([]);
    }
  };

  const connectWallet = async () => {
    try {
      const { requestMetaMaskAccount } = await import('./utils/web3Utils');
      const account = await requestMetaMaskAccount();
      setWalletAddress(account);
    } catch (err) {
      const manual = prompt(
        `${err.message}\n\nWould you like to manually input your Sepolia MetaMask wallet address for testing?`,
        walletAddress || ""
      );
      if (manual && manual.startsWith('0x')) {
        setWalletAddress(manual);
      }
    }
  };

  const createElection = async (newElec) => {
    try {
      const res = await axios.post('/api/admin/elections/create', newElec);
      setElections([res.data, ...elections]);
      alert("Election created successfully!");
    } catch (err) {
      alert("Error creating election: " + (err.response?.data?.message || err.message));
    }
  };

  const updatePhase = async (id, phase) => {
    try {
      await axios.post(`/api/admin/elections/${id}/phase?phase=${phase}`);
      fetchElections();
    } catch (err) {
      alert("Error updating election phase: " + (err.response?.data?.message || err.message));
    }
  };

  const addCandidate = async (cand) => {
    try {
      await axios.post('/api/admin/candidates/add', cand);
      alert("Candidate registered successfully!");
      fetchElections();
    } catch (err) {
      alert("Error adding candidate: " + (err.response?.data?.message || err.message));
    }
  };

  const approveVoter = async (userId, wallet) => {
    try {
      await axios.post('/api/admin/voters/approve', { electionId: 1, userId, walletAddress: wallet, approved: true });
      fetchVoters();
      alert("Voter approved successfully.");
    } catch (err) {
      alert("Approval error: " + (err.response?.data?.message || err.message));
    }
  };

  const loginVoter = (userObj) => {
    setUser(userObj);
    if (userObj && userObj.walletAddress) {
      setWalletAddress(userObj.walletAddress);
    }
  };

  const selectElectionForVoting = (election) => {
    setSelectedElection(election);
    localStorage.setItem('evotivity_selected_election', JSON.stringify(election));
    navigateTo('vote-wizard');
  };

  const selectElectionForResults = (election) => {
    setSelectedElection(election);
    localStorage.setItem('evotivity_selected_election', JSON.stringify(election));
    navigateTo('results');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar 
        activePage={activePage} 
        setActivePage={navigateTo} 
        walletAddress={walletAddress} 
        connectWallet={connectWallet} 
      />

      <div style={{ flex: 1 }}>
        {(activePage === 'home' || ((activePage === 'vote-wizard' || activePage === 'results') && !selectedElection)) && (
          <Home 
            setActivePage={navigateTo} 
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
            user={user}
          />
        )}
        {activePage === 'results' && selectedElection && (
          <ResultsPage election={selectedElection} />
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '2rem 1rem', marginTop: '3rem', borderTop: '1px solid var(--border-subtle)', background: '#ffffff', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <p>EvoTivity / eVoteVerity &copy; 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}


