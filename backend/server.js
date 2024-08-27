const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let games = {}; // Store game states keyed by game IDs

// Utility function to initialize a new game
const initializeGame = () => {
    return {
        grid: Array(5).fill(null).map(() => Array(5).fill(null)),
        players: ['A', 'B'],
        currentPlayer: 'A',
        pieces: { 'A': [], 'B': [] },
        gameId: Date.now()
    };
};

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        console.log('Received:', message);
        const data = JSON.parse(message);

        switch (data.type) {
            case 'init':
                const game = initializeGame();
                games[game.gameId] = game;
                ws.send(JSON.stringify({ type: 'game_init', gameId: game.gameId, gameState: game }));
                break;

            case 'move':
                const currentGame = games[data.gameId];
                if (currentGame && currentGame.currentPlayer === data.player) {
                    const validMove = processMove(currentGame, data.move);
                    if (validMove) {
                        currentGame.currentPlayer = currentGame.players.find(p => p !== data.player);
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'state_update', gameState: currentGame }));
                            }
                        });
                    } else {
                        ws.send(JSON.stringify({ type: 'invalid_move' }));
                    }
                }
                break;

            default:
                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.onerror = (error) => {
        console.error('WebSocket server error:', error);
    };
});

// Example function to process a move
const processMove = (game, move) => {
    // Implement your move processing logic
    // Return true if the move is valid, otherwise return false
    return true; // Placeholder
};

// Start the server
server.listen(5000, () => {
    console.log('Server started on port 5000');
});
