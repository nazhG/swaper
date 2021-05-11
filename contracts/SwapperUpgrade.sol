//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./interfaces/Balancer.sol";

import "hardhat/console.sol";

contract SwapperUpgrade is Initializable, OwnableUpgradeable {
    IUniswapV2Router02 internal uniswap;
    address payable private recipient;
    address internal _weth;
    ExchangeProxy internal balancer;

    function setBalancer(address _balancer) public onlyOwner {
        balancer = ExchangeProxy(_balancer);
    }

    modifier needEther() {
        require(msg.value > 0, "operation without ether");
        _;
    }

    function swapOneByUniswap(address token) public payable needEther {
        address[] memory path = new address[](2);
        path[0] = _weth;
        path[1] = token;
        uint256 fee = msg.value / 1000;

        uniswap.swapExactETHForTokens{value: msg.value - msg.value / 1000}(
            msg.value - fee,
            path,
            msg.sender,
            block.timestamp + 3600
        );

        recipient.transfer(fee);
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
        path[0] = _weth;

        for (uint256 i = 0; i < tokens.length; i++) {
            path[1] = tokens[i];

            uniswap.swapExactETHForTokens{
                value: ((msg.value - fee) * value[i]) / 100
            }(0, path, msg.sender, block.timestamp + 8);
        }

        console.log("Gas used: ", startGas - gasleft());
    }

    struct Swap {
        address pool;
        address tokenIn;
        address tokenOut;
        uint256 swapAmount; // tokenInAmount / tokenOutAmount
        uint256 limitReturnAmount; // minAmountOut / maxAmountIn
        uint256 maxPrice;
    }

    function swapOneByBalancer(address _token) external payable {
        uint256 remaining = msg.value - (msg.value / 1000);
        recipient.transfer(msg.value / 1000);

        // TokenInterface weth = TokenInterface(_weth);
        // TokenInterface toToken = TokenInterface(_token);

        // weth.deposit{value: remaining}();
        // weth.approve(address(balancer), remaining);

        (Swap[] memory swaps, uint256 totalOutput) =
            balancer.viewSplitExactIn(_weth, _token, remaining, 1);
        // console.log(swaps);
        console.log(totalOutput);
    }
}
