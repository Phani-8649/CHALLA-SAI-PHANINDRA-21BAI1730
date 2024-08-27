import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [gameState, setGameState] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('A');
    const [selectedPiece, setSelectedPiece] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:5000');

        ws.onopen = () => {
            console.log('WebSocket connection established');
            ws.send(JSON.stringify({ type: 'init' }));
        };

        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            switch (data.type) {
                case 'game_init':
                    setGameState(data.gameState);
                    setCurrentPlayer('A');
                    break;
                case 'state_update':
                    setGameState(data.gameState);
                    break;
                case 'invalid_move':
                    alert('Invalid move, please try again!');
                    break;
                default:
                    break;
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    const handleCellClick = (rowIndex, cellIndex) => {
        if (!selectedPiece || gameState.currentPlayer !== currentPlayer) return;

        const move = determineMoveDirection(selectedPiece, rowIndex, cellIndex);

        if (!move) {
            alert("Invalid move direction.");
            return;
        }

        const ws = new WebSocket('ws://localhost:5000');
        ws.send(JSON.stringify({
            type: 'move',
            gameId: gameState.gameId,
            player: currentPlayer,
            move: `${selectedPiece}:${move}`
        }));

        setSelectedPiece(null);
    };

    const handlePieceSelect = (piece) => {
        if (gameState.currentPlayer !== currentPlayer) {
            alert("It's not your turn.");
            return;
        }
        setSelectedPiece(piece);
    };

    const determineMoveDirection = (selectedPiece, rowIndex, cellIndex) => {
        // Implement the actual move direction logic
        return 'L'; // Example direction, replace with real logic
    };

    return (
        <div className="App">
            {gameState ? (
                <div>
                    <h1>Turn: Player {gameState.currentPlayer}</h1>
                    <div className="grid">
                        {gameState.grid.map((row, rowIndex) => (
                            <div key={rowIndex} className="row">
                                {row.map((cell, cellIndex) => (
                                    <div
                                        key={cellIndex}
                                        className="cell"
                                        onClick={() => handleCellClick(rowIndex, cellIndex)}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="pieces">
                        {gameState.pieces[currentPlayer].map((piece, index) => (
                            <button key={index} onClick={() => handlePieceSelect(piece)}>
                                {piece}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <p>Loading game...</p>
            )}
        </div>
    );
}

export default App;
