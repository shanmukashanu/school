import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect as Select } from '@/components/ui/SimpleSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const FeesSection: React.FC = () => {
  const { schools, selectedSchool, refreshStats } = useSchool();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('structure');
  const [formData, setFormData] = useState({
    school_id: selectedSchool?.id || '',
    parent_name: '',
    email: '',
    phone: '',
    student_class: '',
    enquiry_type: '',
    message: ''
  });

  const feeStructure = {
    'Primary (Class 1-5)': [
      { type: 'Admission Fee', amount: 25000, frequency: 'One-time' },
      { type: 'Tuition Fee', amount: 15000, frequency: 'Quarterly' },
      { type: 'Development Fee', amount: 5000, frequency: 'Yearly' },
      { type: 'Activity Fee', amount: 3000, frequency: 'Yearly' },
      { type: 'Computer Lab Fee', amount: 2000, frequency: 'Yearly' },
    ],
    'Middle (Class 6-8)': [
      { type: 'Admission Fee', amount: 30000, frequency: 'One-time' },
      { type: 'Tuition Fee', amount: 18000, frequency: 'Quarterly' },
      { type: 'Development Fee', amount: 6000, frequency: 'Yearly' },
      { type: 'Science Lab Fee', amount: 4000, frequency: 'Yearly' },
      { type: 'Computer Lab Fee', amount: 3000, frequency: 'Yearly' },
    ],
    'Secondary (Class 9-10)': [
      { type: 'Admission Fee', amount: 35000, frequency: 'One-time' },
      { type: 'Tuition Fee', amount: 22000, frequency: 'Quarterly' },
      { type: 'Development Fee', amount: 8000, frequency: 'Yearly' },
      { type: 'Science Lab Fee', amount: 5000, frequency: 'Yearly' },
      { type: 'Board Exam Fee', amount: 3000, frequency: 'Yearly' },
    ],
    'Senior Secondary (Class 11-12)': [
      { type: 'Admission Fee', amount: 40000, frequency: 'One-time' },
      { type: 'Tuition Fee', amount: 28000, frequency: 'Quarterly' },
      { type: 'Development Fee', amount: 10000, frequency: 'Yearly' },
      { type: 'Lab Fee (Science)', amount: 8000, frequency: 'Yearly' },
      { type: 'Board Exam Fee', amount: 5000, frequency: 'Yearly' },
    ],
  };

  const enquiryTypes = [
    { value: 'fee-structure', label: 'Fee Structure Details' },
    { value: 'payment-options', label: 'Payment Options' },
    { value: 'scholarship', label: 'Scholarship Information' },
    { value: 'sibling-discount', label: 'Sibling Discount' },
    { value: 'refund-policy', label: 'Refund Policy' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('fee_enquiries')
        .insert([{
          ...formData,
          school_id: formData.school_id || selectedSchool?.id || schools[0]?.id
        }]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        school_id: selectedSchool?.id || '',
        parent_name: '',
        email: '',
        phone: '',
        student_class: '',
        enquiry_type: '',
        message: ''
      });
      refreshStats();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting fee enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-semibold mb-4">
            Fee Information
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transparent Fee Structure
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We believe in complete transparency. Here's our comprehensive fee structure 
            for the academic year 2026-27.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'structure'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fee Structure
          </button>
          <button
            onClick={() => setActiveTab('enquiry')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'enquiry'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fee Enquiry
          </button>
        </div>

        {activeTab === 'structure' && (
          <>
            {/* Fee Tables */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {Object.entries(feeStructure).map(([level, fees]) => (
                <Card key={level} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h3 className="text-xl font-bold text-white">{level}</h3>
                  </div>
                  <div className="p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 text-sm font-semibold text-gray-600">Fee Type</th>
                          <th className="text-right py-3 text-sm font-semibold text-gray-600">Amount</th>
                          <th className="text-right py-3 text-sm font-semibold text-gray-600">Frequency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((fee, index) => (
                          <tr key={index} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 text-gray-700">{fee.type}</td>
                            <td className="py-3 text-right font-semibold text-gray-900">
                              ${fee.amount.toLocaleString()}
                            </td>
                            <td className="py-3 text-right text-sm text-gray-500">{fee.frequency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ))}
            </div>

            {/* Payment Options */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Online Payment</h4>
                <p className="text-gray-600 text-sm">Pay securely via credit/debit card or net banking</p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Bank Transfer</h4>
                <p className="text-gray-600 text-sm">Direct bank transfer to school account</p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">EMI Options</h4>
                <p className="text-gray-600 text-sm">Easy monthly installment plans available</p>
              </Card>
            </div>

            {/* Discounts */}
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Special Discounts</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">10%</div>
                  <p className="text-gray-700 font-medium">Sibling Discount</p>
                  <p className="text-sm text-gray-500">For second child onwards</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">15%</div>
                  <p className="text-gray-700 font-medium">Early Bird Discount</p>
                  <p className="text-sm text-gray-500">Pay before March 31st</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">5%</div>
                  <p className="text-gray-700 font-medium">Annual Payment</p>
                  <p className="text-sm text-gray-500">Pay full year in advance</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'enquiry' && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Fee Enquiry Form</h3>
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 font-medium">Your enquiry has been submitted! Our team will contact you shortly.</p>
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

                <Input
                  label="Parent/Guardian Name"
                  required
                  placeholder="Enter your name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                />

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
                  <Input
                    label="Student's Class"
                    placeholder="e.g., Class 5"
                    value={formData.student_class}
                    onChange={(e) => setFormData({ ...formData, student_class: e.target.value })}
                  />
                  <Select
                    label="Enquiry Type"
                    required
                    options={enquiryTypes}
                    value={formData.enquiry_type}
                    onChange={(e) => setFormData({ ...formData, enquiry_type: e.target.value })}
                  />
                </div>

                <Textarea
                  label="Your Question"
                  required
                  placeholder="Please describe your query in detail..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />

                <Button type="submit" size="lg" loading={loading} className="w-full">
                  Submit Enquiry
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};
