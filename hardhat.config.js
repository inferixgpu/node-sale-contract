const { config: dotenvConfig } = require("dotenv");
const { resolve } = require("path");

require("@nomiclabs/hardhat-ethers");
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
    arbSepolia: {
      accounts: privateKeys,
      chainId: 421614,
      url: "https://arb-sepolia.g.alchemy.com/v2/K5HFS2AVdOWcgEmYsnRB_OpN9WZ2oJLC",
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
