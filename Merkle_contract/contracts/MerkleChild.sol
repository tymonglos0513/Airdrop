// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleChild {
    bytes32 public immutable merkleRoot;
    IERC20 internal immutable token;

    uint32 internal constant CLAIM_GAP = 1 days;
    uint32 internal constant CLAIM_PERIOD = 1 days;
    uint32 internal constant CLAIM_FEE = 5; //0.5%

    mapping(address => bool) public userClaimed;
    mapping(uint8 => bool) public creatorClaimed;
    mapping(uint8 => bool) public ownerClaimed;

    uint256 internal nonClaimedFunds;

    uint256 public startDate;
    uint256 public endDate;

    address internal creator;
    address internal owner;

    event Claim(address indexed to, uint256 amount);

    constructor(
        address _token,
        address _creator,
        address _owner,
        uint256 _startDate,
        uint256 _endDate,
        bytes32 _merkleRoot
    ) {
        merkleRoot = _merkleRoot;
        token = IERC20(_token);
        startDate = _startDate;
        endDate = _endDate;
        creator = _creator;
        owner = _owner;
    }

    function claim(uint256 amount, bytes32[] calldata proof) external {
        require(block.timestamp >= startDate && block.timestamp <= endDate, "Not Started/Expired");
        require(canUserClaim(msg.sender, amount, proof), "Invalid proof");
        require(!userClaimed[msg.sender], "Already claimed");

        userClaimed[msg.sender] = true;
        emit Claim(msg.sender, amount);

        uint256 fee = amount * CLAIM_FEE / 1000;
        token.transfer(owner,fee);
        amount -= fee;

        token.transfer(msg.sender, amount);
    }

    function creatorClaim(uint8 roundId) external {
        require(msg.sender == creator, "Not creator");
        require(canCreatorClaim(roundId), "Not in claim period");
        require(!creatorClaimed[roundId], "Already claimed");

        if (nonClaimedFunds == 0) {
            nonClaimedFunds = token.balanceOf(address(this));
        }

        creatorClaimed[roundId] = true;
        token.transfer(creator, nonClaimedFunds / 4);
    }

    function ownerClaim(uint8 roundId) external {
        require(msg.sender == owner, "Not owner");
        require(canCreatorClaim(roundId), "Not in claim period");
        require(!ownerClaimed[roundId], "Already claimed");

        if (nonClaimedFunds == 0) {
            nonClaimedFunds = token.balanceOf(address(this));
        }

        ownerClaimed[roundId] = true;
        token.transfer(owner, nonClaimedFunds / 4);
    }

    function canCreatorClaim(uint8 roundId) public view returns (bool) {
        uint256 start = endDate + (((2 * roundId) + 1) * CLAIM_GAP);
        uint256 end = start + CLAIM_PERIOD;

        return (block.timestamp >= start && block.timestamp <= end);
    }

    function canOwnerClaim(uint8 roundId) public view returns (bool) {
        uint256 end = endDate + (((2 * roundId) + 1) * CLAIM_GAP) + CLAIM_PERIOD;

        return (block.timestamp >= end && !creatorClaimed[roundId]);
    }

    function canUserClaim(
        address user,
        uint256 amount,
        bytes32[] calldata proof
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
        return isValidLeaf;
    }
}