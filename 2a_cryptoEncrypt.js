// Setup for console input in node.js environment
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const crypto = require('crypto');
const fs = require('fs');

// Keep secret key safe!
const SECRET_KEY = crypto.randomBytes(32).toString("hex");  // Must be 32 bytes for AES-256
const ALGORITHM = 'aes-256-cbc';          // AES (Advanced Encryption Standard)

// Encrypt function
function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

rl.question("Enter .json file to encrypt: ", function(jsonFile) {

// Load the JSON file
const jsonData = fs.readFileSync(jsonFile, 'utf8');

// Encrypt the data
const encryptedData = encrypt(jsonData, SECRET_KEY);

// Save the encrypted data to a file
fs.writeFileSync('2b_encrypted_data.txt', encryptedData);

console.log('Encryption complete!');
console.log("Secret Key:", SECRET_KEY);
});