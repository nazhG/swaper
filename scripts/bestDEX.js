// TODO:
// Get token addres
// select token(s)
// https://api.1inch.exchange/v3.0/1/tokens
// get best Dex
// https://api.1inch.exchange/v3.0/1/protocols
// call method
// https://github.com/1inch/1inchProtocol/tree/master/contracts
// make contract multi token
// make upgradable



/** NodeJS example of using the 1INCH API with web3{js} */
const axios = require('axios');                     //used for getting api data, install with "yarn add axios"
const Web3 = require('web3');                       //used for web3 functions, install with "yarn add web3"
const Common = require('ethereumjs-common').default;//used for creating custom chains, install with "yarn add '@ethereumjs/common'"
var Tx = require('ethereumjs-tx').Transaction;      //used to sign and broadcast the transaction, install with "yarn add ethereumjs-tx"


let ETHprovider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/*INFURA_SECRET_KEY_HERE*')
//websocket provider for Ethereum mainnet can be found here: infura.io

let BSCprovider = new Web3.providers.WebsocketProvider('wss://apis.ankr.com/wss/*FIND_ON_ANKR_PROJECT_WEBPAGE*/*FIND_ON_ANKR_PROJECT_WEBPAGE*/binance/full/main');
//websocket provider for binance smart chain can be found here: app.ankr.com/apps/api

let web3 = new Web3(ETHprovider);
var privateKey = Buffer.from('*YOUR_PRIVATE_KEY_HERE*', 'hex');

//some variables/constnats we'll use
const ADDRESS = '*ADDRESS_ASSOCIATED_WITH_PRIVATE_KEY*';//your address
let callURL = 'https://api.1inch.exchange/v3.0/1/swap?fromTokenAddress=0x6b175474e89094c44da98b954eedeac495271d0f&' +
    'toTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&' +
    'amount=1000000000000000000&fromAddress=' +
    ADDRESS +
    '&slippage=1';
//make sure to use the BSC API if you'll be executing swaps on BSC

let globalData = {};                                //globalData will be a JSON object
let transaction;                                    //this will be what we broadcast

//the common configuration for Binance Smart Chain
//docs: https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/common
const binanceSmartChain = Common.forCustomChain(
    'mainnet',
    {                                               //Custom chain parameters 
        name: 'Binance',
        networkId: 56,
        chainId: 56,
    },
    'petersburg'                                    //Supported hard forks
)
//the configuration for ETH mainnet
const ethereumMainnet = { 'chain': 'mainnet' }

/**
 * The driver of the program, this will execute anything you put in it
 */
async function driver() {
    globalData = await apiCaller(callURL, '0xff');  //call the api to get the data, and wait until it returns
    console.log(globalData["tx"]);                  //log the data
    transaction = signTx(globalData["tx"]);         //sign the transaction
    console.log(transaction);                       //print the bytes
    sendTransaction(transaction);                   //send the transaction
    console.log("transaction success");
}

/**
 * Sends a transaction based on serialized data
 * @param {the serialized transaction you want to send} tx 
 */
function sendTransaction(tx) {
    let temp = '0x' + tx.toString('hex');           //make the transaction into a hexadecimal string
    web3.eth.sendSignedTransaction(temp).on('receipt', console.log);
}

/**
 * Will sign a transaction with a private key based on the transaction data provided
 * @param {the transaction you'd like signed} tx
 * @returns serialized transaction
 */
function signTx(tx) {
    let temp = new Tx(tx, ethereumMainnet);
    //let temp = new Tx(tx, { common: binanceSmartChain });
    temp.sign(privateKey);
    console.log(temp);
    return temp.serialize();
}

/**
 * Will call the api and return the data needed
 * @param {the url of what api call you want} url 
 * @param {the nonce of the transaction, the user must keep track of this} nonce
 */
async function apiCaller(url, nonce) {
    let temp = await axios.get(url);                //get the api call
    temp = temp.data;                               //we only want the data object from the api call
    //we need to convert the gasPrice to hex
    let gasPrice = parseInt(temp.tx["gasPrice"]);   //get the gasPrice from the tx
    gasPrice = '0x' + gasPrice.toString(16);        //add a leading 0x after converting from decimal to hexadecimal
    temp.tx["gasPrice"] = gasPrice;                 //set the value of gasPrice in the transaction object
    //we also need value in the form of hex
    let value = parseInt(temp.tx["value"]);			    //get the value from the transaction
    value = '0x' + value.toString(16);				      //add a leading 0x after converting from decimal to hexadecimal
    temp.tx["value"] = value;						            //set the value of value in the transaction object
    temp.tx["nonce"] = nonce;                       //it's the users responsibility to keep track of the nonce
    return temp;                                    //return the data
}

driver(); 											                    //call driver to run all the code