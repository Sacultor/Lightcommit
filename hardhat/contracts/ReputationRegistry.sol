// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract ReputationRegistry is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;
    
    bytes32 public constant EVALUATOR_ROLE = keccak256("EVALUATOR_ROLE");
    
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
    
    mapping(bytes32 => Feedback) public feedbacks;
    mapping(address => uint256) public contributorTotalScore;
    mapping(address => uint256) public contributorFeedbackCount;
    mapping(bytes32 => bool) public processedCommits;
    
    uint256 public totalFeedbacks;
    
    bytes32 private constant FEEDBACK_TYPEHASH = keccak256(
        "Feedback(address contributor,string repo,string commitSha,uint256 score,bytes32 feedbackHash,uint256 timestamp,uint256 nonce)"
    );
    
    mapping(address => uint256) public nonces;
    
    event FeedbackSubmitted(
        bytes32 indexed commitHash,
        address indexed contributor,
        string repo,
        string commitSha,
        uint256 score,
        bytes32 feedbackHash,
        string metadataURI,
        address evaluator,
        uint256 timestamp
    );
    
    event ReputationUpdated(
        address indexed contributor,
        uint256 newTotalScore,
        uint256 feedbackCount,
        uint256 averageScore
    );
    
    constructor() EIP712("LightCommit Reputation", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EVALUATOR_ROLE, msg.sender);
    }
    
    function submitFeedback(
        address contributor,
        string memory repo,
        string memory commitSha,
        uint256 score,
        bytes32 feedbackHash,
        string memory metadataURI,
        bytes memory signature
    ) external whenNotPaused nonReentrant {
        require(contributor != address(0), "Invalid contributor address");
        require(score <= 100, "Score must be <= 100");
        require(bytes(repo).length > 0, "Invalid repo");
        require(bytes(commitSha).length > 0, "Invalid commit SHA");
        
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        require(!processedCommits[commitHash], "Commit already processed");
        
        bytes32 structHash = keccak256(
            abi.encode(
                FEEDBACK_TYPEHASH,
                contributor,
                keccak256(bytes(repo)),
                keccak256(bytes(commitSha)),
                score,
                feedbackHash,
                block.timestamp,
                nonces[contributor]
            )
        );
        
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);
        
        require(hasRole(EVALUATOR_ROLE, signer), "Invalid signature: not an evaluator");
        
        feedbacks[commitHash] = Feedback({
            contributor: contributor,
            repo: repo,
            commitSha: commitSha,
            feedbackHash: feedbackHash,
            score: score,
            timestamp: block.timestamp,
            evaluator: signer,
            exists: true
        });
        
        processedCommits[commitHash] = true;
        nonces[contributor]++;
        totalFeedbacks++;
        
        contributorTotalScore[contributor] += score;
        contributorFeedbackCount[contributor]++;
        
        emit FeedbackSubmitted(
            commitHash,
            contributor,
            repo,
            commitSha,
            score,
            feedbackHash,
            metadataURI,
            signer,
            block.timestamp
        );
        
        emit ReputationUpdated(
            contributor,
            contributorTotalScore[contributor],
            contributorFeedbackCount[contributor],
            getAverageScore(contributor)
        );
    }
    
    function getFeedback(bytes32 commitHash) external view returns (Feedback memory) {
        require(feedbacks[commitHash].exists, "Feedback not found");
        return feedbacks[commitHash];
    }
    
    function getFeedbackByCommit(
        string memory repo,
        string memory commitSha
    ) external view returns (Feedback memory) {
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        require(feedbacks[commitHash].exists, "Feedback not found");
        return feedbacks[commitHash];
    }
    
    function getContributorReputation(address contributor) external view returns (
        uint256 totalScore,
        uint256 feedbackCount,
        uint256 averageScore
    ) {
        totalScore = contributorTotalScore[contributor];
        feedbackCount = contributorFeedbackCount[contributor];
        averageScore = getAverageScore(contributor);
    }
    
    function getAverageScore(address contributor) public view returns (uint256) {
        if (contributorFeedbackCount[contributor] == 0) {
            return 0;
        }
        return contributorTotalScore[contributor] / contributorFeedbackCount[contributor];
    }
    
    function isCommitProcessed(string memory repo, string memory commitSha) external view returns (bool) {
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        return processedCommits[commitHash];
    }
    
    function grantEvaluatorRole(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(EVALUATOR_ROLE, evaluator);
    }
    
    function revokeEvaluatorRole(address evaluator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(EVALUATOR_ROLE, evaluator);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

