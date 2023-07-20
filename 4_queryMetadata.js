// Setup for console input in node.js environment
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Import necessary Hedera classes
require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    TokenNftInfoQuery,
    NftId,
    TokenId,
  } = require("@hashgraph/sdk");

const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function getMetadata(inputNftId, inputNftSerial) {
    
    const nftId = new NftId(new TokenId(0, 0, inputNftId), inputNftSerial);

    const nftInfoQuery = new TokenNftInfoQuery()
          .setNftId(nftId);
      
    const nftInfos = await nftInfoQuery.execute(client);
    
    metadataVal = nftInfos[0].metadata.toString();
    console.log("User's Data:", metadataVal);
  
    rl.close();
    client.close();
}

rl.question("Enter NFT Token ID: ", function(metadataInput) {
  rl.question("Enter NFT serial number: ", function(serialInput) {
    getMetadata(metadataInput, serialInput);
  });
});