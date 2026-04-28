"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Director, DriveRight Academy",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      text: "iDrive has completely transformed how we manage our driving school. The scheduling system alone has saved us countless hours every week. Highly recommended!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Owner, Elite Driving School",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      text: "The best investment we've made for our business. Our revenue increased by 35% in the first year, and our students love the online booking system.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Manager, SafeDrive Institute",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      text: "Outstanding platform with excellent customer support. The analytics help us make better business decisions, and the instructors find it incredibly easy to use.",
      rating: 5
    },
    {
      name: "James Anderson",
      role: "CEO, ProDrive Training",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      text: "We switched from our old system to iDrive and never looked back. Everything is more organized, efficient, and our customers are happier than ever.",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "Owner, RoadMaster Academy",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      text: "The payment management feature is a game changer. We no longer have to chase down payments, and our cash flow has improved dramatically.",
      rating: 5
    },
    {
      name: "David Kumar",
      role: "Manager, CityDrive School",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      text: "Our instructors love the mobile app. They can update student progress on the go, and parents appreciate the real-time updates.",
      rating: 5
    }
  ];

  useEffect(() => {
    if (testimonialsRef.current) {
      const container = testimonialsRef.current;
      const cards = container.children;
      const cardWidth = cards[0]?.clientWidth || 400;
      const gap = 32; // gap between cards
      const totalWidth = (cardWidth + gap) * testimonials.length;

      // Create infinite loop animation
      animationRef.current = gsap.to(container, {
        x: -totalWidth,
        duration: 30,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
        }
      });

      // Pause on hover
      const handleMouseEnter = () => {
        if (animationRef.current) {
          animationRef.current.pause();
        }
      };

      const handleMouseLeave = () => {
        if (animationRef.current) {
          animationRef.current.resume();
        }
      };

      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">iDrive</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Home</a>
              <a href="#about" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">About</a>
              <a href="#features" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Contact</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/adminlogin" className="bg-purple-500 text-white px-6 py-2.5 rounded-full hover:bg-purple-600 transition-all font-medium shadow-md hover:shadow-lg">
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-purple-500 hover:bg-purple-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Home</a>
                <a href="#about" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">About</a>
                <a href="#features" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Features</a>
                <a href="#testimonials" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Testimonials</a>
                <a href="#contact" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">Contact</a>
                <Link href="/login" className="text-gray-700 hover:text-purple-500 transition-colors font-medium">
                  Sign In
                </Link>
                <Link href="/adminlogin" className="bg-purple-500 text-white px-5 py-2 rounded-full hover:bg-purple-600 transition-colors font-medium text-center">
                  Login
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <div className="inline-block">
                <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Professional Management Software
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Simplify Your
                <span className="block text-gray-900 mt-2">
                  Driving School
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Streamline operations, manage bookings, track students, and grow your driving school with our all-in-one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/adminlogin" className="bg-purple-500 text-white px-8 py-4 rounded-full hover:bg-purple-600 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Start Free Trial
                </Link>
                <a href="#features" className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-full hover:bg-gray-50 transition-all font-semibold text-lg">
                  Learn More
                </a>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Schools</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600 mt-1">Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600 mt-1">Uptime</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 animate-float">
                <Image
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop&q=80"
                  alt="Driving School Dashboard"
                  width={800}
                  height={600}
                  className="rounded-3xl shadow-2xl"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Image
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=500&fit=crop&q=80"
                    alt="Instructor teaching"
                    width={400}
                    height={500}
                    className="rounded-2xl shadow-lg object-cover w-full h-64"
                  />
                  <div className="bg-gray-100 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-800">24</div>
                        <div className="text-sm text-gray-600">Today&apos;s Bookings</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-gray-100 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-800">12</div>
                        <div className="text-sm text-gray-600">Instructors</div>
                      </div>
                    </div>
                  </div>
                  <Image
                    src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=500&fit=crop&q=80"
                    alt="Driving lesson"
                    width={400}
                    height={500}
                    className="rounded-2xl shadow-lg object-cover w-full h-64"
                  />
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-block mb-4">
                <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                  About iDrive
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Designed for Modern 
                <span className="block text-gray-900">
                  Driving Schools
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                iDrive is a cutting-edge management platform built specifically for driving schools. 
                We understand your unique challenges and created a solution that simplifies every aspect of your operations.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From instructor schedules to student progress tracking, payments to vehicle management — 
                everything you need in one beautiful, intuitive platform.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Cloud-Based Solution</h3>
                    <p className="text-gray-600">Access your data anywhere, anytime, from any device</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Intuitive Interface</h3>
                    <p className="text-gray-600">Easy to use design that requires minimal training</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Secure & Reliable</h3>
                    <p className="text-gray-600">Bank-level security to protect your sensitive data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools to manage every aspect of your driving school business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Automated scheduling system that optimizes instructor and vehicle allocation, 
                minimizes conflicts, and maximizes efficiency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Handle payments, invoices, and financial tracking with ease. 
                Integrated payment processing and detailed financial reports.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track student progress, lesson history, test results, and certifications. 
                Keep comprehensive records at your fingertips.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instructor Portal</h3>
              <p className="text-gray-600 leading-relaxed">
                Dedicated portal for instructors to manage their schedules, view student information, 
                and submit progress reports.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Reports</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive reporting and analytics to track your business performance, 
                identify trends, and make data-driven decisions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vehicle Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track vehicle maintenance, insurance, and availability. 
                Ensure your fleet is always ready and compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                Testimonials
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of satisfied driving schools transforming their business
            </p>
          </div>

          <div className="max-w-7xl mx-auto overflow-hidden">
            <div 
              ref={testimonialsRef}
              className="flex gap-8"
              style={{ width: 'fit-content' }}
            >
              {/* Duplicate testimonials for infinite loop effect */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[500px]"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 h-full">
                    <div className="flex flex-col items-center text-center gap-6">
                      <div className="flex-shrink-0">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={100}
                          height={100}
                          className="rounded-full border-4 border-gray-200 shadow-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                            </svg>
                          ))}
                        </div>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                          &quot;{testimonial.text}&quot;
                        </p>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                          <p className="text-gray-600 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-500 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Driving School?</h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join hundreds of driving schools already using iDrive to streamline their operations 
            and grow their business. Start your free trial today – no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/adminlogin" className="bg-white text-purple-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
              Get Started Free
            </Link>
            <a href="#features" className="bg-white/20 backdrop-blur text-white border-2 border-white px-8 py-4 rounded-full hover:bg-white/30 transition-all font-semibold text-lg">
              Schedule Demo
            </a>
          </div>
          <p className="mt-8 text-white/90">
            Questions? Contact us at <a href="mailto:support@idrive.com" className="text-white font-semibold hover:underline">support@idrive.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">iDrive</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                Professional driving school management software trusted by schools worldwide.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-gray-300 transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-gray-300 transition-colors">Testimonials</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-gray-300 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-gray-300 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-gray-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                © 2026 iDrive. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
