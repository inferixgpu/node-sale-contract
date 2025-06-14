// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SaleConfig, TierConfig, InferixNodeSaleConfiguration} from "./InferixNodeSaleConfiguration.sol";
import {InferixNodeSale} from "./InferixNodeSale.sol";
import {InferixNodeLicense} from "./InferixNodeLicense.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

// The node license NFT contract for Inferix
contract InferixNodeSaleManagement is Ownable, Pausable, ReentrancyGuard {
    address public airdropManager;
    address public cashbackManager;
    address public cashbackPool;
    address public saleConfigurationContract;
    address public licenseContract;

    mapping(string => uint256) public codeCashbackPercentage;
    mapping(address => mapping (uint8 => bool)) public whitelistCashbackIssued;
    mapping(address => mapping (uint8 => bool)) public publicCashbackIssued;

    event CashbackIssued(string code, address indexed buyer, uint256 amount);

    constructor(address saleConfigurationAddr, address nodeLicenseAddr)
        Ownable(msg.sender)
    {
        saleConfigurationContract = saleConfigurationAddr;
        licenseContract = nodeLicenseAddr;
    }

    
    modifier onlyAirdropManager() {
        require(msg.sender == airdropManager || msg.sender == owner() , "Only AirdropManager can call this function");
        _;
    }

    modifier onlyCashbackManager() {
        require(msg.sender == cashbackManager || msg.sender == owner(), "Only CashbackManager can call this function");
        _;
    }
    
    function initAirdropManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid address");
        require(airdropManager == address(0), "AirdropManager already initialized");
        airdropManager = manager;
    }

    function initCashbackManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid address");
        require(cashbackManager == address(0), "CashbackManager already initialized");
        cashbackManager = manager;
    }

    // Set the cashback pool address
    // This address is used to transfer cashback tokens
    function initCashbackPool(address poolAddr) external onlyOwner {
        require(poolAddr != address(0), "Invalid address");
        cashbackPool = poolAddr;
    }

    // Mint node licenses and airdrop to the specified address
    // _to: the address to airdrop the tokens to
    // _quantity: the number of tokens to mint
    // _nodeType: the type of node to mint. Using bitmask to represent the type of node
    // 1   : Mobile verifier
    // 2   : Standard verifier
    // 4   : Secure verifier
    // 8   : Preserved verifier type
    // 16  : Mobile worker
    // 32  : Standard worker
    // 64  : Secure worker
    // 128 : Standard Unit worker
    // 256 : Preserved worker type
    // 512 : Standard manager
    // 1024: Secure manager
    function airdrop(address _to, uint256 _quantity, uint256 _nodeType) external onlyAirdropManager {
        InferixNodeLicense(licenseContract).airdrop(_to, _quantity, _nodeType);
    }

    // Set the percentage of cashback for a specific code
    // code: the code for which cashback percentage is set
    // percentage: the cashback percentage to set (0-100)
    // Only callable by the CashbackManager
    // Throws if the percentage is greater than 100 or if the code already exists with a different percentage
    // Emits a CashbackIssued event when the cashback is successfully issued
    function setCodeCashbackPercentage(string calldata code, uint256 percentage) external onlyCashbackManager {
        require(percentage <= 100, "Percentage cannot exceed 100");
        codeCashbackPercentage[code] = percentage;
    }

    // Issue cashback to a purchaser for a specific code
    // buyer: the address of the buyer
    // code: the code for which cashback is issued
    // saleContractAddr: the address of the sale contract (public or whitelisted)
    // nodeAmount: the amount of nodes purchased by the buyer
    // Only callable by the CashbackManager 
    // Throws if the code does not exist or if the cashback amount is zero
    // Emits a CashbackIssued event when the cashback is successfully issued
    function cashback(address buyer, string calldata code, address saleContractAddr, uint256 nodeAmount) external onlyCashbackManager {
        require(buyer != address(0), "Invalid buyer address");
        require(nodeAmount > 0, "Node amount must be greater than 0");

        uint256 cashbackPercentage = codeCashbackPercentage[code];
        require(cashbackPercentage > 0, "Code not found or cashback not set");

        InferixNodeSale saleContract = InferixNodeSale(saleContractAddr);
        require(saleContract != InferixNodeSale(address(0)), "Invalid sale contract address");

        (string memory name, address cfg, bool isWhitelisted, uint8 tier) = saleContract.data();

        // Mark the cashback as issued for the buyer and tier
        // This prevents double cashback issuance for the same buyer and tier
        bool cashbackIssued = isWhitelisted ? whitelistCashbackIssued[buyer][tier] : publicCashbackIssued[buyer][tier];
        require(!cashbackIssued, "Cashback already issued for this buyer and tier");

        // Check if the buyer has purchased enough nodes
        uint256 totalPurchasedNodes = saleContract.totalPurchased(buyer);
        require(totalPurchasedNodes >= nodeAmount, "Not enough nodes purchased to qualify for cashback");

        // Call the internal cashback function to process the cashback
        uint256 cashbackAmount = _cashback(cashbackPercentage, buyer, tier, isWhitelisted, nodeAmount, cfg);

        emit CashbackIssued(code, buyer, cashbackAmount);
    }

    function _cashback(uint256 cashbackPercentage, address buyer, uint8 tier, bool isWhitelisted, uint256 nodeAmount, address cfgAddr) internal returns (uint256) {
        InferixNodeSaleConfiguration config = InferixNodeSaleConfiguration(cfgAddr);
        SaleConfig memory saleConfig = config.getSaleConfig();
        TierConfig memory tierConfig = config.getTierConfig(isWhitelisted, tier);
        uint256 salePrice = tierConfig.usdPrice / saleConfig.snapshotedRate;
        uint totalPurchasedValue = salePrice * nodeAmount;
        
        // Calculate the cashback amount based on the total purchased and the cashback percentage
        uint256 cashbackAmount = (totalPurchasedValue * cashbackPercentage) / 100;

        IERC20 paymentToken = IERC20(saleConfig.paymentToken);
        require(paymentToken.balanceOf(cashbackPool) >= cashbackAmount, "not enough balance");

        paymentToken.transferFrom(cashbackPool, buyer, cashbackAmount);

        if (isWhitelisted) {
            whitelistCashbackIssued[buyer][tier] = true;
        } else {
            publicCashbackIssued[buyer][tier] = true;
        }

        return cashbackAmount;
    }



}