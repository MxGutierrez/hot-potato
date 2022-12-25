// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IHotPotatoGame.sol";

contract HotPotato is Ownable, ERC721 {
    IHotPotatoGame public _hotPotatoGameContract;

    constructor() Ownable() ERC721("HotPotato", "HPT") {
        _hotPotatoGameContract = IHotPotatoGame(msg.sender);
    }

    function mint(address to, uint256 gameId) external onlyOwner {
        _safeMint(to, gameId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (from == address(0)) {
            // Allow transfer to take place after game has finished (result has already been persisted)
            // or if minting token
            return;
        }

        require(
            !_hotPotatoGameContract.hasGameEnded(tokenId),
            "Game has already ended"
        );

        require(
            _hotPotatoGameContract.isPlayerInGame(to, tokenId),
            "Player not in game"
        );

        // Pseudo-randomness will do
        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.difficulty))
        );

        uint256 playerCount = _hotPotatoGameContract.getPlayers(tokenId).length;

        // Check drawn number between 1-100 lays under player-count defined threshold
        // if ((rand % 100) <= (20 - playerCount)) {
        // Token id equals game id
        _hotPotatoGameContract.endGame(tokenId, to);
        // }
    }

    function approve(
        address, /* to */
        uint256 /* tokenId */
    ) public virtual override {
        revert("Can't approve token");
    }

    function setApprovalForAll(
        address, /* operator */
        bool /* approved */
    ) public virtual override {
        revert("Can't approve token");
    }
}
