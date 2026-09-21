// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Election
 * @dev Independent election smart contract managed by ElectionFactory.
 * Enforces triple authentication verification checks off-chain before vote write,
 * records votes immutably on Sepolia, auto-tallies results, and determines winners.
 */
contract Election {
    address public admin;
    string public electionName;
    string public description;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public totalVotesCast;

    enum Phase { REGISTRATION, VOTING, COMPLETED }
    Phase public currentPhase;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        string symbolUrl;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool isApproved;
        bool hasVoted;
        uint256 votedCandidateId;
        uint256 timestamp;
    }

    Candidate[] public candidates;
    mapping(address => Voter) public voters;
    address[] public voterAddresses;

    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoterApproved(address indexed voterAddress);
    event VoteCast(address indexed voterAddress, uint256 indexed candidateId, uint256 timestamp);
    event PhaseChanged(Phase indexed newPhase);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier inPhase(Phase _phase) {
        require(currentPhase == _phase, "Action not allowed in current phase");
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        address _admin
    ) {
        electionName = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        admin = _admin;
        currentPhase = Phase.REGISTRATION;
    }

    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _symbolUrl
    ) external onlyAdmin inPhase(Phase.REGISTRATION) {
        uint256 candidateId = candidates.length;
        candidates.push(Candidate({
            id: candidateId,
            name: _name,
            party: _party,
            symbolUrl: _symbolUrl,
            voteCount: 0
        }));

        emit CandidateAdded(candidateId, _name, _party);
    }

    function approveVoter(address _voterAddress) external onlyAdmin {
        if (!voters[_voterAddress].isRegistered) {
            voters[_voterAddress].isRegistered = true;
            voterAddresses.push(_voterAddress);
        }
        voters[_voterAddress].isApproved = true;

        emit VoterApproved(_voterAddress);
    }

    function setPhase(Phase _newPhase) external onlyAdmin {
        currentPhase = _newPhase;
        emit PhaseChanged(_newPhase);
    }

    /**
     * @dev Main voting function called by approved voter during VOTING phase.
     * Enforces single-vote rule and candidate validation.
     */
    function vote(uint256 _candidateId) external inPhase(Phase.VOTING) {
        require(voters[msg.sender].isApproved, "Voter is not approved for this election");
        require(!voters[msg.sender].hasVoted, "Voter has already cast a vote");
        require(_candidateId < candidates.length, "Invalid candidate ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        voters[msg.sender].timestamp = block.timestamp;

        candidates[_candidateId].voteCount++;
        totalVotesCast++;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidatesCount() external view returns (uint256) {
        return candidates.length;
    }

    function getVoterStatus(address _voter) external view returns (
        bool isRegistered,
        bool isApproved,
        bool hasVoted,
        uint256 votedCandidateId
    ) {
        Voter memory v = voters[_voter];
        return (v.isRegistered, v.isApproved, v.hasVoted, v.votedCandidateId);
    }

    function getWinner() external view returns (
        uint256 winnerId,
        string memory winnerName,
        string memory winnerParty,
        uint256 winningVoteCount
    ) {
        require(candidates.length > 0, "No candidates in election");
        
        uint256 highestVotes = 0;
        uint256 winningIdx = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                winningIdx = i;
            }
        }

        Candidate memory w = candidates[winningIdx];
        return (w.id, w.name, w.party, w.voteCount);
    }
}
