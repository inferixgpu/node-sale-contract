//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import { SaleConfig, TierConfig, InferixNodeSaleConfiguration } from "./InferixNodeSaleConfiguration.sol";

contract InferixNodeSale is Ownable, Pausable, ReentrancyGuard {
    struct Data {
        string name;
        address configAddress;
        bool isWhitelistSale;
        uint8 tier;
    }

    Data public data;
    uint256 public totalPaymentReceived;
    uint256 public saleTokenPurchased;

    // Total purchased nodes per address
    mapping(address => uint256) public totalPurchased;
    string[] public codes;
    mapping(string => bool) public isCodeStored;

    // Total purchased tokens per code
    mapping(string => uint256) public purchasedAmountPerCode;
    //mapping(address => uint256) public purchasedWhitelistAmountPerAddress;

    event Purchase(address indexed sender, uint256 purchasedAmount);
    event PurchaseWithCode(address indexed sender, uint256 purchasedAmount, string code);

    constructor(
        string memory _name,
        address _configAddress,
        bool _isWhitelistSale,
        uint8 _tier
    )  
        Ownable(msg.sender)
    {
        data = Data(_name, _configAddress, _isWhitelistSale, _tier);
    }

    modifier onlyDuringSale {
        SaleConfig memory saleConfig = InferixNodeSaleConfiguration(data.configAddress).getSaleConfig();
        if (data.isWhitelistSale) {
            require(saleConfig.whitelistSaleStartTime <= block.timestamp, 'sale has not begun');
            require(block.timestamp <= saleConfig.whitelistSaleEndTime, 'sale over');
        } else {
            require(saleConfig.publicSaleStartTime <= block.timestamp, 'sale has not begun');
            require(block.timestamp <= saleConfig.publicSaleEndTime, 'sale over');
        }
        
        _;
    }

    // Public purchase function
    // This function allows users to purchase nodes during the public sale
    // It checks if the sale is currently active and if the user has enough balance to purchase
    // It also ensures that the total purchased amount of nodes does not exceed the sale's allocation
    // The function requires the user to provide a valid referral code
    // @param amount: the number of nodes to purchase
    // @param code: referral code to associate with the purchase
    // @dev This function is only callable during the public sale period
    function purchase(uint256 amount, string memory code) external onlyDuringSale {
        require(!data.isWhitelistSale, 'for public sale only');

        _purchase(amount, code);
    }

    // Whitelisted purchase function
    // This function allows users to purchase during the whitelist sale using a Merkle proof
    // It checks if the user is whitelisted and if they have enough allocation
    // It also ensures that the total purchased amount of nodes does not exceed the user's allocation
    // The Merkle proof is used to verify the user's allocation in the whitelist
    // The function requires the user to provide a valid Merkle proof and allocation amount
    // It also checks that the user has not exceeded their allocation for the whitelist sale
    // The function emits a Purchase event upon successful purchase
    // @param amount: the number of nodes to purchase
    // @param allocation: the maximum node amount the user can purchase in the whitelist sale
    // @param code: referral code to associate with the purchase
    // @param merkleProof: the Merkle proof to verify the user's allocation in the whitelist
    // @dev This function is only callable during the whitelist sale period
    function whitelistedPurchase(uint256 amount, uint256 allocation, string memory code, bytes32[] memory merkleProof) external onlyDuringSale {
        require(data.isWhitelistSale, 'for whitelist sale only');
        require(merkleProof.length > 0, 'proof is empty');
        address senderAddress = msg.sender;
        require(checkProof(senderAddress, merkleProof, allocation), 'invalid whitelist proof');
        //require(purchasedWhitelistAmountPerAddress[senderAddress] + amount <= allocation, 'whitelist allocation exceeded');
        require(totalPurchased[senderAddress] + amount <= allocation, 'whitelist allocation exceeded');
        _purchase(amount, code);
        //purchasedWhitelistAmountPerAddress[senderAddress] += amount;
    }

    // Check if the user is whitelisted and has a valid allocation
    // This function verifies the user's Merkle proof against the whitelist root hash
    // It calculates the leaf node from the user's address and allocation
    // and checks if it exists in the Merkle tree
    // @param user: the address of the user to check
    // @param merkleProof: the Merkle proof to verify the user's allocation in the whitelist
    // @param allocation: the maximum node amount the user can purchase in the whitelist sale
    // @return bool: true if the user is whitelisted and has a valid allocation, false otherwise
    function checkProof(address user, bytes32[] memory merkleProof, uint256 allocation) public view returns (bool)
    {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(user, allocation))));
        return MerkleProof.verify(merkleProof, InferixNodeSaleConfiguration(data.configAddress).whitelistRootHash(data.tier), leaf);
    }

    function _purchase(uint256 amount, string memory code) internal nonReentrant whenNotPaused onlyDuringSale {
        InferixNodeSaleConfiguration config = InferixNodeSaleConfiguration(data.configAddress);
        SaleConfig memory saleConfig = config.getSaleConfig();
        TierConfig memory tierConfig = config.getTierConfig(data.isWhitelistSale, data.tier);
        
        require(bytes(code).length <= 64, 'code is too long');
        require(tierConfig.usdPrice > 0, 'sale price is zero');
        require(amount > 0, 'cannot purchase 0');
        require(saleTokenPurchased + amount <= tierConfig.totalAllocation, "excceded");

        uint256 purchasedAmount = totalPurchased[msg.sender];
        require(tierConfig.capPerUser == 0 || purchasedAmount + amount <= tierConfig.capPerUser, "excceded cap per user");

        uint256 salePrice = tierConfig.usdPrice / saleConfig.snapshotedRate;
        uint totalPurchaseValue = salePrice * amount;

        IERC20 paymentToken = IERC20(saleConfig.paymentToken);
        require(paymentToken.balanceOf(msg.sender) >= totalPurchaseValue, "not enough balance");

        saleTokenPurchased += amount;
        paymentToken.transferFrom(msg.sender, saleConfig.beneficiary, totalPurchaseValue);
        totalPaymentReceived += totalPurchaseValue;

        totalPurchased[msg.sender] = purchasedAmount + amount;

        emit Purchase(msg.sender, amount);
        if (bytes(code).length > 0) {
            if (!isCodeStored[code]) {
                isCodeStored[code] = true;
                codes.push(code);
            }

            purchasedAmountPerCode[code] += totalPurchaseValue;
            emit PurchaseWithCode(_msgSender(), amount, code);
        }
    }

    // Returns the total amount of tokens sold in the sale
    // This function calculates the total amount of tokens sold based on the total payment received
    // It retrieves the sale price from the tier configuration and divides the total payment received by the sale price
    // @return amount: the total amount of tokens sold in the sale
    function getSaleTokensSold() public view returns (uint256 amount) {
        InferixNodeSaleConfiguration config = InferixNodeSaleConfiguration(data.configAddress);
        TierConfig memory tierConfig = config.getTierConfig(data.isWhitelistSale, data.tier);
        uint256 salePrice = tierConfig.usdPrice / config.getSaleConfig().snapshotedRate;
        if (salePrice == 0) {
            return 0;
        } else {
            return totalPaymentReceived / salePrice;
        }
    }
}