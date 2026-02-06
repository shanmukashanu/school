import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet } from '@/lib/api';
import { clearAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface Attendance { _id: string; date: string; status: string; remarks?: string }
interface Mark { _id: string; exam: string; subject: string; score: number; outOf: number; term?: string }
interface Remark { _id: string; text: string; category?: string; date?: string }
interface Fee { _id: string; feeType: string; amount: number; fine?: number; status: string; remarks?: string; dueDate?: string; paidDate?: string }

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [a, m, r, f] = await Promise.all([
          apiGet('/api/me/attendance'),
          apiGet('/api/me/marks'),
          apiGet('/api/me/remarks'),
          apiGet('/api/me/fees'),
        ]);
        setAttendance(a || []);
        setMarks(m || []);
        setRemarks(r || []);
        setFees(f || []);
      } catch (e) { /* surface via UI later */ }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <Button variant="outline" onClick={() => { clearAuth(); navigate('/'); }}>Logout</Button>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Attendance</h2>
          <div className="space-y-2">
            {attendance.length === 0 ? (
              <p className="text-gray-500">No attendance records</p>
            ) : attendance.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{a.date}</p>
                  {a.remarks ? <p className="text-xs text-gray-500">{a.remarks}</p> : null}
                </div>
                <span className="text-sm font-semibold">{a.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Marks</h2>
          <div className="space-y-2">
            {marks.length === 0 ? (
              <p className="text-gray-500">No marks available</p>
            ) : marks.map((m) => (
              <div key={m._id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{m.subject} • {m.exam}{m.term ? ` • ${m.term}` : ''}</p>
                </div>
                <span className="text-sm font-semibold">{m.score}/{m.outOf}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Remarks</h2>
          <div className="space-y-2">
            {remarks.length === 0 ? (
              <p className="text-gray-500">No remarks</p>
            ) : remarks.map((r) => (
              <div key={r._id} className="p-3 rounded-lg border">
                <p className="font-medium">{r.text}</p>
                <p className="text-xs text-gray-500">{[r.category, r.date].filter(Boolean).join(' • ')}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Fees</h2>
          <div className="space-y-2">
            {fees.length === 0 ? (
              <p className="text-gray-500">No fee records</p>
            ) : fees.map((f) => (
              <div key={f._id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{f.feeType}</p>
                  <p className="text-xs text-gray-500">
                    Status: {f.status}
                    {typeof f.fine === 'number' ? ` • Fine: ${f.fine}` : ''}
                    {f.remarks ? ` • ${f.remarks}` : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold">{f.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
