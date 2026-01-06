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
import { useCompanies } from './CompanyContext';

export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectName: string;
  projectType: string;
  projectPayment: number;
  annualFee: number;
  startDate: Date;
  contractEndDate: Date;
  nextRenewalDate: Date;
  lastRenewalDate?: Date;
  projectStatus: ProjectStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  createdBy: string;
  companyId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClientInput {
  name: string;
  email: string;
  phone: string;
  projectName: string;
  projectType: string;
  projectPayment: number;
  annualFee: number;
  startDate: Date;
  contractEndDate: Date;
  projectStatus: ProjectStatus;
  paymentStatus: PaymentStatus;
  notes: string;
}

interface ClientActivityLog {
  id: string;
  action: 'added' | 'edited' | 'deleted' | 'renewed';
  userId: string;
  username: string;
  clientId: string;
  clientDetails: Partial<Client>;
  timestamp: Date;
}

interface ClientContextType {
  clients: Client[];
  clientActivityLogs: ClientActivityLog[];
  loading: boolean;
  addClient: (client: ClientInput) => Promise<void>;
  updateClient: (id: string, data: Partial<ClientInput>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  renewClient: (id: string) => Promise<void>;
  getOverdueClients: () => Client[];
  getUpcomingRenewals: (daysAhead?: number) => Client[];
  filteredClients: (
    status?: ProjectStatus,
    paymentStatus?: PaymentStatus,
    projectType?: string
  ) => Client[];
  searchClients: (keyword: string) => Client[];
  getClientStats: () => {
    totalRevenue: number;
    annualRevenue: number;
    activeClients: number;
    overdueCount: number;
    upcomingRenewals: number;
  };
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientActivityLogs, setClientActivityLogs] = useState<ClientActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();
  const { currentCompany } = useCompanies();

  // Calculate next renewal date based on start date or last renewal
  const calculateNextRenewalDate = (startDate: Date, lastRenewalDate?: Date): Date => {
    const baseDate = lastRenewalDate || startDate;
    const nextRenewal = new Date(baseDate);
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    return nextRenewal;
  };

