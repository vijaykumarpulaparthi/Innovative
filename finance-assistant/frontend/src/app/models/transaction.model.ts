export interface Transaction {
  id: number;
  user_id: number;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  transaction_type: 'expense' | 'income' | 'investment';
  source: 'manual' | 'bank_statement';
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  date: string;
  description: string;
  amount: number;
  category?: string;
  transaction_type: 'expense' | 'income' | 'investment';
  source: 'manual' | 'bank_statement';
}

export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  total_investment: number;
  net_savings: number;
  expense_by_category: Record<string, number>;
}

export interface YearlySummary {
  monthly_data: {
    [key: number]: {
      income: number;
      expense: number;
      investment: number;
    }
  };
  yearly_totals: {
    total_income: number;
    total_expense: number;
    total_investment: number;
    net_savings: number;
  };
}
