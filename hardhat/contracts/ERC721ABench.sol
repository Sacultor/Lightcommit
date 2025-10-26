// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "erc721a/contracts/ERC721A.sol";

contract ERC721ABench is ERC721A {
    struct CommitData {
        string repo;
        string commit;
        uint256 linesAdded;
        uint256 linesDeleted;
        bool testsPass;
        uint256 timestamp;
        string author;
        string message;
        bool merged;
    }

    // commit 数据与 URI 存储
    mapping(uint256 => CommitData) private _commitData;
    mapping(string => bool) private _mintedCommits;
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function mintCommit(
        address to,
        CommitData memory commitData,
        string memory metadataURI
    ) external {
        require(to != address(0), "Invalid recipient");
        require(!_mintedCommits[commitData.commit], "Commit already minted");

        uint256 tokenId = _nextTokenId();
        _safeMint(to, 1);

        _commitData[tokenId] = commitData;
        _mintedCommits[commitData.commit] = true;
        _tokenURIs[tokenId] = metadataURI;
    }

    function batchMintCommits(
        address to,
        CommitData[] memory commitsData,
        string[] memory metadataURIs
    ) external {
        require(to != address(0), "Invalid recipient");
        require(commitsData.length == metadataURIs.length, "Arrays length mismatch");
        require(commitsData.length > 0, "Empty array");
        require(commitsData.length <= 50, "Batch size too large");

        uint256 startId = _nextTokenId();
        _safeMint(to, commitsData.length);

        for (uint256 i = 0; i < commitsData.length; i++) {
            require(!_mintedCommits[commitsData[i].commit], "Commit already minted");
            uint256 tokenId = startId + i;
            _commitData[tokenId] = commitsData[i];
            _mintedCommits[commitsData[i].commit] = true;
            _tokenURIs[tokenId] = metadataURIs[i];
        }
    }

    function getCommitData(uint256 tokenId) external view returns (CommitData memory) {
        require(_exists(tokenId), "Token does not exist");
        return _commitData[tokenId];
    }

    function isCommitMinted(string memory commitHash) external view returns (bool) {
        return _mintedCommits[commitHash];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}


