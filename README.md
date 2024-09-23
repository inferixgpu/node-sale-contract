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

3. Compile the contracts:

   ```bash
   npx hardhat compile
   ```

4. Run the tests:

   ```bash
   npx hardhat test
   ```

### Deployment

Configure the network details in `hardhat.config.js` for deployment.

Deploy the contracts:

```bash
npx hardhat ignition deploy ignition/modules/InferixNodeSale.js --network <network_name>
```

Replace `<network_name>` with your desired network (e.g., `mainnet`, `arbitrium`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contribution

Contributions are welcome! Please open an issue or pull request if you have suggestions or improvements.

## Contact

For more information, visit [Inferix](https://inferix.io) or contact us via [contact@inferix.io](mailto:contact@inferix.io).
