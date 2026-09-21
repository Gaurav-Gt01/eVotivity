const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const VoterRegistration = require('../models/VoterRegistration');

exports.createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, contractAddress } = req.body;
    const election = await Election.create({
      title,
      description,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 7 * 86400000),
      contractAddress: contractAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
    });
    return res.status(201).json(election);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.setElectionPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { phase } = req.query;

    const election = await Election.findByPk(id);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    election.phase = phase.toUpperCase();
    await election.save();
    return res.json(election);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addCandidate = async (req, res) => {
  try {
    const { electionId, name, party, symbolUrl, bio } = req.body;
    const existing = await Candidate.findAll({ where: { electionId } });
    
    const candidate = await Candidate.create({
      electionId,
      candidateIdOnChain: existing.length,
      name,
      party,
      symbolUrl: symbolUrl || '/images/default-avatar.png',
      bio
    });
    return res.status(201).json(candidate);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.approveVoter = async (req, res) => {
  try {
    const { electionId, userId, walletAddress, approved } = req.body;

    let reg = await VoterRegistration.findOne({ where: { electionId, userId } });
    if (!reg) {
      reg = await VoterRegistration.create({ electionId, userId, walletAddress, isApproved: approved });
    } else {
      reg.isApproved = approved;
      if (walletAddress) reg.walletAddress = walletAddress;
      await reg.save();
    }

    // Also update User profile approval
    await User.update({ isApproved: approved }, { where: { id: userId } });

    return res.json(reg);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllVoters = async (req, res) => {
  try {
    const voters = await User.findAll({ where: { role: 'ROLE_VOTER' } });
    return res.json(voters);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
