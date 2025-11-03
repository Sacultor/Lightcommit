// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CommitNFT
 * @dev 基于GitHub commit记录的NFT合约
 * @author LightCommit Team
 */
contract CommitNFT is ERC721, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // 计数器用于生成唯一的token ID
    Counters.Counter private _tokenIdCounter;
    
    // 最大供应量限制
    uint256 public constant MAX_SUPPLY = 1000000;

    // 单个地址最大铸造数量，帮助缓解女巫攻击（可根据需求调整）
    uint256 public constant MAX_MINTS_PER_ADDRESS = 1000;
    
    // 基础URI，用于构建tokenURI
    string private _baseTokenURI;
    
    // 每个token的commit数据结构
    struct CommitData {
        string repo;           // 仓库名称
        string commit;         // commit哈希
        uint256 linesAdded;    // 添加的代码行数
        uint256 linesDeleted;  // 删除的代码行数
        bool testsPass;       // 测试是否通过
        uint256 timestamp;     // commit时间戳
        string author;         // 作者
        string message;        // commit消息
        bool merged;           // 是否被合并
    }
    
    // 存储每个token的commit数据
    mapping(uint256 => CommitData) private _commitData;
    
    // 存储已铸造的commit哈希，防止重复铸造
    mapping(string => bool) private _mintedCommits;
    
    // 存储用户铸造的token数量
    mapping(address => uint256) private _userTokenCount;

    // EIP-712: 签名验证相关
    bytes32 public constant MINT_TYPEHASH = keccak256("Mint(address to,bytes32 commit,uint256 timestamp,string metadataURI,uint256 nonce)");
    bytes32 private _DOMAIN_SEPARATOR;

    // 防重放的 nonce（可按地址或按签名者，这里使用递增 nonce）
    mapping(address => uint256) public nonces;

    // 授权签名者（后端签名者）
    address public authorizedSigner;
    
    // 事件定义
    event CommitMinted(
        uint256 indexed tokenId,
        address indexed to,
        string repo,
        string commit,
        uint256 linesAdded,
        bool testsPass,
        bool merged
    );
    
    event BatchMinted(
        address indexed to,
        uint256[] tokenIds,
        uint256 gasLeft
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

        uint256 chainId;
        assembly { chainId := chainid() }
        _DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)),
            keccak256(bytes("1")),
            chainId,
            address(this)
        ));
    }

    // 设置授权签名者（只有 owner）
    function setAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigner = signer;
    }

    // 获取 domain separator
    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return _DOMAIN_SEPARATOR;
    }
    
    /**
     * @dev 铸造单个commit NFT
     * @param to 接收者地址
     * @param commitData commit数据
     * @param metadataURI 元数据URI
     */
    function mintCommit(
        address to,
        CommitData memory commitData,
        string memory metadataURI
    ) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(!_mintedCommits[commitData.commit], "Commit already minted");
        require(_tokenIdCounter.current() <= MAX_SUPPLY, "Max supply exceeded");
        // 输入校验：commit 与 metadataURI 不可为空，限制长度以防恶意大字符串
        require(bytes(commitData.commit).length > 0, "Commit hash required");
        require(bytes(commitData.commit).length <= 256, "Commit hash too long");
        require(bytes(metadataURI).length > 0, "metadataURI required");
        require(_userTokenCount[to] + 1 <= MAX_MINTS_PER_ADDRESS, "Recipient mint limit exceeded");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // 存储commit数据
        _commitData[tokenId] = commitData;
        _mintedCommits[commitData.commit] = true;
        _userTokenCount[to]++;
        
        // 铸造NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit CommitMinted(
            tokenId,
            to,
            commitData.repo,
            commitData.commit,
            commitData.linesAdded,
            commitData.testsPass,
            commitData.merged
        );
    }

    // 内部统一的铸造逻辑，避免代码重复（假设已通过校验）
    function _mintCommitInternal(
        address to,
        CommitData memory commitData,
        string memory metadataURI
    ) internal {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // 存储commit数据
        _commitData[tokenId] = commitData;
        _mintedCommits[commitData.commit] = true;
        _userTokenCount[to]++;

        // 铸造NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit CommitMinted(
            tokenId,
            to,
            commitData.repo,
            commitData.commit,
            commitData.linesAdded,
            commitData.testsPass,
            commitData.merged
        );
    }

    // 使用后端签名进行铸造（EIP-712）
    function mintWithSignature(
        address to,
        CommitData memory commitData,
        string memory metadataURI,
        uint256 timestamp,
        uint256 nonce,
        bytes memory signature
    ) external whenNotPaused nonReentrant {
        require(authorizedSigner != address(0), "Authorized signer not set");
        require(to != address(0), "Invalid recipient address");
        require(!_mintedCommits[commitData.commit], "Commit already minted");
        require(_tokenIdCounter.current() <= MAX_SUPPLY, "Max supply exceeded");
        require(bytes(commitData.commit).length > 0, "Commit hash required");
        require(bytes(commitData.commit).length <= 256, "Commit hash too long");
        require(bytes(metadataURI).length > 0, "metadataURI required");
        require(_userTokenCount[to] + 1 <= MAX_MINTS_PER_ADDRESS, "Recipient mint limit exceeded");

        // 验证 nonce 匹配
        require(nonce == nonces[authorizedSigner] + 1, "Invalid nonce");

        // 构造 digest
        bytes32 structHash = keccak256(abi.encode(
            MINT_TYPEHASH,
            to,
            keccak256(bytes(commitData.commit)),
            timestamp,
            keccak256(bytes(metadataURI)),
            nonce
        ));

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _DOMAIN_SEPARATOR, structHash));

        // 恢复签名者
        address signer = recoverSigner(digest, signature);
        require(signer == authorizedSigner, "Invalid signer");

        // 更新时间戳/nonce
        nonces[authorizedSigner] = nonce;

        // 调用内部铸造
        _mintCommitInternal(to, commitData, metadataURI);
    }

    // ECDSA 签名恢复函数（简化实现）
    function recoverSigner(bytes32 digest, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        require(v == 27 || v == 28, "Invalid v value");
        return ecrecover(digest, v, r, s);
    }
    
    /**
     * @dev 批量铸造commit NFT（gas优化）
     * @param to 接收者地址
     * @param commitsData commit数据数组
     * @param metadataURIs 元数据URI数组
     */
    function batchMintCommits(
        address to,
        CommitData[] memory commitsData,
        string[] memory metadataURIs
    ) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(commitsData.length == metadataURIs.length, "Arrays length mismatch");
        require(commitsData.length <= 50, "Batch size too large"); // 限制批量大小
        
        uint256[] memory tokenIds = new uint256[](commitsData.length);

    // 简单输入校验
    require(commitsData.length > 0, "Empty array");
    require(_userTokenCount[to] + commitsData.length <= MAX_MINTS_PER_ADDRESS, "Recipient mint limit exceeded");
        
        for (uint256 i = 0; i < commitsData.length; i++) {
            require(!_mintedCommits[commitsData[i].commit], "Commit already minted");
            require(_tokenIdCounter.current() <= MAX_SUPPLY, "Max supply exceeded");
            require(bytes(commitsData[i].commit).length > 0, "Commit hash required");
            require(bytes(commitsData[i].commit).length <= 256, "Commit hash too long");
            require(bytes(metadataURIs[i]).length > 0, "metadataURI required");
            
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            // 存储commit数据
            _commitData[tokenId] = commitsData[i];
            _mintedCommits[commitsData[i].commit] = true;
            tokenIds[i] = tokenId;
            
            // 铸造NFT
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, metadataURIs[i]);
        }
        
        _userTokenCount[to] += commitsData.length;
        
        emit BatchMinted(to, tokenIds, gasleft());
    }
    
    /**
     * @dev 获取commit数据
     * @param tokenId token ID
     * @return commitData commit数据
     */
    function getCommitData(uint256 tokenId) external view returns (CommitData memory) {
        require(_exists(tokenId), "Token does not exist");
        return _commitData[tokenId];
    }
    
    /**
     * @dev 检查commit是否已被铸造
     * @param commitHash commit哈希
     * @return 是否已铸造
     */
    function isCommitMinted(string memory commitHash) external view returns (bool) {
        return _mintedCommits[commitHash];
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
    function emergencyWithdraw() external onlyOwner nonReentrant {
        // 使用 call 更稳健地转账并防止因接收合约需要更多 gas 而失败
        uint256 bal = address(this).balance;
        (bool ok, ) = payable(owner()).call{value: bal}("");
        require(ok, "Withdraw failed");
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