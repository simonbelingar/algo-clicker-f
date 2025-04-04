//temp solution to simulate picking random winner
import request from 'sync-request';
import algosdk from 'algosdk';


//BCR4TCL6BUJB7H2KTOVVJCGT7SOH7V2RUOM6QYPZM6KOSTUJIPHHOSUEK4
var escrowmnemonic = '';
var escrowAccount = algosdk.mnemonicToSecretKey(escrowmnemonic);
const escrowaddr="BCR4TCL6BUJB7H2KTOVVJCGT7SOH7V2RUOM6QYPZM6KOSTUJIPHHOSUEK4";

//set round to ignore initial funding etc
var res = request('GET', `https://mainnet-idx.4160.nodely.dev/v2/accounts/${escrowaddr}/transactions?tx-type=pay&min-round=48691351&currency-greater-than=0&currency-less-than=100000`, {
    headers: {
      'user-agent': 'example-user-agent',
    },
  });

var bodydata = JSON.parse(res.getBody('utf8'));

var participants = [];

for(let i = 0; i < bodydata.transactions.length ;i++){
    var entry = bodydata.transactions[i];

    //remove any random txs
    if(entry.sender !== escrowaddr)
    {
        participants.push(entry);
    }
}

var winner = participants[Math.floor(Math.random()*participants.length)];
console.log(winner.sender);
var senderaddr = winner.sender;


//figure out who funded the hotaccount
var rs = request('GET', `https://mainnet-idx.4160.nodely.dev/v2/accounts/${winner.sender}/transactions?tx-type=pay&currency-greater-than=0&rekey-to=false`, {
    headers: {
      'user-agent': 'example-user-agent',
    },
});
var bd = JSON.parse(rs.getBody('utf8'));
var fundingtx = bd.transactions[bd.transactions.length-1];
//console.log(fundingtx);
var winneraddress = fundingtx.sender;


//const algodToken = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
//const algodServer = "https://testnet-api.algonode.cloud";
//const algodPort = 443;

const algodToken = '';
const algodServer = 'https://mainnet-api.algonode.cloud';
const algodPort = 443;

let algodclient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const SendToWinner = async function(winneraddress){
    let accountInfo = await algodclient.accountInformation(escrowAccount.addr).do();
    //console.log("Account balance: %d microAlgos", accountInfo.amount);
    var tosend = parseInt(accountInfo.amount) - 102000;
    //console.log("send "+tosend);

    let params = await algodclient.getTransactionParams().do();
    let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender:escrowAccount.addr,
        receiver: winneraddress,
        amount:tosend,
        suggestedParams:params,
    });
    let signedTxn = txn.signTxn(escrowAccount.sk);
    let txId = txn.txID().toString();
    await algodclient.sendRawTransaction(signedTxn).do();
}

SendToWinner(winneraddress);
