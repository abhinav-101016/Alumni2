"use client";
import { useState, useEffect, useCallback } from "react";

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    bloodGroup: "",
    passingYear: "",
    company: ""
  });

  const fetchAlumni = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); 
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.bloodGroup) queryParams.append("bloodGroup", filters.bloodGroup);
      if (filters.passingYear) queryParams.append("passingYear", filters.passingYear);
      if (filters.company) queryParams.append("company", filters.company);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alumni/directory?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (response.ok) {
        setAlumni(result.data);
        setMyId(result.currentUserId);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAlumni(), 300);
    return () => clearTimeout(timer);
  }, [fetchAlumni]);

  const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen bg-white">
      {/* Search & Filter Section */}
      <div className="mb-12 border-b border-slate-200 pb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Alumni Directory</h1>
        <p className="text-slate-600 mb-8 text-lg">Browse and connect with verified members of our community.</p>
        
        <div className="flex flex-col md:flex-row gap-4 bg-slate-100 p-5 rounded-3xl items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name or skills..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-none ring-1 ring-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 placeholder:text-slate-400"
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select
              className="flex-1 md:w-44 p-3 rounded-2xl border-none ring-1 ring-slate-300 bg-white text-sm font-semibold text-slate-700"
              onChange={(e) => setFilters(f => ({ ...f, bloodGroup: e.target.value }))}
            >
              <option value="">Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            
            <input
              type="number"
              placeholder="Year"
              className="w-28 p-3 rounded-2xl border-none ring-1 ring-slate-300 text-sm font-semibold text-slate-700"
              onChange={(e) => setFilters(f => ({ ...f, passingYear: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Directory List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-bold animate-pulse">Loading Alumni...</p>
          </div>
        ) : alumni.length > 0 ? (
          alumni.map((person) => {
            const isMe = person._id === myId;
            const currentJob = person.professional?.experiences?.find(e => e.isCurrent) || person.professional?.experiences[0];

            return (
              <div key={person._id} className="flex flex-col sm:flex-row gap-8 p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 items-center sm:items-start bg-white relative">
                
                {/* Image Section (LEFT) */}
                <div className="relative flex-shrink-0">
                  {person.profile?.profilePicUrl ? (
                    <img 
                      src={person.profile.profilePicUrl} 
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] object-cover ring-4 ring-slate-50 border border-slate-100" 
                      alt={person.name} 
                    />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white text-5xl font-black shadow-lg">
                      {getInitials(person.name)}
                    </div>
                  )}
                  {isMe && (
                    <span className="absolute -top-3 -right-3 bg-green-600 text-white text-[12px] font-black px-4 py-1.5 rounded-2xl border-4 border-white shadow-md">
                      YOU
                    </span>
                  )}
                </div>

                {/* Details Section (RIGHT) - High Contrast Colors */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 gap-3">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 leading-none mb-2">{person.name}</h2>
                      <p className="text-indigo-700 font-extrabold text-base">
                        {currentJob?.designation || "Professional"} 
                        <span className="text-slate-400 mx-2 font-normal">at</span> 
                        {currentJob?.company || "Not listed"}
                      </p>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-2">
                      <span className="bg-slate-900 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Batch {person.academic?.passingYear}
                      </span>
                      {person.profile?.bloodGroup && (
                        <span className="text-red-600 font-black text-sm px-2">
                          🩸 Group: {person.profile.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio - No longer faded */}
                  <p className="text-slate-700 text-base font-medium italic mb-6 leading-relaxed line-clamp-2">
                    "{person.profile?.bio || "Community member and alumni."}"
                  </p>

                  {/* Skills Section */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {person.professional?.skills?.map((skill, i) => (
                      <span key={i} className="px-4 py-1.5 bg-indigo-50 text-indigo-800 text-[11px] font-black rounded-xl border border-indigo-100 uppercase tracking-tighter">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-900 text-xl font-black">No batchmates found.</p>
            <p className="text-slate-500 font-medium mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}