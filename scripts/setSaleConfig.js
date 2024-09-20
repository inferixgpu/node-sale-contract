const hre = require("hardhat")
const WhitelistNodeSale = require("../ignition/modules/WhitelistNodeSale");

async function main() {
    const { config, nodeSales } = await hre.ignition.deploy(WhitelistNodeSale);

    console.log(config)
    console.log(nodeSales)

}

main().catch(console.error);