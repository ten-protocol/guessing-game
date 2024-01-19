//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20.sol";

contract Guess {
    address payable owner;
    uint8 private _target;
    address[] private _attemptAddresses;
    mapping(address => uint8) private _prevMisses;
    uint8 public guessRange;
    IERC20 public erc20;

    event GuessResult(address indexed player, uint allowance, uint prize, uint guess, string msg);

    constructor(uint8 range, address tokenAddress) {
        owner = payable(msg.sender);
        guessRange = range;
        erc20 = IERC20(tokenAddress);
        _setNewTarget();
    }

    function attempt(uint8 guess) public payable {
        require(erc20.allowance(msg.sender, address(this)) >= 1 ether, "Check the token allowance.");

        _attemptAddresses.push(msg.sender);
        erc20.transferFrom(msg.sender, address(this), 1 ether);
        if (guess == _target) {
            emit GuessResult(msg.sender, erc20.allowance(msg.sender, address(this)), prizePool(), guess, "correct! You won the prize of");
            erc20.transfer(msg.sender, prizePool());
            _setNewTarget();
        } else {
            uint8 previous = _prevMisses[msg.sender];
            uint8 miss = guess > _target ? guess - _target : _target - guess;
            _prevMisses[msg.sender] = miss;
            if (previous == 0) {
                emit GuessResult(msg.sender, erc20.allowance(msg.sender, address(this)), prizePool(), guess, "wrong, try again! The prize is now");
            } else if (miss < previous) {
                emit GuessResult(msg.sender, erc20.allowance(msg.sender, address(this)), prizePool(), guess, "wrong, but warmer! The prize is now");
            } else if (miss > previous) {
                emit GuessResult(msg.sender, erc20.allowance(msg.sender, address(this)), prizePool(), guess, "wrong, and colder! The prize is now");
            } else {
                emit GuessResult(msg.sender, erc20.allowance(msg.sender, address(this)), prizePool(), guess, "wrong, neither warmer or colder! The prize is now");
            }
        }
    }

    function close() public payable {
        require(msg.sender == owner, "Only owner can call this function.");

        selfdestruct(payable(owner));
    }

    function prizePool() public view returns (uint256) {
        return erc20.balanceOf(address(this));
    }

    function _setNewTarget() private {
        require(erc20.balanceOf(address(this)) == 0, "Balance must be zero to set a new target.");

        for (uint16 i = 0; i < _attemptAddresses.length; i++) {
            _prevMisses[_attemptAddresses[i]] = 0;
        }
        delete _attemptAddresses;
        _target = uint8(
            uint256(
                keccak256(abi.encodePacked(block.timestamp, block.difficulty))
            ) % guessRange
        );
    }

    // for conformance with hardhat and metamask
    receive() external payable {}
    fallback() external payable {}
}
