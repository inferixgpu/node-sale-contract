const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers, ignition } = require("hardhat");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");

const NodeSaleModule = require("../ignition/modules/InferixNodeSale")

const ONE = ethers.parseEther("1");

describe("NodeSale", function () {
    async function deployNodeSaleFixture() {
        const [owner, beneficiary, addr1, addr2] = await ethers.getSigners();
        // console.log(owner, addr1, addr2)
        const nodeSaleContracts = await ignition.deploy(NodeSaleModule);
        const { configContract, wethAddress } = nodeSaleContracts;
        delete nodeSaleContracts.configContract
        delete nodeSaleContracts.wethAddress

        let publicSaleList = [];
        let whitelistSaleList = [];

        for(let idx of Object.keys(nodeSaleContracts)) {
            var node = nodeSaleContracts[idx];
            var data = await node.data();
            
            expect(data[1]).to.eq(configContract.target)
            if (data[2])
                whitelistSaleList.push(nodeSaleContracts[idx])
            else
                publicSaleList.push(nodeSaleContracts[idx])
        }

        return { wethAddress, configContract, publicSaleList, whitelistSaleList, owner, beneficiary, addr1, addr2 }
    }

    describe("Deployment", function () {
        it("Should set the right name", async function () {
            const { configContract, publicSaleList, whitelistSaleList } = await loadFixture(deployNodeSaleFixture);

            expect(whitelistSaleList.length).to.eq(8)
            expect(publicSaleList.length).to.eq(20)
        })
    })

    describe("Public Purchase", function () {
        it("Should purchase without code succeed", async function () {
            const { wethAddress, configContract, publicSaleList, owner, beneficiary, addr1, addr2 } = await loadFixture(deployNodeSaleFixture);
            await wethAddress.connect(owner).transfer(addr1, ONE);
            await wethAddress.connect(owner).transfer(addr2, ONE);

            let saleConfig = await configContract.getSaleConfig();
            // console.log(saleConfig)
            
            let publicSaleTier1Contract = publicSaleList[0];
            let tierConfig1 = await configContract.getTierConfig(false, 1);

            let price = tierConfig1[0] / saleConfig[2];
            await wethAddress.connect(addr1).approve(publicSaleTier1Contract.target, "0xffffffffffffffffffffffffffffffffffffffff")

            await expect(publicSaleTier1Contract.connect(addr1).purchase(1, ""))
                // .to.changeTokenBalance(wethAddress, addr1, -price)
                .to.emit(publicSaleTier1Contract, "Purchase")
                .withArgs(addr1, 1)

            expect(await wethAddress.balanceOf(addr1)).to.equal(ONE - price);
            expect(await publicSaleTier1Contract.totalPurchased(addr1)).to.eq(1);
            expect(await wethAddress.balanceOf(beneficiary)).to.eq(price);


            await expect(publicSaleTier1Contract.connect(addr1).purchase(2, ""))
                // .to.changeTokenBalance(wethAddress, addr1, -price)
                .to.emit(publicSaleTier1Contract, "Purchase")
                .withArgs(addr1, 2)
            expect(await wethAddress.balanceOf(addr1)).to.equal(ONE - price*3n);
            expect(await publicSaleTier1Contract.totalPurchased(addr1)).to.eq(3);
            expect(await wethAddress.balanceOf(beneficiary)).to.eq(price*3n);

            await expect(publicSaleTier1Contract.connect(addr1).purchase(3, ""))
                .to.be.revertedWith("excceded cap per user")
        })

        it("Should purchase with code succeed", async function () {
            const { wethAddress, configContract, publicSaleList, owner, addr1, addr2 } = await loadFixture(deployNodeSaleFixture);
            
            await wethAddress.connect(owner).transfer(addr1, ONE);
            await wethAddress.connect(owner).transfer(addr2, ONE);

            let saleConfig = await configContract.getSaleConfig();
            // console.log(saleConfig)
            
            let publicSaleTier1Contract = publicSaleList[0];
            let tierConfig1 = await configContract.getTierConfig(false, 1);

            let price = tierConfig1[0] / saleConfig[2];
            await wethAddress.connect(addr1).approve(publicSaleTier1Contract.target, "0xffffffffffffffffffffffffffffffffffffffff")
            await wethAddress.connect(addr2).approve(publicSaleTier1Contract.target, "0xffffffffffffffffffffffffffffffffffffffff")

            await expect(publicSaleTier1Contract.connect(addr1).purchase(1, "code0"))
                // .to.changeTokenBalance(wethAddress, addr1, -price)
                .to.emit(publicSaleTier1Contract, "Purchase")
                .withArgs(addr1, 1)
                .to.emit(publicSaleTier1Contract, "PurchaseWithCode")
                .withArgs(addr1, 1, "code0")

            expect(await publicSaleTier1Contract.totalPurchased(addr1)).to.eq(1);
            expect(await publicSaleTier1Contract.codes(0)).to.eq("code0")
            expect(await publicSaleTier1Contract.isCodeStored("code0")).to.eq(true)
            expect(await publicSaleTier1Contract.purchaseAmountPerCode("code0")).to.eq(price)
        })
    })

    describe("Whitelist Purchase", function () {
        it("Should purchase without code succeed", async function () {
            const { wethAddress, configContract, whitelistSaleList, owner, addr1, addr2 } = await loadFixture(deployNodeSaleFixture);

            let whitelistSaleTier1Contract = whitelistSaleList[0];
            // var data = await whitelistSaleTier1Contract.data();

            // let tierConfig1 = await configContract.getTierConfig(true, data[3]);
            // console.log(tierConfig1)

            const values = [
                [addr1.address.toLowerCase(), 1],
                [addr2.address.toLowerCase(), 1]
            ];
            const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
            await configContract.connect(owner).setWhitelistRootHash(1, tree.root);

            // console.log(await configContract.whitelistRootHash(1))

            // for (const [i, v] of tree.entries()) {
            //     const proof = tree.getProof(i);
            //     console.log('Value:', v);
            //     console.log('Proof:', proof);
            // }
            // console.log(JSON.stringify(tree.dump()))

            await wethAddress.connect(owner).transfer(addr1, ONE);
            await wethAddress.connect(owner).transfer(addr2, ONE);

            await wethAddress.connect(addr1).approve(whitelistSaleTier1Contract.target, "0xffffffffffffffffffffffffffffffffffffffff")
            await wethAddress.connect(addr2).approve(whitelistSaleTier1Contract.target, "0xffffffffffffffffffffffffffffffffffffffff")

            const addr1Proof = Array.from(tree.entries())
                .filter(([i, v]) => v[0] == addr1.address.toLowerCase())
                .map(([i, v]) => ({
                    value: v,
                    proof: tree.getProof(i)
                }))[0]           
            
            await expect(whitelistSaleTier1Contract.connect(addr1).whitelistedPurchase(1, addr1Proof.proof, ""))
                .to.emit(whitelistSaleTier1Contract, "Purchase")
                .withArgs(addr1, 1)              
            // await whitelistSaleTier1Contract.connect(addr1).whitelistedPurchase(1, addr1Proof.proof, "");
        })
    })
})