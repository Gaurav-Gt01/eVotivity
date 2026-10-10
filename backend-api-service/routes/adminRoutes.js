const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/elections/create', adminController.createElection);
router.delete('/elections/:id', adminController.deleteElection);
router.post('/elections/:id/phase', adminController.setElectionPhase);
router.post('/elections/:id/schedule', adminController.updateElectionSchedule);
router.post('/candidates/add', adminController.addCandidate);
router.post('/candidates/approve', adminController.approveCandidate);
router.post('/voters/approve', adminController.approveVoter);
router.get('/voters/all', adminController.getAllVoters);
router.get('/pending', adminController.getPendingRequests);

module.exports = router;

