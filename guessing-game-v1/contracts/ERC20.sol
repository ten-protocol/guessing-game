//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20.sol";

contract ERC20 is IERC20 {
    string public constant name = "Obscuro Guessing Game";
    string public constant symbol = "OGG";
    uint8 public constant decimals = 0;
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;
    uint256 private _totalSupply = 10000 ether;
    address private _contractOwner;

    constructor() {
        balances[msg.sender] = _totalSupply;
        _contractOwner = msg.sender;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address tokenOwner) public view override returns (uint256) {
        require(tx.origin == tokenOwner || msg.sender == tokenOwner, "Only the token owner can see the balance.");

        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender], "ERC20 transfer must be less than balance.");

        balances[msg.sender] = balances[msg.sender] - numTokens;
        balances[receiver] = balances[receiver] + numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        assign(msg.sender, numTokens);
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public view override returns (uint) {
        require(tx.origin == owner || tx.origin == delegate, "Only the token owner or delegate can see the allowance.");

        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner], "ERC20 transfer from must be less than balance.");
        require(numTokens <= allowed[owner][msg.sender], "ERC20 transfer from must be less than allowance.");

        balances[owner] = balances[owner] - numTokens;
        allowed[owner][msg.sender] = allowed[owner][msg.sender] - numTokens;
        balances[buyer] = balances[buyer] + numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }

    function assign(address receiver, uint256 numTokens) private returns (bool) {
        require(numTokens <= balances[_contractOwner], "ERC20 assignment must be less than the contract creator balance.");

        balances[_contractOwner] = balances[_contractOwner] - numTokens;
        balances[receiver] = balances[receiver] + numTokens;
        return true;
    }

    // for conformance with hardhat and metamask
    receive() external payable {}
    fallback() external payable {}
}