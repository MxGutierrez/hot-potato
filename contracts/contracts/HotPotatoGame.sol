// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./HotPotato.sol";

contract HotPotatoGame is Ownable {
    uint8 constant MAX_HOT_POTATOES = 4;
    uint8 constant MAX_PLAYERS = 15;
    uint256 constant MAX_FUTURE_EXPIRATION_TIME = 1 weeks;

    IERC721 public _hotPotatoContract;

    struct Player {
        uint256 joinedAt;
    }

    struct Game {
        address owner;
        uint8 hotPotatoCount;
        uint256 expirationTime;
        uint256 startedAt;
        uint256 endedAt;
        // Mapping addresses to hot potatoes
        mapping(address => Player) players;
        address[] playerAddrs;
    }

    // Mapping gameIds to games
    mapping(uint256 => Game) private _games;

    // Used for generating game ids
    uint256 private _gameCount = 0;

    event GameStarted(uint256 indexed gameId);
    event GameEnded(uint256 indexed gameId);
    event PlayerJoined(uint256 indexed gameId, address player);

    modifier gameStarted(uint256 gameId, bool started) {
        require(
            (_games[gameId].startedAt > 0) == started,
            started ? "Game hasn't started yet" : "Game already started"
        );
        _;
    }

    modifier gameEnded(uint256 gameId, bool ended) {
        require(
            (_games[gameId].endedAt == 0) == ended,
            ended ? "Game hasn't ended yet" : "Game has ended"
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

    constructor(address hotPotatoContract) public {
        _hotPotatoContract = IERC721(hotPotatoContract);
    }

    function createGame() public {
        uint256 gameId = uint256(keccak256(abi.encodePacked(_gameCount++)));

        _games[gameId] = new Game({owner: msg.sender, playerAddrs: []});

        _addPlayer(gameId, msg.sender);
    }

    function startGame(
        uint256 gameId,
        uint8 hotPotatoCount,
        uint256 expirationTime
    ) onlyOwner(gameId) gameStarted(gameId, false) {
        require(
            now < expirationTime,
            "Expiration time should be in the future"
        );
        require(
            now + MAX_FUTURE_EXPIRATION_TIME >= expirationTime,
            "Expiration time exceeds limit"
        );
        require(_games[gameId].playerAddrs.length > 1, "Not enough players");
        require(
            hotPotatoCount < _games[gameId].playerAddrs.length,
            "To many hot potatoes"
        );

        _games[gameId].hotPotatoCount = hotPotatoCount;
        _games[gameId].expirationTime = expirationTime;

        // TODO: Create hot potatoes

        _games[gameId].expirationTime.started = true;

        emit GameStarted(gameId);
    }

    function joinGame(uint256 gameId) public gameStarted(gameId, false) {
        require(
            _games[gameId].playerAddrs.length < MAX_PLAYERS,
            "Already at max players"
        );
        require(
            _games[gameId].players[msg.sender].joinedAt == 0,
            "Player already in game"
        );

        _addPlayer(gameId, msg.sender);

        emit PlayerJoined(gameId, msg.sender);
    }

    function _addPlayer(uint256 gameId, address player) internal {
        _games[gameId].players[player] = new Player({joinedAt: now});
        _games[gameId].playerAddrs.push(player);

        emit PlayerJoined(gameId, player);
    }

    function getWinners(uint256 gameId)
        view
        gameEnded(gameId, true)
        returns (uint256[] winners)
    {
        uint256[] winners;
        for (uint8 i = 0; i < _playerAddrs.length; i++) {
            // TODO: Check HotPotato contract to see if each player owns hot potato
            if (_players[_playerAddrs[i]]) {
                winners.push(_playerAddrs[i]);
            }
        }
        return winners;
    }
}
