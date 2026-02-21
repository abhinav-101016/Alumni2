"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ENUMS = {
  gender: [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" }
  ],
  course: [
    { label: "B.Tech", value: "Btech" },
    { label: "M.Tech", value: "Mtech" },
    { label: "MBA", value: "MBA" },
    { label: "MCA", value: "MCA" }
  ],
  branch: ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical", "Chemical"],
  passingYear: Array.from({ length: 45 }, (_, i) => (1984 + i).toString()).reverse(),
  hostels: ["Ramanujan", "Aryabhatt", "Bhabha", "Vishveshwarya", "Sarojini", "Gargi", "H1", "H2", "H3"],
  bloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
};

// Reusable Input Field Component
const InputField = ({ label, name, type = "text", options = null, value, onChange }) => (
  <div className="flex flex-col gap-1.5 px-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">{label}</label>
    <div className="relative">
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#951114] outline-none text-xs text-black font-medium transition-all appearance-none cursor-pointer"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all"
        />
      )}
    </div>
  </div>
);

export default function SignUp() {
  const router = useRouter(); // ✅ must be inside component
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    gender: "",
    course: "",
    branch: "",
    passingYear: "",
    hostel: "",
    city: "",
    country: "",
    bloodGroup: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, passingYear: Number(formData.passingYear) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Save email for OTP page
      sessionStorage.setItem("verifyEmail", formData.email);

      // Redirect to Verify Email page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);

    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full lg:w-1/2 bg-white border border-slate-200 shadow-sm overflow-hidden rounded-sm">
        
        {/* Header */}
        <div className="pt-10 pb-6 text-center border-b border-slate-100">
          <div className="w-10 h-1 bg-[#951114] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Create Account</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Official Alumni Enrollment Form
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
          {/* Personal Info */}
          <section>
            <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
              <span className="w-4 h-px bg-[#951114]"></span> 01. Personal Info
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
              <InputField label="DOB" name="dob" type="date" value={formData.dob} onChange={handleChange} />
              <InputField label="Gender" name="gender" options={ENUMS.gender} value={formData.gender} onChange={handleChange} />
              <InputField label="Blood Group" name="bloodGroup" options={ENUMS.bloodGroups} value={formData.bloodGroup} onChange={handleChange} />
            </div>
          </section>

          {/* Academic Record */}
          <section>
            <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
              <span className="w-4 h-px bg-[#951114]"></span> 02. Academic Record
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
              <InputField label="Course" name="course" options={ENUMS.course} value={formData.course} onChange={handleChange} />
              <InputField label="Branch" name="branch" options={ENUMS.branch} value={formData.branch} onChange={handleChange} />
              <InputField label="Passing Year" name="passingYear" options={ENUMS.passingYear} value={formData.passingYear} onChange={handleChange} />
              <InputField label="Hostel" name="hostel" options={ENUMS.hostels} value={formData.hostel} onChange={handleChange} />
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
              <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />
            </div>
          </section>

          {/* Submit & messages */}
          <div className="pt-8 flex flex-col items-center border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[240px] py-4 bg-[#951114] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all duration-300 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Register Now"}
            </button>

            {message && (
              <p className={`mt-6 text-[11px] font-bold uppercase tracking-widest ${message.includes('✅') ? 'text-green-600' : 'text-[#951114]'}`}>
                {message}
              </p>
            )}

            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Already have an account?
              </p>
              <Link 
                href="/login" 
                className="block mt-1 text-black font-black text-[11px] uppercase tracking-widest hover:text-[#951114] transition-all underline underline-offset-4 decoration-2"
              >
                Login here
              </Link>
            </div>
          </div>
        </form>
      </div>

      <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
        Verified &bull; IET Lucknow
      </p>
    </main>
  );
}