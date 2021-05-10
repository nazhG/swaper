const { ethers, upgrades } = require("hardhat");

async function main() {
    [user] = await ethers.getSigners();
    const Swapper = await ethers.getContractFactory("Swapper");
    const swapper = await upgrades.deployProxy(Swapper, [user.address, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"]);
    await swapper.deployed();
    console.log("Swapper Addrs =>", swapper.address);
}
//0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
main();