'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Eddie's Savings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Eddie's Savings
          </h1>
          <p className="text-xl text-white/90 font-light">
            Save Smart. Grow Wealth.
          </p>
        </div>

        {/* Animated Elements */}
        <div className="mb-12">
          <div className="flex space-x-4 mb-8">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          <Link
            href="/auth/signup"
            className="w-full bg-white text-primary font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center block"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="w-full bg-white/10 text-white font-semibold py-4 px-6 rounded-xl border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-center block"
          >
            Sign In
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="glassmorphism rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-white font-semibold mb-2">Smart Savings</h3>
            <p className="text-white/80 text-sm">Create personalized savings plans with automated deposits</p>
          </div>
          <div className="glassmorphism rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-white font-semibold mb-2">Grow Wealth</h3>
            <p className="text-white/80 text-sm">Invest in curated opportunities with competitive returns</p>
          </div>
          <div className="glassmorphism rounded-2xl p-6 text-center">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-white font-semibold mb-2">Secure & Safe</h3>
            <p className="text-white/80 text-sm">Bank-level security with advanced encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
