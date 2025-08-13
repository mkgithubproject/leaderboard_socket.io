


function socketHandler(io, leaderboardService) {
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    // send socket id to client
    socket.emit('welcome_socket_ji', { socket_id: socket.id });
    // Store the room name joined by this socket connection
    socket.joinedRoom = null;

    socket.on('join', ({ roomName }) => {
      console.log('Joining room:', roomName);
      if (!roomName) {
        socket.emit('error', { message: 'Room name is required to join' });
        return;
      }
      if (socket.joinedRoom) {
        socket.leave(socket.joinedRoom);
      }
      socket.join(roomName);
      socket.emit('joinedRoom', { msg: `Joined room ${roomName}` });
      socket.joinedRoom = roomName;
    });

    socket.on('leave', ({ roomName }) => {
      if (!roomName) return;
      socket.leave(roomName);
      if (socket.joinedRoom === roomName) {
        socket.joinedRoom = null;
      }
    });

    socket.on('updateScore', async (payload) => {
      try {
        const { playerId, score, name, region, mode } = payload;

        // Update score via service
        const updated = await leaderboardService.updateScore(playerId, score, { name, region, mode });

        // Emit to the socket's joined room
        if (socket.joinedRoom) {
          io.to(socket.joinedRoom).emit('leaderboardData', { playerId, score: updated.score, rank: updated.rank, key: updated.key });
        } else {
          console.warn('Socket not joined to any room, cannot emit leaderboardData');
        }
      } catch (err) {
        console.error('socket updateScore error', err);
        socket.emit('error', { message: 'update failed' });
      }
    });

    // top 10 leaderboard players
    socket.on('getTopN', async ({ limit = 10, mode, region }) => {
      try {
        const data = await leaderboardService.getTopN({ limit: Number(limit), mode, region });
        socket.emit('topData', data);
      } catch (err) {
        console.error('socket getTop error', err);
        socket.emit('error', { message: 'Failed to fetch top players' });
      }
    });

    socket.on('disconnect', () => {
      // cleanup if needed
      if (socket.joinedRoom) {
        socket.leave(socket.joinedRoom);
        socket.joinedRoom = null;
      }
    });
  });
}



module.exports = socketHandler;
