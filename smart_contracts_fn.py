import json
import os

from dotenv import load_dotenv
from web3 import Web3


def get_balance(address):
    trx_info = connect_web3()
    balance = trx_info.get('contract').functions.obtenerPuntos(address).call({"from": f"{os.getenv('TIENDA_ADDRESS')}"})
    return balance // 10**18


def send_prc_to_customer(address, amount):
    print("Check if is a valid address")
    if Web3.isAddress(address):
        w3 = connect_web3()
        print(f"Sending {amount} PRC to {address}")
        trx = w3.get('contract').functions.transferirPuntosCliente(amount,"test",address).buildTransaction({
            'from': f"{os.getenv('TIENDA_ADDRESS')}",
            'value': 0,
            'maxFeePerGas': 2750000000,
            'maxPriorityFeePerGas': 10 ** 9,
            'nonce': w3.get('nonce'),
        })

        signed_tx  = w3.get('w3').eth.account.signTransaction(trx, private_key=w3.get('private_key'))
        txn_hash = w3.get('w3').eth.send_raw_transaction(signed_tx.rawTransaction)
        txn_receipt  = w3.get('w3').eth.wait_for_transaction_receipt(txn_hash)

        return txn_receipt
    else:
        return "Invalid address"

def connect_web3():
    load_dotenv()
    from web3.auto.infura.goerli import w3 as goerli_w3

    print("Connecting to the Blockchain...")
    file = open('contracts/PuntosRecompensasCoin.json')

    data = json.load(file)
    abi = data["abi"]

    print("File Opened and abi loaded")

    trx_info = {
        'w3': None,
        'nonce': None,
        'contract': None,
        'rinkeby_chain_id': 5,
        'contract_address': f"{os.getenv('SMART_CONTRACT_ADDRESS')}",
        'private_key': f"{os.getenv('PRIVATE_KEY')}",
        'provider_url': "https://goerli.infura.io/v3/68198e8a840944c4a9d8ecb5d93bae04",
        'wallet_address': f"{os.getenv('TIENDA_ADDRESS')}"
    }

    print("Connecting to the infura http provier and create contract")
    # w3 = Web3(Web3.HTTPProvider(trx_info['provider_url']))
    trx_info['w3'] = goerli_w3
    print(f"Infura: {goerli_w3.isConnected()}")

    print(f"1 - Getting the contract: {os.getenv('SMART_CONTRACT_ADDRESS')}")
    contract = goerli_w3.eth.contract(address=os.getenv('SMART_CONTRACT_ADDRESS'), abi=abi)
    trx_info['contract'] = contract

    # goerli_w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    print(
        f"Connected to blockchain, chain id is {goerli_w3.eth.chain_id}. the latest block is {goerli_w3.eth.block_number:,}")

    print("Getting the nonce")
    nonce = goerli_w3.eth.getTransactionCount(trx_info['wallet_address'])
    # get_transaction_count
    trx_info['nonce'] = nonce

    return trx_info