
const { client } = require('../redis/client');
const { yyyymmdd, secondsUntilEndOfUTCDay } = require('../utils/time');
const config = require('../config');


/*
Generate the key for the leaderboard based on mode and region
This key will be used to store the daily leaderboard scores
Format: leaderboard:daily:YYYYMMDD:mode:MODE:region:REGION
Example: leaderboard:daily:20231001:mode:solo:region:us
This allows us to have separate leaderboards for different modes and regions
and also reset them daily.
*/
function modeRegionKey(mode, region) {
  return `leaderboard:daily:${yyyymmdd()}:mode:${mode}:region:${region}`;
}

/*
 storing player metadata in a hash
to avoid redundancy and allow easy updates
playerId is the key, and we store player meta data like name , avtar, etc.
*/
function playerHashKey(playerId) {
  return `player:${playerId}`;
}


async function updateScore(playerId, increment, meta = {}) {
  const { name, region, mode } = meta;

  if (!region || !mode) {
    throw new Error('Region and mode are required to update leaderboard');
  }

  const primaryKey = modeRegionKey(mode, region);

  // Increment score
  await client.zIncrBy(primaryKey, increment, playerId);
  // Set TTL for the daily leaderboard key and player hash
  const ttl = secondsUntilEndOfUTCDay();
  if (name) {
    await client.hSet(playerHashKey(playerId), { name });
    await client.expire(playerHashKey(playerId), ttl);
  }

  await client.expire(primaryKey, ttl);

  // Fetch updated score and rank
  const [scoreRaw, rankRaw] = await Promise.all([
    client.sendCommand(['ZSCORE', primaryKey, playerId]),
    client.sendCommand(['ZREVRANK', primaryKey, playerId])
  ]);

  const score = scoreRaw ? parseFloat(scoreRaw) : 0;
  const rank = rankRaw !== null ? parseInt(rankRaw, 10) + 1 : null;

  return { key: primaryKey, score, rank , playerId, meta: { name } };
}

/**
 * Get top N players from leaderboard
 */
async function getTopN({ limit = 10, mode, region } = {}) {
  if (!region || !mode) {
    throw new Error('Region and mode are required to fetch leaderboard');
  }

  const key = modeRegionKey(mode, region);

  const raw = await client.sendCommand([
    'ZREVRANGE',
    key,
    '0',
    String(limit - 1),
    'WITHSCORES'
  ]);
  console.log(raw) // [ 'mk123', '10' ]
  const result = [];
  for (let i = 0; i < raw.length; i += 2) {
    const playerId = raw[i];
    const score = parseFloat(raw[i + 1]);
    const rank = (i / 2) + 1;
    result.push({ playerId, score, rank });
  }

  if (result.length === 0) return { key, items: [] };

  // Fetch only player names from hash
  const metas = await Promise.all(
    result.map((item) => client.hGetAll(playerHashKey(item.playerId)))
  );

  const combined = result.map((r, idx) => ({
    ...r,
    meta: { name: metas[idx]?.name || null }
  }));

  return { key, items: combined };
}

module.exports = { updateScore, getTopN };
