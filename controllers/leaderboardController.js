const leaderboardService = require('../services/leaderboardService');


async function getTop(req, res) {
  const { limit = 10, mode, region, daily = 'true' } = req.query;
  try {
    const data = await leaderboardService.getTopN({ limit: Number(limit), mode, region});
    return res.json(data);
  } catch (err) {
    console.error('getTop error', err);
    return res.status(500).json({ error: 'internal' });
  }
}

module.exports = {  getTop };
