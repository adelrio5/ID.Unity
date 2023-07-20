// Setup for console input in node.js environment
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Import necessary classes for Hedera SDK
//console.clear();
require("dotenv").config();
const fs = require("fs");
const {
  AccountId,
  PrivateKey,
  Client,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  AccountCreateTransaction,
  Hbar,
  TokenNftInfoQuery,
  NftId,
  TokenId,
} = require("@hashgraph/sdk");

// Metadata of NFT to include .json file for collected KYC data
//metadata = "ipfs://.../metadata.json";

// ID.Unity keys used to initially create user's NFT
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Account creation function
async function accountCreator(pvKey, iBal) {
  const response = await new AccountCreateTransaction()
    .setInitialBalance(new Hbar(iBal))
    .setKey(pvKey.publicKey)
    .setMaxAutomaticTokenAssociations(10)
    .execute(client);
  const receipt = await response.getReceipt(client);
  return receipt.accountId;
}

const main = async (metadata) => {
  
  // Initiate user's account
  const userKey = PrivateKey.generateED25519();
  const userId = await accountCreator(userKey, 100);

  const bytecode = fs.readFileSync("NFTCreator_sol_NFTCreator.bin");

  // Create contract for NFT ID
  const createContract = new ContractCreateFlow()
    .setGas(4000000) // Increase if revert
    .setBytecode(bytecode); // Contract bytecode
  const createContractTx = await createContract.execute(client);
  const createContractRx = await createContractTx.getReceipt(client);
  const contractId = createContractRx.contractId;

  console.log(`Contract ID: ${contractId} \n`);


  // Create NFT ID from precompile
  const createToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4000000) // Increase if revert
    .setPayableAmount(50) // Increase if revert
    .setFunction(
      "createNft",
      new ContractFunctionParameters()
        .addString("UserID") // NFT name
        .addString("uID") // NFT symbol
        .addString("UserID") // NFT memo
        .addInt64(1) // NFT max supply
        .addInt64(7000000) // Expiration: Needs to be between 6999999 and 8000001
    );
  const createTokenTx = await createToken.execute(client);
  const createTokenRx = await createTokenTx.getRecord(client);
  const tokenIdSolidityAddr =
    createTokenRx.contractFunctionResult.getAddress(0);
  const tokenId = AccountId.fromSolidityAddress(tokenIdSolidityAddr);

  //console.log(`Token created with ID: ${tokenId} \n`);

  // Mint user's NFT ID
  const mintToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4000000)
    .setMaxTransactionFee(new Hbar(20)) //Use when HBAR is under 10 cents
    .setFunction(
      "mintNft",
      new ContractFunctionParameters()
        .addAddress(tokenIdSolidityAddr) // Token address
        .addBytesArray([Buffer.from(metadata)]) // Metadata
    );
  const mintTokenTx = await mintToken.execute(client);
  const mintTokenRx = await mintTokenTx.getRecord(client);
  const serial = mintTokenRx.contractFunctionResult.getInt64(0);


  // Transfer NFT ID to user's account
  const transferToken = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4000000)
    .setFunction(
      "transferNft",
      new ContractFunctionParameters()
        .addAddress(tokenIdSolidityAddr) // Token address
        .addAddress(userId.toSolidityAddress()) // Token receiver (user)
        .addInt64(serial)
    ) // NFT serial number
    .freezeWith(client) // freezing using client
    .sign(userKey); // Sign transaction with user
  const transferTokenTx = await transferToken.execute(client);
  const transferTokenRx = await transferTokenTx.getReceipt(client);

  console.log(`Transfer status: ${transferTokenRx.status} \n`);
  

  //Returns the info for the specified user's NFT ID
  
  let idNum = TokenId.fromString(tokenId);
  let tokenIdNum = idNum.num.getLowBits();
  let tokenSerial = serial.s;
  console.log("Token ID:", tokenIdNum)
  console.log("Token Serial:", tokenSerial)
  

  const nftId = new NftId(new TokenId(0, 0, tokenIdNum), tokenSerial);

  const nftInfoQuery = new TokenNftInfoQuery()
        .setNftId(nftId);
    
  const nftInfos = await nftInfoQuery.execute(client);
  
  
  metadataVal = nftInfos[0].metadata.toString();
  console.log("User's Data:", metadataVal);



  client.close();
};

rl.question("Enter metadata to include in NFT: ", function(metadataFile) {
  main(metadataFile);
});