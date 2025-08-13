const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.get('/top', leaderboardController.getTop);         // query: ?limit=10&mode=...&region=...&daily=true

module.exports = router;
