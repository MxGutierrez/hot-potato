// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Potato is ERC20 {
    uint256 constant CLAIM_INTERVAL = 1 days;
    uint256 constant CLAIM_AMOUNT = 100 * (10**18);

    mapping(address => uint256) public _lastClaims;

    constructor() ERC20("Potato", "POT") {}

    function claim() external {
        require(
            balanceOf(msg.sender) < CLAIM_AMOUNT,
            "Can't claim with higher balance than the max required"
        );
        require(
            _lastClaims[msg.sender] + CLAIM_INTERVAL < block.timestamp,
            "Can only claim once a day"
        );

        _lastClaims[msg.sender] = block.timestamp;
        // Give player the amount left to the CLAIM_AMOUNT
        _mint(msg.sender, CLAIM_AMOUNT - balanceOf(msg.sender));
    }
}
