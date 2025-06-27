
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  onAuthenticated: () => void;
}

export const AuthModal = ({ onAuthenticated }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSocialLogin = (provider: string) => {
    // Simulate social login
    console.log(`Logging in with ${provider}`);
    setTimeout(() => {
      onAuthenticated();
    }, 1000);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email login
    console.log('Logging in with email:', email);
    setTimeout(() => {
      onAuthenticated();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to TaskFlow
          </h1>
          <p className="text-slate-600">
            {isLogin ? 'Sign in to manage your tasks' : 'Create your account to get started'}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <Button
            onClick={() => handleSocialLogin('Google')}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50"
          >
            <div className="w-5 h-5 bg-red-500 rounded"></div>
            Continue with Google
          </Button>

          <Button
            onClick={() => handleSocialLogin('GitHub')}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50"
          >
            <div className="w-5 h-5 bg-gray-900 rounded"></div>
            Continue with GitHub
          </Button>

          <Button
            onClick={() => handleSocialLogin('Facebook')}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50"
          >
            <div className="w-5 h-5 bg-blue-600 rounded"></div>
            Continue with Facebook
          </Button>
        </div>

        <div className="relative">
          <Separator className="my-6" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white px-3 text-sm text-slate-500">or</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">Demo Mode - Click any login option to continue</p>
        </div>
      </div>
    </div>
  );
};
