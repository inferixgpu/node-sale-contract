const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const InferixNodeSaleConfiguration = require("./InferixNodeSaleConfiguration");
const InferixNodeLicense = require("./InferixNodeLicense");

module.exports = buildModule("InferixNodeSaleManagement", (m) => {
    var owner = m.getAccount(0);
    const { iusdtAddress, configContract } = m.useModule(InferixNodeSaleConfiguration);
    const { nodeLicense } = m.useModule(InferixNodeLicense);
    const nodeSaleManagement = m.contract("InferixNodeSaleManagement", [configContract, nodeLicense]);
    return { nodeSaleManagement };
});