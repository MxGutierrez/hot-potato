// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./HotPotato.sol";

contract HotPotatoGame is Ownable {
    uint8 constant MAX_HOT_POTATOES = 4;
    uint8 constant MAX_PLAYERS = 15;
    uint256 constant MAX_FUTURE_EXPIRATION_TIME = 1 weeks;

    IERC721 public _hotPotatoContract;

    struct Player {
        uint256 joinedAt;
        bool hasHotPotato;
    }

    // Mapping addresses to hot potatoes
    mapping(address => Player) public _players;
    address[] public _playerAddrs;

    bool public _started = false;
    bool public _ended = false;

    uint8 public _hotPotatoCount;

    uint256 public _expirationTime;

    event GameStarted();
    event GameEnded();
    event PlayerJoined(address);

    modifier gameStarted(bool started) {
        require(
            _started == started,
            _started ? "Game hasn't started yet" : "Game already started"
        );
        _;
    }

    modifier gameEnded(bool ended) {
        require(
            _ended == ended,
            _ended ? "Game hasn't ended yet" : "Game has ended"
        );
        _;
    }

    constructor(address hotPotatoContract, uint256 expirationTime)
        public
        Ownable()
    {
        require(
            now < expirationTime,
            "Expiration time should be in the future"
        );
        require(
            now + MAX_FUTURE_EXPIRATION_TIME >= expirationTime,
            "Expiration time exceeds limit"
        );

        _owner = tx.origin;

        _hotPotatoContract = IERC721(hotPotatoContract);
        _expirationTime = expirationTime;

        _addPlayer(_owner);
    }

    function startGame(uint8 hotPotatoCount) onlyOwner gameStarted(false) {
        require(_playerCount > 1, "Not enough players");
        require(hotPotatoCount < _playerCount, "To many hot potatoes");

        // TODO: Create hot potatoes

        _started = true;

        emit GameStarted();
    }

    function joinGame() public gameStarted(false) {
        require(_players.length < MAX_PLAYERS, "Already at max players");
        require(_players[msg.sender].joinedAt == 0, "Player already in game");

        _addPlayer(msg.sender);

        emit PlayerJoined(msg.sender);
    }

    function _addPlayer(address addr) internal {
        _players[addr] = new Player({joinedAt: now, hasHotPotato: false});
        _playerAddrs.push(addr);
    }

    function getWinners() view gameEnded(true) returns (uint256[]) {
        uint256[] winners;
        for (uint8 i = 0; i < _playerAddrs.length; i++) {
            if (_players[_playerAddrs[i]]) {
                winners.push(_playerAddrs[i]);
            }
        }
        return winners;
    }
}
