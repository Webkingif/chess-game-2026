/**
 * Grandmaster AI Chess - Vanilla JS Implementation
 */

// --- Constants & Types ---
const PieceType = { PAWN: 'p', KNIGHT: 'n', BISHOP: 'b', ROOK: 'r', QUEEN: 'q', KING: 'k' };
const Color = { WHITE: 'w', BLACK: 'b' };
const MoveFlags = { NORMAL: 0, PAWN_PUSH: 1, BIG_PAWN: 2, CAPTURE: 4, EN_PASSANT: 8, PROMOTION: 16, KSIDE_CASTLE: 32, QSIDE_CASTLE: 64 };

const PIECE_VALUES = { [PieceType.PAWN]: 100, [PieceType.KNIGHT]: 320, [PieceType.BISHOP]: 330, [PieceType.ROOK]: 500, [PieceType.QUEEN]: 900, [PieceType.KING]: 20000 };

const PST = {
    [PieceType.PAWN]: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    [PieceType.KNIGHT]: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    [PieceType.BISHOP]: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    [PieceType.ROOK]: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    [PieceType.QUEEN]: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    [PieceType.KING]: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20]
};

const PIECE_SVGS = {
    'w-p': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    'w-n': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    'w-b': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    'w-r': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    'w-q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    'w-k': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    'b-p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    'b-n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    'b-b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    'b-r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    'b-q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    'b-k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

// Variable to store the install event
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    // 1. Prevent the default mini-infobar from appearing on mobile
    e.preventDefault();

    // 2. Stash the event so it can be triggered later
    deferredPrompt = e;

    // 3. Unhide your custom install button
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    // Show the native browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, it can't be used again. Clear it.
    deferredPrompt = null;

    // Hide our custom button since the user made a choice
    installBtn.style.display = 'none';
});

window.addEventListener('appinstalled', (event) => {
    console.log('🎉 Grandmaster Chess was successfully installed!');
    // Hide the button just in case
    installBtn.style.display = 'none';
});


