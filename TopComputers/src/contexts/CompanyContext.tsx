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

export interface Company {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CompanyInput {
  name: string;
  description?: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  addCompany: (company: CompanyInput) => Promise<any>;
  updateCompany: (id: string, data: Partial<CompanyInput>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  createDefaultCompany: () => Promise<string | undefined>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useCompanies() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompanyProvider');
  }
  return context;
}

interface CompanyProviderProps {
  children: ReactNode;
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();

  // Create default company for new users
  async function createDefaultCompany() {
    if (!currentUser || !userData) return;

    try {
      const defaultCompanyData = {
        name: 'Default Company',
        description: 'Default company',
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'companies'), defaultCompanyData);
      
      // Set this company as the user's current company
      await updateDoc(doc(db, 'users', currentUser.uid), {
        currentCompanyId: docRef.id
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create default company:', error);
    }
  }

  // Fetch all companies the user has access to
  useEffect(() => {
    if (!currentUser) return;
    
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const companiesData: Company[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        companiesData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      
      setCompanies(companiesData);
      
      // If no companies exist, create default company
      if (companiesData.length === 0) {
        await createDefaultCompany();
        setLoading(false);
        return;
      }
      
      // Set current company from user data or first available company
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        const savedCompanyId = userData?.currentCompanyId;
        
        if (savedCompanyId) {
          const savedCompany = companiesData.find(c => c.id === savedCompanyId);
          if (savedCompany) {
            setCurrentCompany(savedCompany);
          } else {
            // Saved company doesn't exist, use first available
            setCurrentCompany(companiesData[0]);
            await updateDoc(doc(db, 'users', currentUser.uid), {
              currentCompanyId: companiesData[0].id
            });
          }
        } else {
          // No saved company, use first available
          setCurrentCompany(companiesData[0]);
          await updateDoc(doc(db, 'users', currentUser.uid), {
            currentCompanyId: companiesData[0].id
          });
        }
      } catch (error) {
        // Fallback to first company
        if (companiesData.length > 0) {
          setCurrentCompany(companiesData[0]);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching companies:', error);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser]);

  // Add a new company
  async function addCompany(companyData: CompanyInput) {
    if (!currentUser || !userData) throw new Error('User not authenticated');
    
    try {
      const companyDoc: any = {
        name: companyData.name,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Only add description if it has a value
      if (companyData.description && companyData.description.trim()) {
        companyDoc.description = companyData.description.trim();
      }
      
      const docRef = await addDoc(collection(db, 'companies'), companyDoc);
      return docRef;
    } catch (error) {
      throw error;
    }
  }

  // Update an existing company
  async function updateCompany(id: string, data: Partial<CompanyInput>) {
    if (!currentUser || !userData) throw new Error('User not authenticated');
    
    const companyRef = doc(db, 'companies', id);
    await updateDoc(companyRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // Delete a company
  async function deleteCompany(id: string) {
    if (!currentUser || !userData) throw new Error('User not authenticated');
    
    // Don't allow deleting the current company if it's the only one
    if (companies.length === 1) {
      throw new Error('Cannot delete the last company');
    }
    
    // If deleting current company, switch to another one first
    if (currentCompany?.id === id) {
      const otherCompany = companies.find(c => c.id !== id);
      if (otherCompany) {
        await switchCompany(otherCompany.id);
      }
    }
    
    await deleteDoc(doc(db, 'companies', id));
  }

  // Switch to a different company
  async function switchCompany(companyId: string) {
    if (!currentUser) throw new Error('User not authenticated');
    
    const company = companies.find(c => c.id === companyId);
    if (!company) throw new Error('Company not found');
    
    setCurrentCompany(company);
    
    // Save the selected company to user document
    await updateDoc(doc(db, 'users', currentUser.uid), {
      currentCompanyId: companyId
    });
  }

  const value = {
    companies,
    currentCompany,
    loading,
    addCompany,
    updateCompany,
    deleteCompany,
    switchCompany,
    createDefaultCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export default CompanyContext; 