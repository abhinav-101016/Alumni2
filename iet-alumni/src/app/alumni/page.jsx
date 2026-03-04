"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AlumniDirectory() {
  const router = useRouter();
  const [alumni, setAlumni] = useState([]);
  const [filters, setFilters] = useState({
    passingYear: "",
    bloodGroup: "",
    hostel: "",
    skills: "",
    company: "",
    location: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAlumni = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const query = new URLSearchParams({ ...filters, page, limit: 20 }).toString();
      const res = await fetch(`/api/alumni?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert("You are not authorized or verified!");
          router.push("/login");
        }
        throw new Error("Failed to fetch alumni");
      }

      const data = await res.json();
      setAlumni(data.alumni);
      setTotalPages(Math.ceil(data.total / data.perPage));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Alumni Directory</h1>

      {/* ================= Filter Section ================= */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="number"
          name="passingYear"
          placeholder="Year"
          value={filters.passingYear}
          onChange={handleFilterChange}
          className="border rounded px-3 py-1 text-sm w-24"
        />
        <input
          type="text"
          name="bloodGroup"
          placeholder="Blood Group"
          value={filters.bloodGroup}
          onChange={handleFilterChange}
          className="border rounded px-3 py-1 text-sm w-24"
        />
        <input
          type="text"
          name="hostel"
          placeholder="Hostel"
          value={filters.hostel}
          onChange={handleFilterChange}
          className="border rounded px-3 py-1 text-sm w-24"
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills"
          value={filters.skills}
          onChange={handleFilterChange}
          className="border rounded px-3 py-1 text-sm w-36"
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={filters.company}
          onChange={handleFilterChange}
          className="border rounded px-3 py-1 text-sm w-36"
        />
        <input
          type="text"
          name="location"
          placeholder="City"
          value={filters.location}
          onChange={handleFilterChange}
          className="border rounded px-3 py-1 text-sm w-36"
        />
      </div>

      {/* ================= Alumni List Section ================= */}
      <div className="flex gap-6">
        {/* Left Side: Alumni Cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {alumni.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4 flex flex-col items-center text-center"
            >
              <img
                src={a.profile.profilePicUrl || "/default-profile.png"}
                alt={a.name}
                className="w-24 h-24 rounded-full mb-3 object-cover"
              />
              <h2 className="font-semibold text-lg">{a.name}</h2>
              <p className="text-sm text-gray-600 mb-2">
                {a.profile.bio
                  ? a.profile.bio.length > 120
                    ? a.profile.bio.slice(0, 120) + "..."
                    : a.profile.bio
                  : "No bio available"}
              </p>
              <div className="text-left text-sm w-full space-y-1">
                <p><span className="font-semibold">Year:</span> {a.academic.passingYear}</p>
                <p><span className="font-semibold">Blood:</span> {a.profile.bloodGroup}</p>
                <p><span className="font-semibold">Hostel:</span> {a.academic.hostel}</p>
                <p><span className="font-semibold">Skills:</span> {a.professional.skills.join(", ") || "N/A"}</p>
                <p><span className="font-semibold">Company:</span> {a.professional.experiences[0]?.company || "N/A"}</p>
                <p><span className="font-semibold">Location:</span> {a.profile.location.city || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side (optional: you could add a placeholder for map or details) */}
        <div className="w-1/4 hidden lg:block">
          <div className="sticky top-6 p-4 border rounded bg-gray-50 text-gray-700">
            <h3 className="font-semibold mb-2">Filters Applied</h3>
            {Object.entries(filters).map(([key, value]) => (
              value && (
                <p key={key} className="text-sm">
                  <span className="font-semibold">{key}:</span> {value}
                </p>
              )
            ))}
          </div>
        </div>
      </div>

      {/* ================= Pagination ================= */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2 text-sm">{page} / {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}