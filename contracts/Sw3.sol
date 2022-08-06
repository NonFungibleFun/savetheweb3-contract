//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract Sw3 is Ownable, ERC721A, ReentrancyGuard, Pausable {
    uint256 public maxPerAddressDuringMint;
    uint256 public immutable collectionSize;
    uint256 public maxPerTransactionDuringMint;

    uint256 public maxPreSaleMintCount;
    uint256 public maxWhitelistMintCount;

    // whitelist for presale
    bytes32 public preSaleRoot;
    // whitelist root
    bytes32 public whitelistRoot;
    
    uint64 public preSalePrice;
    uint64 public whitelistPrice;   
    uint64 public publicPrice;

    uint256 public preSaleStartTime;
    uint256 public preSaleEndTime;

    uint256 public whitelistSaleStartTime;
    uint256 public whitelistSaleEndTime;

    uint256 public publicSaleStartTime;
    uint256 public publicSaleEndTime;

    mapping(address => bool) public preSaleMinted;
    mapping(address => bool) public whitelistMinted;

    modifier callerIsUser() {
        require(tx.origin == msg.sender);
        _;
    }

    constructor(
        uint256 maxBatchSize_,
        uint256 collectionSize_
    ) ERC721A("Save the Web3", "SW3") {
        maxPerAddressDuringMint = maxBatchSize_;
        collectionSize = collectionSize_;
        maxPerTransactionDuringMint = 10;
        maxPreSaleMintCount = 2;
        maxWhitelistMintCount = 2;
        _pause();
    }
    
    function preSaleMint(uint256 quantity, bytes32[] memory proof) external payable callerIsUser whenNotPaused {
        uint256 price = preSalePrice * quantity;
        require(price != 0 && isPreSaleOn(), "presale has not begun yet");
        require(isValidPreSale(proof, keccak256(abi.encodePacked(msg.sender))), "not eligible for presale mint");
        require(totalSupply() + quantity <= collectionSize, "reached max supply");
        require(!preSaleMinted[msg.sender], "already minted");
        require(quantity <= maxPreSaleMintCount, "reached max mint count for presale");
        preSaleMinted[msg.sender] = true;
        _safeMint(msg.sender, quantity);
        refundIfOver(price);
    }

    function whitelistMint(uint256 quantity, bytes32[] memory proof) external payable callerIsUser whenNotPaused {
        uint256 price = whitelistPrice * quantity;
        require(price != 0 && isWhitelistSaleOn(), "whitelist sale has not begun yet");        
        require(isValidWhitelist(proof, keccak256(abi.encodePacked(msg.sender))), "not eligible for whitelist mint");
        require(totalSupply() + quantity <= collectionSize, "reached max supply");
        require(!whitelistMinted[msg.sender], "already minted");
        require(quantity <= maxWhitelistMintCount, "reached max mint count for whitelist");
        whitelistMinted[msg.sender] = true;
        _safeMint(msg.sender, quantity);
        refundIfOver(price);

    }

    function publicMint(uint256 quantity) external payable callerIsUser whenNotPaused {
        require(
            isPublicSaleOn(),
            "public sale has not started yet"
        );
        require(
            totalSupply() + quantity <= collectionSize,
            "reached max supply"
        );
        require(
            numberMinted(msg.sender) + quantity <= maxPerAddressDuringMint,
            "can not mint this many"
        );
        uint256 totalCost = publicPrice * quantity;
        _safeMint(msg.sender, quantity);
        refundIfOver(totalCost);
    }

    function refundIfOver(uint256 price) private {
        require(msg.value >= price, "Need to send more ETH.");
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }

    function setPreSalePrice(uint64 price_) external onlyOwner {
        preSalePrice = price_;
    }

    function setWhitelistPrice(uint64 price_) external onlyOwner {
        whitelistPrice = price_;
    }

    function setPublicPrice(uint64 price_) external onlyOwner {
        publicPrice = price_;
    }

    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function withdrawMoney() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function isValidPreSale(bytes32[] memory proof, bytes32 leaf) public view returns (bool) {
        return MerkleProof.verify(proof, preSaleRoot, leaf);
    }

    function isValidWhitelist(bytes32[] memory proof, bytes32 leaf) public view returns (bool) {
        return MerkleProof.verify(proof, whitelistRoot, leaf);
    }

    function setPreSaleMerkleRoot(bytes32 root_) external onlyOwner {
        preSaleRoot = root_;
    }

    function setWhitelistMerkleRoot(bytes32 root_) external onlyOwner {
        whitelistRoot = root_;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
    
    function isPreSaleOn() public view returns (bool) {
        return preSaleStartTime <= block.timestamp && block.timestamp <= preSaleEndTime;
    }

    function isWhitelistSaleOn() public view returns (bool) {
        return whitelistSaleStartTime <= block.timestamp && block.timestamp <= whitelistSaleEndTime;
    }

    function isPublicSaleOn() public view returns (bool) {
        return publicSaleStartTime <= block.timestamp && block.timestamp <= publicSaleEndTime;
    }

    string private _baseTokenURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function setMaxPreSaleMintCount(uint256 count) external onlyOwner {
        maxPreSaleMintCount = count;
    }

    function setMaxWhitelistMinCount(uint256 count) external onlyOwner {
        maxWhitelistMintCount = count;
    }

    function setMaxPerAddressDuringMint(uint256 maxPerAddressDuringMint_) external onlyOwner {
        maxPerAddressDuringMint = maxPerAddressDuringMint_;
    }

    function setMaxPerTransactionDuringMint(uint256 maxPerTransactionDuringMint_) external onlyOwner {
        maxPerTransactionDuringMint = maxPerTransactionDuringMint_;
    }

    function getPreSaleTime() public view returns (uint256, uint256) {
        return (preSaleStartTime, preSaleEndTime);
    }

    function setPreSaleTime(uint256 start, uint256 end) external onlyOwner {
        preSaleStartTime = start;
        preSaleEndTime = end;
    }

    function getWhitelistSaleTime() public view returns (uint256, uint256) {
        return (whitelistSaleStartTime, whitelistSaleEndTime);
    }

    function setWhitelistSaleTime(uint256 start, uint256 end) external onlyOwner {
        whitelistSaleStartTime = start;
        whitelistSaleEndTime = end;
    }

    function getPublicSaleTime() public view returns (uint256, uint256) {
        return (publicSaleStartTime, publicSaleEndTime);
    }

    function setPublicSaleTime(uint256 start, uint256 end) external onlyOwner {
        publicSaleStartTime = start;
        publicSaleEndTime = end;
    }
}

