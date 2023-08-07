// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./MerkleChild.sol";

contract MerkleFactory is Ownable {
    using ECDSA for bytes32;

    mapping(address => address[]) private tokenAirdrops;
    mapping(address => address[]) private creatorAirdrops;
    mapping(address => string) public airdropUserList;
    address[] private allAirdrops;

    IERC20 public immutable weth;
    uint256 public creatorFee = 0.01 ether;
    uint256 public claimFee = 0.003 ether;
    address payable public feeAddress;

    uint256 public minClaimPeriod = 14 days;
    uint256 public maxClaimPeriod = 90 days;
    address private _validator;

    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(address verifyingContract)");

    bytes32 public domainSeparator =
        keccak256(abi.encode(DOMAIN_TYPEHASH, address(this)));

    constructor(address _weth, address validator) {
        weth = IERC20(_weth);
        feeAddress = payable(msg.sender);
        _validator = validator;
    }

    function createNewAirdrop(
        bool _isPayingInToken,
        address _token,
        uint256 _amount,
        uint256 _startDate,
        uint256 _endDate,
        string memory _url,
        bytes32 _merkleRoot,
        uint256 discount,
        bytes memory signature,
        uint256 validity
    ) external payable {
        uint256 duration = _endDate - _startDate;
        require(
            duration >= minClaimPeriod && duration <= maxClaimPeriod,
            "Invalid duration to claim airdrop"
        );
        require(_amount > 0, "Zero amount");
        uint256 fee = creatorFee;
        if (discount > 0) {
            require(validity >= block.timestamp, "Merkle Factory: Signature");
            bytes32 msgHash = getHash(msg.sender, discount, validity);
            require(
                msgHash.recover(signature) == _validator,
                "Merkle Factory: Invalid signature."
            );
            fee = (fee * (100 - discount)) / 100;
        }
        MerkleChild newAirdrop = new MerkleChild(
            _token,
            payable(msg.sender),
            feeAddress,
            _startDate,
            _endDate,
            _merkleRoot
        );
        airdropUserList[address(newAirdrop)] = _url;

        if (_isPayingInToken) {
            weth.transferFrom(msg.sender, feeAddress, fee);
        } else {
            require(msg.value >= fee, "Fees not paid");
            feeAddress.transfer(fee);
        }

        allAirdrops.push(address(newAirdrop));
        tokenAirdrops[_token].push(address(newAirdrop));
        creatorAirdrops[msg.sender].push(address(newAirdrop));

        if (_token == address(0)) {
            /* solhint-disable-next-line */
            (bool success, ) = address(newAirdrop).call{value: _amount}("");
            require(success, "");
        } else {
            IERC20(_token).transferFrom(
                msg.sender,
                address(newAirdrop),
                _amount
            );
        }
    }

    function setFees(
        address payable _newAddress,
        uint256 _creatorFee,
        uint256 _claimFee
    ) external onlyOwner {
        feeAddress = _newAddress;
        creatorFee = _creatorFee;
        claimFee = _claimFee;
    }

    function setClaimPeriod(uint256 min, uint256 max) external onlyOwner {
        minClaimPeriod = min;
        maxClaimPeriod = max;
    }

    function getAllTokenAirdrops(
        address _token
    ) public view returns (address[] memory) {
        return tokenAirdrops[_token];
    }

    function getAllCreatorAirdrops(
        address _creator
    ) public view returns (address[] memory) {
        return creatorAirdrops[_creator];
    }

    function getAllAirdrops() public view returns (address[] memory) {
        return allAirdrops;
    }

    function getAllAirdropsByIndex(
        uint256 startIdx,
        uint256 endIdx
    ) public view returns (address[] memory) {
        if (endIdx > allAirdrops.length - 1) {
            endIdx = allAirdrops.length - 1;
        }
        address[] memory list = new address[](endIdx - startIdx + 1);
        uint256 counter = 0;

        for (uint256 i = startIdx; i <= endIdx; i++) {
            list[counter] = allAirdrops[i];
            counter++;
        }
        return list;
    }

    function getHash(
        address user,
        uint256 discount,
        uint256 validity
    ) public view returns (bytes32 hash) {
        hash = keccak256(
            abi.encodePacked(domainSeparator, user, discount, validity)
        );
    }

    function setValidator(address validator) public {
        require(_msgSender() == _validator, "Validator wut?");
        _validator = validator;
    }
}
