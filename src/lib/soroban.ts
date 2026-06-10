import * as StellarSdk from "@stellar/stellar-sdk";
import { networkPassphrase } from "./stellar";

const CONTRACT_ID = process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || "";
const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
    ? "https://soroban-rpc.stellar.org"
    : "https://soroban-testnet.stellar.org";

export function getSorobanRpc() {
  return new StellarSdk.rpc.Server(RPC_URL);
}

export async function buildContractTx(
  callerAddress: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<string> {
  const rpcServer = getSorobanRpc();
  const account = await rpcServer.getAccount(callerAddress);
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await rpcServer.prepareTransaction(tx);
  return prepared.toXDR();
}

export async function submitSorobanTx(signedXdr: string) {
  const rpcServer = getSorobanRpc();
  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  const response = await rpcServer.sendTransaction(tx);

  if (response.status === "ERROR") {
    throw new Error("Soroban tx error");
  }

  let result = await rpcServer.getTransaction(response.hash);
  while (result.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1000));
    result = await rpcServer.getTransaction(response.hash);
  }

  if (result.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Soroban transaction failed");
  }

  return { hash: response.hash, result };
}

function toI128(value: number) {
  return StellarSdk.nativeToScVal(BigInt(Math.round(value * 1e7)), { type: "i128" });
}

function toU64(value: number) {
  return StellarSdk.nativeToScVal(value, { type: "u64" });
}

export async function sorobanRegisterInvoice(
  callerAddress: string,
  invoiceId: string,
  amount: number,
  dueDateUnix: number
) {
  return buildContractTx(callerAddress, "register_invoice", [
    StellarSdk.nativeToScVal(invoiceId, { type: "string" }),
    toI128(amount),
    toU64(dueDateUnix),
  ]);
}

export async function sorobanRepay(callerAddress: string, invoiceId: string, amount: number) {
  return buildContractTx(callerAddress, "repay", [
    StellarSdk.nativeToScVal(invoiceId, { type: "string" }),
    toI128(amount),
  ]);
}
