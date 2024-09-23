const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");

const whitelistByTiers = {
    1: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "1"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "1"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "1"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "1"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "1"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "1"],
    ],
    2: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "1"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "1"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "1"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "1"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "1"],   
    ],
    3: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "1"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "1"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "1"],
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "1"],   
    ],
    4: [
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "1"],
        ["0xeec07af430abbcafb246c8b8ff22f2950215f519", "1"],
        ["0x3187b84013078f714e1486be6ab624716eec5465", "1"],   
    ],
    5: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "1"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "1"],   
    ],
    6: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "1"],
    ],
    7: [
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "1"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "1"],
    ],
    8: [
        ["0x51b0b6418b910c97fbf618bb6f273a1c5a60ee87", "1"],
        ["0x308a9c078f843dbb7e8826b50b485b01f62a0ca7", "1"],
        ["0xabde77f54a80b597eb909b31a4c219e83df7a197", "1"],
    ]
}

const { ignition } = require("hardhat")
const NodeSaleModule = require("../ignition/modules/InferixNodeSale");

async function main() {
    const nodeSaleContracts = await ignition.deploy(NodeSaleModule);
    const { configContract, wethAddress } = nodeSaleContracts;
    delete nodeSaleContracts.configContract
    delete nodeSaleContracts.wethAddress

    let whitelistSale = {}

    for(let idx of Object.keys(nodeSaleContracts)) {
        var node = nodeSaleContracts[idx];
        var data = await node.data();
        
        if (data[2]) {
            whitelistSale[data[3]] = nodeSaleContracts[idx];
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