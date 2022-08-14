// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IHotPotatoGame.sol";

contract HotPotato is Ownable, ERC1155 {
    IHotPotatoGame public _hotPotatoGameContract;

    // Add event similar to TransferBatch but with indexed _id
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _id,
        uint256 _value
    );

    constructor() Ownable() ERC1155("") {
        _hotPotatoGameContract = IHotPotatoGame(msg.sender);
    }

    function mint(address to, uint256 gameId) external onlyOwner {
        _mint(to, gameId, 1, "");
    }

    function _beforeTokenTransfer(
        address, /* operator */
        address, /* from */
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory /* data */
    ) internal virtual override {
        require(ids.length == 1 && amounts.length == 1, "Can't batch transfer");
        require(amounts[0] == 1, "Can't transfer more than 1 token at a time");

        require(
            balanceOf(to, ids[0]) == 0,
            "To address already has hot potato"
        );

        if (_hotPotatoGameContract.hasGameEnded(ids[0])) {
            // Allow transfer to take place after game has finished (result has already been persisted)
            return;
        }

        // Pseudo-randomness will do
        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.difficulty))
        );

        uint256 playerCount = _hotPotatoGameContract.getPlayers(ids[0]).length;

        // Check drawn number between 1-100 lays under player-count defined threshold
        if ((rand % 100) <= (20 - playerCount)) {
            // Token id equals game id
            _hotPotatoGameContract.endGame(ids[0]);
        }
    }

    function _afterTokenTransfer(
        address, /* operator */
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory /* data */
    ) internal virtual override {
        emit Transfer(from, to, ids[0], amounts[0]);
    }

    function setApprovalForAll(
        address, /* operator */
        bool /* approved */
    ) public virtual override {
        revert("Can't approve tokens");
    }
}
