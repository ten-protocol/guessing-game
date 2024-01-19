import argparse, ast, sys, secrets
import requests, json
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_structured_data


def authenticate(account, url):
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.get(url+'/join/',  headers=headers)
    token = response.text
    print('Joined network with token', token)

    domain = {'name': 'Ten', 'version': '1.0', 'chainId': 443}
    message = {'EncryptionToken': "0x"+token}
    types = {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
            {'name': 'version', 'type': 'string'},
            {'name': 'chainId', 'type': 'uint256'},
        ],
        'Authentication': [
            {'name': 'EncryptionToken', 'type': 'address'},
        ],
    }
    typed_data = {'types': types, 'domain': domain, 'primaryType': 'Authentication',  'message': message}

    signable_msg_from_dict = encode_structured_data(typed_data)
    signed_msg_from_dict = Account.sign_message(signable_msg_from_dict, account.key)

    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    data = {"signature": signed_msg_from_dict.signature.hex(), "address": account.address}
    response = requests.post(url+'/authenticate/?token=%s' % token, data=json.dumps(data), headers=headers)
    print('Authentication response was', response.text)
    return token


def get_target():
    # get the storage of the first slot
    slot0=web3.eth.get_storage_at(contractAddress, 0)
    print('Slot bytes:    %s' % slot0.hex())

    # slot 0 last 20 bytes owner address [12:32]
    address=slot0[12:32]
    print('Owner:         %s' % address.hex())

    # slot 0 11th byte is the target
    target=slot0[11]
    print('Target:        %d' % target)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Try to cheat and get the target from storage')
    parser.add_argument('--network', help='Set network to hardhat or obscuro (defaults hardhat)', required=True)
    parser.add_argument('--address', help='The contract address of the guessing game')
    parser.add_argument('--api_key', help='The sepolia API key')
    args = parser.parse_args()

    web3 = None
    contractAddress = args.address
    if args.network == 'hardhat':
        web3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545/'))

    elif args.network == 'sepolia':
        web3 = Web3(Web3.HTTPProvider('https://eth-sepolia.g.alchemy.com/v2/%s' % args.api_key))

    elif args.network == 'ten':
        _token = authenticate(Web3().eth.account.from_key(secrets.token_hex(32)), 'https://testnet.ten.xyz/v1')
        web3 = Web3(Web3.HTTPProvider('https://testnet.ten.xyz/v1/?token=%s' % _token))
    else:
        print('--network should be either ten, sepolia or hardhat')
        sys.exit(-1)

    try:
        print('Calling to get the target storageAt value')
        get_target()
    except Exception as error:
        print('Error calling eth end point: %s' % ast.literal_eval(str(error))['message'])
