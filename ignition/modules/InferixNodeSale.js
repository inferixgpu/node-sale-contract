const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const InferixNodeSaleConfiguration = require("./InferixNodeSaleConfiguration");
const config = require("./config");

module.exports = buildModule("InferixNodeSale", (m) => {
    // var owner = m.getAccount(0);

    const { wethAddress, configContract } = m.useModule(InferixNodeSaleConfiguration);

    const nodeSales = [];
    for(let tierCfg of config.tiers) {
        nodeSales.push(m.contract("InferixNodeSale", [
            `${tierCfg.isWhitelistSale ? "Whitelist" : "Public"} Sale Tier #${tierCfg.tier}`,
            configContract,
            tierCfg.isWhitelistSale,
            tierCfg.tier
        ], { id: `deploy_InferixNodeSale_${tierCfg.tier}_${tierCfg.isWhitelistSale}`}));
    }

    nodeSales.configContract = configContract;
    nodeSales.wethAddress = wethAddress;
    return nodeSales;
});