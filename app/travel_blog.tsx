'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, Compass, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Post = {
  id: number;
  title: string;
  description: string;
  content: string;
  date: string;
  location: string;
  likes: number;
  comments: Comment[];
  likedBy: number[];
  images?: string[];
  category: string;
};

type Comment = {
  id: number;
  text: string;
  author: string;
};

const WanderlustJournal = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: "Sunrise over the Grand Canyon",
      description: "Witnessing one of nature's most spectacular shows in Arizona",
      content: "The Grand Canyon at sunrise is a truly magical experience. The way the first light hits the vast expanse of this natural wonder is simply breathtaking. As someone who's been fortunate enough to visit multiple times, I still find myself in awe of its beauty. The silence of the early morning, the cool breeze carrying the scent of pine, and the ever-changing colors of the canyon walls as the sun rises higher in the sky create a sensory experience that never gets old. Whether you're an early riser or not, make the effort to be there for sunrise - it's a memory you'll cherish forever.",
      date: "April 15, 2024",
      location: "Grand Canyon, Arizona",
      likes: 24,
      likedBy: [],
      comments: [
        { id: 1, text: "Jealous! This is on my bucket list!", author: "Sarah Chen" },
        { id: 2, text: "Been there last year! The sunrise is definitely the best time to visit.", author: "Michael Lee" }
      ],
      category: 'places',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 2,
      title: "Exploring the streets of Kyoto",
      description: "Discovering hidden temples and traditional tea houses",
      content: "Kyoto, the city of a thousand temples, is a place where ancient traditions meet modern life. Wandering through its streets, especially in the early morning before the crowds arrive, feels like stepping back in time. The scent of incense, the soft chirping of birds, and the sound of temple bells create an atmosphere of tranquility. From the famous Fushimi Inari shrine with its thousands of vermilion torii gates to the lesser-known Philosopher's Path lined with cherry blossoms in spring, every corner of Kyoto has a story to tell. The city's dedication to preserving its cultural heritage while embracing modernity makes it a fascinating destination for any traveler.",
      date: "April 10, 2024",
      location: "Kyoto, Japan",
      likes: 31,
      likedBy: [],
      comments: [
        { id: 3, text: "Kyoto is so underrated! I lived there for a year and it's always full of surprises.", author: "Emma Nakamura" }
      ],
      category: 'places',
      images: [
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 3,
      title: "Best Day Hikes in Switzerland",
      description: "Alpine lakes and mountain views",
      content: "Switzerland offers some of the best day hikes in the world...",
      date: "March 20, 2024",
      location: "Switzerland",
      likes: 18,
      likedBy: [],
      comments: [],
      category: 'places',
      images: [
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 4,
      title: "Hiking to Machu Picchu",
      description: "The adventure of a lifetime in the Peruvian Andes",
      content: "The four-day Inca Trail hike to Machu Picchu is more than just a trek - it's an immersion into the heart of the Andes. Each day brings new challenges and breathtaking views that test your physical limits while rewarding you with scenery that most people only dream of. The crisp mountain air, the warmth of Andean hospitality, and the mystery of Incan history combine to create an unforgettable journey. From the Sun Gate's first glimpse of Machu Picchu to exploring the ancient ruins at dawn when the mist still rises from the Urubamba Valley, this experience leaves an indelible mark on your soul.",
      date: "March 28, 2024",
      location: "Cusco, Peru",
      likes: 42,
      likedBy: [],
      comments: [],
      category: 'experiences',
      images: [
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 5,
      title: "Camping under the Northern Lights",
      description: "A magical night in Iceland",
      content: "Sleeping under the aurora borealis is a bucket-list experience...",
      date: "February 12, 2024",
      location: "Iceland",
      likes: 27,
      likedBy: [],
      comments: [],
      category: 'experiences',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 6,
      title: "Hot Air Ballooning in Cappadocia",
      description: "Floating above fairy chimneys",
      content: "Cappadocia's sunrise balloon rides are unforgettable...",
      date: "January 5, 2024",
      location: "Cappadocia, Turkey",
      likes: 35,
      likedBy: [],
      comments: [],
      category: 'experiences',
      images: [
        'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 7,
      title: "10 Packing Tips for Every Traveler",
      description: "How to pack light and smart",
      content: "Packing efficiently is an art. Here are 10 tips to help you pack like a pro...",
      date: "April 1, 2024",
      location: "",
      likes: 12,
      likedBy: [],
      comments: [],
      category: 'blog',
      images: [
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 8,
      title: "How to Take Better Travel Photos",
      description: "Simple tips for stunning shots",
      content: "You don't need a fancy camera to take great travel photos...",
      date: "March 15, 2024",
      location: "",
      likes: 20,
      likedBy: [],
      comments: [],
      category: 'blog',
      images: [
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 9,
      title: "Solo Travel: Pros and Cons",
      description: "Is traveling alone right for you?",
      content: "Solo travel can be liberating but also challenging...",
      date: "February 28, 2024",
      location: "",
      likes: 15,
      likedBy: [],
      comments: [],
      category: 'blog',
      images: [
        'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ]);

  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    content: "",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    location: "",
    category: ""
  });
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newImages, setNewImages] = useState<string[]>([]);

  const [showAll, setShowAll] = useState({ places: false, experiences: false, blog: false });

  const placesPosts = posts.filter((post: Post) => post.category === 'places');
  const experiencesPosts = posts.filter((post: Post) => post.category === 'experiences');
  const blogPosts = posts.filter((post: Post) => post.category === 'blog');

  const placesRef = React.useRef<HTMLDivElement>(null);
  const experiencesRef = React.useRef<HTMLDivElement>(null);
  const blogRef = React.useRef<HTMLDivElement>(null);
  const aboutRef = React.useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === 'about') {
      setActiveTab('about');
    } else {
      setActiveTab('posts');
    }
  }, []);

  const handleAddPost = () => {
    if (newPost.title && newPost.description && newPost.content && newPost.location && newPost.category) {
      const newPostComplete = {
        ...newPost,
        id: posts.length + 1,
        likes: 0,
        likedBy: [],
        comments: [],
        images: newImages,
        category: newPost.category
      };
      setPosts([...posts, newPostComplete]);
      setNewPost({
        title: "",
        description: "",
        content: "",
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        location: "",
        category: ""
      });
      setNewImages([]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleAddComment = (postId: number) => {
    if (newComment && commentAuthor) {
      const updatedPosts = posts.map((post: Post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, {
              id: post.comments.length + 1,
              text: newComment,
              author: commentAuthor
            }]
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      setNewComment("");
      setCommentAuthor("");
      const updatedPost = updatedPosts.find((p: Post) => p.id === postId);
      if (updatedPost) setCurrentPost(updatedPost);
    }
  };

  const handleLike = (postId: number) => {
    if (!likedPosts.includes(postId)) {
      const updatedPosts = posts.map((post: Post) => {
        if (post.id === postId && !post.likedBy.includes(1)) {
          return {
            ...post,
            likes: post.likes + 1,
            likedBy: [...post.likedBy, 1]
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      setLikedPosts([...likedPosts, postId]);
    }
  };

  const filteredPosts = posts.filter((post: Post) => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewPost = (post: Post) => {
    setCurrentPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPost(null);
  };

  const nextSlide = () => {
    setCurrentSlide((prev: number) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev: number) => (prev - 1 + 3) % 3);
  };

  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-[#2A4D5C] text-white px-1 rounded">{part}</mark> : part
    );
  };
  const filterAndHighlight = (posts: Post[], query: string) => {
    if (!query) return posts;
    return posts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.description.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.location.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F3] to-[#F5F1E6] flex flex-col">
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')`,
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <nav className="absolute top-0 left-0 w-full flex flex-col items-center px-2 sm:px-10 py-4 sm:py-6 z-20">
          <ul className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-8 text-white font-semibold text-sm tracking-wide justify-center w-full">
            <li><button className="hover:underline text-white cursor-pointer" onClick={() => scrollToSection(placesRef)}>PLACES</button></li>
            <li><button className="hover:underline text-white cursor-pointer" onClick={() => scrollToSection(experiencesRef)}>EXPERIENCES</button></li>
            <li><button className="hover:underline text-white cursor-pointer" onClick={() => scrollToSection(blogRef)}>BLOG</button></li>
            <li><button className="hover:underline text-white cursor-pointer" onClick={() => scrollToSection(aboutRef)}>ABOUT US</button></li>
          </ul>
        </nav>
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-white text-4xl md:text-5xl font-bold tracking-widest text-center mb-2 drop-shadow-lg"
          >
            WANDERLUST
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-white text-lg md:text-xl font-light text-center drop-shadow-lg"
          >
            travel blog
          </motion.p>
        </div>
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="w-full flex flex-col gap-3 mb-8 items-center">
            <div className="w-full flex-1 max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts by title, description, content, or location..."
                  className="w-full py-3 pl-12 pr-4 bg-white border-2 border-[#E5E5E5] rounded-full text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#F8B400] shadow-sm text-lg transition-all"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-[#2A4D5C] rounded-full">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
              </div>
            </div>
            <button
              className="flex items-center gap-2 bg-[#2A4D5C] text-white font-medium py-1.5 px-4 rounded-full text-sm transition-colors duration-150 hover:bg-[#1a2a33] focus:outline-none focus:ring-2 focus:ring-[#2A4D5C] mt-2 cursor-pointer"
              onClick={() => { setCurrentPost(null); setIsModalOpen(true); }}
              style={{ boxShadow: 'none' }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Add New Post
            </button>
          </div>
          <section ref={placesRef} className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2A4D5C]">Places</h2>
              {placesPosts.length > 4 && (
                <button className="bg-[#2A4D5C] text-white font-medium px-3 py-1 rounded cursor-pointer hover:bg-[#1a2a33]" onClick={() => setShowAll(s => ({ ...s, places: !s.places }))}>
                  {showAll.places ? 'Show Less' : 'See All'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(showAll.places ? filterAndHighlight(placesPosts, searchQuery) : filterAndHighlight(placesPosts, searchQuery).slice(0, 4)).map((post: Post, i: number) => {
                const coverImg = post.images && post.images.length > 0 ? post.images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                return (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative rounded-xl overflow-hidden cursor-pointer group min-h-[320px] flex items-end"
                    onClick={() => viewPost(post)}
                    style={{ background: `url('${coverImg}') center center / cover no-repeat` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                    <div className="relative z-20 w-full text-center p-6 flex flex-col justify-end items-center">
                      <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-lg leading-tight">
                        {highlight(post.title, searchQuery)}
                      </h3>
                      <p className="text-white text-base mt-2 line-clamp-2">{highlight(post.description, searchQuery)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
          <section ref={experiencesRef} className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2A4D5C]">Experiences</h2>
              {experiencesPosts.length > 4 && (
                <button className="bg-[#2A4D5C] text-white font-medium px-3 py-1 rounded cursor-pointer hover:bg-[#1a2a33]" onClick={() => setShowAll(s => ({ ...s, experiences: !s.experiences }))}>
                  {showAll.experiences ? 'Show Less' : 'See All'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(showAll.experiences ? filterAndHighlight(experiencesPosts, searchQuery) : filterAndHighlight(experiencesPosts, searchQuery).slice(0, 4)).map((post: Post, i: number) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`relative rounded-xl overflow-hidden cursor-pointer group min-h-[320px] flex items-end ${i === 0 ? 'md:col-span-2' : ''}`}
                  onClick={() => viewPost(post)}
                  style={{ background: `url('${post.images && post.images[0] ? post.images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}') center center / cover no-repeat` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  <div className="relative z-20 w-full text-center p-6 flex flex-col justify-end items-center">
                    <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-lg leading-tight">{highlight(post.title, searchQuery)}</h3>
                    <p className="text-white text-base mt-2 line-clamp-2">{highlight(post.description, searchQuery)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
          <section ref={blogRef} className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2A4D5C]">Blog</h2>
              {blogPosts.length > 4 && (
                <button className="bg-[#2A4D5C] text-white font-medium px-3 py-1 rounded cursor-pointer hover:bg-[#1a2a33]" onClick={() => setShowAll(s => ({ ...s, blog: !s.blog }))}>
                  {showAll.blog ? 'Show Less' : 'See All'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(showAll.blog ? filterAndHighlight(blogPosts, searchQuery) : filterAndHighlight(blogPosts, searchQuery).slice(0, 6)).map((post: Post, i: number) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative rounded-xl overflow-hidden cursor-pointer group min-h-[220px] flex items-end"
                  onClick={() => viewPost(post)}
                  style={{ background: `url('${post.images && post.images[0] ? post.images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}') center center / cover no-repeat` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  <div className="relative z-20 w-full text-center p-4 flex flex-col justify-end items-center">
                    <h3 className="text-white text-lg md:text-xl font-bold drop-shadow-lg leading-tight">{highlight(post.title, searchQuery)}</h3>
                    <p className="text-white text-base mt-2 line-clamp-2">{highlight(post.description, searchQuery)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/60 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-2xl max-w-xl w-full my-8 border border-[#E5E5E5] max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#2A4D5C]">
                    {currentPost ? "View Post" : "Add New Post"}
                  </h2>
                  <button 
                    onClick={closeModal}
                    className="bg-[#2A4D5C] text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-[#1a2a33] transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {currentPost ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm text-[#999]">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{currentPost.date}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{currentPost.location}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2A4D5C]">{currentPost.title}</h3>
                    <p className="text-[#4A4A4A] leading-relaxed">{currentPost.content}</p>
                    {currentPost.images && currentPost.images.length > 0 && (
                      <Gallery images={currentPost.images} />
                    )}
                    <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
                      <h4 className="font-medium text-[#2A4D5C] mb-4">Comments</h4>
                      {currentPost.comments.length > 0 ? (
                        <div className="space-y-4">
                          {currentPost.comments.map((comment: Comment) => (
                            <div key={comment.id} className="bg-[#F8F8F8] p-4 rounded-lg border border-[#E5E5E5]">
                              <p className="text-[#4A4A4A]">{comment.text}</p>
                              <span className="text-xs text-[#999] mt-1 block">{comment.author}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#999]">No comments yet</p>
                      )}
                      <div className="mt-6 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-grow px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8B400] text-[#4A4A4A]"
                        />
                        <input
                          type="text"
                          value={commentAuthor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentAuthor(e.target.value)}
                          placeholder="Your name"
                          className="sm:w-1/3 w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8B400] text-[#4A4A4A]"
                        />
                        <button
                          onClick={() => {
                            handleAddComment(currentPost.id);
                          }}
                          className="bg-[#2A4D5C] hover:bg-[#1a2a33] text-white px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                          style={{ minWidth: '48px' }}
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-[#4A4A4A] mb-1">Title</label>
                      <input
                        id="title"
                        type="text"
                        value={newPost.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({...newPost, title: e.target.value})}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8B400] text-[#4A4A4A]"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-[#4A4A4A] mb-1">Short Description</label>
                      <input
                        id="description"
                        type="text"
                        value={newPost.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({...newPost, description: e.target.value})}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8B400] text-[#4A4A4A]"
                      />
                    </div>
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-[#4A4A4A] mb-1">Content</label>
                      <textarea
                        id="content"
                        value={newPost.content}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost({...newPost, content: e.target.value})}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8B400] h-32 text-[#4A4A4A]"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-[#4A4A4A] mb-1">Location</label>
                      <input
                        id="location"
                        type="text"
                        value={newPost.location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({...newPost, location: e.target.value})}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8B400] text-[#4A4A4A]"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-[#4A4A4A] mb-1">Category</label>
                      <select
                        id="category"
                        value={newPost.category}
                        onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8B400] text-[#4A4A4A]"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="places">Places</option>
                        <option value="experiences">Experiences</option>
                        <option value="blog">Blog</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1">Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const files = Array.from(e.target.files || []);
                          Promise.all(files.map((file: File) => {
                            return new Promise<string>(resolve => {
                              const reader = new FileReader();
                              reader.onload = (ev: ProgressEvent<FileReader>) => {
                                if (ev.target) resolve(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            });
                          })).then(imgs => setNewImages(prev => [...prev, ...imgs]));
                        }}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg"
                      />
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {newImages.map((img: string, i: number) => (
                          <img key={i} src={img} alt="preview" className="w-20 h-20 object-cover rounded-lg border" />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleAddPost();
                        closeModal();
                      }}
                      className="w-full bg-[#2A4D5C] hover:bg-[#1a2a33] text-white font-medium py-3 px-6 rounded-lg transition-colors mt-4 cursor-pointer"
                    >
                      Add Post
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-[#2A4D5C] text-white px-6 py-3 rounded-lg shadow-lg transition-all transform translate-y-0">
          <p>Post added successfully!</p>
        </div>
      )}

      {!isModalOpen && (
        <section ref={aboutRef} className="container mx-auto px-4 mb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 flex flex-col justify-center py-10 md:py-16 gap-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2a33] leading-tight mb-2" style={{lineHeight:1.2}}>
              Wanderlust is here to help you make the most of <span className="font-extrabold text-[#222]">every trip</span>.
            </h2>
            <p className="text-[#2A4D5C] text-lg mb-2 font-light">We are Wanderlust, an independent travellers passionate about exploring the world.</p>
            <p className="text-[#2A4D5C] text-base mb-2 font-light">We craft every piece of content you read here, plan every trip, and take every photo. Our guides include practical tips and detailed itineraries based on our personal experiences to help you make the most of every journey.</p>            
            <div className="mt-4 text-[#888] text-base italic">Wanderlust Journal.</div>
          </div>
          <div className="flex-1 min-h-[240px] flex items-center justify-center w-full md:w-auto">
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="About us" className="object-cover w-full h-60 md:h-auto md:w-auto max-h-[340px] rounded-xl shadow-lg" />
          </div>
        </section>
      )}
      <footer className="bg-[#2A4D5C] text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Wanderlust Journal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WanderlustJournal;
export const Schema = {
    "commentary": "",
    "template": "nextjs-developer",
    "title": "",
    "description": "",
    "additional_dependencies": [],
    "has_additional_dependencies": false,
    "install_dependencies_command": "",
    "port": 3000,
    "file_path": "pages/index.tsx",
    "code": "<see code above>"
}

const Gallery = ({ images }: { images: string[] }) => {
  const [idx, setIdx] = useState<number>(0);
  if (!images.length) return null;
  return (
    <motion.div className="flex flex-col items-center gap-2 mt-4">
      <motion.img
        key={images[idx]}
        src={images[idx]}
        alt="Gallery"
        className="w-full max-h-80 object-contain rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5 }}
      />
      <div className="flex gap-2 mt-2">
        <button onClick={() => setIdx((idx - 1 + images.length) % images.length)} className="px-2 py-1 bg-[#2A4D5C] text-white rounded cursor-pointer">&#8592;</button>
        <span className="px-2 py-1 bg-[#2A4D5C] text-white rounded">{idx + 1} / {images.length}</span>
        <button onClick={() => setIdx((idx + 1) % images.length)} className="px-2 py-1 bg-[#2A4D5C] text-white rounded cursor-pointer">&#8594;</button>
      </div>
      <div className="flex gap-1 mt-1">
        {images.map((img: string, i: number) => (
          <img key={i} src={img} alt="thumb" className={`w-8 h-8 object-cover rounded border cursor-pointer ${i === idx ? 'border-[#2A4D5C]' : 'border-[#E5E5E5]'}`} onClick={() => setIdx(i)} />
        ))}
      </div>
    </motion.div>
  );
};

<style jsx global>{`
  @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700&display=swap');
  body, html, * {
    font-family: 'Nunito Sans', Arial, sans-serif;
    font-weight: 300;
  }
`}</style>