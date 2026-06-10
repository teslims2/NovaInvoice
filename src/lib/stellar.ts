import * as StellarSdk from "@stellar/stellar-sdk";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
const HORIZON_URL =
  NETWORK === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);
export const networkPassphrase =
  NETWORK === "mainnet"
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;

export async function buildPaymentTx(
  senderAddress: string,
  destinationAddress: string,
  amount: string,
  assetCode = "USDC",
  assetIssuer = process.env.NEXT_PUBLIC_USDC_ISSUER || ""
): Promise<string> {
  const account = await server.loadAccount(senderAddress);
  const asset =
    assetCode === "XLM"
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(assetCode, assetIssuer);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({ destination: destinationAddress, asset, amount })
    )
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function submitSignedTx(signedXdr: string) {
  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  return server.submitTransaction(tx);
}
