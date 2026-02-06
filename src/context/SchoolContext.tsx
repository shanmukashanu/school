import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { School, DashboardStats } from '@/types';

interface SchoolContextType {
  schools: School[];
  selectedSchool: School | null;
  setSelectedSchool: (school: School | null) => void;
  loading: boolean;
  stats: DashboardStats;
  refreshStats: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    teachers: 0,
    admissionEnquiries: 0,
    feeEnquiries: 0
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    refreshStats();
  }, [selectedSchool]);

  const fetchSchools = async () => {
    try {
      const { data: schoolsData, error } = await supabase
        .from('schools')
        .select('*')
        .order('established_year', { ascending: true });
      
      if (error) {
        console.error('Error fetching schools:', error);
        return;
      }
      
      if (schoolsData) {
        setSchools(schoolsData);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const schoolFilter = selectedSchool ? { school_id: selectedSchool.id } : {};
      
      const [studentsRes, teachersRes, enquiriesRes, feeEnquiriesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).match(schoolFilter),
        supabase.from('teachers').select('id', { count: 'exact', head: true }).match(schoolFilter),
        supabase.from('admission_enquiries').select('id', { count: 'exact', head: true }).match(schoolFilter),
        supabase.from('fee_enquiries').select('id', { count: 'exact', head: true }).match(schoolFilter)
      ]);

      setStats({
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        admissionEnquiries: enquiriesRes.count || 0,
        feeEnquiries: feeEnquiriesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <SchoolContext.Provider value={{
      schools,
      selectedSchool,
      setSelectedSchool,
      loading,
      stats,
      refreshStats
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