// --- Chess Engine ---
class ChessEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = new Array(64).fill(null);
        this.turn = Color.WHITE;
        this.history = [];
        this.stateStack = [];
        this.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
        this.enPassant = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.isCheck = false;
        this.isCheckmate = false;
        this.isStalemate = false;

        const setup = (color, row, pawns) => {
            const pieces = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN, PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK];
            for (let i = 0; i < 8; i++) {
                this.board[row * 8 + i] = { type: pieces[i], color };
                this.board[pawns * 8 + i] = { type: PieceType.PAWN, color };
            }
        };
        setup(Color.BLACK, 0, 1);
        setup(Color.WHITE, 7, 6);
    }

    generateMoves(square = null, onlyLegal = true) {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            if (square !== null && i !== square) continue;
            const piece = this.board[i];
            if (!piece || piece.color !== this.turn) continue;
            this.generatePieceMoves(i, piece, moves, true);
        }

        if (onlyLegal) {
            return moves.filter(move => {
                const turn = this.turn;
                this.makeMove(move, false);
                const inCheck = this.isCheckForColor(turn);
                this.undoMove(false);
                return !inCheck;
            });
        }
        return moves;
    }

    generatePieceMoves(pos, piece, moves, includeCastling = true) {
        const row = Math.floor(pos / 8);
        const col = pos % 8;
        const dir = piece.color === Color.WHITE ? -1 : 1;

        switch (piece.type) {
            case PieceType.PAWN:
                const startRow = piece.color === Color.WHITE ? 6 : 1;
                const promoRow = piece.color === Color.WHITE ? 0 : 7;
                const next = pos + dir * 8;
                if (next >= 0 && next < 64 && !this.board[next]) {
                    if (Math.floor(next / 8) === promoRow) {
                        [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].forEach(p => moves.push({ from: pos, to: next, promotion: p, flags: MoveFlags.PROMOTION }));
                    } else {
                        moves.push({ from: pos, to: next, flags: MoveFlags.PAWN_PUSH });
                        const double = pos + dir * 16;
                        if (row === startRow && !this.board[double]) moves.push({ from: pos, to: double, flags: MoveFlags.BIG_PAWN });
                    }
                }
                [-1, 1].forEach(dCol => {
                    const targetCol = col + dCol;
                    if (targetCol < 0 || targetCol > 7) return;
                    const target = pos + dir * 8 + dCol;
                    const targetPiece = this.board[target];
                    if (targetPiece && targetPiece.color !== piece.color) {
                        if (Math.floor(target / 8) === promoRow) {
                            [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].forEach(p => moves.push({ from: pos, to: target, promotion: p, captured: targetPiece, flags: MoveFlags.PROMOTION | MoveFlags.CAPTURE }));
                        } else {
                            moves.push({ from: pos, to: target, captured: targetPiece, flags: MoveFlags.CAPTURE });
                        }
                    } else if (target === this.enPassant) {
                        moves.push({ from: pos, to: target, captured: { type: PieceType.PAWN, color: piece.color === Color.WHITE ? Color.BLACK : Color.WHITE }, flags: MoveFlags.EN_PASSANT | MoveFlags.CAPTURE });
                    }
                });
                break;
            case PieceType.KNIGHT:
                [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
                    const r = row + dr, c = col + dc;
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const target = r * 8 + c, targetPiece = this.board[target];
                        if (!targetPiece) moves.push({ from: pos, to: target, flags: MoveFlags.NORMAL });
                        else if (targetPiece.color !== piece.color) moves.push({ from: pos, to: target, captured: targetPiece, flags: MoveFlags.CAPTURE });
                    }
                });
                break;
            case PieceType.BISHOP:
            case PieceType.ROOK:
            case PieceType.QUEEN:
                const dirs = [];
                if (piece.type !== PieceType.ROOK) dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
                if (piece.type !== PieceType.BISHOP) dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
                dirs.forEach(([dr, dc]) => {
                    let r = row + dr, c = col + dc;
                    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const target = r * 8 + c, targetPiece = this.board[target];
                        if (!targetPiece) moves.push({ from: pos, to: target, flags: MoveFlags.NORMAL });
                        else {
                            if (targetPiece.color !== piece.color) moves.push({ from: pos, to: target, captured: targetPiece, flags: MoveFlags.CAPTURE });
                            break;
                        }
                        r += dr; c += dc;
                    }
                });
                break;
            case PieceType.KING:
                [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
                    const r = row + dr, c = col + dc;
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const target = r * 8 + c, targetPiece = this.board[target];
                        if (!targetPiece) moves.push({ from: pos, to: target, flags: MoveFlags.NORMAL });
                        else if (targetPiece.color !== piece.color) moves.push({ from: pos, to: target, captured: targetPiece, flags: MoveFlags.CAPTURE });
                    }
                });
                if (includeCastling && !this.isCheckForColor(piece.color)) {
                    const rights = this.castling[piece.color];
                    if (rights.k) {
                        const p = [pos + 1, pos + 2];
                        if (!this.board[p[0]] && !this.board[p[1]] && !this.isSquareAttacked(p[0], piece.color === Color.WHITE ? Color.BLACK : Color.WHITE)) moves.push({ from: pos, to: pos + 2, flags: MoveFlags.KSIDE_CASTLE });
                    }
                    if (rights.q) {
                        const p = [pos - 1, pos - 2, pos - 3];
                        if (!this.board[p[0]] && !this.board[p[1]] && !this.board[p[2]] && !this.isSquareAttacked(p[0], piece.color === Color.WHITE ? Color.BLACK : Color.WHITE)) moves.push({ from: pos, to: pos - 2, flags: MoveFlags.QSIDE_CASTLE });
                    }
                }
                break;
        }
    }

    isSquareAttacked(pos, attackerColor) {
        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (piece && piece.color === attackerColor) {
                const moves = [];
                this.generatePieceMoves(i, piece, moves, false);
                if (moves.some(m => m.to === pos)) return true;
            }
        }
        return false;
    }

    isCheckForColor(color) {
        const kingPos = this.board.findIndex(p => p?.type === PieceType.KING && p.color === color);
        if (kingPos === -1) return false;
        return this.isSquareAttacked(kingPos, color === Color.WHITE ? Color.BLACK : Color.WHITE);
    }

    makeMove(move, updateStatus = true) {
        const piece = this.board[move.from];
        const opponent = piece.color === Color.WHITE ? Color.BLACK : Color.WHITE;

        this.stateStack.push({
            castling: { w: { ...this.castling.w }, b: { ...this.castling.b } },
            enPassant: this.enPassant,
            halfMoveClock: this.halfMoveClock
        });

        this.board[move.to] = move.promotion ? { type: move.promotion, color: piece.color } : piece;
        this.board[move.from] = null;

        if (move.flags & MoveFlags.EN_PASSANT) {
            const dir = piece.color === Color.WHITE ? 1 : -1;
            this.board[move.to + dir * 8] = null;
        } else if (move.flags & MoveFlags.KSIDE_CASTLE) {
            const rookPos = move.to + 1, rook = this.board[rookPos];
            this.board[move.to - 1] = rook;
            this.board[rookPos] = null;
        } else if (move.flags & MoveFlags.QSIDE_CASTLE) {
            const rookPos = move.to - 2, rook = this.board[rookPos];
            this.board[move.to + 1] = rook;
            this.board[rookPos] = null;
        }

        this.enPassant = (move.flags & MoveFlags.BIG_PAWN) ? (move.from + move.to) / 2 : null;

        if (piece.type === PieceType.KING) {
            this.castling[piece.color].k = false;
            this.castling[piece.color].q = false;
        }
        if (piece.type === PieceType.ROOK) {
            if (move.from % 8 === 0) this.castling[piece.color].q = false;
            if (move.from % 8 === 7) this.castling[piece.color].k = false;
        }
        if (move.captured?.type === PieceType.ROOK) {
            if (move.to % 8 === 0) this.castling[opponent].q = false;
            if (move.to % 8 === 7) this.castling[opponent].k = false;
        }

        this.history.push(move);
        this.turn = opponent;

        if (updateStatus) {
            this.isCheck = this.isCheckForColor(this.turn);
            const nextMoves = this.generateMoves();
            if (nextMoves.length === 0) {
                if (this.isCheck) this.isCheckmate = true;
                else this.isStalemate = true;
            }
        }
    }

    undoMove(updateStatus = true) {
        if (this.history.length === 0) return;
        const move = this.history.pop();
        const prevState = this.stateStack.pop();
        const opponent = this.turn;
        const turn = opponent === Color.WHITE ? Color.BLACK : Color.WHITE;

        const piece = this.board[move.to];
        this.board[move.from] = move.promotion ? { type: PieceType.PAWN, color: turn } : piece;
        this.board[move.to] = move.captured || null;

        if (move.flags & MoveFlags.EN_PASSANT) {
            const dir = turn === Color.WHITE ? 1 : -1;
            const capturedPos = move.to + dir * 8;
            this.board[move.to] = null;
            this.board[capturedPos] = { type: PieceType.PAWN, color: opponent };
        } else if (move.flags & MoveFlags.KSIDE_CASTLE) {
            const rook = this.board[move.to - 1];
            this.board[move.to + 1] = rook;
            this.board[move.to - 1] = null;
        } else if (move.flags & MoveFlags.QSIDE_CASTLE) {
            const rook = this.board[move.to + 1];
            this.board[move.to - 2] = rook;
            this.board[move.to + 1] = null;
        }

        this.castling = prevState.castling;
        this.enPassant = prevState.enPassant;
        this.halfMoveClock = prevState.halfMoveClock;
        this.turn = turn;

        if (updateStatus) {
            this.isCheck = this.isCheckForColor(this.turn);
            this.isCheckmate = false;
            this.isStalemate = false;
        }
    }
}

