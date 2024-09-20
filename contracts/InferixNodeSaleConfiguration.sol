//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

struct SaleConfig {
    address beneficiary;

    address paymentToken;
    uint256 snapshotedRate;

    uint64 whitelistSaleStartTime;
    uint64 whitelistSaleEndTime;
    uint64 publicSaleStartTime;
    uint64 publicSaleEndTime;
}

struct TierConfig {
    uint128 usdPrice;
    uint16 capPerUser;
    uint16 totalAllocation;
}

contract InferixNodeSaleConfiguration is Ownable {

    mapping(uint256 => bytes32) public whitelistRootHash;
    mapping(uint256 => TierConfig) public whitelistSaleTiers;
    mapping(uint256 => TierConfig) public publicSaleTiers;

    SaleConfig private saleConfig;

    constructor() Ownable(msg.sender) { }

    function setSaleConfig(SaleConfig memory config) external onlyOwner {
        saleConfig = config;
    }

    function getSaleConfig() external view returns(SaleConfig memory) {
        return saleConfig;
    }

    function setTierConfig(bool isWhitelistSale, uint256 tier, TierConfig memory config) external onlyOwner {
        if (isWhitelistSale)
            whitelistSaleTiers[tier] = config;
        else
            publicSaleTiers[tier] = config;
    }

    function getTierConfig(bool isWhitelistSale, uint256 tier) external view returns(TierConfig memory) {
        return isWhitelistSale ? whitelistSaleTiers[tier] : publicSaleTiers[tier];
    }

    function setWhitelistRootHash(uint256 tier, bytes32 hash) external onlyOwner {
        whitelistRootHash[tier] = hash;
    }
}