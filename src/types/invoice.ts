export type InvoiceStatus = 'PENDING' | 'VERIFIED' | 'FUNDED' | 'TRADING' | 'REPAID' | 'DEFAULTED';

export interface Invoice {
  id: string;
  issuerId: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  debtorName: string;
  debtorAddress?: string | null;
  status: InvoiceStatus;
  discountRate: number;
  txHash?: string | null;
  contractId?: string | null;
  createdAt: string;
  updatedAt: string;
  issuer?: { stellarAddress: string; isVerified: boolean };
}
