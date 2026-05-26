"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Linkedin, ExternalLink, GraduationCap, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Full alumni data from your list
const allAlumniData = [
  { id: 1, name: "Yatish Katheria", branch: "EC", passingYear: "1988", jobProfile: "DDG DoT" },
  { id: 2, name: "Lallan Babu", branch: "EC", passingYear: "1988", jobProfile: "Govt Sector" },
  { id: 3, name: "Dr. Anita Yadav", branch: "CS", passingYear: "1988", jobProfile: "Professor, Research Guide, Project guiden, subject expert in various selection committee of NITs, NSUT etc, Advisory committee in various International Conferences and various other technical committees" },
  { id: 4, name: "Dr. Renu Lata Rajni", branch: "CS", passingYear: "1988", jobProfile: "Director, Destue Bank" },
  { id: 5, name: "Pankaj Aswal", branch: "EC", passingYear: "1988", jobProfile: "Sr. Vice Chairman, Intel corp USA" },
  { id: 6, name: "Prof. Sanjany Kumar Singh", branch: "", passingYear: "", jobProfile: "Professor IIM Lucknow" },
  { id: 7, name: "Prof. D . K. Lobiyal", branch: "CS", passingYear: "1988", jobProfile: "Prof. in JNU" },
  { id: 8, name: "Anil Gupta", branch: "ME", passingYear: "1989", jobProfile: "CGM ordinance Factory" },
  { id: 9, name: "DC Gupta", branch: "EE", passingYear: "1988", jobProfile: "GM BHEL" },
  { id: 10, name: "Ashish Kumar Shrivstav", branch: "EC", passingYear: "1988", jobProfile: "GM AAI" },
  { id: 11, name: "Vivek Chandra Verma", branch: "ME", passingYear: "1989", jobProfile: "An Indian Ordnance Factory Officer of 1991 batch, under Ministry of Defence. Empanelled as Joint Secretary in Government of India. Presently working at UIDAI Headquarters, New Delhi." },
  { id: 12, name: "Asif Siddiqui", branch: "EC", passingYear: "1990", jobProfile: "General Manager ISRO" },
  { id: 13, name: "Manish Jain", branch: "Civil Engineering", passingYear: "1990", jobProfile: "1995 batch IAS Officer, West Bengal cadre, Principal Secretary, School Education" },
  { id: 14, name: "Alok Katiyar", branch: "EC", passingYear: "1990", jobProfile: "Director, National High Speed Rail Corporation Ltd" },
  { id: 15, name: "Navin Kumar", branch: "EE", passingYear: "1991", jobProfile: "Joint Secretary, Ministry of Railways" },
  { id: 16, name: "Pradeep Mishra", branch: "CE", passingYear: "1991", jobProfile: "Founder and CMD of REPL, a company related with urban development and infrastructure consulting" },
  { id: 17, name: "Dhananjay Singh", branch: "CE", passingYear: "1991", jobProfile: "JS in Ministry of Railways" },
  { id: 18, name: "Dayapatra Nevatia", branch: "EE", passingYear: "1991", jobProfile: "President & Chief Operating Officer, Infogain" },
  { id: 19, name: "Ram Naresh Singh", branch: "EC", passingYear: "1991", jobProfile: "Public Service" },
  { id: 20, name: "Vikas Gupta", branch: "MR", passingYear: "1992", jobProfile: "In active Politics and a Minister" },
  { id: 21, name: "Sharat Sinha", branch: "EC", passingYear: "1992", jobProfile: "CEO Airtel Business" },
  { id: 22, name: "Dr Vinay Prakash", branch: "ME", passingYear: "1993", jobProfile: "Director at Adani Enterprises & ACC, CEO Adani Natural Resources" },
  { id: 23, name: "Nitish Sinha", branch: "EC", passingYear: "1994", jobProfile: "Joint Secretary Level Officer in Government of India" },
  { id: 24, name: "Samir Kumar", branch: "EC", passingYear: "1994", jobProfile: "CXO (Group Chief Shared Services officer) in QBE Insurance, the largest Australian and one of the largest in the world. Previously Managing Director in JP Morgan Chase bank and Deutsche bank in global roles." },
  { id: 25, name: "Lokesh Singh", branch: "ME", passingYear: "1995", jobProfile: "General Manager, Centre for Railway Information Systems, Ministry of Railways" },
  { id: 26, name: "Tej Pratap Narayan", branch: "EE", passingYear: "1998", jobProfile: "JS in Ministry of Railway" },
  { id: 27, name: "Siddhartha Rungta", branch: "ME", passingYear: "1999", jobProfile: "Country Head HSBC" },
  { id: 28, name: "Srijan Pal Singh", branch: "EE", passingYear: "2006", jobProfile: "Chairperson Dr. APJ Abdul Kalam Centre" },
  { id: 29, name: "Laxmi Singh", branch: "", passingYear: "", jobProfile: "IPS" },
  { id: 30, name: "Niharika Bhatt", branch: "E&T", passingYear: "2011", jobProfile: "IPS" },
  { id: 31, name: "Bandana Sinha", branch: "CS", passingYear: "1989", jobProfile: "Global Delivery head, Business Analytics - Life science, healthcare and public services, TCS." },
  { id: 32, name: "Avinash Kumar Singh", branch: "EE", passingYear: "2007", jobProfile: "IFS 2012, Presently in Nepal Embassy" },
  { id: 33, name: "Roopal Saxena", branch: "CS", passingYear: "1988", jobProfile: "Vice President, Citizens Bank" },
  { id: 34, name: "Bhaskar Srivastava", branch: "EE", passingYear: "1989", jobProfile: "CTO, Reliance JIO" },
  { id: 35, name: "Upendra Singh", branch: "CS", passingYear: "1991", jobProfile: "Managing Director, Data Architecture at State Street" },
  { id: 36, name: "Pooja Bhat", branch: "", passingYear: "2010", jobProfile: "Indian Defense Accounts Service" },
  { id: 37, name: "Samarendra Behera", branch: "CS", passingYear: "1994", jobProfile: "General Manager, Rourkela steel plant" },
  { id: 38, name: "Ashish Agarwal", branch: "EC", passingYear: "1989", jobProfile: "Senior Technical Director at NIC" },
  { id: 39, name: "Nidhi Srivastava", branch: "CS", passingYear: "1989", jobProfile: "Vice President and Global Head of Google Business Unit at Tata Consultancy Services" },
  { id: 40, name: "Ranveer Verma", branch: "B. Tech", passingYear: "1988", jobProfile: "Vice President Wells Fargo" },
  { id: 41, name: "R K Singh", branch: "B. Tech", passingYear: "1993", jobProfile: "Regional Officer, NHAI, Andhra Pradesh" },
  { id: 42, name: "Amit Khare", branch: "B. Tech", passingYear: "1989", jobProfile: "Chief Executive Officer at Evolko Systems Inc" },
  { id: 43, name: "Sandeep Arora", branch: "EE", passingYear: "1997", jobProfile: "Sr Vice President Transmission & Markets, REV Renewables" },
  { id: 44, name: "Dr Rakhi Gupta", branch: "CS", passingYear: "1993", jobProfile: "Head and Coordinator, I.T Department, KC College, HSNC University" },
  { id: 45, name: "Pawan Agarwal", branch: "EE", passingYear: "1993", jobProfile: "Managing Director, Naini Papers Limited" },
  { id: 46, name: "Sanjay Agrawal", branch: "EC", passingYear: "1988", jobProfile: "CTO & Head Presales at Hitachi Vantra" },
  { id: 47, name: "Shashi Katiyar", branch: "CS", passingYear: "1989", jobProfile: "Senior Manager, Intel Corporation" },
  { id: 48, name: "Sh. Vivek C. Verma", branch: "ME", passingYear: "1989", jobProfile: "CEO, UIDAI" }
];

