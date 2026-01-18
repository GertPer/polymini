// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BinaryMarket (educational prototype)
/// @notice A simple binary prediction market with on-chain AMM trading (YES/NO shares) and 1:1 collateralization.
/// @dev Designed for demos and testnets. Not audited. Not intended for real money.
contract BinaryMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Outcomes
    uint8 public constant OUTCOME_NO = 0;
    uint8 public constant OUTCOME_YES = 1;

    IERC20 public immutable collateral;
    string public question;
    uint256 public immutable closeTime;

    // Resolution
    bool public resolved;
    uint8 public winningOutcome; // 0=NO, 1=YES

    // Internal share balances (not transferable ERC tokens, kept minimal for a university prototype)
    mapping(address => uint256) public yesBalance;
    mapping(address => uint256) public noBalance;

    // AMM pool reserves (held by the contract itself)
    uint256 public yesReserve;
    uint256 public noReserve;

    // Uniswap-style fee (0.30%)
    uint256 public constant FEE_BPS = 30; // 30 bps = 0.30%
    uint256 public constant BPS = 10_000;

    event LiquidityAdded(address indexed provider, uint256 collateralIn, uint256 yesAdded, uint256 noAdded);
    event Split(address indexed user, uint256 collateralIn, uint256 sharesMintedEach);
    event Merge(address indexed user, uint256 sharesBurnedEach, uint256 collateralOut);
    event Swap(address indexed user, uint8 indexed inOutcome, uint256 amountIn, uint8 indexed outOutcome, uint256 amountOut);
    event Resolved(uint8 winningOutcome);
    event Redeemed(address indexed user, uint8 winningOutcome, uint256 sharesBurned, uint256 collateralOut);
    event PoolRedeemed(address indexed to, uint8 winningOutcome, uint256 sharesBurned, uint256 collateralOut);

    error MarketClosed();
    error NotResolved();
    error AlreadyResolved();
    error BadOutcome();
    error Slippage();
    error InsufficientBalance();
    error NotEnoughLiquidity();

    constructor(
        address collateral_,
        string memory question_,
        uint256 closeTime_,
        address owner_
    ) Ownable(owner_) {
        require(collateral_ != address(0), "collateral=0");
        require(closeTime_ > block.timestamp, "closeTime in past");
        collateral = IERC20(collateral_);
        question = question_;
        closeTime = closeTime_;
    }

    modifier beforeClose() {
        if (block.timestamp >= closeTime) revert MarketClosed();
        _;
    }

    function getSpotPriceYesE18() external view returns (uint256) {
        // pYES ~= noReserve / (yesReserve + noReserve)
        uint256 denom = yesReserve + noReserve;
        if (denom == 0) return 0;
        return (noReserve * 1e18) / denom;
    }

    function getSpotPriceNoE18() external view returns (uint256) {
        uint256 denom = yesReserve + noReserve;
        if (denom == 0) return 0;
        return (yesReserve * 1e18) / denom;
    }

    /// @notice Adds AMM liquidity by locking collateral and minting equal YES/NO shares into the pool.
    function addLiquidity(uint256 collateralAmount) external beforeClose nonReentrant {
        require(collateralAmount > 0, "amount=0");
        collateral.safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Mint pair into pool reserves (fully collateralized by the transferred collateral)
        yesReserve += collateralAmount;
        noReserve += collateralAmount;

        emit LiquidityAdded(msg.sender, collateralAmount, collateralAmount, collateralAmount);
    }

    /// @notice Split collateral into equal YES/NO shares (1:1 collateralization).
    function split(uint256 collateralAmount) public beforeClose nonReentrant {
        require(collateralAmount > 0, "amount=0");
        collateral.safeTransferFrom(msg.sender, address(this), collateralAmount);
        yesBalance[msg.sender] += collateralAmount;
        noBalance[msg.sender] += collateralAmount;
        emit Split(msg.sender, collateralAmount, collateralAmount);
    }

    /// @notice Merge equal amounts of YES and NO shares back into collateral.
    function merge(uint256 amountEach) external beforeClose nonReentrant {
        require(amountEach > 0, "amount=0");
        if (yesBalance[msg.sender] < amountEach || noBalance[msg.sender] < amountEach) revert InsufficientBalance();
        yesBalance[msg.sender] -= amountEach;
        noBalance[msg.sender] -= amountEach;
        collateral.safeTransfer(msg.sender, amountEach);
        emit Merge(msg.sender, amountEach, amountEach);
    }

    /// @dev Constant product swap output with fee.
    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256) {
        require(reserveIn > 0 && reserveOut > 0, "empty reserves");
        uint256 amountInWithFee = amountIn * (BPS - FEE_BPS);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * BPS + amountInWithFee;
        return numerator / denominator;
    }

    /// @notice Swap NO shares for YES shares.
    function swapNoForYes(uint256 noIn, uint256 minYesOut) public beforeClose nonReentrant returns (uint256 yesOut) {
        require(noIn > 0, "amount=0");
        if (noBalance[msg.sender] < noIn) revert InsufficientBalance();
        if (noReserve == 0 || yesReserve == 0) revert NotEnoughLiquidity();

        yesOut = _getAmountOut(noIn, noReserve, yesReserve);
        if (yesOut < minYesOut) revert Slippage();

        // Move user's NO into pool
        noBalance[msg.sender] -= noIn;
        noReserve += noIn;

        // Move YES from pool to user
        yesReserve -= yesOut;
        yesBalance[msg.sender] += yesOut;

        emit Swap(msg.sender, OUTCOME_NO, noIn, OUTCOME_YES, yesOut);
    }

    /// @notice Swap YES shares for NO shares.
    function swapYesForNo(uint256 yesIn, uint256 minNoOut) public beforeClose nonReentrant returns (uint256 noOut) {
        require(yesIn > 0, "amount=0");
        if (yesBalance[msg.sender] < yesIn) revert InsufficientBalance();
        if (noReserve == 0 || yesReserve == 0) revert NotEnoughLiquidity();

        noOut = _getAmountOut(yesIn, yesReserve, noReserve);
        if (noOut < minNoOut) revert Slippage();

        // Move user's YES into pool
        yesBalance[msg.sender] -= yesIn;
        yesReserve += yesIn;

        // Move NO from pool to user
        noReserve -= noOut;
        noBalance[msg.sender] += noOut;

        emit Swap(msg.sender, OUTCOME_YES, yesIn, OUTCOME_NO, noOut);
    }

    /// @notice Convenience: buy YES using collateral (split + swap all NO to YES).
    function buyYes(uint256 collateralIn, uint256 minTotalYesOut) external beforeClose nonReentrant returns (uint256 totalYes) {
        require(collateralIn > 0, "amount=0");
        // Split mints collateralIn YES and collateralIn NO to the user
        collateral.safeTransferFrom(msg.sender, address(this), collateralIn);
        yesBalance[msg.sender] += collateralIn;
        noBalance[msg.sender] += collateralIn;
        emit Split(msg.sender, collateralIn, collateralIn);

        // Swap ALL the NO for extra YES
        uint256 extraYes = swapNoForYes(collateralIn, 0);
        totalYes = collateralIn + extraYes;
        if (totalYes < minTotalYesOut) revert Slippage();
    }

    /// @notice Convenience: buy NO using collateral (split + swap all YES to NO).
    function buyNo(uint256 collateralIn, uint256 minTotalNoOut) external beforeClose nonReentrant returns (uint256 totalNo) {
        require(collateralIn > 0, "amount=0");
        collateral.safeTransferFrom(msg.sender, address(this), collateralIn);
        yesBalance[msg.sender] += collateralIn;
        noBalance[msg.sender] += collateralIn;
        emit Split(msg.sender, collateralIn, collateralIn);

        uint256 extraNo = swapYesForNo(collateralIn, 0);
        totalNo = collateralIn + extraNo;
        if (totalNo < minTotalNoOut) revert Slippage();
    }

    /// @notice Resolve the market outcome (admin/oracle for demo).
    function resolve(uint8 outcome) external onlyOwner {
        if (resolved) revert AlreadyResolved();
        if (block.timestamp < closeTime) revert MarketClosed();
        if (outcome != OUTCOME_NO && outcome != OUTCOME_YES) revert BadOutcome();
        resolved = true;
        winningOutcome = outcome;
        emit Resolved(outcome);
    }

    /// @notice Redeem winning shares for collateral after resolution.
    function redeem() external nonReentrant {
        if (!resolved) revert NotResolved();

        uint256 burnAmount;
        if (winningOutcome == OUTCOME_YES) {
            burnAmount = yesBalance[msg.sender];
            require(burnAmount > 0, "no YES");
            yesBalance[msg.sender] = 0;
        } else {
            burnAmount = noBalance[msg.sender];
            require(burnAmount > 0, "no NO");
            noBalance[msg.sender] = 0;
        }

        collateral.safeTransfer(msg.sender, burnAmount);
        emit Redeemed(msg.sender, winningOutcome, burnAmount, burnAmount);
    }

    /// @notice Redeem the pool's winning shares to a recipient (so liquidity providers can recover collateral).
    /// @dev Prototype simplification: owner can call this once after resolution.
    function redeemPool(address to) external onlyOwner nonReentrant {
        if (!resolved) revert NotResolved();
        require(to != address(0), "to=0");

        uint256 burnAmount;
        if (winningOutcome == OUTCOME_YES) {
            burnAmount = yesReserve;
            yesReserve = 0;
        } else {
            burnAmount = noReserve;
            noReserve = 0;
        }

        collateral.safeTransfer(to, burnAmount);
        emit PoolRedeemed(to, winningOutcome, burnAmount, burnAmount);
    }
}
