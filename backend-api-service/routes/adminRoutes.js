const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/elections/create', adminController.createElection);
router.post('/elections/:id/phase', adminController.setElectionPhase);
router.post('/candidates/add', adminController.addCandidate);
router.post('/voters/approve', adminController.approveVoter);
router.get('/voters/all', adminController.getAllVoters);

module.exports = router;
