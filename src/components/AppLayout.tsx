import React, { useState } from 'react';
import { SchoolProvider } from '@/context/SchoolContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { AdmissionsSection } from '@/components/sections/AdmissionsSection';
import { FeesSection } from '@/components/sections/FeesSection';
import { AcademicsSection } from '@/components/sections/AcademicsSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { ContactSection } from '@/components/sections/ContactSection';
import { NoticesSection } from '@/components/sections/NoticesSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { LoginModal } from '@/components/auth/LoginModal';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <NoticesSection />
            <AboutSection onNavigate={handleNavigate} />
            <TestimonialsSection />
            <BlogSection />
          </>
        );
      case 'about':
        return <AboutSection onNavigate={handleNavigate} />;
      case 'academics':
        return <AcademicsSection />;
      case 'admissions':
        return <AdmissionsSection />;
      case 'fees':
        return <FeesSection />;
      case 'gallery':
        return <GallerySection />;
      case 'blog':
        return <BlogSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <NoticesSection />
            <AboutSection onNavigate={handleNavigate} />
            <TestimonialsSection />
            <BlogSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        onOpenLogin={() => setLoginModalOpen(true)}
      />
      
      <main>
        {renderPage()}
      </main>
      
      <Footer onNavigate={handleNavigate} />
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
};

export default AppLayout;
