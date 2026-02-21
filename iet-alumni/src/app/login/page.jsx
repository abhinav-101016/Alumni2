"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or phone
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      
      {/* Container: Matching the 50% width of the Signup box */}
      <div className="w-full lg:w-1/2 max-w-2xl bg-white border border-slate-200 shadow-sm overflow-hidden rounded-sm">
        
        {/* Header */}
        <div className="pt-12 pb-8 text-center border-b border-slate-100">
          <div className="w-10 h-1 bg-[#951114] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
            Member Login
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Access the IET Alumni Portal
          </p>
        </div>

        <form className="p-8 md:p-14 space-y-8 flex flex-col items-center">
          
          <div className="w-full max-w-md space-y-6">
            {/* Identifier Field (Email/Phone) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">
                Email or Phone Number
              </label>
              <input
                type="text"
                name="identifier"
                placeholder="Enter your registered contact"
                value={formData.identifier}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all"
              />
              <div className="text-right">
                <Link 
                  href="/" 
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#951114] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-6 w-full flex flex-col items-center gap-8">
            <button 
              type="submit"
              className=" rounded-sm max-w-[240px] py-4 px-4 bg-[#951114] text-white text-[11px] font-black uppercase  hover:bg-black transition-all duration-300 active:scale-95 shadow-md"
            >
              Sign In
            </button>
            
            <div className="text-center border-t border-slate-100 w-full pt-8">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                New to the network?
              </p>
              <Link 
                href="/signup" 
                className="block mt-1 text-black font-black text-[11px] uppercase tracking-widest hover:text-[#951114] transition-all underline underline-offset-4 decoration-2"
              >
                Create Account
              </Link>
            </div>
          </div>
        </form>
      </div>

      <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
        Secure Gateway &bull; IET Lucknow
      </p>
    </main>
  );
}