// --- Chess AI ---
class ChessAI {
    constructor(engine) {
        this.engine = engine;
    }

    getBestMove(depth) {
        const moves = this.engine.generateMoves();
        if (moves.length === 0) return null;
        this.orderMoves(moves);

        let bestMove = null, bestValue = -Infinity;
        for (const move of moves) {
            this.engine.makeMove(move, true);
            const val = -this.minimax(depth - 1, -Infinity, Infinity, false);
            this.engine.undoMove(true);
            if (val > bestValue) { bestValue = val; bestMove = move; }
        }
        return bestMove;
    }

    orderMoves(moves) {
        moves.sort((a, b) => {
            let sA = 0, sB = 0;
            if (a.captured) sA = 10 * PIECE_VALUES[a.captured.type] - PIECE_VALUES[this.engine.board[a.from]?.type || PieceType.PAWN];
            if (b.captured) sB = 10 * PIECE_VALUES[b.captured.type] - PIECE_VALUES[this.engine.board[b.from]?.type || PieceType.PAWN];
            if (a.promotion) sA += PIECE_VALUES[a.promotion];
            if (b.promotion) sB += PIECE_VALUES[b.promotion];
            return sB - sA;
        });
    }

    minimax(depth, alpha, beta, isMax) {
        if (depth === 0) return this.evaluate();
        const moves = this.engine.generateMoves();
        if (moves.length === 0) {
            if (this.engine.isCheckForColor(this.engine.turn)) return -200000 - depth;
            return 0;
        }
        this.orderMoves(moves);
        if (isMax) {
            let max = -Infinity;
            for (const m of moves) {
                this.engine.makeMove(m, true);
                const val = this.minimax(depth - 1, alpha, beta, false);
                this.engine.undoMove(true);
                max = Math.max(max, val); alpha = Math.max(alpha, val);
                if (beta <= alpha) break;
            }
            return max;
        } else {
            let min = Infinity;
            for (const m of moves) {
                this.engine.makeMove(m, true);
                const val = this.minimax(depth - 1, alpha, beta, true);
                this.engine.undoMove(true);
                min = Math.min(min, val); beta = Math.min(beta, val);
                if (beta <= alpha) break;
            }
            return min;
        }
    }

