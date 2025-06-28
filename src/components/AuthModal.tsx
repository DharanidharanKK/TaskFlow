
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import type { AuthError } from '@supabase/supabase-js';

interface AuthModalProps {
  onAuthenticated: () => void;
}

export const AuthModal = ({ onAuthenticated }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        onAuthenticated();
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Welcome!",
          description: "You have successfully logged in.",
        });
        onAuthenticated();
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthenticated, toast]);

  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook') => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to login with ${provider}`;
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          onAuthenticated();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        if (data.user) {
          if (data.user.email_confirmed_at) {
            toast({
              title: "Account created!",
              description: "You have successfully signed up.",
            });
            onAuthenticated();
          } else {
            toast({
              title: "Check your email",
              description: "We've sent you a confirmation link to complete your registration.",
            });
          }
        }
      }
    } catch (error) {
      console.error('Email auth error:', error);
      const authError = error as AuthError;
      let errorMessage = 'An error occurred during authentication';
      
      if (authError.message) {
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (authError.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (authError.message.includes('Password should be at least')) {
          errorMessage = 'Password should be at least 6 characters long.';
        } else {
          errorMessage = authError.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to TaskFlow
          </h1>
          <p className="text-slate-600 dark:text-gray-300">
            {isLogin ? 'Sign in to manage your tasks' : 'Create your account to get started'}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-6">
          <Button
            onClick={() => handleSocialLogin('google')}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <div className="w-5 h-5 bg-red-500 rounded"></div>
            Continue with Google
          </Button>

          <Button
            onClick={() => handleSocialLogin('github')}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <div className="w-5 h-5 bg-gray-900 dark:bg-white rounded"></div>
            Continue with GitHub
          </Button>

          <Button
            onClick={() => handleSocialLogin('facebook')}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <div className="w-5 h-5 bg-blue-600 rounded"></div>
            Continue with Facebook
          </Button>
        </div>

        <div className="relative">
          <Separator className="my-6" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white dark:bg-gray-800 px-3 text-sm text-slate-500 dark:text-gray-400">or</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
