'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { setAccessToken } from '@/lib/api/client';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLES = [
  { value: 'professor', label: 'Professor', desc: 'Faculty member leading research' },
  { value: 'phd_student', label: 'PhD Student', desc: 'Doctoral researcher' },
  { value: 'masters_student', label: 'Masters Student', desc: 'Graduate student' },
  { value: 'undergraduate', label: 'Undergraduate', desc: "Bachelor's student seeking research experience" },
  { value: 'independent_researcher', label: 'Independent Researcher', desc: 'Researcher outside academia' },
];

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  username: z.string().min(3, 'At least 3 characters'),
  email: z.string().email('Invalid email'),
  role: z.string().min(1, 'Select a role'),
  password: z.string().min(8, 'At least 8 characters'),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: 'Passwords do not match',
  path: ['password2'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      setAccessToken(res.data.access);
      const userRes = await usersApi.getMe();
      setUser(userRes.data);
      router.push('/feed');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Join the academic research network</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input {...register('first_name')} />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input {...register('last_name')} />
              {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input {...register('username')} />
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>I am a…</Label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setSelectedRole(r.value); setValue('role', r.value); }}
                  className={cn(
                    'text-left px-4 py-3 rounded-lg border-2 transition-colors',
                    selectedRole === r.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <p className="font-medium text-sm text-slate-900">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
            <input type="hidden" {...register('role')} />
          </div>

          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Confirm password</Label>
            <Input type="password" {...register('password2')} />
            {errors.password2 && <p className="text-xs text-red-500">{errors.password2.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-slate-600">
        Already have an account? <Link href="/login" className="text-indigo-600 font-medium hover:underline ml-1">Sign in</Link>
      </CardFooter>
    </Card>
  );
}
