module.exports = {
    saleConfig: {
        snapshotedRate: 1,
        whitelistSaleStartTime: "1748599200", //Fri May 30 2025 10:00:00 UTC+00
        whitelistSaleEndTime: "1780135200", //Sat May 30 2026 10:00:00 UTC+00
        publicSaleStartTime: "1748599200",
        publicSaleEndTime: "1780135200",

        beneficiary: "0xC93f074448eF5A8d941BEe246C89e20b7eCf67cf",
        //paymentToken: "0x582eFaC6Ce908a41d3BB9EFFCfF6ee7f0C1eD413", // ArbSepolia Inferix USD
        //paymentToken: "0xdAC17F958D2ee523a2206206994597C13D831ec7", //Ethereum USDT
        paymentToken: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", //Arbitrum USDT0
        //paymentToken: "0xFd687A34262b8288bfc8F1eeBb77E93CF5e84BA6", //Sepolia Inferix USD
        //paymentToken: "0x59996893E73b33640a1f0299caEBd9014d3c806A", //Arbitrum IFX
    },
    tiers: [
        { tier: 1, isWhitelistSale: false, usdPrice: "300000000", capPerUser: "10", allocation: "250" },
        { tier: 2, isWhitelistSale: false, usdPrice: "350000000", capPerUser: "20", allocation: "750" },
        { tier: 3, isWhitelistSale: false, usdPrice: "400000000", capPerUser: "25", allocation: "900" },
        { tier: 4, isWhitelistSale: false, usdPrice: "450000000", capPerUser: "30", allocation: "900" },
        { tier: 5, isWhitelistSale: false, usdPrice: "500000000", capPerUser: "30", allocation: "900" },
        { tier: 6, isWhitelistSale: false, usdPrice: "550000000", capPerUser: "30", allocation: "900" },
        { tier: 7, isWhitelistSale: false, usdPrice: "600000000", capPerUser: "30", allocation: "1200" },
        { tier: 8, isWhitelistSale: false, usdPrice: "650000000", capPerUser: "30", allocation: "1200" },
        { tier: 9, isWhitelistSale: false, usdPrice: "700000000", capPerUser: "0", allocation: "1250" },
        { tier: 10, isWhitelistSale: false, usdPrice: "750000000", capPerUser: "0", allocation: "1250" },
        { tier: 11, isWhitelistSale: false, usdPrice: "800000000", capPerUser: "0", allocation: "1250" },
        { tier: 12, isWhitelistSale: false, usdPrice: "850000000", capPerUser: "0", allocation: "1250" },
        { tier: 13, isWhitelistSale: false, usdPrice: "900000000", capPerUser: "0", allocation: "1500" },
        { tier: 14, isWhitelistSale: false, usdPrice: "950000000", capPerUser: "0", allocation: "1500" },
        { tier: 15, isWhitelistSale: false, usdPrice: "1000000000", capPerUser: "0", allocation: "1500" },
        { tier: 16, isWhitelistSale: false, usdPrice: "1050000000", capPerUser: "0", allocation: "1500" },
        { tier: 17, isWhitelistSale: false, usdPrice: "1100000000", capPerUser: "0", allocation: "1500" },
        { tier: 18, isWhitelistSale: false, usdPrice: "1150000000", capPerUser: "0", allocation: "1500" },
        { tier: 19, isWhitelistSale: false, usdPrice: "1200000000", capPerUser: "0", allocation: "1500" },
        { tier: 20, isWhitelistSale: false, usdPrice: "1250000000", capPerUser: "0", allocation: "1500" },
        { tier: 21, isWhitelistSale: false, usdPrice: "1300000000", capPerUser: "0", allocation: "5000" },
        { tier: 22, isWhitelistSale: false, usdPrice: "1350000000", capPerUser: "0", allocation: "5000" },
        { tier: 23, isWhitelistSale: false, usdPrice: "1400000000", capPerUser: "0", allocation: "5000" },
        { tier: 24, isWhitelistSale: false, usdPrice: "1450000000", capPerUser: "0", allocation: "5000" },
        { tier: 25, isWhitelistSale: false, usdPrice: "1500000000", capPerUser: "0", allocation: "5000" },
        { tier: 26, isWhitelistSale: false, usdPrice: "1550000000", capPerUser: "0", allocation: "10000" },
        { tier: 27, isWhitelistSale: false, usdPrice: "1600000000", capPerUser: "0", allocation: "10000" },
        { tier: 28, isWhitelistSale: false, usdPrice: "1650000000", capPerUser: "0", allocation: "10000" },
        { tier: 29, isWhitelistSale: false, usdPrice: "1700000000", capPerUser: "0", allocation: "10000" },
        { tier: 30, isWhitelistSale: false, usdPrice: "1750000000", capPerUser: "0", allocation: "10000" },
        { tier: 1, isWhitelistSale: true, usdPrice: "300000000", capPerUser: "10", allocation: "250" },
        { tier: 2, isWhitelistSale: true, usdPrice: "350000000", capPerUser: "20", allocation: "250" },
        { tier: 3, isWhitelistSale: true, usdPrice: "400000000", capPerUser: "25", allocation: "100" },
        { tier: 4, isWhitelistSale: true, usdPrice: "450000000", capPerUser: "30", allocation: "100" },
        { tier: 5, isWhitelistSale: true, usdPrice: "500000000", capPerUser: "30", allocation: "100" },
        { tier: 6, isWhitelistSale: true, usdPrice: "550000000", capPerUser: "30", allocation: "100" },
        { tier: 7, isWhitelistSale: true, usdPrice: "600000000", capPerUser: "30", allocation: "50" },
        { tier: 8, isWhitelistSale: true, usdPrice: "650000000", capPerUser: "30", allocation: "50" },
    ]
}