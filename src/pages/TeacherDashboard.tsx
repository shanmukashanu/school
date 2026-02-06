import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect as Select } from '@/components/ui/SimpleSelect';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import { clearAuth, getUser } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface Student { _id: string; name: string; rollNo: string; className: string; section?: string }

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'overview'|'marks'|'attendance'|'remarks'|'fees'|'addStudent'>('overview');

  // Attendance (bulk by date)
  const [attDate, setAttDate] = useState<string>('');
  const [attMap, setAttMap] = useState<Record<string, 'Present'|'Absent'>>({});
  const toggleAttendance = (id: string, status: 'Present'|'Absent') => {
    setAttMap((prev) => ({ ...prev, [id]: status }));
  };

  // Attendance report (monthly)
  const [attMonth, setAttMonth] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  });
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);
  const [attendanceReportStudents, setAttendanceReportStudents] = useState<Student[]>([]);

  const loadFeesForSelected = async () => {
    if (!selectedId) { setFees([]); return; }
    try {
      const list = await apiGet(`/api/fees?studentId=${encodeURIComponent(selectedId)}`);
      setFees(Array.isArray(list) ? list : []);
    } catch {
      setFees([]);
    }
  };

  const loadMarksReport = async () => {
    try {
      if (!className) { setMarksReport([]); setMarksReportStudents([]); return; }
      const q = new URLSearchParams();
      q.set('className', className);
      if (section) q.set('section', section);
      if (exam) q.set('exam', exam);
      if (term) q.set('term', term);
      const data = await apiGet(`/api/reports/marks?${q.toString()}`);
      setMarksReportStudents(Array.isArray((data as any)?.students) ? (data as any).students : []);
      setMarksReport(Array.isArray((data as any)?.marks) ? (data as any).marks : []);
    } catch {
      setMarksReport([]);
      setMarksReportStudents([]);
    }
  };

  const loadAttendanceReport = async () => {
    try {
      if (!className || !attMonth) { setAttendanceReport([]); setAttendanceReportStudents([]); return; }
      const q = new URLSearchParams();
      q.set('className', className);
      if (section) q.set('section', section);
      q.set('month', attMonth);
      const data = await apiGet(`/api/reports/attendance?${q.toString()}`);
      setAttendanceReportStudents(Array.isArray((data as any)?.students) ? (data as any).students : []);
      setAttendanceReport(Array.isArray((data as any)?.attendance) ? (data as any).attendance : []);
    } catch {
      setAttendanceReport([]);
      setAttendanceReportStudents([]);
    }
  };

  // Marks (single selected student)
  const [exam, setExam] = useState('');
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState<number | ''>('');
  const [outOf, setOutOf] = useState<number | ''>('');
  const [term, setTerm] = useState('');

  // Marks report
  const [marksReport, setMarksReport] = useState<any[]>([]);
  const [marksReportStudents, setMarksReportStudents] = useState<Student[]>([]);

  // Fees
  const [fees, setFees] = useState<any[]>([]);
  const [feeType, setFeeType] = useState('Tuition');
  const [feeAmount, setFeeAmount] = useState<number | ''>('');
  const [feeFine, setFeeFine] = useState<number | ''>('');
  const [feeStatus, setFeeStatus] = useState<'Paid'|'Pending'>('Pending');
  const [feeRemarks, setFeeRemarks] = useState('');
  const [editingFeeId, setEditingFeeId] = useState<string>('');

  // Remarks (single selected student)
  const [rText, setRText] = useState('');
  const [rCategory, setRCategory] = useState('');
  const [rDate, setRDate] = useState('');

  // New student (merged user + record)
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUname, setNewUname] = useState('');
  const [newPass, setNewPass] = useState('');
  const teacherSchool = getUser()?.school || '';

  // Student academic fields
  const [newStudentClass, setNewStudentClass] = useState('');
  const [newStudentSection, setNewStudentSection] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');

  const filtered = useMemo(() => students, [students]);

  const loadStudents = async () => {
    const q = new URLSearchParams();
    if (className) q.set('className', className);
    if (section) q.set('section', section);
    const data = await apiGet(`/api/students${q.toString() ? `?${q.toString()}` : ''}`);
    setStudents(Array.isArray(data) ? data : []);
    if (Array.isArray(data) && data.length) {
      setSelectedId((prev) => prev || data[0]._id);
      // initialize attendance map if empty
      if (Object.keys(attMap).length === 0) {
        const init: Record<string, 'Present'|'Absent'> = {};
        data.forEach((s: Student) => { init[s._id] = 'Present'; });
        setAttMap(init);
      }
      // initialize selection map (unchecked by default)
      setSelectedMap((prev) => {
        const next = { ...prev } as Record<string, boolean>;
        data.forEach((s: Student) => { if (next[s._id] === undefined) next[s._id] = false; });
        return next;
      });
    }
  };

  // Ensure records exist for existing student users, then load all on first mount
  const syncMissing = async () => {
    try { await apiPost('/api/students/sync-missing', {}); } catch {}
  };

  useEffect(() => { (async () => { await syncMissing(); await loadStudents(); })().catch(console.error); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadFeesForSelected();
    // eslint-disable-next-line
  }, [selectedId]);

  useEffect(() => {
    loadMarksReport();
    // eslint-disable-next-line
  }, [className, section, exam, term]);

  useEffect(() => {
    loadAttendanceReport();
    // eslint-disable-next-line
  }, [className, section, attMonth]);

  const marksSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const m of marksReport) {
      if (m?.subject) set.add(String(m.subject));
    }
    return Array.from(set).sort();
  }, [marksReport]);

  const marksByStudentSubject = useMemo(() => {
    const map: Record<string, Record<string, any>> = {};
    for (const m of marksReport) {
      const sid = String(m.studentId);
      const subj = String(m.subject || '');
      if (!sid || !subj) continue;
      if (!map[sid]) map[sid] = {};
      map[sid][subj] = m;
    }
    return map;
  }, [marksReport]);

  const monthDays = useMemo(() => {
    if (!attMonth) return [] as string[];
    const [y, m] = attMonth.split('-').map((x) => Number(x));
    if (!y || !m) return [] as string[];
    const last = new Date(y, m, 0).getDate();
    const days: string[] = [];
    for (let d = 1; d <= last; d++) {
      days.push(`${attMonth}-${String(d).padStart(2, '0')}`);
    }
    return days;
  }, [attMonth]);

  const attendanceByStudentDate = useMemo(() => {
    const map: Record<string, Record<string, 'Present'|'Absent'>> = {};
    for (const a of attendanceReport) {
      const sid = String(a.studentId);
      const date = String(a.date);
      if (!sid || !date) continue;
      if (!map[sid]) map[sid] = {};
      map[sid][date] = a.status;
    }
    return map;
  }, [attendanceReport]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => { clearAuth(); navigate('/'); }}
          >Logout</Button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar: Students list + Filters + Add Student */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3">Filter Students</h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Input placeholder="Class" value={className} onChange={(e) => setClassName(e.target.value)} />
                <Input placeholder="Section" value={section} onChange={(e) => setSection(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={loadStudents}>Apply</Button>
                <Button variant="outline" onClick={() => { setClassName(''); setSection(''); loadStudents(); }}>Load All</Button>
              </div>
            </Card>

            {/* Add Student (create login + record) */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3">Add Student</h2>
              <div className="space-y-2">
                <Input placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Username" value={newUname} onChange={(e) => setNewUname(e.target.value)} />
                  <Input placeholder="Password" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Class" value={newStudentClass} onChange={(e) => setNewStudentClass(e.target.value)} />
                  <Input placeholder="Section" value={newStudentSection} onChange={(e) => setNewStudentSection(e.target.value)} />
                </div>
                <Input placeholder="Roll No" value={newStudentRoll} onChange={(e) => setNewStudentRoll(e.target.value)} />
                <Button onClick={async () => {
                  const name = newName.trim();
                  const email = newEmail.trim();
                  const c = newStudentClass.trim();
                  const sec = newStudentSection.trim();
                  const roll = newStudentRoll.trim();
                  if (!name || !email || !newUname || !newPass || !c || !roll) return alert('Name, Email, Username, Password, Class and Roll No are required');
                  try {
                    const created = await apiPost('/api/users', { username: newUname, password: newPass, role: 'student', school: teacherSchool, name, email });
                    const userId = created?._id || created?.id || created?.user?._id;
                    await apiPost('/api/students', { name, email, className: c, section: sec, rollNo: roll, userId });
                    setNewName(''); setNewEmail(''); setNewUname(''); setNewPass('');
                    setNewStudentClass(''); setNewStudentSection(''); setNewStudentRoll('');
                    await loadStudents();
                    alert('Student created');
                  } catch (e: any) {
                    alert(e?.message || 'Create failed');
                  }
                }}>Create</Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Records are school-scoped automatically. After creation, the student appears in the list above.</p>
            </Card>

            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3">Students</h2>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {filtered.map((s) => (
                  <div key={s._id} className={`p-3 rounded-lg border ${selectedId===s._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={!!selectedMap[s._id]} onChange={(e) => setSelectedMap((prev) => ({ ...prev, [s._id]: e.target.checked }))} />
                      <button className="text-left flex-1" onClick={() => { setSelectedId(s._id); setActiveTab('overview'); }}>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.className}{s.section ? ` - ${s.section}` : ''} • Roll {s.rollNo}</p>
                      </button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-gray-500">No students found for filters.</p>
                )}
              </div>
            </Card>

            {/* Removed duplicate Add Student User card; merged into Add Student above */}
          </div>

          {/* Main content */}
          <div className="col-span-12 md:col-span-8 space-y-4">
            <Card className="p-4">
              <div className="flex gap-2 flex-wrap">
                <Button variant={activeTab==='overview'?undefined:'outline'} onClick={() => setActiveTab('overview')}>Overview</Button>
                <Button variant={activeTab==='marks'?undefined:'outline'} onClick={() => setActiveTab('marks')}>Marks</Button>
                <Button variant={activeTab==='attendance'?undefined:'outline'} onClick={() => setActiveTab('attendance')}>Attendance</Button>
                <Button variant={activeTab==='remarks'?undefined:'outline'} onClick={() => setActiveTab('remarks')}>Remarks</Button>
                <Button variant={activeTab==='fees'?undefined:'outline'} onClick={() => setActiveTab('fees')}>Fees</Button>
              </div>
            </Card>

            {/* Overview */}
            {activeTab === 'overview' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Welcome</h2>
                <p className="text-sm text-gray-600">Select a student from the left to add marks or remarks. Use Attendance tab to mark daily attendance for the class.</p>
              </Card>
            )}

            {/* Marks */}
            {activeTab === 'marks' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Add Marks</h2>
                <div className="grid md:grid-cols-5 gap-3">
                  <Input placeholder="Exam" value={exam} onChange={(e) => setExam(e.target.value)} />
                  <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  <Input placeholder="Score" type="number" value={score} onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))} />
                  <Input placeholder="Out Of" type="number" value={outOf} onChange={(e) => setOutOf(e.target.value === '' ? '' : Number(e.target.value))} />
                  <Input placeholder="Term (optional)" value={term} onChange={(e) => setTerm(e.target.value)} />
                </div>
                <div className="mt-4">
                  <Button onClick={async () => {
                    if (!exam || !subject || score === '' || outOf === '') return alert('All fields required');
                    const ids = Object.keys(selectedMap).filter((k) => selectedMap[k]);
                    const targets = ids.length ? ids : (selectedId ? [selectedId] : []);
                    if (!targets.length) return alert('Select at least one student');
                    for (const id of targets) {
                      await apiPost(`/api/students/${id}/marks`, { exam, subject, score, outOf, term });
                    }
                    setExam(''); setSubject(''); setScore(''); setOutOf(''); setTerm('');
                    await loadMarksReport();
                    alert('Marks added');
                  }}>Add</Button>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                    <h3 className="font-semibold">Class Marks</h3>
                    <Button variant="outline" onClick={loadMarksReport}>Refresh</Button>
                  </div>
                  <div className="overflow-x-auto border rounded-lg bg-white">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Roll</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          {marksSubjects.map((s) => (
                            <th key={s} className="px-3 py-2 text-left">{s}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {marksReportStudents.length === 0 ? (
                          <tr><td className="px-3 py-3 text-gray-500" colSpan={2 + marksSubjects.length}>No records</td></tr>
                        ) : marksReportStudents.map((st) => (
                          <tr key={st._id} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{st.rollNo}</td>
                            <td className="px-3 py-2">{st.name}</td>
                            {marksSubjects.map((subj) => {
                              const m = marksByStudentSubject[st._id]?.[subj];
                              return (
                                <td key={subj} className="px-3 py-2">
                                  {m ? `${m.score}/${m.outOf}` : '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )}

            {/* Attendance */}
            {activeTab === 'attendance' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Mark Attendance</h2>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <Input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} />
                  <Input type="month" value={attMonth} onChange={(e) => setAttMonth(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {students.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.className}{s.section ? ` - ${s.section}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1 text-sm">
                          <input type="radio" name={`att-${s._id}`} checked={(attMap[s._id]||'Present')==='Present'} onChange={() => toggleAttendance(s._id, 'Present')} /> Present
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                          <input type="radio" name={`att-${s._id}`} checked={attMap[s._id]==='Absent'} onChange={() => toggleAttendance(s._id, 'Absent')} /> Absent
                        </label>
                      </div>
                    </div>
                  ))}
                  {students.length===0 && <p className="text-sm text-gray-500">No students</p>}
                </div>
                <div className="mt-4">
                  <Button onClick={async () => {
                    if (!attDate) return alert('Choose a date');
                    const ids = Object.keys(selectedMap).filter((k) => selectedMap[k]);
                    const targets = ids.length ? students.filter(s => ids.includes(s._id)) : students;
                    for (const s of targets) {
                      const status = attMap[s._id] || 'Present';
                      await apiPost(`/api/students/${s._id}/attendance`, { date: attDate, status });
                    }
                    await loadAttendanceReport();
                    alert('Attendance saved');
                  }}>Save Attendance</Button>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                    <h3 className="font-semibold">Attendance Calendar</h3>
                    <Button variant="outline" onClick={loadAttendanceReport}>Refresh</Button>
                  </div>
                  <div className="overflow-x-auto border rounded-lg bg-white">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left">Roll</th>
                          <th className="px-2 py-2 text-left">Name</th>
                          {monthDays.map((d) => (
                            <th key={d} className="px-2 py-2 text-center">{Number(d.slice(-2))}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {attendanceReportStudents.length === 0 ? (
                          <tr><td className="px-3 py-3 text-gray-500" colSpan={2 + monthDays.length}>No records</td></tr>
                        ) : attendanceReportStudents.map((st) => (
                          <tr key={st._id} className="hover:bg-gray-50">
                            <td className="px-2 py-2">{st.rollNo}</td>
                            <td className="px-2 py-2">{st.name}</td>
                            {monthDays.map((d) => {
                              const s = attendanceByStudentDate[st._id]?.[d];
                              const v = s === 'Present' ? 'P' : s === 'Absent' ? 'A' : '';
                              const cls = s === 'Present'
                                ? 'bg-green-50 text-green-700'
                                : s === 'Absent'
                                  ? 'bg-red-50 text-red-700'
                                  : '';
                              return (
                                <td key={d} className={`px-2 py-2 text-center ${cls}`}>{v}</td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )}

            {/* Remarks */}
            {activeTab === 'remarks' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Add Remark</h2>
                <div className="grid md:grid-cols-4 gap-3 mb-3">
                  <Input placeholder="Category (optional)" value={rCategory} onChange={(e) => setRCategory(e.target.value)} />
                  <Input placeholder="Date (optional)" value={rDate} onChange={(e) => setRDate(e.target.value)} />
                </div>
                <Textarea placeholder="Remark" value={rText} onChange={(e) => setRText(e.target.value)} />
                <div className="mt-3">
                  <Button onClick={async () => {
                    if (!selectedId) return alert('Select a student');
                    if (!rText.trim()) return alert('Remark required');
                    await apiPost(`/api/students/${selectedId}/remarks`, { text: rText, category: rCategory, date: rDate });
                    setRText(''); setRCategory(''); setRDate('');
                    alert('Remark added');
                  }}>Add</Button>
                </div>
              </Card>
            )}

            {/* Fees */}
            {activeTab === 'fees' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Fees</h2>

                <div className="grid md:grid-cols-5 gap-3">
                  <Input placeholder="Fee Type" value={feeType} onChange={(e) => setFeeType(e.target.value)} />
                  <Input placeholder="Amount" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value === '' ? '' : Number(e.target.value))} />
                  <Input placeholder="Fine" type="number" value={feeFine} onChange={(e) => setFeeFine(e.target.value === '' ? '' : Number(e.target.value))} />
                  <Select
                    label="Status"
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Paid', label: 'Paid' },
                    ]}
                    value={feeStatus}
                    onChange={(e) => setFeeStatus(e.target.value as any)}
                  />
                  <Input placeholder="Remarks" value={feeRemarks} onChange={(e) => setFeeRemarks(e.target.value)} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={async () => {
                    if (!feeType || feeAmount === '') return alert('Fee type and amount required');
                    const ids = Object.keys(selectedMap).filter((k) => selectedMap[k]);
                    const targets = ids.length ? ids : (selectedId ? [selectedId] : []);
                    if (!targets.length) return alert('Select at least one student');
                    try {
                      if (editingFeeId) {
                        await apiPut(`/api/fees/${editingFeeId}`, {
                          feeType,
                          amount: feeAmount,
                          fine: feeFine === '' ? 0 : feeFine,
                          status: feeStatus,
                          remarks: feeRemarks,
                        });
                        setEditingFeeId('');
                      } else {
                        for (const id of targets) {
                          await apiPost('/api/fees', {
                            studentId: id,
                            feeType,
                            amount: feeAmount,
                            fine: feeFine === '' ? 0 : feeFine,
                            status: feeStatus,
                            remarks: feeRemarks,
                          });
                        }
                      }
                      setFeeType('Tuition');
                      setFeeAmount('');
                      setFeeFine('');
                      setFeeStatus('Pending');
                      setFeeRemarks('');
                      await loadFeesForSelected();
                      alert('Fee saved');
                    } catch (e: any) {
                      alert(e?.message || 'Fee save failed');
                    }
                  }}>{editingFeeId ? 'Update' : 'Add'}</Button>

                  {editingFeeId && (
                    <Button variant="outline" onClick={() => {
                      setEditingFeeId('');
                      setFeeType('Tuition');
                      setFeeAmount('');
                      setFeeFine('');
                      setFeeStatus('Pending');
                      setFeeRemarks('');
                    }}>Cancel</Button>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Fee Entries {selectedId ? '' : '(select a student)'}</h3>
                  <div className="space-y-2">
                    {fees.length === 0 ? (
                      <p className="text-sm text-gray-500">No fee entries</p>
                    ) : fees.map((f) => (
                      <div key={f._id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{f.feeType} • {f.status}</p>
                          <p className="text-xs text-gray-500">Amount: {f.amount} • Fine: {f.fine || 0}{f.remarks ? ` • ${f.remarks}` : ''}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => {
                            setEditingFeeId(f._id);
                            setFeeType(f.feeType || 'Tuition');
                            setFeeAmount(f.amount ?? '');
                            setFeeFine(f.fine ?? '');
                            setFeeStatus(((f.status === 'Paid' || f.status === 'Pending') ? f.status : 'Pending') as any);
                            setFeeRemarks(f.remarks || '');
                          }}>Edit</Button>
                          <Button variant="outline" onClick={async () => {
                            if (!confirm('Delete this fee entry?')) return;
                            try {
                              await apiDelete(`/api/fees/${f._id}`);
                              await loadFeesForSelected();
                            } catch (e: any) {
                              alert(e?.message || 'Delete failed');
                            }
                          }}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
