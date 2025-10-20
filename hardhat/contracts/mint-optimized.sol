// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CommitNFTOptimized
 * @dev 基于off-chain metadata的优化版GitHub commit NFT合约
 * @author LightCommit Team
 * @notice 此版本将大部分数据存储在链下，大幅降低gas费用
 */
contract CommitNFTOptimized is ERC721, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // 计数器用于生成唯一的token ID
    Counters.Counter private _tokenIdCounter;
    
    // 最大供应量限制
    uint256 public constant MAX_SUPPLY = 1000000;
    
    // 基础URI，用于构建tokenURI
    string private _baseTokenURI;
    
    // 链上只存储关键数据，详细数据存储在off-chain metadata中
    struct CommitData {
        bytes32 commitHash;    // commit哈希的keccak256 (节省gas)
        uint32 timestamp;      // commit时间戳 (使用uint32节省gas)
        bool isMerged;         // 是否被合并
    }
    
    // 存储每个token的核心commit数据
    mapping(uint256 => CommitData) private _commitData;
    
    // 存储已铸造的commit哈希，防止重复铸造
    mapping(bytes32 => bool) private _mintedCommits;
    
    // 存储用户铸造的token数量
    mapping(address => uint256) private _userTokenCount;
    
    // 事件定义 - 简化事件以节省gas
    event CommitMinted(
        uint256 indexed tokenId,
        address indexed to,
        bytes32 indexed commitHash,
        uint32 timestamp,
        bool isMerged,
        string metadataURI
    );
    
    event BatchMinted(
        address indexed to,
        uint256[] tokenIds,
        uint256 totalGasUsed
    );
    
    event BaseURIUpdated(string newBaseURI);
    
    // 构造函数
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        // 从token ID 1开始
        _tokenIdCounter.increment();
    }
    
    /**
     * @dev 铸造单个commit NFT (优化版)
     * @param to 接收者地址
     * @param commitHash commit哈希字符串
     * @param timestamp commit时间戳
     * @param isMerged 是否被合并
     * @param metadataURI 元数据URI (包含完整commit信息)
     */
    function mintCommit(
        address to,
        string memory commitHash,
        uint32 timestamp,
        bool isMerged,
        string memory metadataURI
    ) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(_tokenIdCounter.current() <= MAX_SUPPLY, "Max supply exceeded");
        
        // 将commit哈希转换为bytes32以节省存储空间
        bytes32 commitHashBytes = keccak256(abi.encodePacked(commitHash));
        require(!_mintedCommits[commitHashBytes], "Commit already minted");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // 存储核心数据
        _commitData[tokenId] = CommitData({
            commitHash: commitHashBytes,
            timestamp: timestamp,
            isMerged: isMerged
        });
        
        _mintedCommits[commitHashBytes] = true;
        _userTokenCount[to]++;
        
        // 铸造NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit CommitMinted(
            tokenId,
            to,
            commitHashBytes,
            timestamp,
            isMerged,
            metadataURI
        );
    }
    
    /**
     * @dev 批量铸造commit NFT (优化版)
     * @param to 接收者地址
     * @param commitHashes commit哈希数组
     * @param timestamps 时间戳数组
     * @param isMergedArray 合并状态数组
     * @param metadataURIs 元数据URI数组
     */
    function batchMintCommits(
        address to,
        string[] memory commitHashes,
        uint32[] memory timestamps,
        bool[] memory isMergedArray,
        string[] memory metadataURIs
    ) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(commitHashes.length == timestamps.length, "Hashes and timestamps length mismatch");
        require(commitHashes.length == isMergedArray.length, "Hashes and merged status length mismatch");
        require(commitHashes.length == metadataURIs.length, "Hashes and metadata URIs length mismatch");
        require(commitHashes.length > 0, "Empty array");
        require(commitHashes.length <= 50, "Batch size too large");
        
        uint256[] memory tokenIds = new uint256[](commitHashes.length);
        
        for (uint256 i = 0; i < commitHashes.length; i++) {
            require(_tokenIdCounter.current() <= MAX_SUPPLY, "Max supply exceeded");
            
            bytes32 commitHashBytes = keccak256(abi.encodePacked(commitHashes[i]));
            require(!_mintedCommits[commitHashBytes], "Commit already minted");
            
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            // 存储核心数据
            _commitData[tokenId] = CommitData({
                commitHash: commitHashBytes,
                timestamp: timestamps[i],
                isMerged: isMergedArray[i]
            });
            
            _mintedCommits[commitHashBytes] = true;
            tokenIds[i] = tokenId;
            
            // 铸造NFT
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, metadataURIs[i]);
        }
        
        _userTokenCount[to] += commitHashes.length;
        
        emit BatchMinted(to, tokenIds, gasleft());
    }
    
    /**
     * @dev 获取核心commit数据
     * @param tokenId token ID
     * @return commitHash commit哈希的bytes32形式
     * @return timestamp commit时间戳
     * @return isMerged 是否被合并
     */
    function getCommitData(uint256 tokenId) external view returns (
        bytes32 commitHash,
        uint32 timestamp,
        bool isMerged
    ) {
        require(_exists(tokenId), "Token does not exist");
        CommitData memory data = _commitData[tokenId];
        return (data.commitHash, data.timestamp, data.isMerged);
    }
    
    /**
     * @dev 检查commit是否已被铸造
     * @param commitHash commit哈希字符串
     * @return 是否已铸造
     */
    function isCommitMinted(string memory commitHash) external view returns (bool) {
        bytes32 commitHashBytes = keccak256(abi.encodePacked(commitHash));
        return _mintedCommits[commitHashBytes];
    }
    
    /**
     * @dev 获取用户铸造的token数量
     * @param user 用户地址
     * @return 铸造的token数量
     */
    function getUserTokenCount(address user) external view returns (uint256) {
        return _userTokenCount[user];
    }
    
    /**
     * @dev 获取当前token ID
     * @return 当前token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev 获取总供应量
     * @return 总供应量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
    
    /**
     * @dev 设置基础URI
     * @param baseTokenURI 新的基础URI
     */
    function setBaseURI(string memory baseTokenURI) external onlyOwner {
        _baseTokenURI = baseTokenURI;
        emit BaseURIUpdated(baseTokenURI);
    }
    
    /**
     * @dev 获取基础URI
     * @return 基础URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 紧急提取ETH（仅限owner）
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // 重写必要的函数以支持ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // 重写_burn函数以支持ERC721URIStorage
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
