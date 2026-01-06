import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useAccounts } from './AccountContext';
import { useBudgetCategories } from './BudgetCategoryContext';


export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: TransactionType;
  category: string;
  budgetCategoryId?: string; // Optional field to link to a budget category
  notes: string;
  createdBy: string;
  accountId: string;
  createdAt: Timestamp;
}

export interface TransactionInput {
  amount: number;
  date: Date;
  type: TransactionType;
  category: string;
  budgetCategoryId?: string; // Optional field to link to a budget category
  notes: string;
}

interface ActivityLog {
  id: string;
  action: 'added' | 'edited' | 'deleted';
  userId: string;
  username: string;
  transactionId: string;
  transactionDetails: Partial<Transaction>;
  timestamp: Date;
}

interface TransactionContextType {
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  loading: boolean;
  addTransaction: (transaction: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  filteredTransactions: (
    type?: TransactionType,
    category?: string,
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ) => Transaction[];
  searchTransactions: (keyword: string) => Transaction[];
  getUsernameById: (userId: string) => string | null;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userCache, setUserCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { currentUser, userData, getUserData, isAdmin } = useAuth();
  const { currentAccount } = useAccounts();
  const { } = useBudgetCategories();

  const getUsernameById = (userId: string): string | null => {
    return userCache[userId] || null;
  };

  // Fetch and cache user data
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUsernames = async () => {
      try {
        // Add current user to cache
        if (userData && !userCache[currentUser.uid]) {
          setUserCache(prev => ({
            ...prev,
            [currentUser.uid]: userData.username
          }));
        }
        
        // Get unique user IDs from transactions and activity logs that aren't in cache
        const uniqueUserIds = [...transactions.map(t => t.createdBy), ...activityLogs.map(log => log.userId)]
          .filter((id, index, self) => self.indexOf(id) === index)
          .filter(id => !userCache[id] && id !== currentUser.uid);
        
        // Fetch usernames for each unique ID
        for (const userId of uniqueUserIds) {
          const user = await getUserData(userId);
          if (user) {
            setUserCache(prev => ({
              ...prev,
              [userId]: user.username
            }));
          }
        }
      } catch (error) {
        // Silent fail for production
      }
    };
    
    fetchUsernames();
  }, [currentUser, userData, transactions, activityLogs, userCache, getUserData]);

  // Fetch all transactions from Firestore
  useEffect(() => {
    if (!currentUser || !currentAccount) {
      setLoading(false);
      return;
    }
    
    const transactionsRef = collection(db, 'transactions');
    // For now, get all transactions and filter on client side to handle legacy data
    const q = query(
      transactionsRef, 
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        try {
          // Ensure date is properly converted to Date object
          const date = data.date && data.date.toDate ? data.date.toDate() : new Date();
          
          // Include transaction if it belongs to current account 
          // OR has no accountId/companyId (legacy data) and current account is Personal Finance
          if (data.accountId === currentAccount.id || 
              data.companyId === currentAccount.id || 
              ((!data.accountId && !data.companyId) && currentAccount.name === 'Personal Finance')) {
            transactionsData.push({
              id: doc.id,
              amount: data.amount,
              date: date,
              type: data.type as TransactionType,
              category: data.category,
              budgetCategoryId: data.budgetCategoryId, // Include budget category ID
              notes: data.notes,
              createdBy: data.createdBy,
              accountId: data.accountId || data.companyId || currentAccount.id, // Handle legacy data
              createdAt: data.createdAt,
            });
          }
        } catch (error) {
          // Skip invalid transaction data
        }
      });
      
      setTransactions(transactionsData);
      setLoading(false);
    }, (_error) => {
      // Silent fail for production - set loading to false
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser, currentAccount]);

  // Fetch activity logs from Firestore
  useEffect(() => {
    if (!currentUser || !currentAccount) return;
    
    const logsRef = collection(db, 'activityLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData: ActivityLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Include activity log if it belongs to current account 
        // OR has no accountId/companyId (legacy data) and current account is Personal Finance
        if (data.accountId === currentAccount.id || 
            data.companyId === currentAccount.id || 
            ((!data.accountId && !data.companyId) && currentAccount.name === 'Personal Finance')) {
          logsData.push({
            id: doc.id,
            action: data.action,
            userId: data.userId,
            username: data.username || '', // Support older logs without username
            transactionId: data.transactionId,
            transactionDetails: data.transactionDetails,
            timestamp: data.timestamp.toDate(),
          });
        }
      });
      setActivityLogs(logsData);
    });
    
    return unsubscribe;
  }, [currentUser, currentAccount]);

  // Add a new transaction
  async function addTransaction(transaction: TransactionInput) {
    if (!currentUser || !userData || !currentAccount) throw new Error('User not authenticated or no account selected');
    
    const transactionsRef = collection(db, 'transactions');
    const newTransaction: any = {
      amount: transaction.amount,
      date: Timestamp.fromDate(transaction.date),
      type: transaction.type,
      category: transaction.category,
      notes: transaction.notes,
      createdBy: currentUser.uid,
      accountId: currentAccount.id,
      createdAt: serverTimestamp(),
    };
    
    // Only add budgetCategoryId if it exists and transaction is an expense
    if (transaction.budgetCategoryId && transaction.type === 'expense') {
      newTransaction.budgetCategoryId = transaction.budgetCategoryId;
    }
    
    const docRef = await addDoc(transactionsRef, newTransaction);
    
    // Add activity log
    const logsRef = collection(db, 'activityLogs');
    await addDoc(logsRef, {
      action: 'added',
      userId: currentUser.uid,
      username: userData.username,
      transactionId: docRef.id,
      accountId: currentAccount.id,
      transactionDetails: {
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        budgetCategoryId: transaction.budgetCategoryId,
      },
      timestamp: serverTimestamp(),
    });
    
    // Update budget category spent amount if this is an expense and has a budget category selected
    if (transaction.type === 'expense' && transaction.budgetCategoryId) {
      try {
        // Get the budget category document
        const categoryRef = doc(db, 'budgetCategories', transaction.budgetCategoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          const currentSpent = categoryData.spent || 0;
          
          // Update the spent amount
          await updateDoc(categoryRef, {
            spent: currentSpent + transaction.amount,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating budget category spent amount:", error);
        // Don't throw error here - we don't want to fail the transaction add if budget update fails
      }
    }
  }

  // Update an existing transaction
  async function updateTransaction(id: string, data: Partial<TransactionInput>) {
    if (!currentUser || !userData || !currentAccount) throw new Error('User not authenticated or no account selected');
    
    // Find the transaction to check ownership
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) throw new Error('Transaction not found');
    
    // Check if user owns this transaction OR is an admin
    if (transaction.createdBy !== currentUser.uid && !isAdmin()) {
      throw new Error('You do not have permission to edit this transaction');
    }
    
    // If date is being updated, convert it to Firestore Timestamp
    const updatedData = { ...data } as any;
    if (data.date) {
      updatedData.date = Timestamp.fromDate(data.date);
    }
    
    // Handle budget category changes
    if (transaction.type === 'expense') {
      try {
        // If budget category is being changed
        if (data.budgetCategoryId !== undefined && data.budgetCategoryId !== transaction.budgetCategoryId) {
          // If there was a previous budget category, reduce its spent amount
          if (transaction.budgetCategoryId) {
            const oldCategoryRef = doc(db, 'budgetCategories', transaction.budgetCategoryId);
            const oldCategoryDoc = await getDoc(oldCategoryRef);
            
            if (oldCategoryDoc.exists()) {
              const oldCategoryData = oldCategoryDoc.data();
              const oldSpent = oldCategoryData.spent || 0;
              await updateDoc(oldCategoryRef, {
                spent: Math.max(0, oldSpent - transaction.amount),
                updatedAt: serverTimestamp()
              });
            }
          }
          
          // If there's a new budget category, add to its spent amount
          if (data.budgetCategoryId) {
            const newCategoryRef = doc(db, 'budgetCategories', data.budgetCategoryId);
            const newCategoryDoc = await getDoc(newCategoryRef);
            
            if (newCategoryDoc.exists()) {
              const newCategoryData = newCategoryDoc.data();
              const newSpent = newCategoryData.spent || 0;
              const amount = data.amount !== undefined ? data.amount : transaction.amount;
              await updateDoc(newCategoryRef, {
                spent: newSpent + amount,
                updatedAt: serverTimestamp()
              });
            }
          }
        }
        // If only the amount is being changed and there's a budget category
        else if (data.amount !== undefined && transaction.budgetCategoryId) {
          const categoryRef = doc(db, 'budgetCategories', transaction.budgetCategoryId);
          const categoryDoc = await getDoc(categoryRef);
          
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            const currentSpent = categoryData.spent || 0;
            const amountDifference = data.amount - transaction.amount;
            
            await updateDoc(categoryRef, {
              spent: Math.max(0, currentSpent + amountDifference),
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (error) {
        console.error("Error updating budget category spent amount:", error);
      }
    }
    // If transaction type is being changed from income to expense
    else if (transaction.type === 'income' && data.type === 'expense' && data.budgetCategoryId) {
      try {
        const categoryRef = doc(db, 'budgetCategories', data.budgetCategoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          const currentSpent = categoryData.spent || 0;
          const amount = data.amount !== undefined ? data.amount : transaction.amount;
          
          await updateDoc(categoryRef, {
            spent: currentSpent + amount,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating budget category spent amount:", error);
      }
    }
    // If transaction type is being changed from expense to income
    // @ts-ignore - Ignore TypeScript error for this line
    else if (transaction.type === 'expense' && data.type === 'income' && transaction.budgetCategoryId) {
      try {
        const categoryRef = doc(db, 'budgetCategories', transaction.budgetCategoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          const currentSpent = categoryData.spent || 0;
          
          await updateDoc(categoryRef, {
            spent: Math.max(0, currentSpent - transaction.amount),
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating budget category spent amount:", error);
      }
    }
    
    const transactionRef = doc(db, 'transactions', id);
    await updateDoc(transactionRef, updatedData);
    
    // Add activity log
    const logsRef = collection(db, 'activityLogs');
    await addDoc(logsRef, {
      action: 'edited',
      userId: currentUser.uid,
      username: userData.username,
      transactionId: id,
      accountId: currentAccount.id,
      transactionDetails: {
        ...data,
        budgetCategoryId: data.budgetCategoryId
      },
      timestamp: serverTimestamp(),
    });
  }

  // Delete a transaction
  async function deleteTransaction(id: string) {
    if (!currentUser || !userData || !currentAccount) throw new Error('User not authenticated or no account selected');
    
    // Get transaction details before deleting and check ownership
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) throw new Error('Transaction not found');
    
    // Check if user owns this transaction OR is an admin
    if (transaction.createdBy !== currentUser.uid && !isAdmin()) {
      throw new Error('You do not have permission to delete this transaction');
    }
    
    // If this is an expense transaction with a budget category, update the budget
    if (transaction.type === 'expense' && transaction.budgetCategoryId) {
      try {
        const categoryRef = doc(db, 'budgetCategories', transaction.budgetCategoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          const currentSpent = categoryData.spent || 0;
          
          await updateDoc(categoryRef, {
            spent: Math.max(0, currentSpent - transaction.amount),
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating budget category spent amount:", error);
        // Don't throw error here - we don't want to fail the transaction deletion if budget update fails
      }
    }
    
    const transactionRef = doc(db, 'transactions', id);
    await deleteDoc(transactionRef);
    
    // Add activity log
    const logsRef = collection(db, 'activityLogs');
    await addDoc(logsRef, {
      action: 'deleted',
      userId: currentUser.uid,
      username: userData.username,
      transactionId: id,
      accountId: currentAccount.id,
      transactionDetails: {
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        budgetCategoryId: transaction.budgetCategoryId
      },
      timestamp: serverTimestamp(),
    });
  }

  // Filter transactions based on criteria
  function filteredTransactions(
    type?: TransactionType,
    category?: string,
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Transaction[] {
    return transactions.filter(transaction => {
      let match = true;
      
      if (type && transaction.type !== type) match = false;
      if (category && transaction.category !== category) match = false;
      if (startDate && transaction.date < startDate) match = false;
      if (endDate && transaction.date > endDate) match = false;
      if (userId && transaction.createdBy !== userId) match = false;
      
      return match;
    });
  }

  // Search transactions by keyword
  function searchTransactions(keyword: string): Transaction[] {
    if (!keyword.trim()) return transactions;
    
    const searchTerm = keyword.toLowerCase();
    return transactions.filter(transaction => {
      return (
        transaction.category.toLowerCase().includes(searchTerm) ||
        transaction.notes.toLowerCase().includes(searchTerm)
      );
    });
  }

  const value = {
    transactions,
    activityLogs,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filteredTransactions,
    searchTransactions,
    getUsernameById,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export default TransactionContext;
