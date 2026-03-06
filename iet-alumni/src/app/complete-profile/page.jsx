"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1.5 px-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all"
    />
  </div>
);

export default function CompleteProfile() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true); // Loading state for session check
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    linkedin: "",
    github: "",
    portfolio: "",
    experience: [
      {
        companyName: "",
        position: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
      },
    ],
  });

  /* =========================
      PROTECT ROUTE (HTTP-ONLY)
  ========================== */
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
        } else {
          const data = await res.json();
          // If profile is already complete, don't let them stay here
          if (data.user?.isProfileComplete) {
            router.replace("/dashboard");
          } else {
            setAuthLoading(false);
          }
        }
      } catch (err) {
        router.replace("/login");
      }
    };
    verifyUser();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updated = [...formData.experience];
    updated[index][name] = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, experience: updated }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { companyName: "", position: "", startDate: "", endDate: "", currentlyWorking: false },
      ],
    }));
  };

  const removeExperience = (index) => {
    const updated = formData.experience.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, experience: updated }));
  };

  /* =========================
      SUBMIT (HTTP-ONLY)
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // CRUCIAL: Sends the HTTP-only cookie
          body: JSON.stringify({
            ...formData,
            skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()) : [],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setMessage("✅ Profile completed successfully");

      // Dispatch event so Header refreshes status immediately
      window.dispatchEvent(new Event("authChange"));

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#951114]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full lg:w-1/2 bg-white border border-slate-200 shadow-sm overflow-hidden rounded-sm">
        <div className="pt-10 pb-6 text-center border-b border-slate-100">
          <div className="w-10 h-1 bg-[#951114] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
            Complete Profile
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Alumni Professional Information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
          {/* Section 01: Bio */}
          <section>
            <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
              <span className="w-4 h-px bg-[#951114]"></span> 01. Professional Summary
            </p>
            <div className="px-2">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#951114] outline-none text-xs text-black font-medium"
                placeholder="Write about your professional journey..."
              />
            </div>
          </section>

          {/* Section 02: Experience */}
          <section>
            <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
              <span className="w-4 h-px bg-[#951114]"></span> 02. Work Experience
            </p>
            {formData.experience.map((exp, index) => (
              <div key={index} className="border border-slate-200 p-4 mb-6 space-y-4 bg-slate-50/30">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label="Company Name" name="companyName" value={exp.companyName} onChange={(e) => handleExperienceChange(index, e)} />
                  <InputField label="Position" name="position" value={exp.position} onChange={(e) => handleExperienceChange(index, e)} />
                  <InputField label="Start Date" name="startDate" type="date" value={exp.startDate} onChange={(e) => handleExperienceChange(index, e)} />
                  <InputField label="End Date" name="endDate" type="date" value={exp.endDate} onChange={(e) => handleExperienceChange(index, e)} />
                </div>
                <div className="flex items-center gap-2 px-2">
                  <input type="checkbox" name="currentlyWorking" checked={exp.currentlyWorking} onChange={(e) => handleExperienceChange(index, e)} />
                  <label className="text-xs font-medium text-black">Currently Working Here</label>
                </div>
                {formData.experience.length > 1 && (
                  <button type="button" onClick={() => removeExperience(index)} className="text-[10px] font-bold uppercase tracking-widest text-red-600">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addExperience} className="text-[10px] font-bold uppercase tracking-widest text-[#951114] ml-2 hover:underline">+ Add Another Experience</button>
          </section>

          {/* Section 03: Links & Skills */}
          <section>
            <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
              <span className="w-4 h-px bg-[#951114]"></span> 03. Skills & Links
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label="Skills (comma separated)" name="skills" value={formData.skills} onChange={handleChange} />
              <InputField label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} />
              <InputField label="GitHub URL" name="github" value={formData.github} onChange={handleChange} />
              <InputField label="Portfolio URL" name="portfolio" value={formData.portfolio} onChange={handleChange} />
            </div>
          </section>

          {/* Submit Action */}
          <div className="pt-8 flex flex-col items-center border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[240px] py-4 bg-[#951114] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all duration-300 active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? "Saving..." : "Complete Profile"}
            </button>
            {message && (
              <p className={`mt-6 text-[11px] font-bold uppercase tracking-widest ${message.includes("✅") ? "text-green-600" : "text-[#951114]"}`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
      <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">Verified • IET Lucknow</p>
    </main>
  );
}