import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import API_BASE from '@/lib/apiBase';

const Login: React.FC = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'Login failed');
        return;
      }
      saveAuth(data.token, data.user);
      const role = data?.user?.role;
      if (role === 'teacher') nav('/teacher');
      else if (role === 'student') nav('/student');
      else if (role === 'parent') nav('/parent');
      else if (role === 'admin') nav('/admin');
      else nav('/');
    } catch (err: any) {
      alert(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in...' : 'Sign In'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
