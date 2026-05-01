import { customerAuthHeaders } from './customerAuth';

export interface WalletTransactionRow {
  id: number;
  orderId: string;
  amount: number;
  createdAt: string | null;
}

export interface WalletMeResponse {
  customerId: number | null;
  balance: number;
  transactions: WalletTransactionRow[];
}

export async function getMyWallet(): Promise<WalletMeResponse> {
  const res = await fetch('/api/wallet/me', {
    headers: { ...customerAuthHeaders() },
  });
  if (res.status === 401) throw new Error('Please sign in to view your wallet');
  if (!res.ok) throw new Error('Failed to fetch wallet');
  return res.json() as Promise<WalletMeResponse>;
}
