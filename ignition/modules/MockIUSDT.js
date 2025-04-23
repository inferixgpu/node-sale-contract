const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MockIUSDT", (m) => {
    var owner = m.getAccount(0);
    const iusdt = m.contract("MockIUSDT", [
        owner,
    ]);

    return { iusdt };
});