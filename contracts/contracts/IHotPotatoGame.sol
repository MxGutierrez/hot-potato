// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHotPotatoGame {
    function endGame(uint256) external;

    function getPlayerCount(uint256) external view returns (uint256);

    function hasGameEnded(uint256) external view returns (bool);
}
