import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import API_BASE from '@/lib/apiBase';

export const AcademicsSection: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState('primary');

  const levels = [
    { id: 'primary', label: 'Primary (1-5)', color: 'bg-green-500' },
    { id: 'middle', label: 'Middle (6-8)', color: 'bg-blue-500' },
    { id: 'secondary', label: 'Secondary (9-10)', color: 'bg-purple-500' },
    { id: 'senior', label: 'Senior Secondary (11-12)', color: 'bg-orange-500' },
  ];

  const curriculum = {
    primary: {
      subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'Art & Craft', 'Physical Education', 'Music', 'Moral Science'],
      features: ['Activity-based learning', 'Smart classroom teaching', 'Regular assessments', 'Parent-teacher interaction', 'Field trips and excursions'],
      description: 'Our primary curriculum focuses on building strong foundations through interactive and engaging learning experiences.'
    },
    middle: {
      subjects: ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit/French', 'Computer Applications', 'Art Education', 'Physical Education', 'Work Education'],
      features: ['Project-based learning', 'Science experiments', 'Language labs', 'Sports training', 'Leadership programs'],
      description: 'Middle school curriculum emphasizes critical thinking and prepares students for higher academic challenges.'
    },
    secondary: {
      subjects: ['English', 'Mathematics', 'Science (Physics, Chemistry, Biology)', 'Social Science', 'Hindi/Sanskrit', 'Information Technology', 'Physical Education'],
      features: ['Board exam preparation', 'Career counseling', 'Competitive exam coaching', 'Practical sessions', 'Mock tests'],
      description: 'Secondary education focuses on comprehensive board exam preparation while nurturing individual talents.'
    },
    senior: {
      subjects: ['Science Stream: Physics, Chemistry, Mathematics/Biology', 'Commerce Stream: Accountancy, Business Studies, Economics', 'Humanities Stream: History, Political Science, Geography'],
      features: ['Specialized coaching', 'University preparation', 'Internship opportunities', 'Research projects', 'Entrance exam guidance'],
      description: 'Senior secondary offers specialized streams to prepare students for higher education and career paths.'
    }
  };

  const facilities = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Smart Classrooms',
      description: 'Interactive whiteboards and digital learning tools'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: 'Science Labs',
      description: 'Well-equipped Physics, Chemistry, and Biology labs'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Library',
      description: '50,000+ books and digital resources'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Innovation Lab',
      description: 'Robotics, 3D printing, and maker space'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: 'Language Lab',
      description: 'Audio-visual language learning facility'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'AV Room',
      description: 'Multimedia presentations and e-learning'
    }
  ];

  const [downloads, setDownloads] = useState<{ name: string; size?: string; type: string; url: string }[]>([]);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await fetch(`${API_BASE}/documents?category=Academics`);
        const data = await res.json();
        const mapped = (data || []).map((d: any) => ({
          name: d.title,
          type: d.category || 'Document',
          url: d.pdfUrl,
        }));
        setDownloads(mapped);
      } catch (e) {
        console.error('Failed to load documents', e);
        setDownloads([]);
      }
    };
    loadDocs();
  }, []);

  const activeData = curriculum[activeLevel as keyof typeof curriculum];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-4">
            Academics
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Curriculum
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our curriculum is designed to provide a well-rounded education that prepares 
            students for academic success and lifelong learning.
          </p>
        </div>

        {/* Level Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeLevel === level.id
                  ? `${level.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        {/* Curriculum Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Subjects Offered</h3>
            <p className="text-gray-600 mb-6">{activeData.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {activeData.subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">{subject}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h3>
            <div className="space-y-4">
              {activeData.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 pt-1">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Facilities */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">Academic Facilities</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <Card key={index} className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {facility.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{facility.title}</h4>
                <p className="text-gray-600 text-sm">{facility.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Downloads */}
        <Card className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Downloads</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {downloads.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                </div>
                <a className="text-blue-600 underline" href={doc.url} target="_blank" rel="noreferrer">View</a>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};
