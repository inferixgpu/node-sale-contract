// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// The node license NFT contract for Inferix
contract InferixNodeLicense is ERC721, ERC721Enumerable, Ownable {
    uint256 public maxSupply;
    string internal baseTokenURI;
    mapping(uint256 => uint256) public idToNodeType;

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

    function setBaseTokenURI(string calldata _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseTokenURI, Strings.toString(idToNodeType[_tokenId]), ".json"));
    }
    
    // Mint node licenses and airdrop to the specified address
    // _to: the address to airdrop the tokens to
    // _quantity: the number of tokens to mint
    // _nodeType: the type of node to mint. Using bitmask to represent the type of node
    // 1   : Standard verifier
    // 2   : Mobile verifier 
    // 4   : Secured verifier
    // 8   : Preserved verifier type
    // 16  : Standard worker
    // 32  : Mobile worker
    // 64  : Secured worker
    // 128 : Standard Unit worker
    // 256 : Preserved worker type
    // 512 : Standard manager
    // 1024: Secured manager
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