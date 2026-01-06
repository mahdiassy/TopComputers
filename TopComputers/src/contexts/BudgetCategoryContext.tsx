import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useAccounts } from './AccountContext';

export type BudgetStatus = 'active' | 'inactive';

export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  monthlyBudget: number;
  spent: number;
  status: BudgetStatus;
  notes: string;
  createdBy: string;
  accountId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BudgetCategoryInput {
  name: string;
  description: string;
  monthlyBudget: number;
  status: BudgetStatus;
  notes: string;
}

interface BudgetActivityLog {
  id: string;
  action: 'added' | 'edited' | 'deleted';
  userId: string;
  username: string;
  categoryId: string;
  categoryDetails: Partial<BudgetCategory>;
  timestamp: Date;
}

interface BudgetCategoryContextType {
  categories: BudgetCategory[];
  budgetActivityLogs: BudgetActivityLog[];
  loading: boolean;
  addCategory: (category: BudgetCategoryInput) => Promise<void>;
  updateCategory: (id: string, data: Partial<BudgetCategoryInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  filteredCategories: (
    status?: BudgetStatus
  ) => BudgetCategory[];
  searchCategories: (keyword: string) => BudgetCategory[];
  findCategoryByName: (name: string) => BudgetCategory | undefined;
  updateCategorySpent: (categoryName: string, amount: number) => Promise<void>;
  getBudgetStats: () => {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    categoryCount: number;
  };
}

const BudgetCategoryContext = createContext<BudgetCategoryContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useBudgetCategories() {
  const context = useContext(BudgetCategoryContext);
  if (context === undefined) {
    throw new Error('useBudgetCategories must be used within a BudgetCategoryProvider');
  }
  return context;
}

interface BudgetCategoryProviderProps {
  children: ReactNode;
}

export function BudgetCategoryProvider({ children }: BudgetCategoryProviderProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [budgetActivityLogs, setBudgetActivityLogs] = useState<BudgetActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();
  const { currentAccount } = useAccounts();

  // Fetch all budget categories from Firestore
  useEffect(() => {
    if (!currentUser || !currentAccount) {
      setLoading(false);
      return;
    }
    
    const categoriesRef = collection(db, 'budgetCategories');
    const q = query(
      categoriesRef, 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const categoriesData: BudgetCategory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        try {
          // Include category if it belongs to current account 
          // OR has no accountId/companyId (legacy data) and current account is Personal Finance
          if (data.accountId === currentAccount.id || 
              data.companyId === currentAccount.id || 
              ((!data.accountId && !data.companyId) && currentAccount.name === 'Personal Finance')) {
            categoriesData.push({
              id: doc.id,
              name: data.name,
              description: data.description || '',
              monthlyBudget: data.monthlyBudget || 0,
              spent: data.spent || 0,
              status: data.status as BudgetStatus || 'active',
              notes: data.notes || '',
              createdBy: data.createdBy,
              accountId: data.accountId || data.companyId || currentAccount.id, // Handle legacy data
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          }
        } catch (error) {
          // Skip invalid category data
        }
      });
      
      setCategories(categoriesData);
      setLoading(false);
    }, (_error) => {
      // Silent fail for production - set loading to false
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser, currentAccount]);

  // Fetch budget activity logs from Firestore
  useEffect(() => {
    if (!currentUser || !currentAccount) return;
    
    const logsRef = collection(db, 'budgetActivityLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData: BudgetActivityLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Include budget activity log if it belongs to current account
        if (data.accountId === currentAccount.id || 
            data.companyId === currentAccount.id || 
            ((!data.accountId && !data.companyId) && currentAccount.name === 'Personal Finance')) {
          logsData.push({
            id: doc.id,
            action: data.action,
            userId: data.userId,
            username: data.username || '',
            categoryId: data.categoryId,
            categoryDetails: data.categoryDetails,
            timestamp: data.timestamp.toDate(),
          });
        }
      });
      setBudgetActivityLogs(logsData);
    });
    
    return unsubscribe;
  }, [currentUser, currentAccount]);

  // Add a new budget category
  async function addCategory(categoryData: BudgetCategoryInput) {
    if (!currentUser || !userData || !currentAccount) return;

    try {
      const categoryDoc = {
        ...categoryData,
        spent: 0, // Initialize spent amount to zero
        createdBy: currentUser.uid,
        accountId: currentAccount.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'budgetCategories'), categoryDoc);

      // Log the activity
      await addDoc(collection(db, 'budgetActivityLogs'), {
        action: 'added',
        userId: currentUser.uid,
        username: userData.username,
        categoryId: docRef.id,
        accountId: currentAccount.id,
        categoryDetails: { name: categoryData.name, monthlyBudget: categoryData.monthlyBudget },
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to add budget category');
    }
  }

  // Update an existing budget category
  async function updateCategory(id: string, data: Partial<BudgetCategoryInput>) {
    if (!currentUser || !userData || !currentAccount) return;

    try {
      const categoryRef = doc(db, 'budgetCategories', id);
      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(categoryRef, updateData);

      // Log the activity
      await addDoc(collection(db, 'budgetActivityLogs'), {
        action: 'edited',
        userId: currentUser.uid,
        username: userData.username,
        categoryId: id,
        accountId: currentAccount.id,
        categoryDetails: data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to update budget category');
    }
  }

  // Delete a budget category
  async function deleteCategory(id: string) {
    if (!currentUser || !userData || !currentAccount) return;

    try {
      const category = categories.find(c => c.id === id);
      if (!category) return;

      await deleteDoc(doc(db, 'budgetCategories', id));

      // Log the activity
      await addDoc(collection(db, 'budgetActivityLogs'), {
        action: 'deleted',
        userId: currentUser.uid,
        username: userData.username,
        categoryId: id,
        accountId: currentAccount.id,
        categoryDetails: { name: category.name },
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to delete budget category');
    }
  }

  // Filter categories based on criteria
  function filteredCategories(
    status?: BudgetStatus
  ): BudgetCategory[] {
    return categories.filter(category => {
      if (status && category.status !== status) return false;
      return true;
    });
  }

  // Search categories by keyword
  function searchCategories(keyword: string): BudgetCategory[] {
    const searchTerm = keyword.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm) ||
      category.description.toLowerCase().includes(searchTerm) ||
      category.notes.toLowerCase().includes(searchTerm)
    );
  }

  // Find a budget category by name
  function findCategoryByName(name: string): BudgetCategory | undefined {
    // Case-insensitive search for the category
    return categories.find(category => 
      category.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Update a budget category's spent amount
  async function updateCategorySpent(categoryName: string, amount: number): Promise<void> {
    if (!currentUser || !currentAccount) return;

    try {
      // Find the category
      const category = findCategoryByName(categoryName);
      if (!category) return; // Category not found

      // Get the current spent amount
      const currentSpent = category.spent || 0;
      
      // Calculate the new spent amount (ensure it's not negative)
      const newSpent = Math.max(0, currentSpent + amount);
      
      // Update the category in Firestore
      const categoryRef = doc(db, 'budgetCategories', category.id);
      await updateDoc(categoryRef, {
        spent: newSpent,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating category spent amount:", error);
    }
  }

  // Get budget statistics
  function getBudgetStats() {
    const totalBudget = categories.reduce((sum, category) => sum + category.monthlyBudget, 0);
    const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);
    const remainingBudget = totalBudget - totalSpent;
    const categoryCount = categories.length;

    return {
      totalBudget,
      totalSpent,
      remainingBudget,
      categoryCount
    };
  }

  const contextValue: BudgetCategoryContextType = {
    categories,
    budgetActivityLogs,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    filteredCategories,
    searchCategories,
    findCategoryByName,
    updateCategorySpent,
    getBudgetStats,
  };

  return (
    <BudgetCategoryContext.Provider value={contextValue}>
      {children}
    </BudgetCategoryContext.Provider>
  );
}

export default BudgetCategoryContext;
