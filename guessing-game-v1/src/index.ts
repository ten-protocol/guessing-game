import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import ERC20 from '../artifacts/contracts/ERC20.sol/ERC20.json';
import Guess from '../artifacts/contracts/Guess.sol/Guess.json';

// expect address on deployed to hardhat
//const ERC20_ADDRESS = '0x572128E5115008812fcD3016d98177EED387faaF';
//const GUESS_ADDRESS = '0x555b8eA821486338D8Bd8637dD379314B09CF26A';

// pre-deployed on sepolia
const ERC20_ADDRESS = '0x555b8eA821486338D8Bd8637dD379314B09CF26A';
const GUESS_ADDRESS = '0xa084b73aF850bAa0A9320baDC46660ad5dE3E1d6';

// pre-deployed on ten
//const ERC20_ADDRESS = '0x611798eB8EEd726C0487f329EAc410300590F915';
//const GUESS_ADDRESS = '0x9ddBd536C075bC35C69280A09B02d5C52F30b54d';

const guessButton = document.getElementById('guess-button') as HTMLButtonElement;
const approveButton = document.getElementById('approve-button') as HTMLButtonElement;
const guessInput = document.getElementById('guess-input') as HTMLInputElement;
const approveInput = document.getElementById('approve-input') as HTMLInputElement;
const guessRange = document.getElementById('guess-range') as HTMLSpanElement;
const connectedAddress = document.getElementById('connected-address') as HTMLSpanElement;
const chainId = document.getElementById('chain-id') as HTMLSpanElement;
const allowanceLabel = document.getElementById('allowance') as HTMLSpanElement;

const provider = new ethers.providers.Web3Provider(window.ethereum)
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();
const erc20Contract = new ethers.Contract(ERC20_ADDRESS, ERC20.abi, signer);
const guessContract = new ethers.Contract(GUESS_ADDRESS, Guess.abi, signer);
const signerAddress = await signer.getAddress();
const filterApproval = erc20Contract.filters.Approval(signerAddress);
const filterGuess = guessContract.filters.GuessResult(signerAddress);

const symbol = await erc20Contract.symbol();
guessRange.innerText = await guessContract.guessRange();
connectedAddress.innerText = signerAddress.substring(0, 18) + '..';
provider.getSigner().getChainId().then(result => {chainId.innerText = result.toString()});
erc20Contract.allowance(signerAddress, GUESS_ADDRESS).then((result: bigint) => {
    updateAllowance(result);
});

guessButton?.addEventListener('click', e => { e.preventDefault(); guess() });
approveButton?.addEventListener('click', e => { e.preventDefault(); approve() });

erc20Contract.on(filterApproval, (owner, _, value) => {
    updateAllowance(value);
    displayMessage(`Approval of ${ethers.utils.formatEther(value)} ${symbol} by account ${owner} to the game was successful. `);
});
guessContract.on(filterGuess, (_, allowance, prize, guess, msg) => {
    updateAllowance(allowance);
    displayMessage(`Your guess of ${guess} was ${msg} ${ethers.utils.formatEther(prize)} OGG.`);
});

function updateAllowance(allowance: bigint) {
    guessButton.disabled = (allowance == BigInt(0));
    allowanceLabel.innerText = formatEther(allowance).split('.')[0];
}

async function approve() {
    try {
        const approval = await erc20Contract.approve(
            GUESS_ADDRESS,
            // parse ether into a BigNumber instance of the amount of wei
            ethers.utils.parseEther(approveInput.value),
            { gasLimit: 400000 }
        );
        approval.wait();
    } catch (error) {
        alert('Error while attempting to approve.' + JSON.stringify(error));
    }
}

async function guess() {
    try {
        const attempt = await guessContract.attempt(
            parseInt(guessInput.value),
            { gasLimit: 400000 }
        );
        attempt.wait();
    } catch (error) {
        alert('Error while attempting to guess.' + JSON.stringify(error));
    }
}

function displayMessage(msg: string) {
    const para = (<HTMLTemplateElement>document.getElementById('message')).content.querySelector('p');
    const message = document.importNode(para as HTMLParagraphElement, true);
    message.append(msg);

    document.querySelector('main')?.prepend(message);
}