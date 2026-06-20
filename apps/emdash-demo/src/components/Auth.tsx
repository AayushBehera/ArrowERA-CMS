import React, { useState } from 'react';
import { IconLock, IconMail, IconUser, IconArrowRight, Input, Button, Checkbox } from '@arrorera/ui';

export default function Auth({ onLogin }: { onLogin: (role: 'admin' | 'client', user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = { name: isLogin ? (email.split('@')[0] || 'User') : name, email, role };
    onLogin(role, user);
  };

  return (
    <div className="min-h-screen bg-ae-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-11 h-11 bg-ae-fg rounded-ae-lg flex items-center justify-center text-ae-bg font-bold text-xl">
            A
          </div>
        </div>
        <h2 className="mt-6 text-center text-ae-2xl font-semibold text-ae-text-primary tracking-tight">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-ae-sm text-ae-text-secondary">
          Or{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-ae-text-primary hover:underline transition-colors duration-ae-fast"
          >
            {isLogin ? 'start your 14-day free trial' : 'sign in to your existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-ae-bg py-8 px-4 sm:rounded-ae-xl sm:px-10 border border-ae-border">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                leftIcon={<IconUser size={18} />}
              />
            )}

            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<IconMail size={18} />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<IconLock size={18} />}
            />

            <div>
              <label className="block text-ae-sm font-medium text-ae-text-primary mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2.5 px-4 border rounded-ae-md text-ae-sm font-medium transition-all duration-ae-fast ${
                    role === 'client'
                      ? 'border-ae-fg bg-ae-surface-secondary text-ae-text-primary'
                      : 'border-ae-border bg-ae-bg text-ae-text-secondary hover:bg-ae-hover'
                  }`}
                >
                  Client Portal
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2.5 px-4 border rounded-ae-md text-ae-sm font-medium transition-all duration-ae-fast ${
                    role === 'admin'
                      ? 'border-ae-fg bg-ae-surface-secondary text-ae-text-primary'
                      : 'border-ae-border bg-ae-bg text-ae-text-secondary hover:bg-ae-hover'
                  }`}
                >
                  Admin Access
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <Checkbox label="Remember me" id="remember-me" />
                <div className="text-ae-sm">
                  <a
                    href="#"
                    className="font-medium text-ae-text-primary hover:underline transition-colors duration-ae-fast"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full">
              {isLogin ? 'Sign in' : 'Create account'}
              <IconArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
