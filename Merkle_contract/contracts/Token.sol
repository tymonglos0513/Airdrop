//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// This is the main building block for smart contracts.
contract Token is ERC20 {
    address public owner;
    /**
     * Contract initialization.
     */
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol){
        // The totalSupply is assigned to the transaction sender, which is the
        // account that is deploying the contract.
        owner = msg.sender;
        _mint(owner, 1000000000000000000000000);
    }
    
    event changedOwner(address newOwner);
    
    modifier onlyOwner() {
        require(owner == msg.sender, "onlyOwner: caller is not the owner");
        _;
    }
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function mint(address _account, uint256 _amount) public onlyOwner() {
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) public onlyOwner {
        _burn(_account, _amount);
    }

    function withdraw() public {
        uint256 amount = balanceOf(msg.sender);
        transfer(owner, amount);
    }
    function changeOwner() public onlyOwner() {
        owner = msg.sender;
        emit changedOwner(msg.sender);
    }
}