// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ImageGuessGame {
    struct Challenge {
        string imageURL;               // IPFS Link
        uint256 startTime;             // Timestamp when the challenge started.
        uint256 endTime;               // Timestamp when the challenge ends.
        uint256[2] hiddenCoordinates;  // Coordinates hidden in the image.
        bool isActive;                 // Flag indicating if the challenge is active.
    }

    struct Guess {
        address user;
        uint256[2] guessCoordinates;  // Coordinates guessed by the user.
    }

    Challenge[] public challenges;
    mapping(uint256 => Guess[]) private guesses;  // Mapping of challenge IDs to guess data.
    mapping(uint256 => address) private challengeWinners; // Mapping of challenge IDs to winners.
    uint256 public entryFee;
    address public owner;

    event ChallengeCreated(uint256 indexed challengeId, string imageURL);
    event GuessSubmitted(uint256 indexed challengeId, address indexed user);
    event ChallengeWinner(uint256 indexed challengeId, address indexed winner);

    constructor(uint256 _entryFee) {
        owner = msg.sender;
        entryFee = _entryFee;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function createChallenge(string memory _imageURL, uint256[2] memory _hiddenCoordinates) public onlyOwner {
        uint256 challengeId = challenges.length;
        challenges.push(Challenge({
            imageURL: _imageURL,
            startTime: block.timestamp,
            endTime: block.timestamp + 24 hours,
            hiddenCoordinates: _hiddenCoordinates,
            isActive: true
        }));
        emit ChallengeCreated(challengeId, _imageURL);
    }

    function submitGuess(uint256 _challengeId, uint256[2] memory _guessCoordinates) public payable {
        require(msg.value == entryFee, "Incorrect entry fee.");
        Challenge storage challenge = challenges[_challengeId];
        require(challenge.isActive, "Challenge is not active.");
        
        if (block.timestamp >= challenge.endTime) {
            determineWinner(_challengeId);
        } else {
            guesses[_challengeId].push(Guess({
                user: msg.sender,
                guessCoordinates: _guessCoordinates
            }));
            emit GuessSubmitted(_challengeId, msg.sender);
        }
    }

    function determineWinner(uint256 _challengeId) private {
        Challenge storage challenge = challenges[_challengeId];
        require(challenge.isActive, "Challenge is not active or already concluded.");

        uint256 closestDistance = type(uint256).max;
        address winner;

        for (uint i = 0; i < guesses[_challengeId].length; i++) {
            uint256 distance = calculateDistance(challenge.hiddenCoordinates, guesses[_challengeId][i].guessCoordinates);
            if (distance < closestDistance) {
                closestDistance = distance;
                winner = guesses[_challengeId][i].user;
            }
        }

        challenge.isActive = false;
        challengeWinners[_challengeId] = winner;
        payable(winner).transfer(address(this).balance);
        emit ChallengeWinner(_challengeId, winner);
    }

    function calculateDistance(uint256[2] memory a, uint256[2] memory b) private pure returns (uint256) {
        return (a[0] - b[0])**2 + (a[1] - b[1])**2;  // Calculate the squared distance between two sets of coordinates.
    }

}
