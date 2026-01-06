import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Supplier, SupplierFormData } from '../types/supplierTypes';

interface SuppliersContextType {
  suppliers: Supplier[];
  loading: boolean;
  addSupplier: (supplierData: SupplierFormData) => Promise<void>;
  updateSupplier: (id: string, supplierData: SupplierFormData) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Supplier | undefined;
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export const SuppliersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Load suppliers from Firebase
  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const suppliersRef = collection(db, 'suppliers');
      const q = query(suppliersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const suppliersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Supplier[];
      
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // Add new supplier
  const addSupplier = useCallback(async (supplierData: SupplierFormData) => {
    try {
      const suppliersRef = collection(db, 'suppliers');
      const newSupplier = {
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(suppliersRef, newSupplier);
      const addedSupplier: Supplier = {
        id: docRef.id,
        ...newSupplier,
      };
      
      setSuppliers(prev => [addedSupplier, ...prev]);
    } catch (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  }, []);

  // Update supplier
  const updateSupplier = useCallback(async (id: string, supplierData: SupplierFormData) => {
    try {
      const supplierRef = doc(db, 'suppliers', id);
      const updatedData = {
        ...supplierData,
        updatedAt: new Date(),
      };
      
      await updateDoc(supplierRef, updatedData);
      
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === id 
            ? { ...supplier, ...updatedData }
            : supplier
        )
      );
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }, []);

  // Delete supplier
  const deleteSupplier = useCallback(async (id: string) => {
    try {
      const supplierRef = doc(db, 'suppliers', id);
      await deleteDoc(supplierRef);
      
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }, []);

  // Get supplier by ID
  const getSupplierById = useCallback((id: string) => {
    return suppliers.find(supplier => supplier.id === id);
  }, [suppliers]);

  return (
    <SuppliersContext.Provider value={{
      suppliers,
      loading,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      getSupplierById,
    }}>
      {children}
    </SuppliersContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SuppliersContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SuppliersProvider');
  }
  return context;
};
