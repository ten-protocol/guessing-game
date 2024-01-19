const fs = require('fs')
const Web3 = require('web3')
const ethers = require('ethers')
const commander = require('commander')

require('console-stamp')(console, 'HH:MM:ss')

async function join(url) {
    console.log('Joining the network ' + url)
    let response = await fetch(`${url}/join/`, {
        method: 'GET',
        headers: {Accept: "application/json", "Content-Type": "application/json",},
    });
    let token = await response.text();
    console.log('Joined the network with token ' + token);
    return token;
}

async function sign(account, token) {
    console.log('Signing message for registration ' + account.address)
    let wallet = new ethers.Wallet(account.privateKey)
    let domain = {name: "Ten", version: "1.0", chainId: 443,}
    let types = {Authentication: [{name: "Encryption Token", type: "address"},],};
    let message = {"Encryption Token": "0x" + token};
    let signed_msg = await wallet._signTypedData(domain, types, message)
    console.log('Signed message for registration is ' + signed_msg);
    return signed_msg
}

async function authenticate(url, account, token, signed_msg) {
    console.log('Authenticating account ' + account.address)
    response = await fetch(`${url}/authenticate/?token=${token}`, {
        method: 'POST',
        headers: {Accept: "application/json", "Content-Type": "application/json",},
        body: JSON.stringify({signature: signed_msg, address: account.address})
    })
    let text = await response.text()
    console.log('Authentication response was ' + text)
}

async function task(network_ws, contractAddress) {
    let provider = new ethers.providers.WebSocketProvider(network_ws)
    let contract = new ethers.Contract(contractAddress, abi, provider)
    let iface = new ethers.utils.Interface(abi)

    console.log('Subscribing for event logs')
    const events = await contract.queryFilter('GuessResult', 0, 'latest')
    if (events.length) {
        for (var i = 0, len = events.length; i < len; i += 1) {
            log = iface.decodeEventLog('GuessResult', events[i].data, events[i].topics)
            console.log(log.player, 'Guess of', log.guess.toNumber(), 'was', log.msg, ethers.utils.formatEther(log.prize), 'OGG.')
        }
    } else {
        console.log('No events in return set')
    }
}

commander
    .version('1.0.0', '-v, --version')
    .usage('[OPTIONS]...')
    .option('--network <value>', 'Set network to hardhat or obscuro (defaults hardhat)')
    .option('--address <value>', 'The contract address of the guessing game')
    .option('--api_key <value>', 'The sepolia API key')
    .parse(process.argv)

const options = commander.opts()
var json = fs.readFileSync('../../artifacts/contracts/Guess.sol/Guess.json')
var abi = JSON.parse(json)['abi']

if (options.network === 'hardhat') {
    network_ws = 'ws://127.0.0.1:8545'
    task(network_ws, options.address)
} else if (options.network === 'sepolia') {
    network_ws = 'wss://eth-sepolia.g.alchemy.com/v2/' + options.api_key
    task(network_ws, options.address)
} else if (options.network === 'ten') {
    base_url = 'https://testnet.ten.xyz/v1'
    account = (new Web3()).eth.accounts.create()

    join(base_url).then(token => {
        let network_ws = `wss://testnet.ten.xyz:81/v1/?token=${token}`
        sign(account, token).then(signed_msg => {
            authenticate(base_url, account, token, signed_msg).then(() => {
                task(network_ws, options.address)
            })
        })
    })
}











