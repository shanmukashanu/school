import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useSchool } from '@/context/SchoolContext';
import API_BASE from '@/lib/apiBase';

export const NoticesSection: React.FC = () => {
  const { selectedSchool } = useSchool();
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const schoolQ = selectedSchool ? `?school=${encodeURIComponent(selectedSchool.code)}` : '';
        const [nRes, eRes] = await Promise.all([
          fetch(`${API_BASE}/notices${schoolQ}`),
          fetch(`${API_BASE}/events${schoolQ}`),
        ]);
        const n = await nRes.json().catch(() => []);
        const e = await eRes.json().catch(() => []);
        setNotices(Array.isArray(n) ? n : []);
        setEvents(Array.isArray(e) ? e : []);
      } catch (err) {
        console.error('Failed to load notices/events', err);
      }
    };
    load();
  }, [selectedSchool]);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-4">
            Stay Updated
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Notices & Announcements
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Important updates and announcements from across our schools.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Notices List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {notices.map((notice) => (
                <Card 
                  key={notice._id || notice.id} 
                  className={`p-6 border-l-4 ${
                    notice.priority === 'high' 
                        ? 'border-l-orange-500' 
                        : 'border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.priority === 'high' && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                            IMPORTANT
                          </span>
                        )}
                        {notice.date ? (
                          <span className="text-sm text-gray-500">{notice.date}</span>
                        ) : null}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h4>
                      <p className="text-gray-600">{notice.content}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
            
            <button className="mt-6 w-full py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-colors">
              View All Notices
            </button>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {events.map((event: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                      <span className="text-xs font-medium">{event.date}</span>
                      <span className="text-lg font-bold">{event.time || ''}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.time || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 mt-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <div className="space-y-3">
                {[
                  { label: 'Download Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { label: 'Fee Payment', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                  { label: 'Student Portal', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { label: 'Contact Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
                ].map((link, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-left"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    <span className="font-medium">{link.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
