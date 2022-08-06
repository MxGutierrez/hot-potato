// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHotPotatoGame {
    function endGame(uint256) external;

    function getPlayers(uint256) external view returns (address[] memory);

    function hasGameEnded(uint256) external view returns (bool);
}
