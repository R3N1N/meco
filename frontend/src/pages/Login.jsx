import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(data.email, data.password);
      // Route based on role
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setError(err || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass border border-slate-800 p-8 rounded-2xl flex flex-col gap-6 text-left relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none"></div>

        <div className="text-center flex flex-col gap-2">
          <div className="w-12 h-12 bg-teal-950/60 border border-teal-800/40 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Eye className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Access Your EyeCare Portal</h2>
          <p className="text-xs text-slate-400">Log in to schedule exams, read prescriptions, or check logs</p>
        </div>

        {error && (
          <div className="bg-red-950/35 border border-red-900/45 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                className={`w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2 border text-xs focus:outline-none focus:border-teal-500 ${errors.email ? 'border-red-500/50' : 'border-slate-800'}`}
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' }
                })}
              />
              <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            </div>
            {errors.email && <span className="text-red-400 text-[10px]">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2 border text-xs focus:outline-none focus:border-teal-500 ${errors.password ? 'border-red-500/50' : 'border-slate-800'}`}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                })}
              />
              <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            </div>
            {errors.password && <span className="text-red-400 text-[10px]">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/10 hover:shadow-teal-500/20"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-900 text-[11px] text-slate-400">
          New to EyeCare? <Link to="/register" className="text-teal-400 underline font-semibold">Create an Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
