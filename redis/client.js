const { createClient } = require('redis');
const config = require('../config');


const redisOptions = {
  socket: {
    host: config.redisHost,
    port: config.redisPort,
  },    
  username : config.redisUserName,
  password : config.redisPassword

};

const client = createClient(redisOptions);

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

async function connectRedis() {
  if (!client.isOpen) await client.connect();
//   console.log(await client.get("1"))
  console.log(`Redis is open: ${client.isOpen} || socket options: ${JSON.stringify(redisOptions.socket)}`);
  return client;
}

module.exports = { client, connectRedis };
