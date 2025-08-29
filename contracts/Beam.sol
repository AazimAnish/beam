// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Beam is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable usdcToken;
    
    struct Transfer {
        address sender;
        address recipient;
        uint256 amount;
        bytes32 claimHash;
        bool claimed;
        uint256 timestamp;
    }
    
    mapping(bytes32 => Transfer) public transfers;
    mapping(address => uint256) public sponsorFunds;
    
    event TransferCreated(
        bytes32 indexed claimHash,
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    
    event TransferClaimed(
        bytes32 indexed claimHash,
        address indexed recipient,
        uint256 amount
    );
    
    event SponsorDeposit(address indexed sponsor, uint256 amount);
    event SponsorWithdraw(address indexed sponsor, uint256 amount);
    
    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
    }
    
    function createTransfer(
        address _recipient,
        uint256 _amount,
        bytes32 _claimHash
    ) external whenNotPaused nonReentrant {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be greater than 0");
        require(transfers[_claimHash].sender == address(0), "Claim hash already exists");
        
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        transfers[_claimHash] = Transfer({
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            claimHash: _claimHash,
            claimed: false,
            timestamp: block.timestamp
        });
        
        emit TransferCreated(_claimHash, msg.sender, _recipient, _amount);
    }
    
    function claimTransfer(bytes32 _claimHash) external whenNotPaused nonReentrant {
        Transfer storage transfer = transfers[_claimHash];
        require(transfer.sender != address(0), "Transfer does not exist");
        require(!transfer.claimed, "Transfer already claimed");
        require(transfer.recipient == msg.sender, "Not authorized to claim");
        
        transfer.claimed = true;
        
        require(
            usdcToken.transfer(transfer.recipient, transfer.amount),
            "Transfer failed"
        );
        
        emit TransferClaimed(_claimHash, transfer.recipient, transfer.amount);
    }
    
    function sponsorDeposit(uint256 _amount) external whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        sponsorFunds[msg.sender] += _amount;
        emit SponsorDeposit(msg.sender, _amount);
    }
    
    function sponsorWithdraw(uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(sponsorFunds[msg.sender] >= _amount, "Insufficient sponsor funds");
        
        sponsorFunds[msg.sender] -= _amount;
        
        require(
            usdcToken.transfer(msg.sender, _amount),
            "Transfer failed"
        );
        
        emit SponsorWithdraw(msg.sender, _amount);
    }
    
    function sponsorClaim(bytes32 _claimHash, address _recipient) external whenNotPaused nonReentrant {
        Transfer storage transfer = transfers[_claimHash];
        require(transfer.sender != address(0), "Transfer does not exist");
        require(!transfer.claimed, "Transfer already claimed");
        require(sponsorFunds[msg.sender] >= transfer.amount, "Insufficient sponsor funds");
        
        transfer.claimed = true;
        sponsorFunds[msg.sender] -= transfer.amount;
        
        require(
            usdcToken.transfer(_recipient, transfer.amount),
            "Transfer failed"
        );
        
        emit TransferClaimed(_claimHash, _recipient, transfer.amount);
    }
    
    function getTransfer(bytes32 _claimHash) external view returns (
        address sender,
        address recipient,
        uint256 amount,
        bool claimed,
        uint256 timestamp
    ) {
        Transfer memory transfer = transfers[_claimHash];
        return (
            transfer.sender,
            transfer.recipient,
            transfer.amount,
            transfer.claimed,
            transfer.timestamp
        );
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(usdcToken.transfer(owner(), balance), "Transfer failed");
    }
}