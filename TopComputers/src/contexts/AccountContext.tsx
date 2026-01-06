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
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Account {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AccountInput {
  name: string;
  description?: string;
}

interface AccountContextType {
  accounts: Account[];
  currentAccount: Account | null;
  loading: boolean;
  addAccount: (account: AccountInput) => Promise<any>;
  updateAccount: (id: string, data: Partial<AccountInput>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  switchAccount: (accountId: string) => Promise<void>;
  createDefaultAccount: () => Promise<string | undefined>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}

interface AccountProviderProps {
  children: ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();

    // Create default account for new users
async function createDefaultAccount() {
    console.log('Creating default account for user:', currentUser?.uid);
    if (!currentUser || !userData) {
      console.log('Cannot create account - missing user or userData:', { currentUser: !!currentUser, userData: !!userData });
      return;
    }

    try {
      const defaultAccountData = {
        name: 'Personal Finance',
        description: 'My personal finances',
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'accounts'), defaultAccountData);
      
      // Set this account as the user's current account
      await updateDoc(doc(db, 'users', currentUser.uid), {
        currentAccountId: docRef.id
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create default account:', error);
    }
  }

  // Fetch all accounts the user has access to
  useEffect(() => {
    if (!currentUser) return;
    
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log('Fetching accounts for user:', currentUser.uid);
      const accountsData: Account[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        accountsData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      
      console.log('Found accounts:', accountsData.length);
      setAccounts(accountsData);
      
      // If no accounts exist, create default account
      if (accountsData.length === 0) {
        console.log('No accounts found, creating default account');
        await createDefaultAccount();
        setLoading(false);
        return;
      }
      
      // Set current account from user data or first available account
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        const savedAccountId = userData?.currentAccountId;
        
        if (savedAccountId) {
          const savedAccount = accountsData.find(a => a.id === savedAccountId);
          if (savedAccount) {
            setCurrentAccount(savedAccount);
          } else {
            // Saved account doesn't exist, use first available
            setCurrentAccount(accountsData[0]);
            await updateDoc(doc(db, 'users', currentUser.uid), {
              currentAccountId: accountsData[0].id
            });
          }
        } else {
          // No saved account, use first available
          setCurrentAccount(accountsData[0]);
          await updateDoc(doc(db, 'users', currentUser.uid), {
            currentAccountId: accountsData[0].id
          });
        }
      } catch (error) {
        // Fallback to first account
        if (accountsData.length > 0) {
          setCurrentAccount(accountsData[0]);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching accounts:', error);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser]);

  // Add a new account
  async function addAccount(accountData: AccountInput) {
    if (!currentUser || !userData) throw new Error('User not authenticated');
    
    try {
      const accountDoc: any = {
        name: accountData.name,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Only add description if it has a value
      if (accountData.description && accountData.description.trim()) {
        accountDoc.description = accountData.description.trim();
      }
      
      const docRef = await addDoc(collection(db, 'accounts'), accountDoc);
      return docRef;
    } catch (error) {
      throw error;
    }
  }

  // Update an existing account
  async function updateAccount(id: string, data: Partial<AccountInput>) {
    if (!currentUser || !userData) throw new Error('User not authenticated');
    
    const accountRef = doc(db, 'accounts', id);
    await updateDoc(accountRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // Delete an account
  async function deleteAccount(id: string) {
    if (!currentUser || !userData) throw new Error('User not authenticated');
    
    // Don't allow deleting the current account if it's the only one
    if (accounts.length === 1) {
      throw new Error('Cannot delete the last account');
    }
    
    // If deleting current account, switch to another one first
    if (currentAccount?.id === id) {
      const otherAccount = accounts.find(a => a.id !== id);
      if (otherAccount) {
        await switchAccount(otherAccount.id);
      }
    }
    
    await deleteDoc(doc(db, 'accounts', id));
  }

  // Switch to a different account
  async function switchAccount(accountId: string) {
    if (!currentUser) throw new Error('User not authenticated');
    
    const account = accounts.find(a => a.id === accountId);
    if (!account) throw new Error('Account not found');
    
    setCurrentAccount(account);
    
    // Save the selected account to user document
    await updateDoc(doc(db, 'users', currentUser.uid), {
      currentAccountId: accountId
    });
  }

  const value = {
    accounts,
    currentAccount,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    switchAccount,
    createDefaultAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export default AccountContext;
