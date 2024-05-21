// Run the script with the following command:
// bun run src/relayedCalls.ts

// Inspired by: https://github.com/lukso-network/lukso-playground/blob/main/key-manager/execute-relay-call.ts

import { ethers } from "ethers";
import { EIP191Signer } from "@lukso/eip191-signer.js";
import KeyManagerContract from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
// This is the version relative to the LSP25 standard, defined as the number 25.
import { LSP25_VERSION } from "@lukso/lsp-smart-contracts/constants";

import {
  LSP0ERC725AccountContract,
  UNIVERSAL_PROFILE_ADDRESS,
  printAddress,
  printTransactionHash,
  relaySigner,
  testSigner,
} from "./constants";

/**
 * Send some LYX from the UP to the relay account.
 * https://docs.lukso.tech/standards/lsp-background/erc725#erc725x
 */
const fundRelayAccountFromUp = async () => {
  console.log(
    "Execute a relayed call for Universal Profile:",
    UNIVERSAL_PROFILE_ADDRESS,
    "with controller:",
    testSigner.address,
    "[do not forget to fund this controller]"
  );

  // Let's first fund our relay signer with some LYX
  const tx = await LSP0ERC725AccountContract.execute(
    0, // operation of type CALL
    relaySigner.address, // recipient address including profiles and vaults
    ethers.parseEther("0.01"), // amount in LYX, converting to wei
    "0x" // contract calldata, empty for regular transfer
  );

  printTransactionHash(tx.hash);
  await tx.wait();
  console.log("✅ LYX sent to relay EOA.");
  printAddress(relaySigner.address);
};

/**
 * Execute a relayed call for the Universal Profile.
 */
const executeRelayCall = async () => {
  // Call the Universal Profile contract to get the Key Manager
  const keyManagerAddress = await LSP0ERC725AccountContract.owner();
  console.log("Key Manager Address: ", keyManagerAddress);
  printAddress(keyManagerAddress);

  // Setup the contract instance of the Key Manager
  const keyManager = new ethers.Contract(
    keyManagerAddress,
    KeyManagerContract.abi,
    relaySigner
  );

  const channelId = 0;

  // Retrieve the nonce of the EOA controller
  const nonce = await keyManager.getNonce(relaySigner.address, channelId);

  // Generate the payload of the transaction
  const abiPayload = LSP0ERC725AccountContract.interface.encodeFunctionData(
    "execute",
    [
      0, // Operation type: CALL
      testSigner.address, // Recipient
      ethers.parseEther("0.08"), // transfer amount in LYX
      "0x", // Optional transaction data
    ]
  );

  // Encode the Message
  const encodedMessage = ethers.solidityPacked(
    // Types of the parameters that will be encoded
    ["uint256", "uint256", "uint256", "uint256", "uint256", "bytes"],
    [
      // MUST be number `25`
      // Encoded value: `0x0000000000000000000000000000000000000000000000000000000000000019`
      LSP25_VERSION,

      // e.g: `42` for LUKSO Mainnet
      42,

      // e.g: nonce number 5 of the signing controller that wants to execute the payload
      // Encoded value: `0x0000000000000000000000000000000000000000000000000000000000000005`
      nonce,

      // e.g: valid until 1st January 2025 at midnight (GMT).
      // Timestamp = 1735689600
      // Encoded value: `0x0000000000000000000000000000000000000000000000000000000067748580`
      0,

      // e.g: not funding the contract with any LYX (0)
      // Encoded value: `0x0000000000000000000000000000000000000000000000000000000000000000`
      0,

      // e.g: send LYX to address 0xcafecafecafecafecafecafecafecafecafecafe
      // by calling execute(uint256,address,uint256,bytes)
      // Encoded value: `0x44c028fe00000000000000000000000000000000000000000000000000000000
      //                 00000000000000000000000000000000cafecafecafecafecafecafecafecafeca
      //                 fecafecafecafe00000000000000000000000000000000000000000000000029a2
      //                 241af62c0000000000000000000000000000000000000000000000000000000000
      //                 000000008000000000000000000000000000000000000000000000000000000000
      //                 00000000`
      abiPayload,
    ]
  );

  // Instanciate EIP191 Signer
  const eip191Signer = new EIP191Signer();

  /**
   * Create signature of the transaction payload using:
   * - Key Manager Address
   * - Message (LSP6 version, chain ID, nonce, timestamp, value, payload)
   * - private key of the controller
   */
  const { signature } = await eip191Signer.signDataWithIntendedValidator(
    keyManagerAddress,
    encodedMessage,
    process.env.CONTROLLER_PRIVATE_KEY || ""
  );

  /**
   * Execute relay call transaction
   *
   * In this example script, we will
   * use the same controller that created
   * the transaction
   */
  const executeRelayCallTransaction = await keyManager
    .connect(relaySigner)
    // @ts-expect-error Ethers BaseContract does not pick dynamic types from ABIs
    .executeRelayCall(signature, nonce, 0, abiPayload);

  const receipt = await executeRelayCallTransaction.wait();

  if (receipt.status === 1 || receipt.status === true) {
    console.log("Transaction successful");
  } else {
    console.log("Transaction failed");
  }
};

executeRelayCall();
