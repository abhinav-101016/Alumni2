{/*"use client";
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
  branch: [
    "Computer Science", "Information Technology", "Electronics",
    "Mechanical", "Civil", "Electrical", "Chemical"
  ],
  passingYear: Array.from({ length: 45 }, (_, i) => (1984 + i).toString()).reverse(),
  hostels: ["Ramanujan", "Aryabhatt", "Bhabha", "Vishveshwarya", "Sarojini", "Gargi", "H1", "H2", "H3"],
  bloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
};

const InputField = ({ label, name, type = "text", options = null, value, onChange, maxLength, error }) => (
  <div className="flex flex-col gap-1.5 px-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">
      {label}
    </label>
    <div className="relative">
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 bg-white border ${error ? "border-[#951114]" : "border-slate-300"} focus:border-[#951114] outline-none text-xs text-black font-medium transition-all appearance-none cursor-pointer`}
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
          maxLength={maxLength}
          className={`w-full px-4 py-2.5 bg-white border ${error ? "border-[#951114]" : "border-slate-300"} focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all`}
        />
      )}
    </div>
    {error && (
      <p className="text-[10px] text-[#951114] font-bold ml-1 uppercase tracking-wide">{error}</p>
    )}
  </div>
);

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", rollNumber: "",
    password: "", dob: "", gender: "", course: "",
    branch: "", passingYear: "", hostel: "",
    city: "", country: "", bloodGroup: "",
    showEmail: true, showPhone: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) return;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Enter a valid email address";

    if (!/^\d{10}$/.test(formData.phone))
      errors.phone = "Phone must be exactly 10 digits";

    if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (!formData.dob)
      errors.dob = "Date of birth is required";

    if (!formData.gender)
      errors.gender = "Please select a gender";

    if (!formData.course)
      errors.course = "Please select a course";

    if (!formData.branch)
      errors.branch = "Please select a branch";

    if (!formData.passingYear)
      errors.passingYear = "Please select a passing year";

    if (!formData.rollNumber.trim())
      errors.rollNumber = "Roll number is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          passingYear: Number(formData.passingYear)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      sessionStorage.setItem("verifyEmail", formData.email);
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

        {/* Header 
        <div className="pt-10 pb-6 text-center border-b border-slate-100">
          <div className="w-10 h-1 bg-[#951114] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
            Create Account
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Official Alumni Enrollment Form
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">

          
          <section>
            <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
              <span className="w-4 h-px bg-[#951114]"></span> 01. Personal Info
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
              <InputField label="Full Name"   name="name"       value={formData.name}       onChange={handleChange} error={fieldErrors.name} />
              <InputField label="Email"       name="email"      type="email" value={formData.email}  onChange={handleChange} error={fieldErrors.email} />
              <InputField label="Phone"       name="phone"      value={formData.phone}      onChange={handleChange} maxLength={10} error={fieldErrors.phone} />
              <InputField label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} error={fieldErrors.rollNumber} />
              <InputField label="Password"    name="password"   type="password" value={formData.password} onChange={handleChange} error={fieldErrors.password} />
              <InputField label="DOB"         name="dob"        type="date" value={formData.dob}    onChange={handleChange} error={fieldErrors.dob} />
              <InputField label="Gender"      name="gender"     options={ENUMS.gender}      value={formData.gender}      onChange={handleChange} error={fieldErrors.gender} />
              <InputField label="Blood Group" name="bloodGroup" options={ENUMS.bloodGroups} value={formData.bloodGroup}  onChange={handleChange} />
            </div>

            <div className="mt-4 px-2 space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                <input type="checkbox" name="showEmail" checked={formData.showEmail} onChange={handleChange} className="accent-[#951114]" />
                Make Email Private
              </label>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                <input type="checkbox" name="showPhone" checked={formData.showPhone} onChange={handleChange} className="accent-[#951114]" />
                Make Phone Private
              </label>
            </div>
          </section>

          
          <section>
            <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
              <span className="w-4 h-px bg-[#951114]"></span> 02. Academic Record
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
              <InputField label="Course"       name="course"      options={ENUMS.course}      value={formData.course}      onChange={handleChange} error={fieldErrors.course} />
              <InputField label="Branch"       name="branch"      options={ENUMS.branch}      value={formData.branch}      onChange={handleChange} error={fieldErrors.branch} />
              <InputField label="Passing Year" name="passingYear" options={ENUMS.passingYear} value={formData.passingYear} onChange={handleChange} error={fieldErrors.passingYear} />
              <InputField label="Hostel"       name="hostel"      options={ENUMS.hostels}     value={formData.hostel}      onChange={handleChange} />
              <InputField label="City"         name="city"        value={formData.city}        onChange={handleChange} />
              <InputField label="Country"      name="country"     value={formData.country}     onChange={handleChange} />
            </div>
          </section>

       
          <div className="pt-8 flex flex-col items-center border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[240px] py-4 bg-[#951114] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all duration-300 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Register Now"}
            </button>

            {message && (
              <p className={`mt-6 text-[11px] font-bold uppercase tracking-widest ${message.includes("✅") ? "text-green-600" : "text-[#951114]"}`}>
                {message}
              </p>
            )}

            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Already have an account?
              </p>
              <Link href="/login" className="block mt-1 text-black font-black text-[11px] uppercase tracking-widest hover:text-[#951114] transition-all underline underline-offset-4 decoration-2">
                Login here
              </Link>
            </div>
          </div>

        </form>
      </div>

      <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
        Verified • IET Lucknow
      </p>
    </main>
  );
}
  */}