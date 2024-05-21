// Run the script with the following command:
// bun run src/customMetadata.ts

import { ERC725YDataKeys } from "@lukso/lsp-smart-contracts";

import {
  LSP0ERC725AccountContractTestController,
  LSP3PROFILE_VALUE,
  UNIVERSAL_PROFILE_ADDRESS,
  printInspectAddress,
  printTransactionHash,
  testSigner,
} from "./constants";

/**
 * Update the metadata of the Universal Profile.
 * https://docs.lukso.tech/standards/lsp-background/erc725#erc725y-generic-data-keyvalue-store
 */
const customMetadata = async () => {
  console.log(
    "Updating Metadata of Universal Profile:",
    UNIVERSAL_PROFILE_ADDRESS,
    "with controller:",
    testSigner.address,
    "[do not forget to fund this controller]"
  );

  const key = ERC725YDataKeys.LSP3.LSP3Profile;
  const value = LSP3PROFILE_VALUE; //"0x";

  const tx = await LSP0ERC725AccountContractTestController.setData(key, value);
  printTransactionHash(tx.hash);
  await tx.wait();
  console.log("✅ Profile metadata updated successfully.");
  printInspectAddress(UNIVERSAL_PROFILE_ADDRESS);

  // We used the new controller to update the metadata of the Universal Profile.
  // The ERC725Y standard provides a simple and efficient key/value store for your smart contract.
  // It can be used to store metadata, profile information, and other data.
};

customMetadata();
