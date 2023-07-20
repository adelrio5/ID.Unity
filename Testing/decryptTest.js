const crypto = require('crypto');
const fs = require('fs');

// Decryption function
function decrypt(encryptedText, algorithm, password) {
    const decipher = crypto.createDecipher(algorithm, password);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Load your encrypted data
const encryptedData = fs.readFileSync('encrypted_data.txt', 'utf8');

// Decrypt the data
const algorithm = 'aes-256-cbc';
const password = 'Password123';  // Use the same password as in the encryption step!
const decryptedData = decrypt(encryptedData, algorithm, password);

// Save the decrypted data
fs.writeFileSync('decrypted_data.json', decryptedData, 'utf8');

console.log("Decryption complete!");