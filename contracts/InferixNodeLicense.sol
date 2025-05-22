// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// The node license NFT contract for Inferix
contract InferixNodeLicense is ERC721, ERC721Enumerable, Ownable {
    uint256 public maxSupply;
    string public baseTokenImageURI;
    mapping(uint256 => uint256) public idToNodeType;

    uint public constant TRANSFER_UNLOCK_DATE = 1780110000; // 2026-05-30 10:00:00 UTC

    event NodeAirdropped(address owner, uint256 tokenId, uint256 nodeType);

    address public airdropManager;

    constructor(address initialOwner) 
        ERC721('InferixNodeLicense','IFXNL') 
        Ownable(initialOwner)
    {
        maxSupply = 1000000;
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || from == to || TRANSFER_UNLOCK_DATE < block.timestamp, "Still in lock period");
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
      super._increaseBalance(account, value);
    }

    function initAirdropManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid address");
        require(airdropManager == address(0), "AirdropManager already initialized");
        airdropManager = manager;
    }

    modifier onlyAirdropManager() {
        require(msg.sender == airdropManager || msg.sender == owner() , "Only AirdropManager can call this function");
        _;
    }

    function setBaseTokenImageURI(string calldata uri) external onlyOwner {
        baseTokenImageURI = uri;
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        uint256 nodeType = idToNodeType[_tokenId];
        string memory nodeTypeImg;
        if ((nodeType & 1024) == 1024) {
            nodeTypeImg = "sec-manager";
        } else if ((nodeType & 512) == 512) {
            nodeTypeImg = "std-manager";
        } else if ((nodeType & 128) == 128) {
            nodeTypeImg = "std-unit-worker";
        } else if ((nodeType & 64) == 64) {
            nodeTypeImg = "sec-worker";
        } else if ((nodeType & 32) == 32) {
            nodeTypeImg = "std-worker";
        } else if ((nodeType & 16) == 16) {
            nodeTypeImg = "mob-worker";
        } else if ((nodeType & 4) == 4) {
            nodeTypeImg = "sec-verifier";
        } else if ((nodeType & 2) == 2) {
            nodeTypeImg = "std-verifier";
        } else if ((nodeType & 1) == 1) {
            nodeTypeImg = "mob-verifier";
        } else {
            nodeTypeImg = "ifx-node";
        }
        return string(abi.encodePacked(
            '{"name":"Inferix Node #', Strings.toString(_tokenId), '",',
            '"description":"Node is a component of the Inferix network responsible for either GPU computation or verification. Nodes are categorized using a bitmask system as follows: 1 = Mobile Verifier, 2 = Standard Verifier, 4 = Secure Verifier, 16 = Mobile Worker, 32 = Standard Worker, 64 = Secure Worker. Additional node types may be defined using other bitmask values as the network evolves",',
            '"image":"', baseTokenImageURI, nodeTypeImg, '.png",',
            '"attributes":[{"trait_type":"Node Type","value":"', Strings.toString(nodeType), '"}]}'   
        ));
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
        require(_to != address(0), "Invalid address");
        require(_quantity > 0, "Invalid quantity");
        require(_nodeType > 0, "Invalid node type");
        require(totalSupply() + _quantity <= maxSupply, "Max supply reached");

        for (uint256 i = 0; i < _quantity; i++) {
            uint256 newTokenId = totalSupply() + 10001;
            _safeMint(_to, newTokenId);
            idToNodeType[newTokenId] = _nodeType;
            emit NodeAirdropped(_to, newTokenId, _nodeType);
        }
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokens;
    }

}