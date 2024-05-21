// Run the script with the following command:
// bun run src/keyManagement.ts

import ERC725, { encodeKeyName } from "@erc725/erc725.js";

import {
  LSP0ERC725AccountContract,
  UNIVERSAL_PROFILE_ADDRESS,
  printInspectAddress,
  printTransactionHash,
  signer,
  testSigner,
} from "./constants";
import { ERC725YDataKeys } from "@lukso/lsp-smart-contracts";

// List of permissions can be found here:
// https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager#permissions

/**
 * Update the permissions of the Universal Profile by adding a new controller.
 */
const updatePermissions = async () => {
  console.log(
    "Updating permissions of Universal Profile:",
    UNIVERSAL_PROFILE_ADDRESS,
    "with controller:",
    signer.address
  );

  // Length of the permissions array
  const keyLength = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;
  const valueLength = "0x00000000000000000000000000000003"; // Initially, there are 2 controllers, so we add the third one.

  const keyIndex =
    ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
    "00000000000000000000000000000002";
  const valueIndex = testSigner.address.toLocaleLowerCase(); // The address of the new controller, at index 2 (index starts at 0)

  // Set the permissions
  const permissionKey = encodeKeyName(
    "AddressPermissions:Permissions:<address>",
    testSigner.address
  );

  // The list of permissions can be found here:
  // https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager#permissions
  // https://docs.lukso.tech/tools/erc725js/methods#encodepermissions

  const permissionsValue = ERC725.encodePermissions({
    ADDCONTROLLER: true,
    EDITPERMISSIONS: true,
    SIGN: true,
    SETDATA: true,
  });

  console.log(keyIndex, valueIndex);

  const tx = await LSP0ERC725AccountContract.setDataBatch(
    [keyLength, keyIndex, permissionKey],
    [valueLength, valueIndex, permissionsValue]
  );
  printTransactionHash(tx.hash);
  await tx.wait();
  console.log("✅ Permissions updated successfully.");
  printInspectAddress(UNIVERSAL_PROFILE_ADDRESS);

  // Our new controller has been added to the permissions list and can now execute transactions on behalf of the Universal Profile.
};
updatePermissions();
