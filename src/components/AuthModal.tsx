
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

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`
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
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            onClick={() => handleSocialLogin('github')}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
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
