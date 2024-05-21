// This file is used to setup constant and variables that will be used in the project.
// It will be imported from other files.

import { configDotenv } from "dotenv";
import { ethers } from "ethers";
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";

configDotenv();

// https://docs.lukso.tech/networks/mainnet/parameters
export const RPC_URL = "https://42.rpc.thirdweb.com";

export const provider = new ethers.JsonRpcProvider(RPC_URL);

const BLOCK_EXPLORER_URL = "https://txs.app/";

// We load our Private Key from the .env file to create a new Wallet
// This signer has the private key of the controller of the UP
export const signer = new ethers.Wallet(
  process.env.CONTROLLER_PRIVATE_KEY || "",
  provider
);

// This signer has the private key of the test account
export const testSigner = new ethers.Wallet(
  process.env.TEST_PRIVATE_KEY || "",
  provider
);

// This signer is used to perform a relay call. It has no permissions over the Universal Profile.
// It needs to be funded with some LYX to be able to send transactions.
export const relaySigner = new ethers.Wallet(
  process.env.RELAY_CALL_PRIVATE_KEY || "",
  provider
);

// Universal Profile can be created here: https://my.universalprofile.cloud/
export const UNIVERSAL_PROFILE_ADDRESS =
  process.env.UNIVERSAL_PROFILE_ADDRESS || "";

// This contract holds the Universal Profile address and ABI
export const LSP0ERC725AccountContract = new ethers.Contract(
  UNIVERSAL_PROFILE_ADDRESS,
  LSP0ERC725Account.abi,
  signer
);

export const LSP0ERC725AccountContractTestController = new ethers.Contract(
  UNIVERSAL_PROFILE_ADDRESS,
  LSP0ERC725Account.abi,
  testSigner
);

export const printTransactionHash = (tx: string) => {
  console.log(`📤 Transaction: ${BLOCK_EXPLORER_URL}tx/${tx}`);
};

export const printAddress = (address: string) => {
  console.log(`📄 Address: ${BLOCK_EXPLORER_URL}address/${address}`);
};

export const printInspectAddress = (address: string) => {
  console.log(
    `🔍 Inspector: https://erc725-inspect.lukso.tech/inspector?address=${address}&network=mainnet`
  );
};

export const LSP3PROFILE_VALUE =
  "0x00006f357c6a0020cd666fb09432d4080c4cd90b8848d50a648da2ad12e7e3381e7c88c4eb5eaa71697066733a2f2f516d596e3362354d675559484236514b5071554c34337650686e434173343554416a424441455855514e7a613742";
