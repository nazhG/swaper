//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// https://github.com/jklepatch/eattheblocks/blob/master/screencast/238-balancer/contracts/
interface IWeth {
    function deposit() external payable;

    function withdraw(uint256 wad) external;

    function approve(address guy, uint256 wad) external returns (bool);

    function balanceOf(address owner) external view returns (uint256);
}
