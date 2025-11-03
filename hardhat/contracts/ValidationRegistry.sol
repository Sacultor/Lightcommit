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
    function isCommitProcessed(string memory repo, string memory commitSha) external view returns (bool);
}

contract ValidationRegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    CommitNFT public nftContract;
    IReputationRegistry public reputationRegistry;
    
    uint256 public mintThreshold = 80;
    uint256 public maxMintThreshold = 100;
    uint256 public minMintThreshold = 60;
    
    mapping(bytes32 => bool) public validated;
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
    
    constructor(address _nftContract, address _reputationRegistry) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_reputationRegistry != address(0), "Invalid reputation registry");
        
        nftContract = CommitNFT(_nftContract);
        reputationRegistry = IReputationRegistry(_reputationRegistry);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
    }
    
    function requestValidation(
        string memory repo,
        string memory commitSha,
        address contributor,
        string memory metadataURI
    ) external whenNotPaused nonReentrant returns (bool shouldMint) {
        require(bytes(repo).length > 0, "Invalid repo");
        require(bytes(commitSha).length > 0, "Invalid commit SHA");
        require(contributor != address(0), "Invalid contributor");
        
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        require(!validated[commitHash], "Already validated");
        
        require(
            reputationRegistry.isCommitProcessed(repo, commitSha),
            "Feedback not submitted yet"
        );
        
        IReputationRegistry.Feedback memory feedback = reputationRegistry.getFeedbackByCommit(repo, commitSha);
        
        emit ValidationRequested(
            commitHash,
            contributor,
            repo,
            commitSha,
            feedback.score,
            block.timestamp
        );
        
        validated[commitHash] = true;
        totalValidations++;
        
        shouldMint = feedback.score >= mintThreshold;
        
        emit ValidationCompleted(
            commitHash,
            shouldMint,
            feedback.score,
            mintThreshold,
            block.timestamp
        );
        
        if (shouldMint) {
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
        }
        
        return shouldMint;
    }
    
    function _triggerMint(
        address to,
        string memory repo,
        string memory commitSha,
        IReputationRegistry.Feedback memory feedback,
        string memory metadataURI
    ) internal returns (uint256) {
        CommitNFT.CommitData memory commitData = CommitNFT.CommitData({
            repo: repo,
            commit: commitSha,
            linesAdded: 0,
            linesDeleted: 0,
            testsPass: feedback.score >= mintThreshold,
            timestamp: feedback.timestamp,
            author: addressToString(to),
            message: string(abi.encodePacked("Score: ", uintToString(feedback.score))),
            merged: true
        });
        
        nftContract.mintCommit(to, commitData, metadataURI);
        
        return nftContract.getCurrentTokenId() - 1;
    }
    
    function setMintThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newThreshold >= minMintThreshold, "Threshold too low");
        require(newThreshold <= maxMintThreshold, "Threshold too high");
        
        uint256 oldThreshold = mintThreshold;
        mintThreshold = newThreshold;
        
        emit ThresholdUpdated(oldThreshold, newThreshold, block.timestamp);
    }
    
    function setThresholdLimits(
        uint256 newMin,
        uint256 newMax
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMin < newMax, "Invalid limits");
        require(newMax <= 100, "Max too high");
        
        minMintThreshold = newMin;
        maxMintThreshold = newMax;
    }
    
    function getValidationStatus(
        string memory repo,
        string memory commitSha
    ) external view returns (
        bool isValidated,
        bool hasMinted,
        uint256 tokenId
    ) {
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        isValidated = validated[commitHash];
        tokenId = commitToTokenId[commitHash];
        hasMinted = tokenId != 0;
    }
    
    function grantValidatorRole(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VALIDATOR_ROLE, validator);
    }
    
    function revokeValidatorRole(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VALIDATOR_ROLE, validator);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function addressToString(address _addr) internal pure returns (string memory) {
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
    
    function uintToString(uint256 value) internal pure returns (string memory) {
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
}

