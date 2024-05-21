// This script generates a new wallet address and private key which you can use for testing purposes.
// You can write the PK in the .env file and use it in the project.

// Run the script with the following command:
// bun run src/utils/generateWallet.ts

import { ethers } from "ethers";

const wallet = ethers.Wallet.createRandom();

console.log("💳 You wallet address is:");
console.log(wallet.address);
console.log("");
console.log("🔑 You private key is:");
console.log(wallet.privateKey);
