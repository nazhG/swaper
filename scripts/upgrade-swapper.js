const { ethers, upgrades } = require("hardhat");

async function main() {
    const swapperUpgrade = await ethers.getContractFactory("SwapperUpgrade");
    const swapper = await upgrades.upgradeProxy("0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", swapperUpgrade);
    console.log("Box upgraded");
}

main();