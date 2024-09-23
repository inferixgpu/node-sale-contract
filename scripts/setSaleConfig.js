const hre = require("hardhat")
const InferixNodeSale = require("../ignition/modules/InferixNodeSale");

async function main() {
    const nodeSales = await hre.ignition.deploy(InferixNodeSale);
    const { configContract } = nodeSales;

    // await configContract.setTierConfig(false, 20, [
    //     '10000000000000000000',
    //     '0',
    //     '10'
    // ])
    
}

main().catch(console.error);