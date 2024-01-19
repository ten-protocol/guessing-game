# Demo utils to break the game 
This directory contains some utility scripts to allow breaking the game by either finding the hidden number through 
use of getStorageAt, or being able to retrieve event logs to see what other players have been guessing and their 
warm and cold results. 

## Python script to get the number using getStorageAt

```bash
# to get from hardhat 
python3 get_number.py --network hardhat --address <game address> 

# to get from sepolia 
python3 get_number.py --network sepolia --address <game address> --api_key <api key>

# to get from ten 
python3 get_number.py --network ten --address <game address>
```

## JS script to get events logs to see other guesses

```bash
source set_path.sh  

# to get from hardhat 
node get_events.js --network hardhat --address <game address> 

# to get from sepolia  
node get_events.js --network sepolia --address <game address> --api_key <api key>

# to get from ten 
node get_events.js --network ten --address <game address> 
```