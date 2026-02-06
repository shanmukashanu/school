export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  banner_url?: string;
  theme_color: string;
  description: string;
  vision: string;
  mission: string;
  established_year: number;
  principal_name: string;
  principal_message?: string;
  created_at: string;
}

export interface AdmissionEnquiry {
  id?: string;
  school_id: string;
  student_name: string;
  parent_name: string;
  email: string;
  phone: string;
  class_applying: string;
  previous_school?: string;
  address?: string;
  message?: string;
  documents?: string[];
  status?: string;
  created_at?: string;
}

export interface FeeEnquiry {
  id?: string;
  school_id: string;
  parent_name: string;
  email: string;
  phone: string;
  student_class?: string;
  enquiry_type?: string;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface FeeStructure {
  id: string;
  school_id: string;
  class_name: string;
  fee_type: string;
  amount: number;
  frequency: string;
  description?: string;
}

export interface Student {
  id: string;
  school_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  class_name: string;
  section: string;
  roll_number: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  address?: string;
  photo_url?: string;
  status: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience_years: number;
  photo_url?: string;
  status: string;
}

export interface Blog {
  id: string;
  school_id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category: string;
  author: string;
  is_published: boolean;
  published_at: string;
  views: number;
}

export interface Notice {
  id: string;
  school_id?: string;
  title: string;
  content: string;
  priority: string;
  is_emergency: boolean;
  target_audience: string;
  attachment_url?: string;
  expires_at?: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  school_id?: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  is_featured: boolean;
}

export interface ContactEnquiry {
  id?: string;
  school_id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface DashboardStats {
  students: number;
  teachers: number;
  admissionEnquiries: number;
  feeEnquiries: number;
}

export interface User {
  id: string;
  school_id?: string;
  email: string;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
  first_name: string;
  last_name: string;
  avatar_url?: string;
}
