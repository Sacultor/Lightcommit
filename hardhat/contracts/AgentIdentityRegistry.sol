// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AgentIdentityRegistry is Ownable, Pausable {
    struct AgentProfile {
        address wallet;
        string githubUsername;
        string agentCardURI;
        uint256 registeredAt;
        bool active;
    }
    
    mapping(address => AgentProfile) public agents;
    mapping(string => address) public githubToWallet;
    mapping(address => bool) public isRegistered;
    
    uint256 public totalAgents;
    
    event AgentRegistered(
        address indexed wallet,
        string githubUsername,
        string agentCardURI,
        uint256 timestamp
    );
    
    event AgentUpdated(
        address indexed wallet,
        string newAgentCardURI,
        uint256 timestamp
    );
    
    event AgentDeactivated(
        address indexed wallet,
        uint256 timestamp
    );
    
    constructor() {}
    
    function registerAgent(
        string memory githubUsername,
        string memory agentCardURI
    ) external whenNotPaused {
        require(!isRegistered[msg.sender], "Agent already registered");
        require(githubToWallet[githubUsername] == address(0), "GitHub username already bound");
        require(bytes(githubUsername).length > 0, "Invalid GitHub username");
        require(bytes(agentCardURI).length > 0, "Invalid agent card URI");
        
        agents[msg.sender] = AgentProfile({
            wallet: msg.sender,
            githubUsername: githubUsername,
            agentCardURI: agentCardURI,
            registeredAt: block.timestamp,
            active: true
        });
        
        githubToWallet[githubUsername] = msg.sender;
        isRegistered[msg.sender] = true;
        totalAgents++;
        
        emit AgentRegistered(msg.sender, githubUsername, agentCardURI, block.timestamp);
    }
    
    function updateAgentCard(string memory newAgentCardURI) external whenNotPaused {
        require(isRegistered[msg.sender], "Agent not registered");
        require(agents[msg.sender].active, "Agent is deactivated");
        require(bytes(newAgentCardURI).length > 0, "Invalid agent card URI");
        
        agents[msg.sender].agentCardURI = newAgentCardURI;
        
        emit AgentUpdated(msg.sender, newAgentCardURI, block.timestamp);
    }
    
    function deactivateAgent() external {
        require(isRegistered[msg.sender], "Agent not registered");
        require(agents[msg.sender].active, "Agent already deactivated");
        
        agents[msg.sender].active = false;
        
        emit AgentDeactivated(msg.sender, block.timestamp);
    }
    
    function getAgentByAddress(address wallet) external view returns (AgentProfile memory) {
        require(isRegistered[wallet], "Agent not registered");
        return agents[wallet];
    }
    
    function getAgentByGithub(string memory githubUsername) external view returns (AgentProfile memory) {
        address wallet = githubToWallet[githubUsername];
        require(wallet != address(0), "GitHub username not bound");
        return agents[wallet];
    }
    
    function isAgentActive(address wallet) external view returns (bool) {
        return isRegistered[wallet] && agents[wallet].active;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
