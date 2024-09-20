const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MockWETH", (m) => {
    var owner = m.getAccount(0);
    const weth = m.contract("MockWETH", [
        owner,
    ]);

    return { weth };
});