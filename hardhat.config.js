/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("dotenv").config();
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-ethers");

module.exports = {
  networks: {
    hardhat: {
      // Uncomment these lines to use mainnet fork
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
        blockNumber: 11589707,
      },
    },
    // live: {
    //   url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
    //   accounts: [process.env.MAINNET_PRIVKEY],
    // },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API,
  },
  solidity: {
    version: "0.8.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: true
  },
  mocha: {
    timeout: 240000,
  },
};
