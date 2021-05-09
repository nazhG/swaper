//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./interfaces/IUniswapV2Router.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Swapper is Initializable {
    IUniswapV2Router uniswap;
    // 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D

    // IUniswapV2Router02 internal uniswapRouter;
    address payable recipient;

    function initialize(address payable _recipient, address _uniswap)
        public
        initializer
    {
        uniswap = IUniswapV2Router(_uniswap);
        recipient = _recipient;
    }

    function makeSwap(address to, uint256 amount) public payable {
        require(msg.value > 0, "operation without ether");

        address[] memory path = new address[](2);
        path[0] = uniswap.WETH();
        path[1] = to;

        uniswap.swapETHForExactTokens{value: (msg.value * 99) / 1000}(
            (amount * 99) / 100,
            path,
            msg.sender,
            block.timestamp + 3600
        );

        recipient.transfer(msg.value / 1000);
    }

    function makeMultiSwap(
        address[] memory to,
        uint256[] memory porc,
        uint256[] memory amounts
    ) public payable {
        require(msg.value > 0, "operation without ether");
        uint256 remaining = (msg.value * 99) / 100;

        address[] memory path = new address[](2);
        path[0] = uniswap.WETH();

        for (uint256 i = 0; i < to.length; i++) {
            path[1] = to[i];

            uniswap.swapETHForExactTokens{value: (remaining * porc[i]) / 100}(
                amounts[i] / 100,
                path,
                msg.sender,
                block.timestamp + 3600
            );
        }

        recipient.transfer(msg.value / 100);
    }
}
