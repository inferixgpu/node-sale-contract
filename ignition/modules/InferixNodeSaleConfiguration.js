const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const hre = require("hardhat")

const config = require("./config");
const MockETHModule = require("./MockWETH")

module.exports = buildModule("InferixNodeSaleConfiguration", (m) => {
    var owner = m.getAccount(0);

    let wethAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
    if (hre.network.name != "arb") {
        let { weth } = m.useModule(MockETHModule);
        wethAddress = weth
    }

    const configContract = m.contract("InferixNodeSaleConfiguration");
    m.call(configContract, "setSaleConfig", [[
        owner,

        wethAddress,
        config.saleConfig.snapshotedRate,

        config.saleConfig.whitelistSaleStartTime,
        config.saleConfig.whitelistSaleEndTime,
        config.saleConfig.publicSaleStartTime,
        config.saleConfig.publicSaleEndTime,
    ]]);

    for(let tierCfg of config.tiers) {
        m.call(configContract, "setTierConfig", [
            tierCfg.isWhitelistSale,
            tierCfg.tier,
            [
                tierCfg.usdPrice,
                tierCfg.capPerUser,
                tierCfg.allocation
            ]
        ], { id: `setTierConfig_${tierCfg.tier}_${tierCfg.isWhitelistSale}`})
    }

    return { wethAddress, configContract };
});