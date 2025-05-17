const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");

const whitelistByTiers = {
    1: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "100"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "100"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "100"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "100"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "100"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "100"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],        
    ],
    2: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "100"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "100"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "100"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "100"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "100"],   
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],    
    ],
    3: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "100"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "10"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "10"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "10"],   
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],    
    ],
    4: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "100"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "100"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "100"],   
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],    
    ],
    5: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "100"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "100"],   
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],    
    ],
    6: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "100"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],    
    ],
    7: [
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "100"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "100"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],    
    ],
    8: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "100"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "100"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "100"],
        ["0x99c8A321DA02F71e8fb87d5B135312dA060D3c35", "100"],    
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

    let whitelistSale = {}

    console.log(`InferixNodeSale addresses: `);

    for(let addr of Object.keys(nodeSaleContracts)) {
        var nodeContract = nodeSaleContracts[addr];
        console.log(addr);
        var data = await nodeContract.data();
        
        if (data[2]) {
            whitelistSale[data[3]] = nodeSaleContracts[addr];
        }
    }

    for (let [tier, values] of Object.entries(whitelistByTiers)) {
        const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
        console.log(`Merkle Root ${tier}:`, tree.root);
        var currentHash = await configContract.whitelistRootHash(tier);
        if (tree.root.toLocaleLowerCase() != currentHash.toLocaleLowerCase())
            await configContract.setWhitelistRootHash(tier, tree.root);

        fs.writeFileSync(`tier${tier}.json`, JSON.stringify(tree.dump()));
    }
}

main().catch(console.error);