// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GuessingGame {
    uint256 private secretNumber;
    address private owner;
    uint256 public totalGuesses;
    uint256 public resetCount;

    mapping(address => uint256) private lastGuess; // Stores the timestamp of the last guess made by each player.
    mapping(address => uint256) private lastDifference; // Stores the difference between the last guess and the secret number for each player.

    uint256 public constant GUESS_FEE = 443e14;
    uint256 public constant MAX_GUESS = 1000;
    uint256 private lastResetTime; // Stores the timestamp of the last game reset.

    event Guessed(address indexed user, uint256 guessedNumber, bool success, string feedback); // Event triggered when a player makes a guess.

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only the owner can call this function');
        _;
    }

    constructor() {
        owner = msg.sender;
        resetCount = 0;
        _resetSecretNumber(); // Initialize the secret number when the contract is deployed.
    }

    function guess(uint256 _number) external payable {
        require(_number > 0 && _number <= MAX_GUESS, 'Secret number should be between 1 and 1000');
        require(msg.value == GUESS_FEE, 'You need to pay a fee of 0.443 ETH to make a guess');
        totalGuesses += 1;

        if (lastResetTime > lastGuess[msg.sender]) {
            lastDifference[msg.sender] = MAX_GUESS + 1; // Reset the last difference if the player is guessing after a secret no. reset.
        }

        string memory feedback;

        if (_number == secretNumber) {
            payable(msg.sender).transfer(address(this).balance);
            feedback = "correct! You won the prize";
            emit Guessed(msg.sender, _number, true, feedback);
            _resetSecretNumber();
            totalGuesses = 0; // Reset the total number of guesses made.
        } else {
        uint256 currentDifference = _number > secretNumber ? _number - secretNumber : secretNumber - _number;
            if (lastResetTime > lastGuess[msg.sender]) {
                if (currentDifference < lastDifference[msg.sender]) {
                    feedback = "Your guess is warmer";
                } else if (currentDifference > lastDifference[msg.sender]) {
                    feedback = "Your guess is colder";
                } else {
                    feedback = "neither warmer nor colder";
                }
            } else {
                feedback = "first guess, try again!";
            }

            lastGuess[msg.sender] = block.timestamp; // Record the timestamp of the last guess made by the player.
            lastDifference[msg.sender] = currentDifference; // Update the last difference for the player.
            emit Guessed(msg.sender, _number, false, feedback);
        }
    }

    function _resetSecretNumber() private {
        uint256 randomNumber = block.difficulty;
        secretNumber = (randomNumber % MAX_GUESS) + 1; // Generate a new random secret number.
        lastResetTime = block.timestamp; // Record the timestamp of the last game reset.
        resetCount += 1;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
