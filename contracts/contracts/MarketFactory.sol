// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BinaryMarket} from "./BinaryMarket.sol";

/// @title MarketFactory
/// @notice Deploys BinaryMarket instances and keeps a list for the UI.
contract MarketFactory is Ownable {
    address public immutable collateral;
    address[] public markets;

    event MarketCreated(address indexed market, string question, uint256 closeTime);

    constructor(address collateral_, address owner_) Ownable(owner_) {
        require(collateral_ != address(0), "collateral=0");
        collateral = collateral_;
    }

    function marketCount() external view returns (uint256) {
        return markets.length;
    }

    function getMarkets(uint256 start, uint256 count) external view returns (address[] memory slice) {
        uint256 len = markets.length;
        if (start >= len) return new address[](0);
        uint256 end = start + count;
        if (end > len) end = len;
        slice = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            slice[i - start] = markets[i];
        }
    }

    /// @notice Creates a new market (admin-only for classroom/demo).
    function createMarket(string calldata question, uint256 closeTime) external onlyOwner returns (address market) {
        BinaryMarket m = new BinaryMarket(collateral, question, closeTime, msg.sender);
        market = address(m);
        markets.push(market);
        emit MarketCreated(market, question, closeTime);
    }
}
