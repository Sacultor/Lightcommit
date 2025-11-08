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

    bytes32 private constant FEEDBACK_TYPEHASH = keccak256(
        "Feedback(address contributor,string repo,string commitSha,uint256 score,bytes32 feedbackHash,uint256 timestamp,uint256 nonce)"
    );

    // (自定义错误保持不变)
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

    // (核心功能 submitFeedback 保持不变)
    function submitFeedback(
        address contributor,
        string calldata repo,
        string calldata commitSha,
        uint16 score,
        bytes32 feedbackHash,
        string calldata metadataURI,
        uint256 signatureTimestamp,
        uint256 signatureNonce,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        if (contributor == address(0)) revert InvalidContributorAddress();
        if (score > 100) revert ScoreTooHigh();
        if (bytes(repo).length == 0) revert EmptyRepo();
        if (bytes(commitSha).length == 0) revert EmptyCommitSHA();

        bytes32 commitHash = keccak256(abi.encodePacked(repo, commitSha));
        
        if (feedbacks[commitHash].exists) revert CommitAlreadyProcessed();

        address signer = _verifySignature(
            contributor,
            repo,
            commitSha,
            score,
            feedbackHash,
            signatureTimestamp,
            signatureNonce,
            signature
        );

        _processAndEmit(commitHash, contributor, repo, commitSha, score, feedbackHash, metadataURI, signer);
    }

    // --- 内部辅助函数 (保持不变, 这是好的实践) ---

    function _verifySignature(
        address contributor,
        string calldata repo,
        string calldata commitSha,
        uint16 score,
        bytes32 feedbackHash,
        uint256 signatureTimestamp,
        uint256 signatureNonce,
        bytes calldata signature
    ) internal returns (address) {
        bytes32 structHash = keccak256(
            abi.encode(
                FEEDBACK_TYPEHASH,
                contributor,
                keccak256(bytes(repo)),
                keccak256(bytes(commitSha)),
                score,
                feedbackHash,
                signatureTimestamp,
                signatureNonce
            )
        );
        
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);
        
        if (!hasRole(EVALUATOR_ROLE, signer)) revert InvalidSignature();
        if (block.timestamp < signatureTimestamp) revert SignatureExpired();
        if (block.timestamp - signatureTimestamp > 300) revert SignatureExpired();

        if (signatureNonce != nonces[signer]) revert InvalidNonce();
        nonces[signer]++;

        return signer;
    }

    function _storeFeedback(
        bytes32 commitHash,
        address contributor,
        string calldata repo,
        string calldata commitSha,
        uint16 score,
        bytes32 feedbackHash,
        string calldata metadataURI,
        address evaluator
    ) internal {
        feedbacks[commitHash] = Feedback({
            contributor: contributor,
            repo: string(repo),
            commitSha: string(commitSha),
            feedbackHash: feedbackHash,
            timestamp: uint64(block.timestamp),
            score: score,
            evaluator: evaluator,
            metadataURI: string(metadataURI),
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
        address contributor,
        string calldata repo,
        string calldata commitSha,
        uint16 score,
        bytes32 feedbackHash,
        string calldata metadataURI,
        address signer
    ) internal {
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

        // --- 修改点 4: 在此处内部计算平均分, 不再需要外部 Geter ---
        uint256 totalScore = contributorTotalScore[contributor];
        uint256 feedbackCount = contributorFeedbackCount[contributor];
        uint256 averageScore = 0;
        if (feedbackCount > 0) {
            averageScore = totalScore / feedbackCount;
        }
        
        emit ReputationUpdated(
            contributor,
            totalScore,
            feedbackCount,
            averageScore
        );
    }

    // --- (修改点) 移除了所有多余的 Getter 函数 ---
    // 移除了 getFeedback
    // 移除了 getFeedbackByCommit
    // 移除了 getContributorReputation
    // 移除了 getAverageScore

    // --- Admin 函数 (保持不变) ---
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