export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  website?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierFormData {
  name: string;
  contactPerson: string;
  phone: string;
  website: string;
  notes: string;
}