    evaluate() {
        const board = this.engine.board, turn = this.engine.turn;
        let total = 0;
        for (let i = 0; i < 64; i++) {
            const p = board[i];
            if (p) {
                const val = PIECE_VALUES[p.type] + this.getPSTValue(p.type, p.color, i);
                total += p.color === turn ? val : -val;
            }
        }
        return total;
    }

    getPSTValue(type, color, pos) {
        const table = PST[type];
        if (color === Color.WHITE) return table[pos];
        const r = Math.floor(pos / 8), c = pos % 8;
        return table[(7 - r) * 8 + c];
    }
}

// --- UI Controller ---
class ChessUI {
    constructor() {
        this.engine = new ChessEngine();
        this.ai = new ChessAI(this.engine);
        this.selectedSquare = null;
        this.legalMoves = [];
        this.isThinking = false;
        this.difficulty = 3;
        this.playerColor = Color.WHITE;
        this.showWhitePieces = true;
        this.showBlackPieces = true;

        this.initElements();
        this.initEvents();
        this.render();
    }

    initElements() {
        this.boardEl = document.getElementById('board');
        this.statusTextEl = document.getElementById('status-text');
        this.turnDotEl = document.getElementById('turn-dot');
        this.historyListEl = document.getElementById('history-list');
        this.moveCountEl = document.getElementById('move-count');
        this.undoBtn = document.getElementById('undo-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultyBtns = document.querySelectorAll('#difficulty-btns button');
        this.colorBtns = document.querySelectorAll('#color-btns button');
        this.toggleWhite = document.getElementById('toggle-white');
        this.toggleBlack = document.getElementById('toggle-black');
        this.promotionModal = document.getElementById('promotion-modal');
        this.promotionChoices = document.getElementById('promotion-choices');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.gameOverMsg = document.getElementById('game-over-msg');
        this.playAgainBtn = document.getElementById('play-again-btn');
    }

    initEvents() {
        this.undoBtn.onclick = () => { this.engine.undoMove(); this.engine.undoMove(); this.render(); };
        this.resetBtn.onclick = () => { this.engine.reset(); this.render(); };
        this.playAgainBtn.onclick = () => { this.gameOverModal.classList.remove('active'); this.engine.reset(); this.render(); };

        this.difficultyBtns.forEach(btn => {
            btn.onclick = () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = parseInt(btn.dataset.depth);
            };
        });

        this.colorBtns.forEach(btn => {
            btn.onclick = () => {
                this.colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.playerColor = btn.dataset.color;
                this.engine.reset();
                this.render();
            };
        });

        this.toggleWhite.onchange = (e) => { this.showWhitePieces = e.target.checked; this.render(); };
        this.toggleBlack.onchange = (e) => { this.showBlackPieces = e.target.checked; this.render(); };
    }