// Featured alumni for spotlight section (first 4 from the list)
const featuredAlumni = allAlumniData.slice(0, 4);

const AlumniDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique branches and years for filters
  const branches = [...new Set(allAlumniData.map(a => a.branch).filter(b => b))];
  const years = [...new Set(allAlumniData.map(a => a.passingYear).filter(y => y))].sort();

  // Filter alumni based on search and filters
  const filteredAlumni = allAlumniData.filter(alumni => {
    const matchesSearch = alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alumni.jobProfile.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !selectedBranch || alumni.branch === selectedBranch;
    const matchesYear = !selectedYear || alumni.passingYear === selectedYear;
    return matchesSearch && matchesBranch && matchesYear;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);
  const paginatedAlumni = filteredAlumni.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, selectedYear]);

  return (
    <main className="bg-white min-h-screen pb-20">
      {/* HEADER SECTION */}
      <section className="bg-[#951114] text-white py-20 px-6 md:px-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-black uppercase tracking-[0.3em] opacity-70 mb-4">
            Our Distinguished Alumni
          </p>
          <h1 style={{ fontFamily: "Playfair Display" }} className="text-5xl md:text-7xl font-bold mb-6">
            IET Lucknow Alumni Directory
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl opacity-90">
            Celebrating the outstanding alumni of IET Lucknow — graduates who are leading industries, 
            shaping national policy, and inspiring every engineer who walks these halls.
          </p>
        </div>
      </section>

      {/* FEATURED SPOTLIGHTS */}
      <section className="max-w-7xl bg-white mx-auto mt-10 px-6 mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <GraduationCap className="text-[#951114]" size={32} />
          Featured Alumni Spotlights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredAlumni.map((alumni, idx) => (
            <div key={idx} className="bg-white shadow-xl overflow-hidden border border-slate-100 rounded-lg">
              <div className="p-6">
                <div className="flex items-center gap-2 text-[#951114] font-bold tracking-widest uppercase text-xs mb-3">
                  <GraduationCap size={16} />
                  {alumni.branch || 'Engineering'} | Batch of {alumni.passingYear || 'N/A'}
                </div>
                <h3 style={{ fontFamily: "Playfair Display" }} className="text-2xl font-bold text-slate-900 mb-1">
                  {alumni.name}
                </h3>
                <p className="text-slate-700 font-medium mb-4 line-clamp-2">
                  {alumni.jobProfile}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIRECTORY SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="border-t-2 border-slate-200 pt-12 mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Complete Alumni Directory</h2>
          <p className="text-slate-600">Browse through our complete list of notable alumni</p>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or profile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#951114] focus:border-transparent"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#951114] bg-white"
            >
              <option value="">All Branches</option>
              {branches.sort().map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#951114] bg-white"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>Batch of {year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-slate-600">
            Showing <span className="font-bold text-slate-900">{filteredAlumni.length}</span> alumni
            {selectedBranch && ` in ${selectedBranch}`}
            {selectedYear && ` from batch of ${selectedYear}`}
          </p>
        </div>

        {/* ALUMNI GRID */}
        {filteredAlumni.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAlumni.map((alumni) => (
                <div key={alumni.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 text-[#951114] font-bold tracking-widest uppercase text-xs mb-2">
                        <GraduationCap size={14} />
                        {alumni.branch || 'Engineering'} • Batch {alumni.passingYear || 'N/A'}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{alumni.name}</h3>
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm line-clamp-3 mb-4">
                    {alumni.jobProfile}
                  </p>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#951114] text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No alumni found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBranch('');
                setSelectedYear('');
              }}
              className="mt-4 text-[#951114] font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* NOMINATION CTA */}
      <section className="max-w-3xl mx-auto px-6 mt-24 text-center">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-12 rounded-2xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Know an alumnus making waves?</h3>
          <p className="text-slate-600 mb-8">
            Every successful graduate has a story worth telling. Help us inspire the next generation of
            engineers by adding a nomination for someone whose journey deserves to be celebrated.
          </p>
          <button className="text-[#951114] font-black uppercase tracking-[0.2em] border-b-2 border-[#951114] pb-1 hover:text-slate-900 hover:border-slate-900 transition-all">
            Add a Nomination
          </button>
        </div>
      </section>
    </main>
  );
};

export default AlumniDirectory;