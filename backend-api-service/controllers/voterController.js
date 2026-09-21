const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const VoterRegistration = require('../models/VoterRegistration');
const VoteRecord = require('../models/VoteRecord');

exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(elections);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    
    const candidates = await Candidate.findAll({ where: { electionId: req.params.id } });
    return res.json({ election, candidates });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.registerForElection = async (req, res) => {
  try {
    const { electionId, userId, walletAddress } = req.query;
    let reg = await VoterRegistration.findOne({ where: { electionId, userId } });

    if (!reg) {
      reg = await VoterRegistration.create({ electionId, userId, walletAddress });
    } else if (walletAddress) {
      reg.walletAddress = walletAddress;
      await reg.save();
    }
    return res.json(reg);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getVoterStatus = async (req, res) => {
  try {
    const { electionId, userId } = req.query;
    const reg = await VoterRegistration.findOne({ where: { electionId, userId } });

    if (reg) {
      return res.json({
        registered: true,
        approved: reg.isApproved,
        hasVoted: reg.hasVoted,
        walletAddress: reg.walletAddress,
        txHash: reg.txHash,
        etherscanUrl: reg.txHash ? `https://sepolia.etherscan.io/tx/${reg.txHash}` : '#'
      });
    }

    return res.json({ registered: false, approved: false, hasVoted: false });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId, userId, walletAddress, txHash, blockNumber } = req.body;

    // Save Vote Record
    const voteRecord = await VoteRecord.create({
      electionId,
      candidateId,
      walletAddress,
      txHash,
      blockNumber: blockNumber || 0
    });

    // Update VoterRegistration
    const reg = await VoterRegistration.findOne({ where: { electionId, userId } });
    if (reg) {
      reg.hasVoted = true;
      reg.txHash = txHash;
      await reg.save();
    }

    // Increment Candidate vote count
    const candidate = await Candidate.findByPk(candidateId);
    if (candidate) {
      candidate.voteCount += 1;
      await candidate.save();
    }

    // Increment Election total votes cast
    const election = await Election.findByPk(electionId);
    if (election) {
      election.totalVotesCast += 1;
      await election.save();
    }

    return res.json({
      success: true,
      message: 'Vote transaction submitted successfully to Sepolia Blockchain',
      txHash,
      etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findByPk(id);
    const candidates = await Candidate.findAll({
      where: { electionId: id },
      order: [['voteCount', 'DESC']]
    });

    const winner = (candidates.length > 0 && election.phase === 'COMPLETED') ? candidates[0] : null;

    return res.json({ election, candidates, winner });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
