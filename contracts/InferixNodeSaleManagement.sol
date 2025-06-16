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

// The Node Sale Management contract is responsible for managing the sale of node licenses
// It allows for airdropping node licenses, managing cashback and referral systems
contract InferixNodeSaleManagement is Ownable, Pausable, ReentrancyGuard {
    address public airdropManager;
    address public cashbackManager;
    address public cashbackPool;
    address public saleConfigurationContract;
    address public licenseContract;

    // Mapping to store the referrer that owns the code
    mapping(string => address) public codeReferrer;
    // Mapping to store the cashback percentage for each code
    mapping(string => uint256) public codeCashbackPercentage;
    // Mapping to store the referrer commission percentage for each code
    mapping(string => uint256) public codeReferrerPercentage;
    // Mapping to store the total cashback issued for each code
    mapping(string => uint256) public codeCashbackIssuedValue;
    // Mapping to store the total referral commission issued for each code
    mapping(string => uint256) public codeReferralIssuedValue;

    mapping(address => mapping (uint8 => uint256)) public whitelistCashbackIssued;
    mapping(address => mapping (uint8 => uint256)) public publicCashbackIssued;

    event CashbackIssued(string code, address indexed buyer, uint256 amount);
    event ReferrerCashbackIssued(string code, address indexed referrer, uint256 amount);

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
    
    function setAirdropManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid address");
        airdropManager = manager;
    }

    function setCashbackManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid address");
        cashbackManager = manager;
    }

    // Set the cashback pool address
    // This address is used to transfer cashback tokens
    function initCashbackPool(address poolAddr) external onlyOwner {
        require(poolAddr != address(0), "Invalid address");
        cashbackPool = poolAddr;
    }

    // Set the license contract address
    // This contract is used to manage node licenses
    function setLicenseContract(address licenseAddr) external onlyOwner {
        require(licenseAddr != address(0), "Invalid address");
        licenseContract = licenseAddr;
    }

    // Set the sale configuration contract address
    // This contract is used to manage sale configurations and tier settings
    function setSaleConfigurationContract(address saleConfigAddr) external onlyOwner {
        require(saleConfigAddr != address(0), "Invalid address");
        saleConfigurationContract = saleConfigAddr;
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

    // Set the referrer and cashback percentage for a specific code
    // This function allows setting a referrer and cashback percentage for a specific code
    // It can be used to incentivize referrals and set cashback percentages for specific codes.
    // referrer: the address of the referrer. This address will receive the referrer cashback when the code is used, see referrerCashback method 
    // code: the code for which cashback percentage is set
    // percentage: the cashback percentage to set (0-100)
    // referralPercentage: the percentage of cashback that the referrer will receive
    // Only callable by the CashbackManager
    // Throws if the percentage is greater than 100 or if the code already exists with a different percentage
    // Emits a CashbackIssued event when the cashback is successfully issued
    function setCodeReferrerAndPercentage(address referrer, string calldata code, uint256 percentage, uint256 referralPercentage) external onlyCashbackManager {
        require(percentage <= 100, "Percentage cannot exceed 100");
        codeCashbackPercentage[code] = percentage;
        codeReferrerPercentage[code] = referralPercentage;
        codeReferrer[code] = referrer;
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
        uint256 cashbackIssuedNodes = isWhitelisted ? whitelistCashbackIssued[buyer][tier] : publicCashbackIssued[buyer][tier];

        // Check if the buyer has purchased enough nodes
        uint256 totalPurchasedNodes = saleContract.totalPurchased(buyer);
        require(totalPurchasedNodes >= nodeAmount + cashbackIssuedNodes, "Not enough nodes purchased to qualify for cashback");

        // Call the internal cashback function to process the cashback
        uint256 nodePurchasedValue = _cashback(cashbackPercentage, buyer, tier, isWhitelisted, nodeAmount);

        codeCashbackIssuedValue[code] += nodePurchasedValue;

        emit CashbackIssued(code, buyer, (nodePurchasedValue * cashbackPercentage) / 100);
    }

    // Issue referral cashback to the referrer for a specific code
    // This function allows the referrer to claim their cashback based on the total purchased value
    // code: the code for which referral cashback is issued
    // Only callable by the CashbackManager
    // Throws if the code does not exist or if the referral cashback has already been issued
    // Emits a ReferrerCashbackIssued event when the referral cashback is successfully issued
    function referrerCashback(string calldata code) external onlyCashbackManager {
        uint256 referralPercentage = codeReferrerPercentage[code];
        require(referralPercentage > 0, "Code not found or cashback not set");
        uint256 referralIssuedValue = codeReferralIssuedValue[code];

        uint256 cashbackIssuedValue = codeCashbackIssuedValue[code];
        require(referralIssuedValue < cashbackIssuedValue, "Referral cashback already issued for this code");

        // Calculate the cashback amount based on the total purchased and the cashback percentage
        uint256 cashbackAmount = ((cashbackIssuedValue - referralIssuedValue) * referralPercentage) / 100;
        
        InferixNodeSaleConfiguration config = InferixNodeSaleConfiguration(saleConfigurationContract);
        SaleConfig memory saleConfig = config.getSaleConfig();

        IERC20 paymentToken = IERC20(saleConfig.paymentToken);
        require(paymentToken.balanceOf(cashbackPool) >= cashbackAmount, "Not enough balance");

        address referrer = codeReferrer[code];

        paymentToken.transferFrom(cashbackPool, referrer, cashbackAmount);

        codeReferralIssuedValue[code] = cashbackIssuedValue;
        
        emit ReferrerCashbackIssued(code, referrer, cashbackAmount);
    }

    // Internal function to handle the cashback logic
    // This function calculates the cashback amount based on the total purchased value and the cashback percentage
    // It transfers the cashback amount from the cashback pool to the buyer
    // cashbackPercentage: the percentage of cashback to be issued
    // buyer: the address of the buyer who is eligible for cashback 
    // tier: the tier of the buyer (used for whitelisted or public sales)
    // isWhitelisted: whether the sale is whitelisted or public
    // nodeAmount: the amount of nodes purchased by the buyer
    // Returns the purchased value corresponding to the node amount
    function _cashback(uint256 cashbackPercentage, address buyer, uint8 tier, bool isWhitelisted, uint256 nodeAmount) internal returns (uint256) {
        InferixNodeSaleConfiguration config = InferixNodeSaleConfiguration(saleConfigurationContract);
        SaleConfig memory saleConfig = config.getSaleConfig();
        TierConfig memory tierConfig = config.getTierConfig(isWhitelisted, tier);
        uint256 salePrice = tierConfig.usdPrice / saleConfig.snapshotedRate;
        uint nodePurchasedValue = salePrice * nodeAmount;
        
        // Calculate the cashback amount based on the total purchased and the cashback percentage
        uint256 cashbackAmount = (nodePurchasedValue * cashbackPercentage) / 100;

        IERC20 paymentToken = IERC20(saleConfig.paymentToken);
        require(paymentToken.balanceOf(cashbackPool) >= cashbackAmount, "Not enough balance");

        paymentToken.transferFrom(cashbackPool, buyer, cashbackAmount);

        if (isWhitelisted) {
            whitelistCashbackIssued[buyer][tier] += nodeAmount;
        } else {
            publicCashbackIssued[buyer][tier] += nodeAmount;
        }

        return nodePurchasedValue;
    }



}