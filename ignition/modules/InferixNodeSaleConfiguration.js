const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const hre = require("hardhat")

const config = require("./config");
const MockIUSDTModule = require("./MockIUSDT")

module.exports = buildModule("InferixNodeSaleConfiguration", (m) => {
    //var owner = m.getAccount(0);

    let iusdtAddress = "0x582eFaC6Ce908a41d3BB9EFFCfF6ee7f0C1eD413";
    let beneficiaryAddress = "0xC93f074448eF5A8d941BEe246C89e20b7eCf67cf";

    if (hre.network.name == "hardhat") {
        let { iusdt } = m.useModule(MockIUSDTModule);
        iusdtAddress = iusdt;
        beneficiaryAddress = m.getAccount(1);
    }

    const configContract = m.contract("InferixNodeSaleConfiguration");
    m.call(configContract, "setSaleConfig", [[
        beneficiaryAddress,

        iusdtAddress,
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

    return { iusdtAddress, configContract };
});