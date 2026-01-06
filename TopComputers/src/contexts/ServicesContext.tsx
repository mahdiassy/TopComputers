import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import type { MainService, SubService, ServiceFormData, SubServiceFormData } from '../types/services';

interface ServicesContextType {
  mainServices: MainService[];
  subServices: SubService[];
  loading: boolean;
  error: string | null;
  
  // Main Services
  addMainService: (service: ServiceFormData) => Promise<void>;
  updateMainService: (id: string, service: ServiceFormData) => Promise<void>;
  deleteMainService: (id: string) => Promise<void>;
  
  // Sub Services
  addSubService: (subService: SubServiceFormData) => Promise<void>;
  updateSubService: (id: string, subService: SubServiceFormData) => Promise<void>;
  deleteSubService: (id: string) => Promise<void>;
  
  // WhatsApp
  generateWhatsAppUrl: (message: string) => string;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};

interface ServicesProviderProps {
  children: ReactNode;
}

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
  const [mainServices, setMainServices] = useState<MainService[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load services from Firebase on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load main services (only active)
      const mainServicesQuery = query(
        collection(db, 'mainServices'), 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      let mainServicesData: MainService[];
      try {
        const mainServicesSnapshot = await getDocs(mainServicesQuery);
        mainServicesData = mainServicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as MainService[];
      } catch (err: any) {
        // Fallback while index builds: fetch without orderBy and sort client-side
        const fallbackMsSnapshot = await getDocs(
          query(collection(db, 'mainServices'), where('isActive', '==', true))
        );
        mainServicesData = fallbackMsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as MainService[];
        mainServicesData.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      }

      // Load sub services (only active)
      const subServicesQuery = query(
        collection(db, 'subServices'), 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      let subServicesData: SubService[];
      try {
        const subServicesSnapshot = await getDocs(subServicesQuery);
        subServicesData = subServicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as SubService[];
      } catch (err: any) {
        // Fallback while index builds
        const fallbackSsSnapshot = await getDocs(
          query(collection(db, 'subServices'), where('isActive', '==', true))
        );
        subServicesData = fallbackSsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as SubService[];
        subServicesData.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      }

      // Organize sub-services under their main services
      const servicesWithSubs = mainServicesData.map(mainService => ({
        ...mainService,
        subServices: subServicesData.filter(sub => sub.mainServiceId === mainService.id)
      }));

      setMainServices(servicesWithSubs);
      setSubServices(subServicesData);
      
    } catch (err) {
      console.error('Error loading services from Firebase:', err);
      setError('Failed to load services from Firebase');
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Main Services CRUD
  const addMainService = async (serviceData: ServiceFormData) => {
    setLoading(true);
    try {
      const now = new Date();
      const mainServiceData = {
        ...serviceData,
        subServices: [],
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'mainServices'), mainServiceData);
      
      const newService: MainService = {
        id: docRef.id,
        ...mainServiceData,
      };
      
      setMainServices(prev => [newService, ...prev]);
      toast.success('Service created successfully');
    } catch (err) {
      console.error('Error adding main service:', err);
      setError('Failed to add main service');
      toast.error('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const updateMainService = async (id: string, serviceData: ServiceFormData) => {
    setLoading(true);
    try {
      const updateData = {
        ...serviceData,
        updatedAt: new Date(),
      };
      
      await updateDoc(doc(db, 'mainServices', id), updateData);
      
      setMainServices(prev => prev.map(service =>
        service.id === id
          ? { ...service, ...updateData }
          : service
      ));
      
      toast.success('Service updated successfully');
    } catch (err) {
      console.error('Error updating main service:', err);
      setError('Failed to update main service');
      toast.error('Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const deleteMainService = async (id: string) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      // Delete the main service
      batch.delete(doc(db, 'mainServices', id));
      
      // Delete all sub-services of this main service
      const relatedSubServices = subServices.filter(sub => sub.mainServiceId === id);
      relatedSubServices.forEach(subService => {
        batch.delete(doc(db, 'subServices', subService.id));
      });
      
      await batch.commit();
      
      // Update local state
      setMainServices(prev => prev.filter(service => service.id !== id));
      setSubServices(prev => prev.filter(sub => sub.mainServiceId !== id));
      
      toast.success('Service and related sub-services deleted successfully');
    } catch (err) {
      console.error('Error deleting main service:', err);
      setError('Failed to delete main service');
      toast.error('Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  // Sub Services CRUD
  const addSubService = async (subServiceData: SubServiceFormData) => {
    setLoading(true);
    try {
      const now = new Date();
      const subServiceDocData = {
        ...subServiceData,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'subServices'), subServiceDocData);
      
      const newSubService: SubService = {
        id: docRef.id,
        ...subServiceDocData,
      };
      
      // Update local states
      setSubServices(prev => [newSubService, ...prev]);
      setMainServices(prev => prev.map(service => 
        service.id === subServiceData.mainServiceId
          ? { 
              ...service, 
              subServices: [...service.subServices, newSubService],
              updatedAt: now 
            }
          : service
      ));
      
      toast.success('Sub-service created successfully');
    } catch (err) {
      console.error('Error adding sub-service:', err);
      setError('Failed to add sub-service');
      toast.error('Failed to create sub-service');
    } finally {
      setLoading(false);
    }
  };

  const updateSubService = async (id: string, subServiceData: SubServiceFormData) => {
    setLoading(true);
    try {
      const updateData = {
        ...subServiceData,
        updatedAt: new Date(),
      };
      
      await updateDoc(doc(db, 'subServices', id), updateData);
      
      // Update local states
      setSubServices(prev => prev.map(sub =>
        sub.id === id
          ? { ...sub, ...updateData }
          : sub
      ));
      
      setMainServices(prev => prev.map(service => ({
        ...service,
        subServices: service.subServices.map(sub =>
          sub.id === id
            ? { ...sub, ...updateData }
            : sub
        ),
      })));
      
      toast.success('Sub-service updated successfully');
    } catch (err) {
      console.error('Error updating sub-service:', err);
      setError('Failed to update sub-service');
      toast.error('Failed to update sub-service');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubService = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'subServices', id));
      
      // Update local states
      setSubServices(prev => prev.filter(sub => sub.id !== id));
      setMainServices(prev => prev.map(service => ({
        ...service,
        subServices: service.subServices.filter(sub => sub.id !== id),
      })));
      
      toast.success('Sub-service deleted successfully');
    } catch (err) {
      console.error('Error deleting sub-service:', err);
      setError('Failed to delete sub-service');
      toast.error('Failed to delete sub-service');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp URL generation
  const generateWhatsAppUrl = (message: string) => {
    const phoneNumber = "76601305"; // Your WhatsApp business number
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  const value: ServicesContextType = {
    mainServices,
    subServices,
    loading,
    error,
    addMainService,
    updateMainService,
    deleteMainService,
    addSubService,
    updateSubService,
    deleteSubService,
    generateWhatsAppUrl,
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};