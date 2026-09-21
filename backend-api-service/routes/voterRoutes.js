const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterController');

router.get('/elections', voterController.getAllElections);
router.get('/elections/:id', voterController.getElectionById);
router.post('/register-election', voterController.registerForElection);
router.get('/status', voterController.getVoterStatus);
router.post('/cast-vote', voterController.castVote);
router.get('/results/:id', voterController.getResults);

module.exports = router;
