let Election;
function getElectionModel() {
  if (!Election) {
    Election = require('../models/Election');
  }
  return Election;
}

/**
 * Automatically computes election phase based on current date/time and scheduled start/end dates.
 * 
 * Timeline:
 *   - Current time < startDate => 'REGISTRATION'
 *   - startDate <= Current time <= endDate => 'VOTING'
 *   - Current time > endDate => 'COMPLETED'
 * 
 * @param {Date|string|null} startDate
 * @param {Date|string|null} endDate
 * @param {string} fallbackPhase
 * @returns {string} 'REGISTRATION' | 'VOTING' | 'COMPLETED'
 */
function computeElectionPhase(startDate, endDate, fallbackPhase = 'REGISTRATION') {
  if (!startDate && !endDate) {
    return fallbackPhase || 'REGISTRATION';
  }

  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const hasValidStart = start && !isNaN(start.getTime());
  const hasValidEnd = end && !isNaN(end.getTime());

  if (hasValidStart && now < start) {
    return 'REGISTRATION';
  }

  if (hasValidEnd && now > end) {
    return 'COMPLETED';
  }

  if (hasValidStart && hasValidEnd && now >= start && now <= end) {
    return 'VOTING';
  }

  if (hasValidStart && !hasValidEnd && now >= start) {
    return 'VOTING';
  }

  if (!hasValidStart && hasValidEnd && now <= end) {
    return 'VOTING';
  }

  return fallbackPhase || 'REGISTRATION';
}

/**
 * Checks and updates the database record for an election if its phase has changed based on dates.
 * 
 * @param {Object} election Sequelize Election instance
 * @returns {Promise<Object>} Synchronized election instance
 */
async function syncElectionPhase(election) {
  if (!election) return null;

  if (election.startDate || election.endDate) {
    const computed = computeElectionPhase(election.startDate, election.endDate, election.phase);
    if (election.phase !== computed) {
      console.log(`[AutoPhase] Transitioning Election #${election.id} ("${election.title}"): ${election.phase} -> ${computed}`);
      election.phase = computed;
      await election.save();
    }
  }

  return election;
}

/**
 * Checks and synchronizes phases for all elections in the database.
 * 
 * @returns {Promise<number>} Number of elections evaluated
 */
async function syncAllElectionPhases() {
  try {
    const ElectionModel = getElectionModel();
    const elections = await ElectionModel.findAll();
    for (const election of elections) {
      await syncElectionPhase(election);
    }
    return elections.length;
  } catch (err) {
    console.error('[AutoPhase] Error during automatic phase synchronization:', err.message);
    return 0;
  }
}

module.exports = {
  computeElectionPhase,
  syncElectionPhase,
  syncAllElectionPhases
};
