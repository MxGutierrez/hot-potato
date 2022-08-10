// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Potato.sol";
import "./HotPotato.sol";
import "./IHotPotatoGame.sol";

contract HotPotatoGame is IHotPotatoGame {
    uint8 constant MAX_PLAYERS = 15;
    uint256 constant MAX_FUTURE_EXPIRATION_TIME = 1 weeks;
    uint256 constant POTATO_GAME_ENTRY_AMOUNT = 50 * (10**18); // 50 tokens
    uint256 constant POTATO_WIN_AMOUNT = 100 * (10**18); // 100 tokens

    HotPotato public _hotPotatoContract;
    Potato public _potatoContract;

    struct Player {
        uint256 joinedAt;
        uint256 claimedWinAt;
    }

    struct Game {
        address owner;
        uint256 createdAt;
        uint256 expirationTime;
        uint256 startedAt;
        uint256 endedAt;
        uint8 hotPotatoCount;
        // Mapping addresses to hot potatoes
        mapping(address => Player) players;
        address[] playerAddrs;
    }

    // Mapping gameIds to games
    mapping(uint256 => Game) private _games;

    // Used for generating game ids
    uint256 private _gameCount = 0;

    event GameCreated(address indexed owner, uint256 gameId);
    event GameStarted(uint256 indexed gameId);
    event GameEnded(uint256 indexed gameId);
    event PlayerJoined(uint256 indexed gameId, address player);
    event PlayerWinClaimed(uint256 indexed gameId, address indexed player);

    modifier gameExists(uint256 gameId) {
        require(_games[gameId].createdAt > 0, "Game doesn't exist");
        _;
    }

    modifier gameStarted(uint256 gameId, bool started) {
        require(
            (_games[gameId].startedAt != 0) == started,
            started ? "Game hasn't started yet" : "Game already started"
        );
        _;
    }

    modifier gameEnded(uint256 gameId, bool ended) {
        require(
            (_games[gameId].endedAt != 0) == ended,
            ended ? "Game hasn't ended yet" : "Game has ended"
        );
        _;
    }

    modifier affordsGame() {
        // Check if user has approved contract with game cost amount
        require(
            _potatoContract.allowance(msg.sender, address(this)) >=
                POTATO_GAME_ENTRY_AMOUNT,
            "Player should approve contract with potato game amount"
        );
        _;
    }

    modifier onlyOwner(uint256 gameId) {
        require(
            _games[gameId].owner == msg.sender,
            "Sender should be game owner"
        );
        _;
    }

    constructor() {
        _hotPotatoContract = new HotPotato();
        _potatoContract = new Potato();
    }

    function createGame() public affordsGame {
        // Generate 8 digit game identifier
        uint256 gameId = uint256(keccak256(abi.encodePacked(_gameCount++))) %
            (10**8);

        Game storage game = _games[gameId];
        game.createdAt = block.timestamp;
        game.owner = msg.sender;

        emit GameCreated(msg.sender, gameId);

        _addPlayer(gameId, msg.sender);
    }

    function startGame(
        uint256 gameId,
        uint8 hotPotatoCount,
        uint256 expirationTime
    ) public gameExists(gameId) onlyOwner(gameId) gameStarted(gameId, false) {
        require(
            block.timestamp < expirationTime,
            "Expiration time should be in the future"
        );
        require(
            block.timestamp + MAX_FUTURE_EXPIRATION_TIME >= expirationTime,
            "Expiration time exceeds limit"
        );
        require(_games[gameId].playerAddrs.length > 1, "Not enough players");
        require(
            hotPotatoCount < _games[gameId].playerAddrs.length,
            "Too many hot potatoes"
        );

        _games[gameId].hotPotatoCount = hotPotatoCount;
        _games[gameId].expirationTime = expirationTime;

        // Copy player addresses array for temporal manipulation
        address[] memory copy = _games[gameId].playerAddrs;

        // Pseudo-randomness will do
        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.difficulty))
        );

        for (uint8 i = 0; i < _games[gameId].hotPotatoCount; i++) {
            uint256 k = uint256(keccak256(abi.encodePacked(rand, i))) %
                (copy.length - i);
            _hotPotatoContract.mint(copy[k], gameId);

            // Remove k indexed item
            copy[k] = copy[copy.length - 1];
        }

        _games[gameId].startedAt = block.timestamp;

        emit GameStarted(gameId);
    }

    function joinGame(uint256 gameId)
        public
        gameExists(gameId)
        gameStarted(gameId, false)
        affordsGame
    {
        require(
            _games[gameId].playerAddrs.length < MAX_PLAYERS,
            "Already at max players"
        );
        require(
            _games[gameId].players[msg.sender].joinedAt == 0,
            "Player already in game"
        );

        _addPlayer(gameId, msg.sender);
    }

    function _addPlayer(uint256 gameId, address player) internal {
        // Transfer allowed potato to contract
        _potatoContract.transferFrom(
            player,
            address(this),
            POTATO_GAME_ENTRY_AMOUNT
        );

        Player storage p = _games[gameId].players[player];
        p.joinedAt = block.timestamp;
        _games[gameId].playerAddrs.push(player);

        emit PlayerJoined(gameId, player);
    }

    function endGame(uint256 gameId)
        external
        gameStarted(gameId, true)
        gameEnded(gameId, false)
    {
        // Only hot potato contract is allowed to end game
        require(msg.sender == address(_hotPotatoContract));

        _games[gameId].endedAt = block.timestamp;

        emit GameEnded(gameId);
    }

    function getWinners(uint256 gameId)
        public
        view
        gameEnded(gameId, true)
        returns (address[] memory)
    {
        // The amount of winners is the player count - hot potato count
        address[] memory winners = new address[](
            _games[gameId].playerAddrs.length - _games[gameId].hotPotatoCount
        );

        // Index of stored indices on winners array
        uint256 w_idx = 0;

        for (uint8 i = 0; i < _games[gameId].playerAddrs.length; i++) {
            // Check if player's address has any hot potatos
            if (_isPlayerWinner(gameId, _games[gameId].playerAddrs[i])) {
                winners[w_idx++] = _games[gameId].playerAddrs[i];
            }
        }
        return winners;
    }

    function claimWin(uint256 gameId) external gameEnded(gameId, true) {
        require(
            _isPlayerWinner(gameId, msg.sender),
            "Player not winner of game"
        );
        require(
            _games[gameId].players[msg.sender].claimedWinAt == 0,
            "Player already claimed win"
        );

        _games[gameId].players[msg.sender].claimedWinAt == block.timestamp;

        // Split lost potato count evenly to winners
        uint256 winnerCount = _games[gameId].playerAddrs.length -
            _games[gameId].hotPotatoCount;

        uint256 lostPotatoAmount = _games[gameId].hotPotatoCount *
            POTATO_GAME_ENTRY_AMOUNT;

        _potatoContract.transfer(msg.sender, lostPotatoAmount / winnerCount);

        emit PlayerWinClaimed(gameId, msg.sender);
    }

    function _isPlayerWinner(uint256 gameId, address player)
        internal
        view
        gameEnded(gameId, true)
        returns (bool)
    {
        return _hotPotatoContract.balanceOf(player, gameId) == 0;
    }

    function getPlayers(uint256 gameId)
        external
        view
        returns (address[] memory)
    {
        return _games[gameId].playerAddrs;
    }

    function hasGameEnded(uint256 gameId) external view returns (bool) {
        return _games[gameId].endedAt > 0;
    }
}
