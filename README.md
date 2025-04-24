# Inferix Node Sale Contracts

This repository contains the smart contracts for the sale of node verifier licenses for the [Inferix](https://inferix.io/) project. The contracts enable users to purchase verifier node licenses to support decentralized verification by running nodes on their devices.

## Project Overview

Inferix allows users to participate in decentralized verification by purchasing verifier nodes, enabling them to contribute to the network and earn rewards.

## Features

- **Node Sale Contract**: Handles the core logic for purchasing verifier node licenses.
- **Payment Support**: Supports cryptocurrency payments for node purchases.

## Repository Structure

- **contracts/**: Contains the Solidity smart contracts.
- **scripts/**: Includes deployment and interaction scripts.
- **test/**: Contains unit tests for verifying contract functionality.
- **hardhat.config.js**: Configuration for the Hardhat environment.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Hardhat](https://hardhat.org/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/inferixgpu/node-sale-contract.git
   cd node-sale-contract
   ```

2. Install dependencies:

   ```bash
   npm install
   ```
3. Create .env file:

   ```
   PRIVATE_KEYS=<your wallet private key>
   RPC_ARBITRIUM_SEPOLIA=https://sepolia-rollup.arbitrum.io/rpc
   RPC_ARBITRIUM=https://arb1.arbitrum.io/rpc
   ETHERSCAN_ARB_APIKEY=8KWKNUKA2NWKK4SWS76F54D3JUE442Y88E
   ```
   
4. Compile the contracts:

   ```bash
   npx hardhat compile
   ```

5. Run the tests:

   ```bash
   npx hardhat test
   ```

### Deployment

Configure the network details in `hardhat.config.js` for deployment.

Deploy the contracts:

*Remember to empty the `ignition/deployments` folder to avoid unwanted exceptions*

```bash
npx hardhat ignition deploy ignition/modules/InferixNodeSale.js --network <network_name>
```

Replace `<network_name>` with your desired network (e.g., `mainnet`, `arbitrium`).

Remember to save the list of contract addresses that are shown in the console log.

### Update Whitelist data

To update whitelisted data:

- Edit the value of `whitelistByTiers` array in scripts/generateMerkleTree.js
  
- Run following command to generate Merkle tree data:
```
npx hardhat run scripts/generateMerkleTree.js
```
- Upload ther tier1.json, tier2.json,...tier8.json to node sale http server
- Save the Merkle hash of each tiers that are shown in the console log 
   
- Use [Getlaika](https://legacy.getlaika.app/) to send the merkle hash of each tier to the `InferixNodeSaleConfiguration#InferixNodeSaleConfiguration` contract. 
  
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contribution

Contributions are welcome! Please open an issue or pull request if you have suggestions or improvements.

## Contact

For more information, visit [Inferix](https://inferix.io) or contact us via [contact@inferix.io](mailto:contact@inferix.io).
