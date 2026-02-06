import React, { useEffect, useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Modal } from '@/components/ui/Modal';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export const GallerySection: React.FC = () => {
  const { selectedSchool } = useSchool();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000';

  const categories = ['all', 'Campus', 'Events', 'Sports', 'Academics', 'Cultural', 'Labs'];

  useEffect(() => {
    const load = async () => {
      try {
        const cat = activeCategory === 'all' ? '' : `?category=${encodeURIComponent(activeCategory)}`;
        const res = await fetch(`${API_BASE}/api/gallery${cat}`);
        const data = await res.json();
        if (Array.isArray(data)) setImages(data);
      } catch (e) {
        console.error('Failed to load gallery', e);
      }
    };
    load();
  }, [activeCategory]);

  const filteredImages = images;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
            Photo Gallery
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Capturing Moments of Excellence
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our vibrant campus life through these memorable moments from events, 
            academics, sports, and cultural activities.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Photos' : category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image, index) => (
            <div
              key={image._id}
              onClick={() => setSelectedImage(image)}
              className={`
                relative overflow-hidden rounded-2xl cursor-pointer group
                ${index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              `}
            >
              <img
                src={image.imageUrl}
                alt={image.title}
                className={`
                  w-full object-cover transition-transform duration-500 group-hover:scale-110
                  ${index % 5 === 0 ? 'h-[400px]' : 'h-48'}
                `}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white mb-2">
                    {image.category}
                  </span>
                  <h4 className="text-white font-semibold">{image.title}</h4>
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          size="xl"
        >
          {selectedImage && (
            <div>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-2">
                    {selectedImage.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{selectedImage.title}</h3>
                </div>
                <div className="flex gap-3">
                  <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
};
