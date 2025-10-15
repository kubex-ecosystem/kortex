import { ArrowRight, Cpu, Eye, EyeOff, Lock, Mail, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const LoginPage: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - replace with real authentication
      if (formData.email && formData.password) {
        // Success - redirect to dashboard
        router.push('/');
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const features = [
    { icon: <Cpu className="w-6 h-6" />, title: 'MCP Server Management', desc: 'Manage Model Context Protocol servers' },
    { icon: <Shield className="w-6 h-6" />, title: 'Advanced Security', desc: 'Enterprise-grade security and monitoring' },
    { icon: <Zap className="w-6 h-6" />, title: 'Real-time Analytics', desc: 'Live performance metrics and insights' }
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-10 dark:opacity-5">
          <div className="absolute inset-0 bg-dotted-pattern" />
        </div>

        {/* Main Container */}
        <div className="relative w-full max-w-6xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
            
            {/* Left Side - Login Form */}
            <div className="p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl mb-4">
                    <div className="text-2xl font-bold text-white">K</div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">KorteX</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sign in to access your MCP management dashboard
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="admin@kubex.local"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600" 
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-primary dark:text-primary hover:text-primary-foreground dark:hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover 
                             text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 
                             transform hover:scale-[1.02] active:scale-[0.98] 
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                             flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 bg-primary-subtle dark:bg-primary/20 border border-primary dark:border-primary rounded-lg">
                  <p className="text-sm font-medium text-primary-foreground dark:text-primary mb-2">Demo Credentials:</p>
                  <p className="text-sm text-primary dark:text-primary">
                    Email: <code className="bg-primary-subtle dark:bg-primary/20 px-1 py-0.5 rounded">admin@kubex.local</code><br/>
                    Password: <code className="bg-primary-subtle dark:bg-primary/20 px-1 py-0.5 rounded">demo123</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Features */}
            <div className="bg-gradient-to-br from-primary to-accent p-8 lg:p-12 text-white">
              <div className="h-full flex flex-col justify-center">
                
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    Enterprise MCP Management
                  </h2>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Powerful dashboard for managing Model Context Protocol servers with 
                    real-time monitoring, advanced analytics, and seamless integrations.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-blue-100 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-blue-200 text-sm">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-blue-200 text-sm">Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
