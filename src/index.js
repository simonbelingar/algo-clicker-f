
import algosdk from 'algosdk';
import { PeraWalletConnect } from "@perawallet/connect";

//replace with your wallet of choice for the prize wallet
var escrowAccount = "BCR4TCL6BUJB7H2KTOVVJCGT7SOH7V2RUOM6QYPZM6KOSTUJIPHHOSUEK4";

var myAccount = algosdk.generateAccount();
var mnemonic = algosdk.secretKeyToMnemonic(myAccount.sk);

//console.log("My address: %s", myAccount.addr);
/*
const algodToken = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodServer = "http://localhost";
const algodPort = 4001;

const algodToken = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodServer = "https://testnet-api.algonode.cloud";
const algodPort = 443;
*/
const algodToken = '';
const algodServer = 'https://mainnet-api.algonode.cloud';
const algodPort = 443;

let algodclient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

//set the fixed ammount per click to be sent
//increase ticket price if you're gonna increase this one, as .1 algo is reserved
const fixedfee = 0;

var clicker  = document.getElementById("main-clicker");
var scoretext    = document.getElementById("scoretext");
var timertext    = document.getElementById("timertext");
var interval;
var countdown = 7;

const attemptBtn = document.getElementById("b1");


//#region pera
const peraWallet = new PeraWalletConnect();
const connectButton = document.createElement("button");
var accountAddress = "";

document.body.appendChild(connectButton);
connectButton.innerHTML = "Connect to Pera Wallet";

document.addEventListener("DOMContentLoaded", reconnectSession());

connectButton.addEventListener("click", (event) => {
  if (accountAddress) {
    handleDisconnectWalletClick(event);
  } else {
    handleConnectWalletClick(event);
  }
});

function reconnectSession() {
  // Reconnect to the session when the component is mounted
  peraWallet
    .reconnectSession()
    .then((accounts) => {
      peraWallet.connector.on("disconnect", handleDisconnectWalletClick);

      if (accounts.length) {
        accountAddress = accounts[0];
      }

      connectButton.innerHTML = "Disconnect";
    })
    .catch((e) => console.log(e));
}

function handleConnectWalletClick(event) {
  event.preventDefault();

  peraWallet
    .connect()
    .then((newAccounts) => {
      peraWallet.connector.on("disconnect", handleDisconnectWalletClick);

      accountAddress = newAccounts[0];
      console.log("accaddr:"+accountAddress);

      connectButton.innerHTML = "Disconnect "+accountAddress.substring(0,3)+"...";
      console.log("enable b1");
      attemptBtn.disabled = false;

    })
    .catch((error) => {
      if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.log(error);
      }
    });
}

function handleDisconnectWalletClick(event) {
  event.preventDefault();

  peraWallet.disconnect().catch((error) => {
    console.log(error);
  });

  accountAddress = "";
  connectButton.innerHTML = "Connect to Pera Wallet";
}

//#endregion pera

const SendTestNew = async function(increment){
    let params = await algodclient.getTransactionParams().do();
var senderaddr = myAccount.addr;


    let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender:myAccount.addr,
        receiver: escrowAccount,
        amount:fixedfee+increment,
        suggestedParams:params,
    });
    let signedTxn = txn.signTxn(myAccount.sk);
    let txId = txn.txID().toString();
    await algodclient.sendRawTransaction(signedTxn).do();
}

var score = 0;

function addScore() { // onClicker pressed add ClickGain
    score = score + 1;
  }

function updateScore(check=true) {//update html score txt
    let text = "x" + score;
    scoretext.innerHTML = text;
}

function TimerShow(){
  let text = 'Start by clicking on the logo<span>you\'ll have 7 seconds to click as many times as possible</span>';
  timertext.innerHTML = text;
  clicker.disabled = false;
}

function GameEnd(){
  let text = 'GG';
  timertext.innerHTML = text;
}


function TimerStart(){
  console.log("start countdown");
  timerUpdate(countdown);
}

function timerUpdate(countdown) {
  let text = "." + countdown;
  timertext.innerHTML = text;

  clearInterval(interval);
  if(countdown == 0){
    console.log("timer donw");
    GameEnd();
    hotwalletCleanup();
    return;
  }else{
  interval = setInterval(function(){ 
    countdown = countdown - 1;
    timerUpdate(countdown);}, 1000);
  }
}

//bind click event
clicker.onclick = function() { 
  if(score==0){
    TimerStart();
  }
	clicker.disabled = true;
	addScore();
    SendTestNew(score);
    updateScore(); 
    
	clicker.disabled = false;
};


//fund hotwallet
const handleperatx = async function(signeraddress){
    let params = await algodclient.getTransactionParams().do();
    const fundtx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: signeraddress,
        receiver:myAccount.addr,
        amount: 200000,
        suggestedParams: params,
    });
    console.log("txn prepared -> from"+signeraddress+" to"+myAccount.addr);
    const singleTxnGroups = [{txn: fundtx, signers: [signeraddress]}];

    try {
        console.log("try sign with pera");
        const signedFundTxn = await peraWallet.signTransaction([singleTxnGroups]);
        console.log("signed, sending");
        await algodclient.sendRawTransaction(signedFundTxn).do();
        TimerShow();

    } catch (error) {
        console.log("Couldn't sign Opt-in txns", error);
    }
}

b1.onclick = function() { 
    console.log("trigger tx creation from "+accountAddress);
	  b1.disabled = true;
    handleperatx(accountAddress);
};

const hotwalletCleanup = async function() {
  //close the hotwallet to escrow
  let params = await algodclient.getTransactionParams().do();
  let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender:myAccount.addr,
    receiver: escrowAccount,
    amount:0,
    closeRemainderTo: escrowAccount,
    suggestedParams:params,
  });
  let signedTxn = txn.signTxn(myAccount.sk);
  let txId = txn.txID().toString();
  await algodclient.sendRawTransaction(signedTxn).do();
}