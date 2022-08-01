// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./HotPotatoGame";

contract HotPotatoGameFactory {
    function startGame(address hotPotatoContract, uint256 expirationTime)
        public
        returns (address)
    {
        return new HotPotatoGame(hotPotatoContract, expirationTime);
    }
}
