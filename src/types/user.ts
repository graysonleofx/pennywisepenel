export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  image: string;
  country: string;
  balance: number;
  totalProfit: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalInvestment: number;
  firstLogin: boolean;
  referer: string;
  password: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}
