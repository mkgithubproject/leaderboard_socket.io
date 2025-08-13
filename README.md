# Flyweis Leaderboard Service

A Node.js service for managing real-time daily leaderboards with Redis and Socket.IO.

## Features

- Daily leaderboards with automatic reset (per mode and region)
- Real-time updates via WebSockets (Socket.IO)
- REST API for leaderboard queries
- Player metadata management
- Redis for fast fetching data

## Project Structure

```
.
├── app.js
├── config.js
├── package.json
├── .env
├── controllers/
│   └── leaderboardController.js
├── redis/
│   └── client.js
├── routes/
│   └── leaderboardRoutes.js
├── services/
│   └── leaderboardService.js
├── socket/
│   └── index.js
└── utils/
    └── time.js
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Redis server (local or remote)

### Installation

1. Clone the repository:
    ```sh
    git clone <your-repo-url>
    cd flyweis_leaderBoard_service
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Configure environment variables in `.env`:
    ```
    PORT=3000
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379
    REDIS_PASSWORD=
    REDIS_USERNAME=
    DAILY_TTL_PADDING=3600
    ```

4. Start the server:
    ```sh
    npm start
    ```

   For development with auto-reload:
    ```sh
    npm run dev
    ```

## API Endpoints

### REST

- `GET /api/leaderboard/top?limit=10&mode=MODE&region=REGION`
    - Returns top N players for the given mode and region.

- `GET /health`
    - Health check endpoint.

### WebSocket Events

- `join` — Join a leaderboard room.
- `leave` — Leave a leaderboard room.
- `updateScore` — Update a player's score.
- `getTopN` — Get top N players in real-time.

## Configuration

See [`config.js`](config.js) and [`.env`](.env) for all configuration options.

