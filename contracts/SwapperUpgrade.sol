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

    function swapOneByBalancer(address[] memory tokens, uint8[] memory value)
        external
        payable
    {
        uint256 fee = msg.value / 1000;
        uint256 remaining = msg.value - fee;
        recipient.transfer(fee);

        TokenInterface weth = TokenInterface(_weth);

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 percent = (remaining * value[i]) / 1000;

            TokenInterface itoken = TokenInterface(tokens[i]);
            weth.deposit{value: percent}();
            weth.approve(address(balancer), percent);

            uint256 coins =
                balancer.smartSwapExactIn{value: percent}(
                    weth,
                    itoken,
                    percent,
                    0,
                    1
                );

            itoken.transfer(tx.origin, coins);
        }
    }

    // function bestDex(address token, uint256 value) public payable {
    //     address[] memory path = new address[](2);
    //     path[0] = address(_weth);
    //     path[1] = token;
    //     RegistryInterface balancerRegistry =
    //         RegistryInterface(0x7226DaaF09B3972320Db05f5aB81FF38417Dd687);

    //     address[] memory best_pool =
    //         balancerRegistry.getBestPoolsWithLimit(
    //             path[0],
    //             path[1],
    //             uint256(1)
    //         );

    //     Bpool ipool = Bpool(best_pool[0]);
    //     uint256 amountOutUniswap =
    //         uniswap.getAmountsOut(value, path)[1] / value;

    //     uint256 TokenPrice = ipool.getSpotPrice(path[0], path[1]);
    //     uint256 amountOutBalancer = value / TokenPrice;

    //     console.log("~ DEX options ~");
    //     console.log("Uniswap: ", amountOutUniswap);
    //     console.log("Balancer: ", amountOutBalancer);
    // }
}
