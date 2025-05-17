const {ethers, network} = require("hardhat")
const config = require("../ignition/modules/config");
//Set to true if you only want to update the sale config and not the tiers
const UPDATE_SALE_CONFIG_ONLY = false;
//Set the tiers you want to update. If empty, all tiers will be updated
const UPDATE_TIERS = [{tier: 8, isWhitelistSale: true}];

async function main() {
    const addresses = require("../ignition/deployments/chain-" + network.config.chainId + "/deployed_addresses.json");
    const configContract = await ethers.getContractAt("InferixNodeSaleConfiguration", addresses["InferixNodeSaleConfiguration#InferixNodeSaleConfiguration"]);

    console.log("setSaleConfig...");
    
    await configContract.setSaleConfig([
        config.saleConfig.beneficiary,
        config.saleConfig.paymentToken,
        config.saleConfig.snapshotedRate,
        config.saleConfig.whitelistSaleStartTime,
        config.saleConfig.whitelistSaleEndTime,
        config.saleConfig.publicSaleStartTime,
        config.saleConfig.publicSaleEndTime,
    ]);

    if(UPDATE_SALE_CONFIG_ONLY) {
        console.log("Done");
        return;
    }

    console.log("Done\n\nsetTierConfig...");
    for(let tierCfg of config.tiers) {
        if(UPDATE_TIERS != undefined && UPDATE_TIERS.length > 0) {
            let found = false;
            for(let updateTierCfg of UPDATE_TIERS) {
                if(tierCfg.tier == updateTierCfg.tier && tierCfg.isWhitelistSale == updateTierCfg.isWhitelistSale) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                console.log("Skipping Tier " + tierCfg.tier + (tierCfg.isWhitelistSale? "WL":"") + "...");
                continue;
            }
        }
        console.log("Tier" + tierCfg.tier + (tierCfg.isWhitelistSale? "WL":"") + "...");
        await configContract.setTierConfig(
            tierCfg.isWhitelistSale,
            tierCfg.tier,
            [
                tierCfg.usdPrice,
                tierCfg.capPerUser,
                tierCfg.allocation
            ]);
    }
        
    console.log("Done");
    
}

main().catch(console.error);