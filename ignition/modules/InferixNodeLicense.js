const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("InferixNodeLicense", (m) => {
    var owner = m.getAccount(0);
    const nodeLicense = m.contract("InferixNodeLicense", [owner]);
    return { nodeLicense };
});