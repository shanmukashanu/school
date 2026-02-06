import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import API_BASE from '@/lib/apiBase';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}

export const BlogSection: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'News', 'Events', 'Achievements', 'Academics', 'Sports', 'Culture'];

  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const cat = activeCategory === 'all' ? '' : `?category=${encodeURIComponent(activeCategory)}`;
        const res = await fetch(`${API_BASE}/blogs${cat}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((b: any) => ({
            id: b._id || String(b.id || b.title),
            title: b.title,
            excerpt: (b.content || '').slice(0, 120),
            content: b.content || '',
            category: b.category || 'News',
            author: 'Admin',
            date: '',
            image: b.coverUrl || 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=800&h=500&fit=crop',
            readTime: ''
          }));
          setPosts(mapped);
        }
      } catch (e) {
        console.error('Failed to load blogs', e);
      }
    };
    load();
  }, [activeCategory]);

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Annual Sports Day 2026 - A Grand Success',
      excerpt: 'Students showcased their athletic prowess in various track and field events...',
      content: 'The Annual Sports Day 2026 was a spectacular event that brought together students, parents, and faculty in a celebration of athleticism and sportsmanship. Over 500 students participated in various track and field events, including sprints, relays, long jump, and shot put. The event was graced by the presence of Olympic medalist John Smith, who inspired the students with his journey and achievements. The day concluded with a colorful march past and prize distribution ceremony.',
      category: 'Sports',
      author: 'Sports Department',
      date: 'Jan 28, 2026',
      image: 'https://images.unsplash.com/photo-1461896836934- voices-of-the-future?w=800&h=500&fit=crop',
      readTime: '3 min'
    },
    {
      id: '2',
      title: 'Science Exhibition Showcases Student Innovation',
      excerpt: 'Young scientists presented groundbreaking projects on sustainability and technology...',
      content: 'Our annual Science Exhibition witnessed remarkable innovations from our young scientists. Students from classes 6-12 presented over 100 projects covering topics from renewable energy to artificial intelligence. The highlight was a working model of a solar-powered water purification system developed by Class 10 students. The exhibition was judged by professors from leading universities, who commended the creativity and scientific approach of our students.',
      category: 'Academics',
      author: 'Science Department',
      date: 'Jan 25, 2026',
      image: 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=800&h=500&fit=crop',
      readTime: '4 min'
    },
    {
      id: '3',
      title: 'Cultural Fest "Harmony 2026" Celebrates Diversity',
      excerpt: 'A three-day extravaganza of music, dance, and drama from across cultures...',
      content: 'Harmony 2026, our annual cultural festival, was a magnificent celebration of art and culture. Students performed classical and contemporary dances, staged thought-provoking plays, and showcased their musical talents. The festival featured participation from 15 schools across the region. The grand finale was a fusion performance combining Indian classical dance with Western contemporary styles, symbolizing our commitment to global harmony.',
      category: 'Culture',
      author: 'Cultural Committee',
      date: 'Jan 22, 2026',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop',
      readTime: '5 min'
    },
    {
      id: '4',
      title: 'Students Excel in National Mathematics Olympiad',
      excerpt: 'Five students qualify for the international round with outstanding performances...',
      content: 'We are proud to announce that five of our students have qualified for the International Mathematics Olympiad after exceptional performances in the national round. These young mathematicians solved complex problems in algebra, geometry, and number theory, competing against thousands of students nationwide. They will now represent our country at the international competition in Singapore.',
      category: 'Achievements',
      author: 'Mathematics Department',
      date: 'Jan 20, 2026',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=500&fit=crop',
      readTime: '3 min'
    },
    {
      id: '5',
      title: 'New Smart Classrooms Inaugurated',
      excerpt: 'State-of-the-art digital learning facilities now available across all campuses...',
      content: 'In our continuous effort to enhance the learning experience, we have inaugurated 50 new smart classrooms across our three campuses. These classrooms feature interactive whiteboards, high-speed internet, and advanced audio-visual systems. Teachers have been trained to utilize these technologies effectively, enabling more engaging and interactive lessons. This initiative is part of our Digital Education 2030 vision.',
      category: 'News',
      author: 'Administration',
      date: 'Jan 18, 2026',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop',
      readTime: '4 min'
    },
    {
      id: '6',
      title: 'Inter-School Debate Competition Winners',
      excerpt: 'Our students win first place in the regional debate championship...',
      content: 'Our debate team has brought home the championship trophy from the Regional Inter-School Debate Competition. Competing against 24 schools, our students demonstrated exceptional oratory skills, critical thinking, and persuasive arguments. The topic for the final round was "Technology: A Boon or Bane for Education." Our team argued convincingly for the balanced integration of technology in education.',
      category: 'Achievements',
      author: 'English Department',
      date: 'Jan 15, 2026',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=500&fit=crop',
      readTime: '3 min'
    },
    {
      id: '7',
      title: 'Parent-Teacher Meeting Schedule Released',
      excerpt: 'Quarterly PTM dates announced for all classes across campuses...',
      content: 'The schedule for the upcoming Parent-Teacher Meetings has been released. These meetings provide an excellent opportunity for parents to discuss their child\'s academic progress, social development, and any concerns with the teachers. We encourage all parents to attend and actively participate in their child\'s educational journey. Online booking for time slots is now available through the parent portal.',
      category: 'Events',
      author: 'Academic Office',
      date: 'Jan 12, 2026',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=500&fit=crop',
      readTime: '2 min'
    },
    {
      id: '8',
      title: 'Environment Club Plants 1000 Trees',
      excerpt: 'Students lead massive tree plantation drive in the community...',
      content: 'Our Environment Club, in collaboration with the local municipality, successfully planted 1000 trees in and around the school campuses and nearby public areas. This initiative, named "Green Future," involved students from all three schools. The saplings include native species that will provide shade, improve air quality, and support local biodiversity. Students have also committed to nurturing these plants for the next year.',
      category: 'Events',
      author: 'Environment Club',
      date: 'Jan 10, 2026',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=500&fit=crop',
      readTime: '3 min'
    },
    {
      id: '9',
      title: 'Basketball Team Wins State Championship',
      excerpt: 'Under-17 boys team clinches the state title after thrilling final...',
      content: 'Our Under-17 boys basketball team has won the State Championship after a nail-biting final against last year\'s champions. The final score was 68-65, with our team captain scoring the winning basket in the last 10 seconds. This victory marks our third state title in basketball and reflects the dedication of our players and coaching staff. The team will now prepare for the national championships.',
      category: 'Sports',
      author: 'Sports Department',
      date: 'Jan 8, 2026',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=500&fit=crop',
      readTime: '3 min'
    }
  ];

  const sourcePosts = posts.length > 0 ? posts : blogPosts;
  const filteredPosts = activeCategory === 'all' 
    ? sourcePosts 
    : sourcePosts.filter(post => post.category === activeCategory);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
            News & Updates
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest From Our Schools
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest news, events, and achievements from across our campuses.
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
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
              }`}
            >
              {category === 'all' ? 'All Posts' : category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card 
              key={post.id} 
              onClick={() => setSelectedPost(post)}
              className="overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>{post.readTime} read</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {post.author}</span>
                  <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                    Read More
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Blog Post Modal */}
        <Modal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          title={selectedPost?.title}
          size="lg"
        >
          {selectedPost && (
            <div>
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-64 object-contain rounded-xl mb-6"
              />
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-medium">
                  {selectedPost.category}
                </span>
                <span>{selectedPost.date}</span>
                <span>{selectedPost.readTime} read</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">{selectedPost.content}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Written by <span className="font-medium text-gray-700">{selectedPost.author}</span></span>
                <div className="flex gap-3">
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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
