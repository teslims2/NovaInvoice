import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected.isConnected) throw new Error("Freighter wallet not found. Please install it.");
  await requestAccess();
  const result = await getAddress();
  if (result.error) throw new Error(result.error.message);
  return result.address;
}

export async function signTx(xdr: string, network: string): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase: network });
  if (result.error) throw new Error(result.error.message);
  return result.signedTxXdr;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connected = await isConnected();
    if (!connected.isConnected) return null;
    const result = await getAddress();
    return result.error ? null : result.address;
  } catch {
    return null;
  }
}
