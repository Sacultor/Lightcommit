// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./mint.sol";

interface IReputationRegistry {
    struct Feedback {
        address contributor;
        string repo;
        string commitSha;
        bytes32 feedbackHash;
        uint256 score;
        uint256 timestamp;
        address evaluator;
        bool exists;
    }
    
    function getFeedbackByCommit(string memory repo, string memory commitSha) external view returns (Feedback memory);
}


contract ValidationRegistry is AccessControl, Pausable, ReentrancyGuard {
    CommitNFT public immutable nftContract;
    IReputationRegistry public immutable reputationRegistry;
    
    uint256 public mintThreshold;
    uint256 public constant MAX_MINT_THRESHOLD = 100;
    uint256 public constant MIN_MINT_THRESHOLD = 60;
    
    mapping(bytes32 => bool) public isMinted;
    mapping(bytes32 => uint256) public commitToTokenId;
    
    uint256 public totalValidations;
    uint256 public totalMints;
    
    event ValidationRequested(
        bytes32 indexed commitHash,
        address indexed contributor,
        string repo,
        string commitSha,
        uint256 score,
        uint256 timestamp
    );
    
    event ValidationCompleted(
        bytes32 indexed commitHash,
        bool approved,
        uint256 score,
        uint256 threshold,
        uint256 timestamp
    );
    
    event MintTriggered(
        bytes32 indexed commitHash,
        uint256 indexed tokenId,
        address indexed contributor,
        uint256 score,
        string metadataURI,
        uint256 timestamp
    );
    
    event ThresholdUpdated(
        uint256 oldThreshold,
        uint256 newThreshold,
        uint256 timestamp
    );
    
    error InvalidAddress();
    error InvalidInput();
    error AlreadyMinted();
    error FeedbackNotFound();
    error InvalidThreshold();
    
    constructor(address _nftContract, address _reputationRegistry) {
        if (_nftContract == address(0)) revert InvalidAddress();
        if (_reputationRegistry == address(0)) revert InvalidAddress();
        
        nftContract = CommitNFT(_nftContract);
        reputationRegistry = IReputationRegistry(_reputationRegistry);
        mintThreshold = 80;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function requestValidation(
        string calldata repo,
        string calldata commitSha,
        address contributor,
        string calldata metadataURI
    ) external whenNotPaused nonReentrant returns (bool didMint) {
        if (bytes(repo).length == 0) revert InvalidInput();
        if (bytes(commitSha).length == 0) revert InvalidInput();
        if (contributor == address(0)) revert InvalidAddress();
        
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        
        if (isMinted[commitHash]) revert AlreadyMinted();
        
        IReputationRegistry.Feedback memory feedback = reputationRegistry.getFeedbackByCommit(repo, commitSha);
        
        if (!feedback.exists) revert FeedbackNotFound();
        emit ValidationRequested(
            commitHash,
            contributor,
            repo,
            commitSha,
            feedback.score,
            block.timestamp
        );
        
        totalValidations++;

        bool shouldMint = feedback.score >= mintThreshold;
        
        emit ValidationCompleted(
            commitHash,
            shouldMint,
            feedback.score,
            mintThreshold,
            block.timestamp
        );
        
        if (shouldMint) {
            isMinted[commitHash] = true;

            uint256 tokenId = _triggerMint(
                contributor,
                repo,
                commitSha,
                feedback,
                metadataURI
            );
            
            commitToTokenId[commitHash] = tokenId;
            totalMints++;
            
            emit MintTriggered(
                commitHash,
                tokenId,
                contributor,
                feedback.score,
                metadataURI,
                block.timestamp
            );

            return true; // didMint = true
        }
        
        return false; // didMint = false
    }
    
    function _triggerMint(
        address to,
        string calldata repo,
        string calldata commitSha,
        IReputationRegistry.Feedback memory feedback,
        string calldata metadataURI
    ) internal returns (uint256) {
        CommitNFT.CommitData memory commitData = CommitNFT.CommitData({
            repo: string(repo),
            commit: string(commitSha),
            linesAdded: 0,
            linesDeleted: 0,
            testsPass: feedback.score >= mintThreshold,
            timestamp: feedback.timestamp,
            author: _addressToString(to),
            message: string(abi.encodePacked("Score: ", _uintToString(feedback.score))),
            merged: true
        });
        
        nftContract.mintCommit(to, commitData, metadataURI);
        
        return nftContract.getCurrentTokenId() - 1;
    }
    
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function setMintThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newThreshold < MIN_MINT_THRESHOLD || newThreshold > MAX_MINT_THRESHOLD) {
            revert InvalidThreshold();
        }
        
        uint256 oldThreshold = mintThreshold;
        mintThreshold = newThreshold;
        
        emit ThresholdUpdated(oldThreshold, newThreshold, block.timestamp);
    }
    
    function getValidationStatus(
        string calldata repo,
        string calldata commitSha
    ) external view returns (
        bool hasBeenMinted,
        uint256 tokenId
    ) {
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        tokenId = commitToTokenId[commitHash];
        hasBeenMinted = tokenId != 0;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}