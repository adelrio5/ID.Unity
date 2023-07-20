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
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function encryptField(jsonData, fieldPath, key) {
    let parts = fieldPath.split('.');
    let obj = jsonData;
 
    for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
        if (!obj) {
            console.log(`Field "${parts.slice(0, i + 1).join('.')}" not found in the JSON data.`);
            return;
        }
    }
 
    let fieldName = parts[parts.length - 1];
    if (obj[fieldName]) {
        // Convert non-string types to string for encryption
        let valueToEncrypt = obj[fieldName];
        if (typeof valueToEncrypt !== 'string') {
            valueToEncrypt = JSON.stringify(valueToEncrypt);
        }
        obj[fieldName] = encrypt(valueToEncrypt, key);
    } else {
        console.log(`Field "${fieldName}" not found in the JSON data.`);
    }
 }


// Ask the user for the number of fields to encrypt
rl.question("Enter the .json file you would like to have the fields encrypted for: ", function(jsonFile) {
    // Load the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    rl.question('Enter number of fields to encrypt: ', (numOfFields) => {
        let count = parseInt(numOfFields);
        let fieldsToEncrypt = [];

        function askForField(index) {
            if (index >= count) {
                rl.close();

                // Encrypt the fields specified by the user
                fieldsToEncrypt.forEach(field => {
                    encryptField(jsonData, field, SECRET_KEY);
                });

                // Save the modified JSON back to a file
                fs.writeFileSync('1b_modified_data.json', JSON.stringify(jsonData, null, 2));
                console.log('Encryption of selected fields complete!');
                return;
            }

            rl.question(`Enter the name of field #${index + 1} (use dot notation for nested fields): `, (field) => {
                fieldsToEncrypt.push(field);
                askForField(index + 1);
            });
        }

        askForField(0);
    });
});