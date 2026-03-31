export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export type OSStatus = 'aberto' | 'agendado' | 'em_deslocamento' | 'em_execucao' | 'concluido' | 'cancelado';
export type OSPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type UserRole = 'admin' | 'tecnico';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  specialty?: string;
  is_online: boolean;
  last_location?: { lat: number; lng: number };
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  lat: number;
  lng: number;
}

export interface ServiceOrder {
  id: string;
  client_id: string;
  technician_id: string;
  title: string;
  description: string;
  status: OSStatus;
  priority: OSPriority;
  scheduled_at: string;
  started_at?: string;
  finished_at?: string;
  total_value: number;
  labor_value: number;
  materials_value: number;
  signature_url?: string;
  client?: Client;
  technician?: UserProfile;
}

export interface Evidence {
  id: string;
  os_id: string;
  type: 'antes' | 'depois' | 'checklist';
  url: string;
  description?: string;
  is_completed: boolean;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
}

export interface UsedMaterial {
  id: string;
  os_id: string;
  material_id: string;
  quantity: number;
  price_at_time: number;
  material?: Material;
}
