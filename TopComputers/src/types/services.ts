export interface SubService {
  id: string;
  mainServiceId: string;
  title: string;
  description: string;
  image: string;
  whatsappMessage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MainService {
  id: string;
  title: string;
  description: string;
  image: string;
  whatsappMessage: string;
  isActive: boolean;
  subServices: SubService[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceFormData {
  title: string;
  description: string;
  image: string;
  whatsappMessage: string;
  isActive: boolean;
}

export interface SubServiceFormData {
  mainServiceId: string;
  title: string;
  description: string;
  image: string;
  whatsappMessage: string;
  isActive: boolean;
}