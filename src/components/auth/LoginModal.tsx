import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SimpleSelect as Select } from '@/components/ui/SimpleSelect';
import { saveAuth } from '@/lib/auth';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const userTypes = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'School Admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }) // using email field as username
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'Login failed');
        return;
      }

      if (data?.user?.role && data.user.role !== userType) {
        alert('Selected role does not match this account');
        return;
      }

      saveAuth(data.token, data.user);
      onClose();
      const role = data?.user?.role;
      if (role === 'admin') window.location.href = '/admin';
      else if (role === 'teacher') window.location.href = '/teacher';
      else if (role === 'student') window.location.href = '/student';
      else if (role === 'parent') window.location.href = '/parent';
      else window.location.href = '/';
    } catch (err: any) {
      alert(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-1">Sign in to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="I am a"
          options={userTypes}
          value={userType}
          onChange={(e) => setUserType(e.target.value as any)}
        />

        <Input
          type="text"
          placeholder="Username or email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={loading} className="w-full">
          Sign In
        </Button>
      </form>
    </Modal>
  );
};
