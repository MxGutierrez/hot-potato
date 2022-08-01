// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Will have to do a mass creation, see if ERC1155 is better
contract HotPotato is ERC721 {
    constructor() ERC721("HotPotato", "HPT") {}
}
