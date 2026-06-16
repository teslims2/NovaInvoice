// Client-side only — must be called from client components (uses Freighter wallet)
import { buildContractTx, submitSorobanTx } from "./soroban";
import { signTx } from "./wallet";
import { networkPassphrase, server } from "./stellar";

export async function invokeContract(
  callerAddress: string,
  method: string,
  args: any[]
): Promise<{ hash: string }> {
  const unsignedXdr = await buildContractTx(callerAddress, method, args);
  const signedXdr = await signTx(unsignedXdr, networkPassphrase);
  const { hash } = await submitSorobanTx(signedXdr);
  return { hash };
}

export async function getUSDCBalance(publicKey: string): Promise<string> {
  const account = await server.loadAccount(publicKey);
  const usdc = account.balances.find(
    (b): b is Extract<typeof b, { asset_code: string }> =>
      "asset_code" in b && b.asset_code === "USDC"
  );
  return usdc ? usdc.balance : "0.00";
}
