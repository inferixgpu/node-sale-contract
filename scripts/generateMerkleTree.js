const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");

const whitelistByTiers = {
    1: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "10"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "10"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "10"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "10"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "10"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "10"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"],  
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "10"],   
    ],
    2: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "10"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "10"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "10"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "10"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "10"],   
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"], 
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "20"],
    ],
    3: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "10"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "10"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "10"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "10"],   
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"],
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "25"],
    ],
    4: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "10"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "10"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "10"],   
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"],  
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "30"],
    ],
    5: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "10"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "10"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"],
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "30"],
    ],
    6: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "10"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"],
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "30"], 
    ],
    7: [
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "10"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "10"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"],
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "30"],
    ],
    8: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "10"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "10"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "10"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "10"],
        ["0x3515d6F8Dd1ebaCcacDA82d2b8AB347219b6C329", "30"],
    ]
}


const {ethers, network} = require("hardhat")

async function main() {
    const addresses = require("../ignition/deployments/chain-" + network.config.chainId + "/deployed_addresses.json");
    const configContract = await ethers.getContractAt("InferixNodeSaleConfiguration", addresses["InferixNodeSaleConfiguration#InferixNodeSaleConfiguration"]);
    const nodeSaleContracts = [];
    for (let [name, addr] of Object.entries(addresses)) {
        if (name.startsWith("InferixNodeSale#")) {
            nodeSaleContracts[addr] = await ethers.getContractAt("InferixNodeSale", addr);
        }
    }

    console.log(`InferixNodeSaleConfiguration address: `, await configContract.getAddress());

    for (let [tier, values] of Object.entries(whitelistByTiers)) {
        for (let i = 0; i < values.length; i++) {
            values[i][0] = values[i][0].toLowerCase();
        }
        const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
        console.log(`Merkle Root ${tier}:`, tree.root);
        var currentHash = await configContract.whitelistRootHash(tier);
        if (tree.root.toLocaleLowerCase() != currentHash.toLocaleLowerCase())
            await configContract.setWhitelistRootHash(tier, tree.root);

        fs.writeFileSync(`scripts/output/tier${tier}.json`, JSON.stringify(tree.dump()));
    }
}

main().catch(console.error);