// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Potato is Ownable, ERC20 {
    uint256 constant CLAIM_INTERVAL = 1 days;
    uint256 constant CLAIM_AMOUNT = 100 * (10**18);

    mapping(address => uint256) public _lastClaims;

    constructor() Ownable() ERC20("Potato", "POT") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function claim() external {
        require(
            _lastClaims[msg.sender] + CLAIM_INTERVAL < block.timestamp,
            "Can only claim once a day"
        );

        _lastClaims[msg.sender] = block.timestamp;
        _mint(msg.sender, CLAIM_AMOUNT);
    }
}
