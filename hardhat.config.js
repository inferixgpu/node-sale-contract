const { config: dotenvConfig } = require("dotenv");
const { resolve } = require("path");

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");

const dotenvConfigPath = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

const mnemonic = process.env.MNEMONIC || "";
const privateKeys = process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(',') : []
if (!mnemonic && !privateKeys.length) {
  throw new Error("Please set your MNEMONIC or PRIVATE_KEYS in a .env file");
}


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
    },
    sepolia: {
      accounts: privateKeys,
      chainId: 11155111,
      url: "https://1rpc.io/sepolia",
    },
    arbsep: {
      accounts: privateKeys,
      chainId: 421614,
      url: "https://sepolia-rollup.arbitrum.io/rpc"
    },
    arb: {
      accounts: privateKeys,
      chainId: 42161,
      url: "https://arb1.arbitrum.io/rpc",
    }
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ETHERSCAN_ARB_APIKEY
    }
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};
