const crypto = require('crypto');
const fs = require('fs');

// Encryption function
function encrypt(text, algorithm, password) {
   const cipher = crypto.createCipher(algorithm, password);
   let encrypted = cipher.update(text, 'utf8', 'hex');
   encrypted += cipher.final('hex');
   return encrypted;
}

// Load JSON data to be encrypted
const jsonData = fs.readFileSync('dummyFile.json', 'utf8');

// Encrypt the JSON data
const algorithm = 'aes-256-cbc';  // AES (Advanced Encryption Standard)
const password = 'Password123'; // Password for encryption
const encryptedData = encrypt(jsonData, algorithm, password);

// Save the encrypted data
fs.writeFileSync('encrypted_data.txt', encryptedData, 'utf8');

console.log("Encryption complete!");