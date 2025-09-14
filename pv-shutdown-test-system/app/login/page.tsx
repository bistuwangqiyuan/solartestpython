'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
    } catch (error: any) {
      setError(error.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // Demo login function
  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')

    try {
      // For demo purposes, create a demo user or use existing
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'demo123456',
      })

      if (error) {
        // If demo user doesn't exist, create one
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'demo@example.com',
          password: 'demo123456',
        })

        if (signUpError) throw signUpError
      }

      router.push('/')
    } catch (error: any) {
      // For demo, just proceed without auth
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            PV-RSD 系统
          </h1>
          <h2 className="text-2xl font-semibold text-gray-100">
            光伏关断器实验数据管理系统
          </h2>
          <p className="mt-2 text-gray-400">
            请登录以访问系统
          </p>
        </div>

        <div className="dashboard-card">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="form-label">
                电子邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-industrial"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    登录中...
                  </span>
                ) : (
                  '登录'
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full px-6 py-3 bg-secondary-600 hover:bg-secondary-700 
                         text-white font-medium rounded-md 
                         shadow-lg hover:shadow-xl
                         transform hover:-translate-y-0.5 
                         transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
                         focus:ring-offset-dark-900"
              >
                演示登录
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              还没有账号？{' '}
              <a href="#" className="font-medium text-primary-400 hover:text-primary-300">
                联系管理员
              </a>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>© 2025 光伏关断器实验数据管理系统</p>
          <p className="mt-1">Powered by Next.js & Supabase</p>
        </div>
      </div>
    </div>
  )
}