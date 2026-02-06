import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect as Select } from '@/components/ui/SimpleSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const AdmissionsSection: React.FC = () => {
  const { schools, selectedSchool, refreshStats } = useSchool();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    school_id: selectedSchool?.id || '',
    student_name: '',
    parent_name: '',
    email: '',
    phone: '',
    class_applying: '',
    previous_school: '',
    address: '',
    message: ''
  });

  const classOptions = [
    { value: 'nursery', label: 'Nursery' },
    { value: 'lkg', label: 'LKG' },
    { value: 'ukg', label: 'UKG' },
    { value: 'class-1', label: 'Class 1' },
    { value: 'class-2', label: 'Class 2' },
    { value: 'class-3', label: 'Class 3' },
    { value: 'class-4', label: 'Class 4' },
    { value: 'class-5', label: 'Class 5' },
    { value: 'class-6', label: 'Class 6' },
    { value: 'class-7', label: 'Class 7' },
    { value: 'class-8', label: 'Class 8' },
    { value: 'class-9', label: 'Class 9' },
    { value: 'class-10', label: 'Class 10' },
    { value: 'class-11', label: 'Class 11' },
    { value: 'class-12', label: 'Class 12' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('admission_enquiries')
        .insert([{
          ...formData,
          school_id: formData.school_id || selectedSchool?.id || schools[0]?.id
        }]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        school_id: selectedSchool?.id || '',
        student_name: '',
        parent_name: '',
        email: '',
        phone: '',
        class_applying: '',
        previous_school: '',
        address: '',
        message: ''
      });
      refreshStats();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const admissionSteps = [
    {
      step: 1,
      title: 'Submit Enquiry',
      description: 'Fill out the admission enquiry form with student details.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      step: 2,
      title: 'Document Verification',
      description: 'Submit required documents for verification.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      step: 3,
      title: 'Entrance Test',
      description: 'Appear for the entrance assessment test.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      step: 4,
      title: 'Interview',
      description: 'Parent and student interaction with school authorities.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      step: 5,
      title: 'Fee Payment',
      description: 'Complete the admission fee payment process.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      step: 6,
      title: 'Admission Confirmed',
      description: 'Receive admission confirmation and welcome kit.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  ];

  const documents = [
    'Birth Certificate',
    'Previous School Transfer Certificate',
    'Report Card / Mark Sheet',
    'Passport Size Photographs (4)',
    'Aadhar Card (Student & Parents)',
    'Address Proof',
    'Medical Fitness Certificate',
    'Caste Certificate (if applicable)'
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-4">
            Admissions 2026-27
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Begin Your Journey With Us
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take the first step towards a bright future. Our admission process is designed 
            to be simple and transparent.
          </p>
        </div>

        {/* Admission Steps */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">Admission Process</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admissionSteps.map((item) => (
              <Card key={item.step} className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full flex items-start justify-end p-2">
                  <span className="text-2xl font-bold text-blue-200">{item.step}</span>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Enquiry Form */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Admission Enquiry Form</h3>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 font-medium">Your enquiry has been submitted successfully! We will contact you soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                label="Select School"
                required
                options={schools.map(s => ({ value: s.id, label: s.name }))}
                value={formData.school_id}
                onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
              />

              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Student Name"
                  required
                  placeholder="Enter student's full name"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                />
                <Input
                  label="Parent/Guardian Name"
                  required
                  placeholder="Enter parent's name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Select
                  label="Class Applying For"
                  required
                  options={classOptions}
                  value={formData.class_applying}
                  onChange={(e) => setFormData({ ...formData, class_applying: e.target.value })}
                />
                <Input
                  label="Previous School"
                  placeholder="Name of previous school"
                  value={formData.previous_school}
                  onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                />
              </div>

              <Textarea
                label="Address"
                placeholder="Enter your complete address"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <Textarea
                label="Additional Message"
                placeholder="Any specific requirements or questions?"
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <Button type="submit" size="lg" loading={loading} className="w-full">
                Submit Enquiry
              </Button>
            </form>
          </Card>

          {/* Documents Required */}
          <div>
            <Card className="p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Documents Required</h3>
              <ul className="space-y-3">
                {documents.map((doc, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-blue-100 mb-6">
                Our admission counselors are here to guide you through the process.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1-555-0100 (Helpline)</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>admissions@edugroup.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mon - Sat: 9:00 AM - 5:00 PM</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
