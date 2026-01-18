// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Mock USDC for local/testnet demos.
/// @dev Anyone can mint from faucet() to keep the prototype frictionless.
contract MockUSDC is ERC20, Ownable {
    uint8 private immutable _decimals;

    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {
        _decimals = 6;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// @notice Faucet: mint 1,000 mUSDC to caller.
    function faucet() external {
        _mint(msg.sender, 1_000 * 10 ** uint256(_decimals));
    }

    /// @notice Owner mint (optional).
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
