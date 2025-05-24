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
    },
    iotex: {
      accounts: privateKeys,
      chainId: 4689,
      url: "https://babel-api.mainnet.iotex.io",
    },
    iotextest: {
      accounts: privateKeys,
      chainId: 4690,
      url: "https://babel-api.testnet.iotex.io",
    }
  },
  etherscan: {
    apiKey: {
      arb: process.env.ARBISCAN_APIKEY,
      arbsep: process.env.ARBISCAN_APIKEY
    },
    customChains: [
      {
        network: "arbsep",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      },
      {
        network: "arb",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/api",
          browserURL: "https://arbiscan.io/"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
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
