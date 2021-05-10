//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// UNISWAP
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
// second Dex
import "./IBPool.sol";
import "./IWeth.sol";

import "hardhat/console.sol";

contract SwapperUpgrade is Initializable, OwnableUpgradeable {
    IUniswapV2Router02 internal uniswap;
    address payable recipient;
    address _weth;
    IBPool bPool;

    function initialize(
        address payable _recipient,
        address _uniswap,
        address _bPool
    ) public initializer {
        uniswap = IUniswapV2Router02(_uniswap);
        recipient = _recipient;
        bPool = IBPool(_bPool);
        _weth = uniswap.WETH();
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

    function swapOneByBalancer(uint256 value, address _token) external payable {
        // IERC20 token = IERC20(_token);
        IWeth weth = IWeth(_weth);
        weth.deposit{value: msg.value}();
        uint256 price = (110 * bPool.getSpotPrice(_weth, _token)) / 100;
        uint256 wethAmount = price * value;
        weth.approve(address(bPool), wethAmount);
        bPool.swapExactAmountOut(_weth, wethAmount, _token, value, price);

        payable(_token).transfer(value);
        payable(msg.sender).transfer(address(this).balance);
    }

    function getSpotPrice(address _token) external view returns (uint256) {
        return bPool.getSpotPrice(_weth, _token);
    }
}
