import React, { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';
import { useSchool } from '@/context/SchoolContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect as Select } from '@/components/ui/SimpleSelect';
import { AdmissionEnquiry, FeeEnquiry, ContactEnquiry } from '@/types';
import { clearAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import API_BASE from '@/lib/apiBase';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { schools, selectedSchool, stats, refreshStats } = useSchool();
  const [activeTab, setActiveTab] = useState('overview');
  const [admissionEnquiries, setAdmissionEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [feeEnquiries, setFeeEnquiries] = useState<FeeEnquiry[]>([]);
  const [contactEnquiries, setContactEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [galleryCategory, setGalleryCategory] = useState('All Photos');
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  // Blogs state
  const [blogCategory, setBlogCategory] = useState('All Posts');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogFile, setBlogFile] = useState<File | null>(null);

  // Documents state
  const [docCategory, setDocCategory] = useState('Academics');
  const [documents, setDocuments] = useState<any[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  // Members state
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [uUsername, setUUsername] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState<'student'|'teacher'|'parent'|'admin'>('student');
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uSchool, setUSchool] = useState('');

  // Newsletter state
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);

  // Notices state
  const [notices, setNotices] = useState<any[]>([]);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState<'high'|'normal'>('normal');
  const [noticeSchool, setNoticeSchool] = useState('');
  const [noticesFilterSchool, setNoticesFilterSchool] = useState<string>('');

  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventSchool, setEventSchool] = useState('');
  const [eventsFilterSchool, setEventsFilterSchool] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [selectedSchool]);

  useEffect(() => {
    const code = selectedSchool?.code || '';
    setNoticesFilterSchool(code);
    setEventsFilterSchool(code);
  }, [selectedSchool]);

  // Default new member school to currently selected school in header (if any)
  useEffect(() => {
    if (!uSchool && selectedSchool?.code) setUSchool(selectedSchool.code);
  }, [selectedSchool]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const schoolFilter = selectedSchool ? { school_id: selectedSchool.id } : {};

      const [admRes, feeRes, contactRes] = await Promise.all([
        supabase.from('admission_enquiries').select('*').match(schoolFilter).order('created_at', { ascending: false }).limit(10),
        supabase.from('fee_enquiries').select('*').match(schoolFilter).order('created_at', { ascending: false }).limit(10),
        supabase.from('contact_enquiries').select('*').match(schoolFilter).order('created_at', { ascending: false }).limit(10)
      ]);

      if (admRes.data) setAdmissionEnquiries(admRes.data);
      if (feeRes.data) setFeeEnquiries(feeRes.data);
      if (contactRes.data) setContactEnquiries(contactRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async (schoolOverride?: string) => {
    try {
      const school = (schoolOverride !== undefined ? schoolOverride : noticesFilterSchool) || '';
      const q = school ? `?school=${encodeURIComponent(school)}` : '';
      const res = await fetch(`${API_BASE}/notices${q}`);
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load notices', e);
    }
  };

  const loadEvents = async (schoolOverride?: string) => {
    try {
      const school = (schoolOverride !== undefined ? schoolOverride : eventsFilterSchool) || '';
      const q = school ? `?school=${encodeURIComponent(school)}` : '';
      const res = await fetch(`${API_BASE}/events${q}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load events', e);
    }
  };

  const updateEnquiryStatus = async (table: string, id: string, status: string) => {
    try {
      await supabase.from(table).update({ status }).eq('id', id);
      fetchData();
      refreshStats();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // ----- Admin API loaders -----
  const loadGallery = async (cat?: string) => {
    try {
      const category = cat ?? galleryCategory;
      const q = category && category !== 'All Photos' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`${API_BASE}/gallery${q}`);
      const data = await res.json();
      setGalleryItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load gallery', e);
    }
  };

  const loadBlogs = async (cat?: string) => {
    try {
      const category = cat ?? blogCategory;
      const q = category && category !== 'All Posts' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`${API_BASE}/blogs${q}`);
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load blogs', e);
    }
  };

  const loadDocuments = async (cat?: string) => {
    try {
      const category = cat ?? docCategory;
      const q = category ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`${API_BASE}/documents${q}`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load documents', e);
    }
  };

  // Initial loads
  useEffect(() => {
    loadGallery();
    loadBlogs();
    loadDocuments();
    loadUsers();
    loadNotices(selectedSchool?.code || '');
    loadEvents(selectedSchool?.code || '');
    loadNewsletter();
  }, []);

  const loadNewsletter = async () => {
    try {
      const schoolQ = selectedSchool?.code ? `?school=${encodeURIComponent(selectedSchool.code)}` : '';
      const res = await fetch(`${API_BASE}/newsletter${schoolQ}`, {
        headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      });
      const data = await res.json().catch(() => ([]));
      setNewsletterSubs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load newsletter', e);
      setNewsletterSubs([]);
    }
  };

  const loadUsers = async (role?: string) => {
    try {
      const q = role ? `?role=${encodeURIComponent(role)}` : '';
      const res = await fetch(`${API_BASE}/users${q}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'admissions', label: 'Admission Enquiries', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'fees', label: 'Fee Enquiries', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'contacts', label: 'Contact Messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'gallery', label: 'Gallery', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 8l4-4h8l4 4M4 8v8a3 3 0 003 3h10a3 3 0 003-3V8' },
    { id: 'blogs', label: 'Blogs', icon: 'M7 8h10M7 12h10m-9 8h8a2 2 0 002-2V6a2 2 0 00-2-2H8l-1 1v1' },
    { id: 'documents', label: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414L14.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'notices', label: 'Notices', icon: 'M9 12h6m-6 4h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'members', label: 'Members', icon: 'M5.121 17.804A7 7 0 1118 13v1m-6 4v-4m0 0a4 4 0 10-8 0v4' },
    { id: 'newsletter', label: 'Newsletter', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      case 'admitted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'unread': return 'bg-blue-100 text-blue-700';
      case 'read': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">
                {selectedSchool ? selectedSchool.name : 'All Schools'} - Management Portal
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
              <Button onClick={() => { clearAuth(); navigate('/'); }} variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Tabs (Left Sidebar) */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-xl shadow p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span className="text-left">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="col-span-12 md:col-span-9">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={stats.students}
                color="bg-blue-100"
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Total Teachers"
                value={stats.teachers}
                color="bg-green-100"
                icon={
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Admission Enquiries"
                value={stats.admissionEnquiries}
                color="bg-purple-100"
                icon={
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Fee Enquiries"
                value={stats.feeEnquiries}
                color="bg-orange-100"
                icon={
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Schools Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Schools Overview</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: school.theme_color }}
                      >
                        {school.code}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{school.name}</p>
                        <p className="text-sm text-gray-500">Est. {school.established_year}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{school.address}</p>
                      <p>{school.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
              </div>
            )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create Notice</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!noticeTitle.trim() || !noticeContent.trim()) return alert('Title and content are required');
                  const payload = {
                    title: noticeTitle,
                    content: noticeContent,
                    priority: noticePriority,
                    school: noticeSchool || (selectedSchool?.code || ''),
                  };
                  const res = await fetch(`${API_BASE}/notices`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return alert(data?.error || 'Create notice failed');
                  setNoticeTitle(''); setNoticeContent(''); setNoticePriority('normal'); setNoticeSchool('');
                  loadNotices();
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <Input placeholder="Title" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} />
                  <Select
                    label="Priority"
                    options={[{ value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }]}
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                  />
                  <Input placeholder="School (optional)" value={noticeSchool || selectedSchool?.code || ''} onChange={(e) => setNoticeSchool(e.target.value)} />
                </div>
                <Textarea placeholder="Content" rows={4} value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} />
                <Button type="submit">Publish Notice</Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h3 className="text-lg font-bold text-gray-900">Notices</h3>
                <div className="min-w-[220px]">
                  <Select
                    label="School"
                    options={[
                      { value: '', label: 'All' },
                      { value: 'SIS', label: 'School A (SIS)' },
                      { value: 'GVA', label: 'School B (GVA)' },
                      { value: 'HPS', label: 'School C (HPS)' },
                    ]}
                    value={noticesFilterSchool}
                    onChange={(e) => { setNoticesFilterSchool(e.target.value); loadNotices(e.target.value); }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {notices.length === 0 ? (
                  <p className="text-gray-500">No notices</p>
                ) : (
                  notices.map((n) => (
                    <div key={n._id} className="rounded-lg border p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.priority}{n.school ? ` • ${n.school}` : ''}</p>
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{n.content}</p>
                      </div>
                      <Button variant="outline" onClick={async () => { await fetch(`${API_BASE}/notices/${n._id}`, { method: 'DELETE' }); loadNotices(); }}>Delete</Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create Event</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!eventTitle.trim() || !eventDate.trim()) return alert('Title and date are required');
                  const payload = {
                    title: eventTitle,
                    date: eventDate,
                    time: eventTime,
                    description: eventDescription,
                    school: eventSchool || (selectedSchool?.code || ''),
                  };
                  const res = await fetch(`${API_BASE}/events`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return alert(data?.error || 'Create event failed');
                  setEventTitle(''); setEventDate(''); setEventTime(''); setEventDescription(''); setEventSchool('');
                  loadEvents();
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-5 gap-4">
                  <Input placeholder="Title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
                  <Input placeholder="Date (e.g. Feb 20, 2026)" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  <Input placeholder="Time (optional)" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                  <Input placeholder="School (optional)" value={eventSchool || selectedSchool?.code || ''} onChange={(e) => setEventSchool(e.target.value)} />
                </div>
                <Textarea placeholder="Description (optional)" rows={4} value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
                <Button type="submit">Publish Event</Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h3 className="text-lg font-bold text-gray-900">Events</h3>
                <div className="min-w-[220px]">
                  <Select
                    label="School"
                    options={[
                      { value: '', label: 'All' },
                      { value: 'SIS', label: 'School A (SIS)' },
                      { value: 'GVA', label: 'School B (GVA)' },
                      { value: 'HPS', label: 'School C (HPS)' },
                    ]}
                    value={eventsFilterSchool}
                    onChange={(e) => { setEventsFilterSchool(e.target.value); loadEvents(e.target.value); }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-gray-500">No events</p>
                ) : (
                  events.map((ev) => (
                    <div key={ev._id} className="rounded-lg border p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{ev.title}</p>
                        <p className="text-xs text-gray-500">{ev.date}{ev.time ? ` • ${ev.time}` : ''}{ev.school ? ` • ${ev.school}` : ''}</p>
                        {ev.description ? <p className="text-sm text-gray-700 mt-1 line-clamp-2">{ev.description}</p> : null}
                      </div>
                      <Button variant="outline" onClick={async () => { await fetch(`${API_BASE}/events/${ev._id}`, { method: 'DELETE' }); loadEvents(); }}>Delete</Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Admission Enquiries Tab */}
        {activeTab === 'admissions' && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Admission Enquiries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admissionEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No admission enquiries yet
                      </td>
                    </tr>
                  ) : (
                    admissionEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{enquiry.student_name}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{enquiry.parent_name}</td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600">{enquiry.email}</p>
                          <p className="text-sm text-gray-400">{enquiry.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{enquiry.class_applying}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status || 'new')}`}>
                            {enquiry.status || 'new'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={enquiry.status || 'new'}
                            onChange={(e) => updateEnquiryStatus('admission_enquiries', enquiry.id!, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="admitted">Admitted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Fee Enquiries Tab */}
        {activeTab === 'fees' && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Fee Enquiries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feeEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No fee enquiries yet
                      </td>
                    </tr>
                  ) : (
                    feeEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{enquiry.parent_name}</td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600">{enquiry.email}</p>
                          <p className="text-sm text-gray-400">{enquiry.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{enquiry.enquiry_type}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{enquiry.message}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status || 'pending')}`}>
                            {enquiry.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={enquiry.status || 'pending'}
                            onChange={(e) => updateEnquiryStatus('fee_enquiries', enquiry.id!, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Contact Messages Tab */}
        {activeTab === 'contacts' && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Contact Messages</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contactEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No contact messages yet
                      </td>
                    </tr>
                  ) : (
                    contactEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{enquiry.name}</td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600">{enquiry.email}</p>
                          <p className="text-sm text-gray-400">{enquiry.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{enquiry.subject}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{enquiry.message}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor((enquiry as any).status || 'unread')}`}>
                            {(enquiry as any).status || 'unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={(enquiry as any).status || 'unread'}
                            onChange={(e) => updateEnquiryStatus('contact_enquiries', enquiry.id!, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                          >
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Image</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!galleryTitle.trim()) return alert('Title is required');
                  if (!galleryFile) return alert('Please choose an image');
                  const form = new FormData();
                  form.append('file', galleryFile);
                  form.append('title', galleryTitle || 'Photo');
                  form.append('category', galleryCategory);
                  const res = await fetch(`${API_BASE}/gallery`, { method: 'POST', body: form });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return alert(data?.error || 'Upload failed');
                  setGalleryTitle('');
                  setGalleryFile(null);
                  loadGallery();
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Title" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} />
                  <Select
                    label="Category"
                    options={[
                      { value: 'All Photos', label: 'All Photos' },
                      { value: 'Campus', label: 'Campus' },
                      { value: 'Events', label: 'Events' },
                      { value: 'Sports', label: 'Sports' },
                      { value: 'Academics', label: 'Academics' },
                      { value: 'Cultural', label: 'Cultural' },
                      { value: 'Labs', label: 'Labs' },
                    ]}
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value)}
                  />
                  <input type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit">Upload</Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Gallery Items</h3>
                <Select
                  options={[
                    { value: 'All Photos', label: 'All Photos' },
                    { value: 'Campus', label: 'Campus' },
                    { value: 'Events', label: 'Events' },
                    { value: 'Sports', label: 'Sports' },
                    { value: 'Academics', label: 'Academics' },
                    { value: 'Cultural', label: 'Cultural' },
                    { value: 'Labs', label: 'Labs' },
                  ]}
                  value={galleryCategory}
                  onChange={(e) => { setGalleryCategory(e.target.value); loadGallery(e.target.value); }}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {galleryItems.map((g) => (
                  <div key={g._id} className="rounded-lg border overflow-hidden">
                    <img src={g.imageUrl} alt={g.title} className="w-full h-48 object-cover" />
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{g.title}</p>
                        <p className="text-xs text-gray-500">{g.category}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await fetch(`${API_BASE}/gallery/${g._id}`, { method: 'DELETE' });
                          loadGallery();
                        }}
                      >Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create Blog Post</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData();
                  if (blogFile) form.append('file', blogFile);
                  if (!blogTitle.trim()) return alert('Title is required');
                  if (!blogContent.trim()) return alert('Content is required');
                  form.append('title', blogTitle);
                  form.append('content', blogContent);
                  form.append('category', blogCategory);
                  const res = await fetch(`${API_BASE}/blogs`, { method: 'POST', body: form });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return alert(data?.error || 'Create failed');
                  setBlogTitle('');
                  setBlogContent('');
                  setBlogFile(null);
                  loadBlogs();
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Title" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} />
                  <Select
                    label="Category"
                    options={[
                      { value: 'All Posts', label: 'All Posts' },
                      { value: 'News', label: 'News' },
                      { value: 'Events', label: 'Events' },
                      { value: 'Achievements', label: 'Achievements' },
                      { value: 'Academics', label: 'Academics' },
                      { value: 'Sports', label: 'Sports' },
                      { value: 'Culture', label: 'Culture' },
                    ]}
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                  />
                  <input type="file" accept="image/*" onChange={(e) => setBlogFile(e.target.files?.[0] || null)} />
                </div>
                <Textarea placeholder="Write content..." rows={6} value={blogContent} onChange={(e) => setBlogContent(e.target.value)} />
                <Button type="submit">Publish</Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Posts</h3>
                <Select
                  options={[
                    { value: 'All Posts', label: 'All Posts' },
                    { value: 'News', label: 'News' },
                    { value: 'Events', label: 'Events' },
                    { value: 'Achievements', label: 'Achievements' },
                    { value: 'Academics', label: 'Academics' },
                    { value: 'Sports', label: 'Sports' },
                    { value: 'Culture', label: 'Culture' },
                  ]}
                  value={blogCategory}
                  onChange={(e) => { setBlogCategory(e.target.value); loadBlogs(e.target.value); }}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {blogs.map((b) => (
                  <div key={b._id} className="rounded-lg border p-4">
                    {b.coverUrl ? (
                      <img src={b.coverUrl} alt={b.title} className="w-full h-40 object-cover rounded" />
                    ) : null}
                    <h4 className="font-semibold mt-3">{b.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{b.category}</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{b.content}</p>
                    <div className="mt-3 text-right">
                      <Button variant="outline" onClick={async () => { await fetch(`${API_BASE}/blogs/${b._id}`, { method: 'DELETE' }); loadBlogs(); }}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload PDF Document</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!docTitle.trim()) return alert('Title is required');
                  if (!docFile) return alert('Please choose a PDF');
                  const form = new FormData();
                  form.append('file', docFile);
                  form.append('title', docTitle);
                  form.append('category', docCategory);
                  const res = await fetch(`${API_BASE}/documents`, { method: 'POST', body: form });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return alert(data?.error || 'Upload failed');
                  setDocTitle('');
                  setDocFile(null);
                  loadDocuments();
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
                  <Select
                    label="Category"
                    options={[
                      { value: 'Academics', label: 'Academics' },
                      { value: 'Syllabus', label: 'Syllabus' },
                      { value: 'Calendar', label: 'Calendar' },
                      { value: 'Exams', label: 'Exams' },
                    ]}
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                  />
                  <input type="file" accept="application/pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit">Upload</Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Documents</h3>
                <Select
                  options={[
                    { value: 'Academics', label: 'Academics' },
                    { value: 'Syllabus', label: 'Syllabus' },
                    { value: 'Calendar', label: 'Calendar' },
                    { value: 'Exams', label: 'Exams' },
                  ]}
                  value={docCategory}
                  onChange={(e) => { setDocCategory(e.target.value); loadDocuments(e.target.value); }}
                />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((d) => (
                  <div key={d._id} className="rounded-lg border p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-gray-500">{d.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <a className="underline text-blue-600" href={d.pdfUrl} target="_blank" rel="noreferrer">View</a>
                      <Button variant="outline" onClick={async () => { await fetch(`${API_BASE}/documents/${d._id}`, { method: 'DELETE' }); loadDocuments(); }}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create Member</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!uUsername.trim() || !uPassword.trim()) return alert('Username and password are required');
                  const finalSchool = uSchool || selectedSchool?.code || '';
                  if (!finalSchool) return alert('Please select a school');
                  const payload = { username: uUsername, password: uPassword, role: uRole, name: uName, email: uEmail, school: finalSchool };
                  const res = await fetch(`${API_BASE}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
                    body: JSON.stringify(payload)
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) return alert(data?.error || 'Create user failed');
                  setUUsername(''); setUPassword(''); setURole('student'); setUName(''); setUEmail('');
                  loadUsers(userRoleFilter || undefined);
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Username" value={uUsername} onChange={(e) => setUUsername(e.target.value)} />
                  <Input placeholder="Password" type="password" value={uPassword} onChange={(e) => setUPassword(e.target.value)} />
                  <Select
                    label="Role"
                    options={[
                      { value: 'student', label: 'Student' },
                      { value: 'teacher', label: 'Teacher' },
                      { value: 'parent', label: 'Parent' },
                      { value: 'admin', label: 'School Admin' },
                    ]}
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as any)}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Full Name" value={uName} onChange={(e) => setUName(e.target.value)} />
                  <Input placeholder="Email" type="email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} />
                  <Select
                    label="School"
                    options={[
                      { value: 'SIS', label: 'School A (SIS)' },
                      { value: 'GVA', label: 'School B (GVA)' },
                      { value: 'HPS', label: 'School C (HPS)' },
                    ]}
                    value={uSchool || selectedSchool?.code || ''}
                    onChange={(e) => setUSchool(e.target.value)}
                  />
                </div>
                <Button type="submit">Add</Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Members</h3>
                <Select
                  options={[
                    { value: '', label: 'All' },
                    { value: 'student', label: 'Student' },
                    { value: 'teacher', label: 'Teacher' },
                    { value: 'parent', label: 'Parent' },
                    { value: 'admin', label: 'School Admin' },
                  ]}
                  value={userRoleFilter}
                  onChange={(e) => { setUserRoleFilter(e.target.value); loadUsers(e.target.value || undefined); }}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">School</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{u.username}</td>
                          <td className="px-6 py-4">{u.role}</td>
                          <td className="px-6 py-4">{u.name || '-'}</td>
                          <td className="px-6 py-4">{u.email || '-'}</td>
                          <td className="px-6 py-4">{u.school || '-'}</td>
                          <td className="px-6 py-4">
                            <Button variant="outline" onClick={async () => {
                              await fetch(`${API_BASE}/users/${u._id}`, { method: 'DELETE', headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) } });
                              loadUsers(userRoleFilter || undefined);
                            }}>Delete</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && (
          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Newsletter Subscriptions</h3>
                  <p className="text-sm text-gray-500">{selectedSchool?.code ? `Filtered by ${selectedSchool.code}` : 'All schools'}</p>
                </div>
                <Button variant="outline" onClick={loadNewsletter}>Refresh</Button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newsletterSubs.length === 0 ? (
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>No subscriptions</td>
                      </tr>
                    ) : newsletterSubs.map((n) => (
                      <tr key={n._id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{n.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{n.school || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{n.createdAt ? new Date(n.createdAt).toLocaleString() : '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" onClick={async () => {
                            if (!confirm('Delete this subscription?')) return;
                            await fetch(`${API_BASE}/newsletter/${n._id}`, {
                              method: 'DELETE',
                              headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
                            });
                            loadNewsletter();
                          }}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
          </div>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