  // Fetch all clients from Firestore
  useEffect(() => {
    if (!currentUser || !currentCompany) {
      setLoading(false);
      return;
    }
    
    const clientsRef = collection(db, 'clients');
    // For now, get all clients and filter on client side to handle legacy data
    const q = query(
      clientsRef, 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientsData: Client[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        try {
          // Ensure dates are properly converted to Date objects
          const startDate = data.startDate && data.startDate.toDate ? data.startDate.toDate() : new Date();
          const contractEndDate = data.contractEndDate && data.contractEndDate.toDate ? data.contractEndDate.toDate() : new Date();
          const nextRenewalDate = data.nextRenewalDate && data.nextRenewalDate.toDate ? data.nextRenewalDate.toDate() : new Date();
          const lastRenewalDate = data.lastRenewalDate && data.lastRenewalDate.toDate ? data.lastRenewalDate.toDate() : undefined;
          
          // Include client if it belongs to current company 
          // OR has no companyId (legacy data) and current company is Default Company
          if (data.companyId === currentCompany.id || (!data.companyId && currentCompany.name === 'Default Company')) {
            clientsData.push({
              id: doc.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              projectName: data.projectName,
              projectType: data.projectType,
              projectPayment: data.projectPayment,
              annualFee: data.annualFee,
              startDate,
              contractEndDate,
              nextRenewalDate,
              lastRenewalDate,
              projectStatus: data.projectStatus as ProjectStatus,
              paymentStatus: data.paymentStatus as PaymentStatus,
              notes: data.notes,
              createdBy: data.createdBy,
              companyId: data.companyId || currentCompany.id, // Assign to current company if no companyId
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          }
        } catch (error) {
          // Skip invalid client data
        }
      });
      
      setClients(clientsData);
      setLoading(false);
    }, (_error) => {
      // Silent fail for production - set loading to false
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser, currentCompany]);

  // Fetch client activity logs from Firestore
  useEffect(() => {
    if (!currentUser || !currentCompany) return;
    
    const logsRef = collection(db, 'clientActivityLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData: ClientActivityLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Include client activity log if it belongs to current company 
        // OR has no companyId (legacy data) and current company is Default Company
        if (data.companyId === currentCompany.id || (!data.companyId && currentCompany.name === 'Default Company')) {
          logsData.push({
            id: doc.id,
            action: data.action,
            userId: data.userId,
            username: data.username || '',
            clientId: data.clientId,
            clientDetails: data.clientDetails,
            timestamp: data.timestamp.toDate(),
          });
        }
      });
      setClientActivityLogs(logsData);
    });
    
    return unsubscribe;
  }, [currentUser, currentCompany]);

  // Add a new client
  async function addClient(clientData: ClientInput) {
    if (!currentUser || !userData || !currentCompany) return;

    try {
      const nextRenewalDate = calculateNextRenewalDate(clientData.startDate);
      
      const clientDoc = {
        ...clientData,
        nextRenewalDate,
        lastRenewalDate: null,
        createdBy: currentUser.uid,
        companyId: currentCompany.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'clients'), clientDoc);

      // Log the activity
      await addDoc(collection(db, 'clientActivityLogs'), {
        action: 'added',
        userId: currentUser.uid,
        username: userData.username,
        clientId: docRef.id,
        companyId: currentCompany.id,
        clientDetails: { name: clientData.name, projectName: clientData.projectName },
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to add client');
    }
  }

  // Update an existing client
  async function updateClient(id: string, data: Partial<ClientInput>) {
    if (!currentUser || !userData || !currentCompany) return;

    try {
      const clientRef = doc(db, 'clients', id);
      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // Recalculate next renewal date if start date changed
      if (data.startDate) {
        const existingClient = clients.find(c => c.id === id);
        updateData.nextRenewalDate = calculateNextRenewalDate(
          data.startDate,
          existingClient?.lastRenewalDate
        );
      }

      await updateDoc(clientRef, updateData);

      // Log the activity
      await addDoc(collection(db, 'clientActivityLogs'), {
        action: 'edited',
        userId: currentUser.uid,
        username: userData.username,
        clientId: id,
        companyId: currentCompany.id,
        clientDetails: data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to update client');
    }
  }

  // Delete a client
  async function deleteClient(id: string) {
    if (!currentUser || !userData || !currentCompany) return;

    try {
      const client = clients.find(c => c.id === id);
      if (!client) return;

      await deleteDoc(doc(db, 'clients', id));

      // Log the activity
      await addDoc(collection(db, 'clientActivityLogs'), {
        action: 'deleted',
        userId: currentUser.uid,
        username: userData.username,
        clientId: id,
        companyId: currentCompany.id,
        clientDetails: { name: client.name, projectName: client.projectName },
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to delete client');
    }
  }

  // Renew a client (extend for another year)
  async function renewClient(id: string) {
    if (!currentUser || !userData || !currentCompany) return;

    try {
      const client = clients.find(c => c.id === id);
      if (!client) return;

      const now = new Date();
      const nextRenewalDate = calculateNextRenewalDate(now);
      const nextContractEndDate = new Date(now);
      nextContractEndDate.setFullYear(nextContractEndDate.getFullYear() + 1);

      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        lastRenewalDate: now,
        nextRenewalDate,
        contractEndDate: nextContractEndDate,
        paymentStatus: 'paid',
        updatedAt: serverTimestamp(),
      });

      // Log the activity
      await addDoc(collection(db, 'clientActivityLogs'), {
        action: 'renewed',
        userId: currentUser.uid,
        username: userData.username,
        clientId: id,
        companyId: currentCompany.id,
        clientDetails: { name: client.name, renewalDate: now },
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to renew client');
    }
  }

  // Get clients with overdue renewals
  function getOverdueClients(): Client[] {
    const now = new Date();
    return clients.filter(client => 
      client.projectStatus === 'active' && 
      client.nextRenewalDate < now &&
      client.paymentStatus !== 'paid'
    );
  }

  // Get clients with upcoming renewals
  function getUpcomingRenewals(daysAhead: number = 30): Client[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);
    
    return clients.filter(client => 
      client.projectStatus === 'active' && 
      client.nextRenewalDate >= now && 
      client.nextRenewalDate <= futureDate
    );
  }

  // Filter clients based on criteria
  function filteredClients(
    status?: ProjectStatus,
    paymentStatus?: PaymentStatus,
    projectType?: string
  ): Client[] {
    return clients.filter(client => {
      if (status && client.projectStatus !== status) return false;
      if (paymentStatus && client.paymentStatus !== paymentStatus) return false;
      if (projectType && client.projectType !== projectType) return false;
      return true;
    });
  }

  // Search clients by keyword
  function searchClients(keyword: string): Client[] {
    const searchTerm = keyword.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.projectName.toLowerCase().includes(searchTerm) ||
      client.projectType.toLowerCase().includes(searchTerm) ||
      client.notes.toLowerCase().includes(searchTerm)
    );
  }

  // Get client statistics
  function getClientStats() {
    const activeClients = clients.filter(c => c.projectStatus === 'active').length;
    const totalRevenue = clients.reduce((sum, client) => sum + client.projectPayment, 0);
    const annualRevenue = clients
      .filter(c => c.projectStatus === 'active')
      .reduce((sum, client) => sum + client.annualFee, 0);
    const overdueCount = getOverdueClients().length;
    const upcomingRenewals = getUpcomingRenewals().length;

    return {
      totalRevenue,
      annualRevenue,
      activeClients,
      overdueCount,
      upcomingRenewals,
    };
  }

  const contextValue: ClientContextType = {
    clients,
    clientActivityLogs,
    loading,
    addClient,
    updateClient,
    deleteClient,
    renewClient,
    getOverdueClients,
    getUpcomingRenewals,
    filteredClients,
    searchClients,
    getClientStats,
  };

  return (
    <ClientContext.Provider value={contextValue}>
      {children}
    </ClientContext.Provider>
  );
} 