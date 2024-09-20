const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const NodeSaleModule = require("../ignition/modules/InferixNodeSale")
const { ignition } = require("hardhat");

describe("NodeSale", function () {
    async function deployNodeSaleFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
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

        return { wethAddress, configContract, publicSaleList, whitelistSaleList, owner, addr1, addr2 }
    }

    describe("Deployment", function () {
        it("Should set the right name", async function () {
            const { configContract, publicSaleList, whitelistSaleList } = await loadFixture(deployNodeSaleFixture);

            expect(whitelistSaleList.length).to.eq(8)
            expect(publicSaleList.length).to.eq(20)
        })
    })

    describe("Purchase", function () {
        it("Should purchase succeed", async function () {
            const { wethAddress, configContract, publicSaleList, owner, addr1, addr2 } = await loadFixture(deployNodeSaleFixture);
            const ONE = ethers.parseEther("1");
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


            await expect(publicSaleTier1Contract.connect(addr1).purchase(2, ""))
                // .to.changeTokenBalance(wethAddress, addr1, -price)
                .to.emit(publicSaleTier1Contract, "Purchase")
                .withArgs(addr1, 2)
            expect(await wethAddress.balanceOf(addr1)).to.equal(ONE - price*3n);
            expect(await publicSaleTier1Contract.totalPurchased(addr1)).to.eq(3);

            await expect(publicSaleTier1Contract.connect(addr1).purchase(3, ""))
                .to.be.revertedWith("excceded cap per user")
                
        })
    })
})