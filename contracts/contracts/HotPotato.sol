// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Will have to do a mass creation, see if ERC1155 is better
contract HotPotato is Ownable, ERC1155 {
    constructor() Ownable() ERC1155() {}

    function mint(address to, uint256 gameId) public onlyOwner {
        _mint(to, gameId, 1, "");
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] ids,
        uint256[] amounts,
        bytes memory data
    ) public override {
        require(ids.length == 1 && amounts.length == 1, "Can't batch transfer");
        require(amounts[0] == 1, "Can't transfer more than 1 token at a time");

        require(
            balanceOf(to, ids[0]) == 0,
            "To address already has hot potato"
        );
    }

    function setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) public override {
        revert("Can't approve tokens");
    }
}
