const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const SECRET_KEY = crypto.randomBytes(32).toString("hex");  // Must be 32 bytes for AES-256
const ALGORITHM = 'aes-256-cbc';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}



// Ask the user for the number of fields to encrypt
rl.question("Enter the .json file you would like to have the fields encrypted for", function(jsonFile) {
// Load the JSON file
const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
   rl.question('Enter number of fields you would like to encrypt: ', (numOfFields) => {
      let count = parseInt(numOfFields);
      let fieldsToEncrypt = [];
      function askForField(index) {
        if (index >= count) {
            rl.close();
            // Encrypt the fields specified by the user
            fieldsToEncrypt.forEach(field => {
                if (jsonData[field]) {
                    jsonData[field] = encrypt(jsonData[field], SECRET_KEY);
                } else {
                    console.log(`Field "${field}" not found in the JSON data.`);
                }
            });

            // Save the modified JSON back to a file
            fs.writeFileSync('modified_data.json', JSON.stringify(jsonData, null, 2));
            console.log('Encryption of selected fields complete!');
            return;
        }

        rl.question(`Enter the name of field #${index + 1}: `, (field) => {
            fieldsToEncrypt.push(field);
            askForField(index + 1);
        });
    }
    askForField(0);
});
});