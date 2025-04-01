
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location.state]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === 'login') {
        await signIn(email, password);
        toast.success('Signed in successfully');
        navigate(location.state?.from || '/');
      } else if (activeTab === 'register') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        
        await signUp(email, password);
        toast.success('Registration successful! Please check your email for verification.');
        setActiveTab('login');
      } else if (activeTab === 'reset') {
        await resetPassword(email);
        toast.success('Password reset email sent');
        setActiveTab('login');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-card dark:bg-card p-6 sm:p-8 rounded-xl shadow-md border border-border">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">AppHaven</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {activeTab === 'login' 
                ? 'Sign in to your account' 
                : activeTab === 'register' 
                  ? 'Create a new account' 
                  : 'Reset your password'}
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="login" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
              <TabsTrigger value="reset" className="flex items-center gap-1">
                <KeyRound className="h-4 w-4" />
                Reset
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input
                    id="password-login"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input
                    id="email-register"
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <Input
                    id="password-register"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-reset">Email</Label>
                  <Input
                    id="email-reset"
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
