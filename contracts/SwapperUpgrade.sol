//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// UNISWAP
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
// second Dex

import "hardhat/console.sol";

contract SwapperUpgrade is Initializable, OwnableUpgradeable {
    IUniswapV2Router02 internal uniswap;
    address payable recipient;

    function initialize(address payable _recipient, address _uniswap)
        public
        initializer
    {
        uniswap = IUniswapV2Router02(_uniswap);
        recipient = _recipient;
    }

    modifier needEther() {
        require(msg.value > 0, "operation without ether");
        _;
    }

    function swapManyByUniswap(address[] memory tokens, uint8[] memory value)
        public
        payable
        needEther
    {
        uint256 startGas = gasleft();
        uint256 fee = msg.value / 1000;
        recipient.transfer(fee);

        address[] memory path = new address[](2);
        path[0] = uniswap.WETH();

        for (uint256 i = 0; i < tokens.length; i++) {
            path[1] = tokens[i];

            uniswap.swapExactETHForTokens{
                value: ((msg.value - fee) * value[i]) / 100
            }(0, path, msg.sender, block.timestamp + 8);
        }

        console.log("Gas used: ", startGas - gasleft());
    }
}
