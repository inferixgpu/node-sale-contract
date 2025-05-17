const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const hre = require("hardhat")

const config = require("./config");
const MockIUSDTModule = require("./MockIUSDT")

module.exports = buildModule("InferixNodeSaleConfiguration", (m) => {
    //var owner = m.getAccount(0);
    const configContract = m.contract("InferixNodeSaleConfiguration");
    m.call(configContract, "setSaleConfig", [[
        config.saleConfig.beneficiary,
        config.saleConfig.paymentToken,
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
    
    const iusdtAddress = config.saleConfig.paymentToken;
    return { iusdtAddress, configContract };
});