    render() {
        this.renderBoard();
        this.renderStatus();
        this.renderHistory();
        this.checkAI();
    }

    renderBoard() {
        this.boardEl.innerHTML = '';
        const lastMove = this.engine.history[this.engine.history.length - 1];

        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8), col = i % 8;
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 1 ? 'dark' : 'light'}`;

            if (this.selectedSquare === i) square.classList.add('selected');
            if (lastMove && (lastMove.from === i || lastMove.to === i)) square.classList.add('last-move');

            const piece = this.engine.board[i];
            if (piece?.type === PieceType.KING && piece.color === this.engine.turn && this.engine.isCheck) {
                square.classList.add('check');
            }

            // Coords
            if (col === 0) {
                const rank = document.createElement('span');
                rank.className = 'coord rank'; rank.textContent = 8 - row;
                square.appendChild(rank);
            }
            if (row === 7) {
                const file = document.createElement('span');
                file.className = 'coord file'; file.textContent = String.fromCharCode(97 + col);
                square.appendChild(file);
            }

            // Legal Move Indicators
            const legalMove = this.legalMoves.find(m => m.to === i);
            if (legalMove) {
                const indicator = document.createElement('div');
                indicator.className = piece ? 'legal-ring' : 'legal-dot';
                square.appendChild(indicator);
            }

            // Piece

            if (piece) {
                const img = document.createElement('img');
                img.src = PIECE_SVGS[`${piece.color}-${piece.type}`];
                img.className = 'piece';

                // Dynamic, descriptive alt text for accessibility
                const colorName = piece.color === Color.WHITE ? 'White' : 'Black';
                const pieceNames = { 'p': 'Pawn', 'n': 'Knight', 'b': 'Bishop', 'r': 'Rook', 'q': 'Queen', 'k': 'King' };
                const squareName = String.fromCharCode(97 + col) + (8 - row);
                img.alt = `${colorName} ${pieceNames[piece.type]} on ${squareName}`;

                if ((piece.color === Color.WHITE && !this.showWhitePieces) || (piece.color === Color.BLACK && !this.showBlackPieces)) {
                    img.classList.add('hidden');
                }
                square.appendChild(img);
            }

            square.onclick = () => this.handleSquareClick(i);
            this.boardEl.appendChild(square);
        }
    }

    renderStatus() {
        this.statusTextEl.textContent = this.engine.isCheckmate ? 'Checkmate!' :
            this.engine.isStalemate ? 'Stalemate' :
                this.isThinking ? 'AI Thinking...' :
                    `${this.engine.turn === Color.WHITE ? 'White' : 'Black'}'s Turn`;

        this.turnDotEl.className = `dot ${this.engine.turn === Color.WHITE ? 'white' : 'black'}`;
        this.undoBtn.disabled = this.engine.history.length < 2 || this.isThinking;

        if (this.engine.isCheckmate || this.engine.isStalemate) {
            this.gameOverTitle.textContent = this.engine.isCheckmate ? 'Checkmate!' : 'Stalemate';
            this.gameOverMsg.textContent = this.engine.isCheckmate ?
                `${this.engine.turn === Color.WHITE ? 'Black' : 'White'} wins the game.` :
                'The game ended in a draw.';
            this.gameOverModal.classList.add('active');
        }
    }

    renderHistory() {
        this.historyListEl.innerHTML = '';
        this.moveCountEl.textContent = `${Math.ceil(this.engine.history.length / 2)} Moves`;

        if (this.engine.history.length === 0) {
            this.historyListEl.innerHTML = '<div class="empty-history">No moves yet</div>';
            return;
        }

        for (let i = 0; i < Math.ceil(this.engine.history.length / 2); i++) {
            const row = document.createElement('div');
            row.className = 'history-row';

            const num = document.createElement('div');
            num.className = 'history-num'; num.textContent = `${i + 1}.`;
            row.appendChild(num);

            const m1 = this.engine.history[i * 2];
            const move1 = document.createElement('div');
            move1.className = 'history-move'; move1.textContent = this.formatMove(m1);
            row.appendChild(move1);

            const m2 = this.engine.history[i * 2 + 1];
            if (m2) {
                const move2 = document.createElement('div');
                move2.className = 'history-move'; move2.textContent = this.formatMove(m2);
                row.appendChild(move2);
            }

            this.historyListEl.appendChild(row);
        }
        this.historyListEl.scrollTop = this.historyListEl.scrollHeight;
    }

    formatMove(m) {
        const f = String.fromCharCode(97 + (m.from % 8)) + (8 - Math.floor(m.from / 8));
        const t = String.fromCharCode(97 + (m.to % 8)) + (8 - Math.floor(m.to / 8));
        return `${f}→${t}${m.promotion ? '=' + m.promotion.toUpperCase() : ''}`;
    }

    handleSquareClick(i) {
        if (this.engine.isCheckmate || this.engine.isStalemate || this.isThinking) return;
        if (this.engine.turn !== this.playerColor) return;

        const move = this.legalMoves.find(m => m.to === i);
        if (move) {
            if (move.flags & MoveFlags.PROMOTION) {
                this.showPromotionModal(move);
            } else {
                this.engine.makeMove(move);
                this.selectedSquare = null; this.legalMoves = [];
                this.render();
            }
            return;
        }

        const piece = this.engine.board[i];
        if (piece && piece.color === this.engine.turn) {
            this.selectedSquare = i;
            this.legalMoves = this.engine.generateMoves(i);
        } else {
            this.selectedSquare = null; this.legalMoves = [];
        }
        this.renderBoard();
    }

    showPromotionModal(move) {
        this.promotionChoices.innerHTML = '';
        [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'promo-btn';
            const img = document.createElement('img');
            img.src = PIECE_SVGS[`${this.playerColor}-${type}`];
            btn.appendChild(img);
            btn.onclick = () => {
                const m = this.engine.generateMoves(move.from).find(x => x.to === move.to && x.promotion === type);
                this.engine.makeMove(m);
                this.promotionModal.classList.remove('active');
                this.selectedSquare = null; this.legalMoves = [];
                this.render();
            };
            this.promotionChoices.appendChild(btn);
        });
        this.promotionModal.classList.add('active');
    }

    checkAI() {
        if (this.engine.turn !== this.playerColor && !this.engine.isCheckmate && !this.engine.isStalemate && !this.isThinking) {
            this.isThinking = true;
            this.renderStatus();
            setTimeout(() => {
                const best = this.ai.getBestMove(this.difficulty);
                if (best) this.engine.makeMove(best);
                this.isThinking = false;
                this.render();
            }, 500);
        }
    }
}

// Start the app
window.onload = () => new ChessUI();
