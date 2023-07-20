// Setup for console input in node.js environment
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const crypto = require('crypto');
const fs = require('fs');


const ALGORITHM = 'aes-256-cbc';          // AES (Advanced Encryption Standard)

// Decrypt function
function decrypt(encryptedText, key) {
    let parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedBuffer = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted.toString('utf8');
}

rl.question("Enter .txt file to decrypt: ", function(encryptedFile) {
    rl.question("Enter 32-bit key: ", function(secretKey) {

        // Load the encrypted data
        const encryptedData = fs.readFileSync(encryptedFile, 'utf8');

        // Decrypt the data using secret key from before
        const decryptedData = decrypt(encryptedData, secretKey);

        // Save the decrypted data back to a JSON file
        fs.writeFileSync('5b_decrypted_data.json', decryptedData, 'utf8');

        console.log('Decryption complete!');
    });
});