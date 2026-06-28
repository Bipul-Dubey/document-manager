'use client'

import { useState } from 'react'
import { BookOpen, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { login, signup } from '@/app/login/actions'

interface AuthFormProps {
  errorMessage?: string
  initialMode?: 'login' | 'signup'
}

export default function AuthForm({ errorMessage, initialMode = 'login' }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FFF0E4] selection:bg-[#24B1B1]/30">
      {/* Background Blobs for Medium Light Mode */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#24B1B1] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#FFE0C5] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-[#007979] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-[#007979]/5">
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-white rounded-2xl ring-1 ring-[#007979]/10 shadow-md">
            <BookOpen className="h-10 w-10 text-[#007979]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-[#007979] mb-2 tracking-tight">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-center text-[#007979]/70 mb-8 font-medium">
          {isLogin ? 'Enter your details to access your workspace.' : 'Start your local-first journey today.'}
        </p>

        <form action={isLogin ? login : signup} className="space-y-5 flex flex-col">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            </div>
          )}

          {!isLogin && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#007979]/50 group-focus-within:text-[#007979] transition-colors" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-[#007979]/20 rounded-xl text-[#007979] placeholder-[#007979]/50 focus:outline-none focus:ring-2 focus:ring-[#007979] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#007979]/50 group-focus-within:text-[#007979] transition-colors" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 bg-white/80 border border-[#007979]/20 rounded-xl text-[#007979] placeholder-[#007979]/50 focus:outline-none focus:ring-2 focus:ring-[#007979] focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-[#007979]/50 group-focus-within:text-[#007979] transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              className="w-full pl-10 pr-12 py-3 bg-white/80 border border-[#007979]/20 rounded-xl text-[#007979] placeholder-[#007979]/50 focus:outline-none focus:ring-2 focus:ring-[#007979] focus:border-transparent transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#007979]/50 hover:text-[#007979] transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#007979] to-[#24B1B1] hover:from-[#006060] hover:to-[#1a9090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#24B1B1] shadow-lg shadow-[#24B1B1]/20 transition-all duration-200 transform hover:scale-[1.02] mt-2"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
            <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#007979]/70">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-[#007979] hover:text-[#24B1B1] transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
