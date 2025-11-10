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

    // (结构体优化保持不变)
    struct Feedback {
        address contributor;
        string repo;
        string commitSha;
        bytes32 feedbackHash;
        uint64 timestamp;
        uint16 score;
        address evaluator;
        string metadataURI;
        bool exists;
    }

    // 关键: 这些 `public` mapping 已经提供了 Getter
    mapping(bytes32 => Feedback) public feedbacks;
    mapping(address => uint256) public contributorTotalScore;
    mapping(address => uint256) public contributorFeedbackCount;

    uint256 public totalFeedbacks;
    mapping(address => uint256) public nonces; // 签名者的 Nonce

    struct SubmitParams {
        address contributor;
        string repo;
        string commitSha;
        uint16 score;
        bytes32 feedbackHash;
        string metadataURI;
        uint256 timestamp;
        uint256 nonce;
    }
    
    bytes32 private constant FEEDBACK_TYPEHASH = keccak256(
        "Feedback(address contributor,string repo,string commitSha,uint256 score,bytes32 feedbackHash,uint256 timestamp,uint256 nonce)"
    );
    error InvalidContributorAddress();
    error ScoreTooHigh();
    error EmptyRepo();
    error EmptyCommitSHA();
    error CommitAlreadyProcessed();
    error InvalidSignature();
    error SignatureExpired();
    error InvalidNonce();
    error FeedbackNotFound(); // <-- (现在只在内部使用，或由客户端处理)

    // (事件保持不变)
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
        SubmitParams calldata params,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        if (params.contributor == address(0)) revert InvalidContributorAddress();
        if (params.score > 100) revert ScoreTooHigh();
        if (bytes(params.repo).length == 0) revert EmptyRepo();
        if (bytes(params.commitSha).length == 0) revert EmptyCommitSHA();

        bytes32 commitHash = keccak256(abi.encodePacked(params.repo, params.commitSha));
        
        if (feedbacks[commitHash].exists) revert CommitAlreadyProcessed();

        address signer = _verifySignature(params, signature);

        _storeFeedback(commitHash, params, signer);

        _updateReputation(params.contributor, params.score);
        
        _emitEvents(commitHash, params, signer);
    }

    function _verifySignature(
        SubmitParams calldata params,
        bytes calldata signature
    ) internal returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    FEEDBACK_TYPEHASH,
                    params.contributor,
                    keccak256(bytes(params.repo)),
                    keccak256(bytes(params.commitSha)),
                    params.score,
                    params.feedbackHash,
                    params.timestamp,
                    params.nonce
                )
            )
        );
        
        address signer = digest.recover(signature);
        
        if (!hasRole(EVALUATOR_ROLE, signer)) revert InvalidSignature();
        if (block.timestamp < params.timestamp) revert SignatureExpired();
        if (block.timestamp - params.timestamp > 300) revert SignatureExpired();

        if (params.nonce != nonces[signer]) revert InvalidNonce();
        nonces[signer]++;

        return signer;
    }

    function _storeFeedback(
        bytes32 commitHash,
        SubmitParams calldata params,
        address evaluator
    ) internal {
        feedbacks[commitHash] = Feedback({
            contributor: params.contributor,
            repo: string(params.repo),
            commitSha: string(params.commitSha),
            feedbackHash: params.feedbackHash,
            timestamp: uint64(block.timestamp),
            score: params.score,
            evaluator: evaluator,
            metadataURI: string(params.metadataURI),
            exists: true
        });
        
        totalFeedbacks++;
    }

    function _updateReputation(address contributor, uint16 score) internal {
        contributorTotalScore[contributor] += score;
        contributorFeedbackCount[contributor]++;
    }

    function _emitEvents(
        bytes32 commitHash,
        SubmitParams calldata params,
        address signer
    ) internal {
        emit FeedbackSubmitted(
            commitHash,
            params.contributor,
            params.repo,
            params.commitSha,
            params.score,
            params.feedbackHash,
            params.metadataURI,
            signer,
            block.timestamp
        );

        uint256 totalScore = contributorTotalScore[params.contributor];
        uint256 feedbackCount = contributorFeedbackCount[params.contributor];
        uint256 averageScore = feedbackCount > 0 ? totalScore / feedbackCount : 0;
        
        emit ReputationUpdated(
            params.contributor,
            totalScore,
            feedbackCount,
            averageScore
        );
    }

    function getFeedbackByCommit(
        string memory repo,
        string memory commitSha
    ) external view returns (Feedback memory) {
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        if (!feedbacks[commitHash].exists) revert FeedbackNotFound();
        return feedbacks[commitHash];
    }
    
    function getContributorReputation(address contributor) external view returns (
        uint256 totalScore,
        uint256 feedbackCount,
        uint256 averageScore
    ) {
        totalScore = contributorTotalScore[contributor];
        feedbackCount = contributorFeedbackCount[contributor];
        if (feedbackCount > 0) {
            averageScore = totalScore / feedbackCount;
        }
    }
    
    function isCommitProcessed(string memory repo, string memory commitSha) external view returns (bool) {
        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        return feedbacks[commitHash].exists;
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