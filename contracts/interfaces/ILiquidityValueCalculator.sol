//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILiquidityValueCalculator {
    function computeLiquidityShareValue(
        uint256 liquidity,
        address tokenA,
        address tokenB
    ) external returns (uint256 tokenAAmount, uint256 tokenBAmount);
}
