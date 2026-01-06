import { useAccounts } from '../contexts/AccountContext';

// Personal Finance Income Categories
const PERSONAL_INCOME_CATEGORIES = [
  'Salary',
  'Freelance Work',
  'Investments',
  'Interest',
  'Gifts',
  'Tax Refunds',
  'Side Hustle',
  'Rental Income',
  'Dividends',
  'Other Income'
];

// Personal Finance Expense Categories
const PERSONAL_EXPENSE_CATEGORIES = [
  'Fuel & Transportation',
  'Cash Spending',
  'Food & Groceries',
  'Rent/Mortgage',
  'Personal Loans',
  'Entertainment & Hobbies',
  'Utilities',
  'Clothing & Accessories',
  'Healthcare & Medications',
  'Travel',
  'Education',
  'Dining Out',
  'Subscriptions',
  'Insurance',
  'Gifts & Donations',
  'Home Maintenance',
  'Electronics',
  'Savings & Investments',
  'Other Expense'
];

export function useTransactionCategories() {
  const { currentAccount } = useAccounts();

  const getIncomeCategories = (): string[] => {
    // Return personal finance income categories regardless of company
    return PERSONAL_INCOME_CATEGORIES;
  };

  const getExpenseCategories = (): string[] => {
    // Return personal finance expense categories regardless of company
    return PERSONAL_EXPENSE_CATEGORIES;
  };

  const getCategories = (type: 'income' | 'expense'): string[] => {
    return type === 'income' ? getIncomeCategories() : getExpenseCategories();
  };

  return {
    getIncomeCategories,
    getExpenseCategories,
    getCategories,
    currentAccount
  };
} 