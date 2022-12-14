

const network = "goerli";
const web3 = new Web3(
new Web3.providers.HttpProvider(
    `https://${network}.infura.io/v3/68198e8a840944c4a9d8ecb5d93bae04`
)
);

// Creating a signing account from a private key
const signer = web3.eth.accounts.privateKeyToAccount('<PRIVATE_KEY>');

web3.eth.accounts.wallet.add(signer);D

const contract = new web3.eth.Contract(ABI_PRC_CONTRACT, "0xae1244156b4e4a1ec41cee1b3ef8939d2f28f6f4",{from: signer.address});


/*****************************************/
/* Detect the MetaMask Ethereum provider */
/*****************************************/

async function startApp(provider) {
    provider = await detectEthereumProvider();
}

/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

let currentAccount = null;
ethereum
  .request({ method: 'eth_accounts' })
  .then(handleAccountsChanged)
  .catch((err) => {
    // Some unexpected error.
    // For backwards compatibility reasons, if no accounts are available,
    // eth_accounts will return an empty array.
    console.error(err);
  });

// Note that this event is emitted on page load.
// If the array of accounts is non-empty, you're already
// connected.
ethereum.on('accountsChanged', handleAccountsChanged);

// For now, 'eth_accounts' will continue to always return an array
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    //showAccount.innerHTML = currentAccount;
    // Do any other work!
  }
}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/


// You should only attempt to request the user's accounts in response to user
// interaction, such as a button click.
// Otherwise, you popup-spam the user like it's 1999.
// If you fail to retrieve the user's account(s), you should encourage the user
// to initiate the attempt.
const ethereumButton = document.querySelector('.enableEthereumButton');
const showAccount = document.querySelector('.showAccount');
;

// While you are awaiting the call to eth_requestAccounts, you should disable
// any buttons the user can click to initiate the request.
// MetaMask will reject any additional requests while the first is still
// pending.

async function getGas(){
    const puntos = web3.utils.toBN("11").mul(new web3.utils.toBN("10").pow(new web3.utils.toBN(18)))
    const gasEstimate = await contract.methods.canjearPuntosTienda(puntos,signer.address).estimateGas({from: currentAccount});

    return gasEstimate;
}
ethereumButton.addEventListener('click', () => {

    connect();

    getGas().then((gas) => {
        const puntos = web3.utils.toBN("11").mul(new web3.utils.toBN("10").pow(new web3.utils.toBN(18)))
        console.log("Gas estimate", gas);
        const transferir = contract.methods.canjearPuntosTienda(puntos,signer.address).encodeABI()

        const tx = {
    data: transferir,
    from: currentAccount,
    to: contract.options.address,
    gasPrice: web3.eth.gasPrice,
    value: '0x0',
    gasLimit: 300000,
    gas: String(gas)
  };

   ethereum
    .request({
      method: 'eth_sendTransaction',
      params: [tx],
    })
    .then(function (txhash) {
            console.log(`https://${network}.etherscan.io/tx/${txhash}`);
            document.getElementById('total_cart').innerHTML = "39";
            document.getElementById('total_cart_hide').value = "39";
            document.getElementById('prc_points').innerHTML = "4"
        }
    )
    .catch((error) => console.error);
    })

  /*
    // Sending the transaction to the network
  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once("transactionHash", (txhash) => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);*/


});

let limit = web3.eth.estimateGas({
    from: currentAccount,
    to: signer.address,
    value: web3.utils.toWei("0.001")
    }).then(console.log);

async function connect() {
    await ethereum
        .request({method: 'eth_requestAccounts'})
        .then(handleAccountsChanged)
        .catch((err) => {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        });

    const balance = await contract.methods.obtenerPuntos(currentAccount).call({from: signer.address});
    console.log("Wallet Balance", balance);

  //document.querySelector('.wallet_display').style.display = "block";
  //showAccount.innerHTML = currentAccount;

}