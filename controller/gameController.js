const waitingPlayers = [];
const games = new Map();

function createGameState() {
  return {
    ball: { x: 400, y: 300, vx: 2, vy: 2 },
    paddles: {
      left: { y: 250 },
      right: { y: 250 }
    },
    score: { left: 0, right: 0 }
  };
}

function resetBall(state) {
  state.ball.x = 400;
  state.ball.y = 300;
  state.ball.vx *= -1;
}

function startGameLoop(io, roomId) {
  const game = games.get(roomId);
  if (!game) return;

  const state = game.state;

  const interval = setInterval(() => {
    state.ball.x += state.ball.vx;
    state.ball.y += state.ball.vy;

    // Wall collision
    if (state.ball.y <= 0 || state.ball.y >= 600) {
      state.ball.vy *= -1;
    }
    // left paddle collision
    if (state.ball.x <= 50 && state.ball.y >= state.paddles.left.y && state.ball.y <= state.paddles.left.y + 100) {
      state.ball.vx *= -1;
      state.ball.x = 50; // Reset position to avoid sticking
    }
    // right paddle collision
    if (state.ball.x >= 750 && state.ball.y >= state.paddles.right.y && state.ball.y <= state.paddles.right.y + 100) {
      state.ball.vx *= -1;
      state.ball.x = 750; // Reset position to avoid sticking
    }

    // Scoring
    if (state.ball.x <= 0) {
      state.score.right++;
      resetBall(state);
    } else if (state.ball.x >= 800) {
      state.score.left++;
      resetBall(state);
    }

    io.to(roomId).emit('gameState', state);
  }, 1000 / 60);
}

function handleConnection(io, socket) {
  if (waitingPlayers.length > 0) {
    const opponent = waitingPlayers.shift();
    const roomId = `game-${socket.id}-${opponent.id}`;

    socket.join(roomId);
    opponent.join(roomId);

    const state = createGameState();
    games.set(roomId, {
      players: [socket, opponent],
      state
    });

    io.to(roomId).emit('matchFound', { roomId });
    startGameLoop(io, roomId);
  } else {
    waitingPlayers.push(socket);
    console.log(`Player added to queue: ${socket.id}`);
  }

  socket.on('paddleMove', ({ roomId, direction }) => {
    const game = games.get(roomId);
    if (!game) return;

    const state = game.state;
    const isLeft = game.players[0].id === socket.id;
    const paddle = isLeft ? state.paddles.left : state.paddles.right;

    const speed = 10;
    if (direction === 'up') paddle.y = Math.max(0, paddle.y - speed);
    if (direction === 'down') paddle.y = Math.min(500, paddle.y + speed);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    // Optional: Remove from queue or end game

    for (const [roomId, game] of games.entries()) {
      if (game.players.some(player => player.id === socket.id)) {
        io.to(roomId).emit('playerDisconnected', { roomId });
        clearInterval(game.interval); // Stop the game loop
        games.delete(roomId);
      }
    }
  });
}

// ✅ EXPORT the main handler (and optionally others)
module.exports = {
  handleConnection
};
