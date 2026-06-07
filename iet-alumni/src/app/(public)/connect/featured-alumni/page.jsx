"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Linkedin, ExternalLink, GraduationCap, Search, ChevronLeft, ChevronRight, Star, Briefcase, Calendar, Award } from 'lucide-react';

// Full alumni data with image mappings (CORRECTED & UPDATED)
const allAlumniData = [
  { id: 1, name: "Yash Kateria", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1988", jobProfile: "DDG DoT", image: "Yash_Kateria.jpeg", isTopAlumni: true, rank: 1, linkedin: null },
  { id: 2, name: "Lallan Babu", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1988", jobProfile: "Govt Sector", image: null, isTopAlumni: false, linkedin: null },
  { id: 3, name: "Dr. Anita Yadav", branch: "Computer Engineering", branchCode: "CS", passingYear: "1988", jobProfile: "Professor, Research Guide, Project guiden, subject expert in various selection committee of NITs, NSUT etc, Advisory committee in various International Conferences and various other technical committees", image: null, isTopAlumni: false, linkedin: null },
  { id: 4, name: "Dr. Renu Lata Rajni", branch: "Computer Engineering", branchCode: "CS", passingYear: "1988", jobProfile: "Director, Destue Bank", image: "renu_rajani.jpeg", isTopAlumni: false, linkedin: null },
  { id: 5, name: "Pankaj Aswal", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1988", jobProfile: "Sr. Vice Chairman, Intel corp USA", image: "pankaj_aswal.jpeg", isTopAlumni: true, rank: 2, linkedin: "https://www.linkedin.com/in/pankaj-aswal" },
  { id: 6, name: "Prof. Sanjay Kumar Singh", branch: "MCA", branchCode: "MCA", passingYear: "1992", jobProfile: "Professor at IIM Lucknow", image: null, isTopAlumni: false, linkedin: null },
  { id: 7, name: "Prof. D. K. Lobiyal", branch: "Computer Engineering", branchCode: "CS", passingYear: "1988", jobProfile: "Professor in JNU", image: "dk_lobiyal.jpeg", isTopAlumni: false, linkedin: null },
  { id: 8, name: "Anil Gupta", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1989", jobProfile: "CGM Ordinance Factory", image: null, isTopAlumni: false, linkedin: null },
  { id: 9, name: "DC Gupta", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1988", jobProfile: "GM BHEL", image: null, isTopAlumni: false, linkedin: null },
  { id: 10, name: "Ashish Kumar Shrivstav", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1988", jobProfile: "GM AAI", image: null, isTopAlumni: false, linkedin: null },
  { id: 11, name: "Vivek Chandra Verma", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1989", jobProfile: "An Indian Ordnance Factory Officer of 1991 batch, under Ministry of Defence. Empanelled as Joint Secretary in Government of India. Presently working at UIDAI Headquarters, New Delhi.", image: "vivek_chandra_verma.jpeg", isTopAlumni: true, rank: 3, linkedin: null },
  { id: 12, name: "Asif Siddiqui", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1990", jobProfile: "General Manager, ISRO Telemetry, Tracking and Command Network (ISTRAC). Serving for 34 years in ISRO.", image: "asif_siddiqui.jpeg", isTopAlumni: true, rank: 4, linkedin: null },
  { id: 13, name: "Manish Jain", branch: "Civil Engineering", branchCode: "CE", passingYear: "1990", jobProfile: "1995 batch IAS Officer, West Bengal cadre, Principal Secretary, School Education", image: "manish_jain.jpeg", isTopAlumni: false, rank: 5, linkedin: null },
  { id: 14, name: "Alok Katiyar", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1990", jobProfile: "Director, National High Speed Rail Corporation Ltd", image: null, isTopAlumni: false, linkedin: null },
  { id: 15, name: "Navin Kumar", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1991", jobProfile: "Director (Rolling Stock & Systems), Uttar Pradesh Metro Rail Corporation (UPMRC). Former Joint Secretary, Ministry of Railways.", image: "navin_kumar.jpeg", isTopAlumni: true, linkedin: null },
  { id: 16, name: "Pradeep Mishra", branch: "Civil Engineering", branchCode: "CE", passingYear: "1991", jobProfile: "Founder and CMD of REPL, a company related with urban development and infrastructure consulting", image: "pradeep_mishra.jpeg", isTopAlumni: false, linkedin: null },
  { id: 17, name: "Dhananjay Singh", branch: "Civil Engineering", branchCode: "CE", passingYear: "1991", jobProfile: "JS in Ministry of Railways", image: null, isTopAlumni: false, linkedin: null },
  { id: 18, name: "Dayapatra Nevatia", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1991", jobProfile: "President & Chief Operating Officer, Infogain", image: "dayapatra_nevatia.jpeg", isTopAlumni: false, linkedin: null },
  { id: 19, name: "Ram Naresh Singh", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1991", jobProfile: "Public Service", image: null, isTopAlumni: false, linkedin: null },
  { id: 20, name: "Capt. Vikas Gupta", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1993", jobProfile: "Chairman, UP Council for Agricultural Research. Formerly in active Politics and a Minister.", image: "vikas_gupta.jpg", isTopAlumni: false, linkedin: null },
  { id: 21, name: "Sharat Sinha", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1992", jobProfile: "CEO Airtel Business", image: "sharat_sinha.jpeg", isTopAlumni: false, linkedin: null },
  { id: 22, name: "Dr. Vinay Prakash", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1993", jobProfile: "Director at Adani Enterprises & ACC, CEO Adani Natural Resources", image: "vinay_prakash.jpeg", isTopAlumni: false, linkedin: null },
  { id: 23, name: "Nitish Sinha", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1994", jobProfile: "IES (1995), Additional General Manager (PGM), BSNL. Former ADG, UIDAI, Government of India.", image: "nitish_sinha.png", isTopAlumni: true, linkedin: null },
  { id: 24, name: "Samir Kumar", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1994", jobProfile: "CXO (Group Chief Shared Services officer) in QBE Insurance, the largest Australian and one of the largest in the world. Previously Managing Director in JP Morgan Chase bank and Deutsche bank in global roles.", image: "samir_kumar.jpeg", isTopAlumni: false, linkedin: null },
  { id: 25, name: "Lokesh Singh", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1995", jobProfile: "IRSME, Executive Director (Works) at Railway Board. Former General Manager, Centre for Railway Information Systems, Ministry of Railways.", image: "lokesh_singh.jpeg", isTopAlumni: false, linkedin: null },
  { id: 26, name: "Tej Pratap Narayan", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1998", jobProfile: "JS in Ministry of Railway", image: "tej_pratap_narayan.jpeg", isTopAlumni: false, linkedin: null },
  { id: 27, name: "Siddhartha Rungta", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1999", jobProfile: "Country Head HSBC", image: "siddharth_rungta.jpeg", isTopAlumni: false, linkedin: null },
  { id: 28, name: "Srijan Pal Singh", branch: "Electrical Engineering", branchCode: "EE", passingYear: "2006", jobProfile: "Chairperson Dr. APJ Abdul Kalam Centre", image: "srijan_pal_singh.jpeg", isTopAlumni: false, linkedin: null },
  { id: 29, name: "Laxmi Singh", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1997", jobProfile: "IPS Officer", image: "laxmi_singh.jpeg", isTopAlumni: false, linkedin: null },
  { id: 30, name: "Niharika Bhatt", branch: "Electronics & Telecommunication Engineering", branchCode: "E&T", passingYear: "2011", jobProfile: "IPS Officer", image: "niharika_bhatt.jpeg", isTopAlumni: false, linkedin: null },
  { id: 31, name: "Bandana Sinha", branch: "Computer Engineering", branchCode: "CS", passingYear: "1989", jobProfile: "Global Delivery head, Business Analytics - Life science, healthcare and public services, TCS.", image: "bandana_sinha.jpeg", isTopAlumni: false, linkedin: null },
  { id: 32, name: "Avinash Kumar Singh", branch: "Electrical Engineering", branchCode: "EE", passingYear: "2007", jobProfile: "IFS 2012, Presently in Nepal Embassy", image: "avinash_kumar_singh.jpeg", isTopAlumni: false, linkedin: null },
  { id: 33, name: "Roopal Saxena", branch: "Computer Engineering", branchCode: "CS", passingYear: "1988", jobProfile: "Vice President, Citizens Bank", image: null, isTopAlumni: false, linkedin: null },
  { id: 34, name: "Bhaskar Srivastava", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1989", jobProfile: "CTO, Reliance JIO", image: "bhasker_shrivastav.jpeg", isTopAlumni: false, linkedin: null },
  { id: 35, name: "Upendra Singh", branch: "Computer Engineering", branchCode: "CS", passingYear: "1991", jobProfile: "Managing Director, Data Architecture at State Street", image: "upendra_singh.jpeg", isTopAlumni: false, linkedin: null },
  { id: 36, name: "Pooja Bhat", branch: "Not Specified", branchCode: "", passingYear: "2010", jobProfile: "Indian Defense Accounts Service", image: "pooja_bhat.jpeg", isTopAlumni: false, linkedin: null },
  { id: 37, name: "Samarendra Behera", branch: "Computer Engineering", branchCode: "CS", passingYear: "1994", jobProfile: "General Manager, Rourkela steel plant", image: null, isTopAlumni: false, linkedin: null },
  { id: 38, name: "Ashish Agarwal", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1989", jobProfile: "Senior Technical Director at NIC", image: "ashish_agarwal.jpeg", isTopAlumni: false, linkedin: "https://www.linkedin.com/in/ashish-agarwal-52664011" },
  { id: 39, name: "Nidhi Srivastava", branch: "Computer Engineering", branchCode: "CS", passingYear: "1989", jobProfile: "Vice President and Global Head of Google Business Unit at Tata Consultancy Services", image: "nidhi_srivastav.jpeg", isTopAlumni: false, linkedin: null },
  { id: 40, name: "Ranveer Verma", branch: "Bachelor of Technology", branchCode: "B. Tech", passingYear: "1988", jobProfile: "Vice President Wells Fargo", image: null, isTopAlumni: false, linkedin: null },
  { id: 41, name: "R K Singh", branch: "Bachelor of Technology", branchCode: "B. Tech", passingYear: "1993", jobProfile: "Regional Officer, NHAI, Andhra Pradesh", image: "rk_singh.jpeg", isTopAlumni: false, linkedin: null },
  { id: 42, name: "Amit Khare", branch: "Bachelor of Technology", branchCode: "B. Tech", passingYear: "1989", jobProfile: "Chief Executive Officer at Evolko Systems Inc", image: "amit_khare.jpg", isTopAlumni: false, linkedin: null },
  { id: 43, name: "Sandeep Arora", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1997", jobProfile: "Sr Vice President Transmission & Markets, REV Renewables", image: "sandeep_arora.jpeg", isTopAlumni: false, linkedin: null },
  { id: 44, name: "Dr. Rakhi Gupta", branch: "Computer Engineering", branchCode: "CS", passingYear: "1993", jobProfile: "Head and Coordinator, I.T Department, KC College, HSNC University", image: "rakhi_gupta.jpeg", isTopAlumni: false, linkedin: null },
  { id: 45, name: "Pawan Agarwal", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1993", jobProfile: "Managing Director, Naini Papers Limited", image: "pawan_agarwal.jpeg", isTopAlumni: false, linkedin: null },
  { id: 46, name: "Sanjay Agrawal", branch: "Electronics Engineering", branchCode: "EC", passingYear: "1988", jobProfile: "CTO & Head Presales at Hitachi Vantra", image: "sanjay_agarwal.jpeg", isTopAlumni: false, linkedin: null },
  { id: 47, name: "Shashi Katiyar", branch: "Computer Engineering", branchCode: "CS", passingYear: "1989", jobProfile: "Senior Manager, Intel Corporation", image: "shashi_katiyar.png", isTopAlumni: false, linkedin: null },

  // ==================== NEW ALUMNI ADDITIONS ====================
  { id: 48, name: "Sanjay Garg", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1991", jobProfile: "IAS (KL 1994). Director General, Bureau of Indian Standards (BIS). Former Additional Secretary, Department of Agricultural Research & Education and Secretary, Indian Council of Agricultural Research.", image: "sanjay_garg.png", isTopAlumni: true, rank: 6, linkedin: null },
  { id: 49, name: "K K Agarwal", branch: "Electronics & Communication Engineering", branchCode: "ECE", passingYear: "1988", jobProfile: "GM (Quality) at Bharat Electronics Limited (BEL), Bangalore", image: null, isTopAlumni: false, linkedin: null },
  { id: 50, name: "Suneeta Singh", branch: "Electronics & Communication Engineering", branchCode: "ECE", passingYear: "1989", jobProfile: "Retd. ADG (UP Police). Recipient of President's Medal (specifics to be confirmed).", image: null, isTopAlumni: false, linkedin: null },
  { id: 51, name: "Manoj Kumar Kala", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1988", jobProfile: "Chief General Manager at ONGC Videsh Ltd., New Delhi", image: "manoj_kumar.jpg", isTopAlumni: false, linkedin: "https://www.linkedin.com/in/manoj-kumar-kala-ba761b395" },
  { id: 52, name: "Meenakshi Vashistha", branch: "Electronics & Communication Engineering", branchCode: "ECE", passingYear: "1988", jobProfile: "Founder & CEO, TekUncorked. Formerly with ISRO, C-Dot, Motorola, Freescale Semiconductor.", image: "meenakshi_vashist.jpg", isTopAlumni: true, rank: 7, linkedin: "https://www.linkedin.com/in/meenakshivashist" },
  { id: 53, name: "Biplab Baksi", branch: "Electronics & Communication Engineering", branchCode: "ECE", passingYear: "1989", jobProfile: "SR. Technical Director at NIC", image: "biplab_baksi.jpg", isTopAlumni: false, linkedin: "https://www.linkedin.com/in/biplab-baksi-591922115" },

  // ==================== CHIEF ENGINEERS (STATE GOVERNMENT SERVICES) ====================
  { id: 54, name: "Akhilesh Kumar Diwakar", branch: "Civil Engineering", branchCode: "CE", passingYear: "1989", jobProfile: "Chief Engineer, UP PWD (Public Works Department), Uttar Pradesh Government", image: null, isTopAlumni: false, linkedin: null },
  { id: 55, name: "Hridyesh Kumar Yadav", branch: "Civil Engineering", branchCode: "CE", passingYear: "1989", jobProfile: "Chief Engineer, UPSEB (Uttar Pradesh State Electricity Board)", image: null, isTopAlumni: false, linkedin: null },
  { id: 56, name: "Rajeev Gupta", branch: "Electrical Engineering", branchCode: "EE", passingYear: "1989", jobProfile: "Chief Engineer, UPSEB (Uttar Pradesh State Electricity Board)", image: null, isTopAlumni: false, linkedin: null },

  // ==================== ADDITIONAL NEW ALUMNI ====================
  { id: 57, name: "Pankaj Kumar Gupta", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1990", jobProfile: "GM & Head (Project) at NTPC, Kanti", image: "pankaj_kumar.jpeg", isTopAlumni: false, linkedin: "https://www.linkedin.com/in/pankaj-kumar-gupta-5a443b2b" },
  { id: 58, name: "Avinash Chandra", branch: "Chemical Engineering", branchCode: "CHE", passingYear: "2000", jobProfile: "Head & Professor at Thapar University, Patiala", image: null, isTopAlumni: false, linkedin: null },
  { id: 59, name: "Sanjay Kumar", branch: "Mechanical Engineering", branchCode: "ME", passingYear: "1990", jobProfile: "Senior Executive at NTPC / Power Sector", image: "sanjay_kumar.jpg", isTopAlumni: false, linkedin: "https://www.linkedin.com/in/sanjay-kumar-a80b0619" }
];

// Get top alumni (ranked) - Includes new additions Sanjay Garg and Meenakshi Vashistha
const topAlumni = allAlumniData.filter(alumni => alumni.isTopAlumni).sort((a, b) => (a.rank || 99) - (b.rank || 99));

const AlumniDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState({});
  const itemsPerPage = 12;

  // Get unique branches and years for filters
  const branches = [...new Set(allAlumniData.map(a => a.branchCode).filter(b => b && b !== ''))].sort();
  const years = [...new Set(allAlumniData.map(a => a.passingYear).filter(y => y && y !== ''))].sort((a, b) => Number(b) - Number(a));

  // Filter alumni based on search and filters
  const filteredAlumni = allAlumniData.filter(alumni => {
    const matchesSearch = alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.jobProfile.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !selectedBranch || alumni.branchCode === selectedBranch;
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
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, selectedYear]);

  const handleImageError = (alumniId) => {
    setImageErrors(prev => ({ ...prev, [alumniId]: true }));
  };

  const getImagePath = (imageName) => {
    if (!imageName) return null;
    return `/images/Alumnis/${imageName}`;
  };

  return (
    <main className="bg-white min-h-screen pb-20">
      {/* HEADER SECTION */}
      <section className="bg-gradient-to-r from-[#951114] to-[#6d0c0f] text-white py-20 px-6 md:px-24">
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

      {/* TOP ALUMNI HIGHLIGHTS */}
      {topAlumni.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 -mt-12 mb-16">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 border border-amber-200">
            <div className="flex items-center gap-3 mb-8">
              <Award className="text-amber-600" size={32} />
              <h2 className="text-3xl font-bold text-slate-900">Featured Alumni</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-amber-300 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topAlumni.map((alumni, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-amber-200 flex flex-col">
                  <div className="relative">
                    {/* Image Container */}
                    <div className="relative h-64 w-full bg-gradient-to-br from-amber-100 to-orange-100">
                      {alumni.image && !imageErrors[`top-${alumni.id}`] ? (
                        <Image
                          src={getImagePath(alumni.image)}
                          alt={alumni.name}
                          fill
                          className="object-contain"
                          onError={() => handleImageError(`top-${alumni.id}`)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <GraduationCap size={64} className="text-amber-400 mx-auto mb-2" />
                            <p className="text-amber-600 font-medium">{alumni.name}</p>
                          </div>
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-amber-600 font-bold tracking-widest uppercase text-xs mb-2">
                        <GraduationCap size={14} />
                        {alumni.branchCode || 'Engineering'} • Batch {alumni.passingYear || 'N/A'}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{alumni.name}</h3>
                      <p className="text-slate-600 text-sm line-clamp-3">{alumni.jobProfile}</p>
                    </div>
                    {/* LinkedIn Button */}
                    {alumni.linkedin && (
                      <a
                        href={alumni.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#0077B5] hover:bg-[#005e8c] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        <Linkedin size={16} />
                        Connect on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#951114] focus:border-transparent bg-white"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#951114] bg-white"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
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
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <p className="text-slate-600">
            Showing <span className="font-bold text-slate-900">{filteredAlumni.length}</span> alumni
            {selectedBranch && ` in ${selectedBranch}`}
            {selectedYear && ` from batch of ${selectedYear}`}
          </p>
          {(searchTerm || selectedBranch || selectedYear) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBranch('');
                setSelectedYear('');
              }}
              className="text-[#951114] text-sm font-medium hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* ALUMNI GRID */}
        {filteredAlumni.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedAlumni.map((alumni) => (
                <div key={alumni.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                  {/* Alumni Image */}
                  <div className="relative h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200">
                    {alumni.image && !imageErrors[alumni.id] ? (
                      <Image
                        src={getImagePath(alumni.image)}
                        alt={alumni.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(alumni.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <GraduationCap size={56} className="text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm font-medium">{alumni.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 text-[#951114] font-bold tracking-widest uppercase text-xs mb-1">
                          <GraduationCap size={14} />
                          {alumni.branch || 'Engineering'}
                        </div>
                        <div className="text-[#951114] font-bold tracking-widest uppercase text-xs">
                          Batch {alumni.passingYear || 'N/A'}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#951114] transition-colors">
                        {alumni.name}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3">
                        {alumni.jobProfile}
                      </p>
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Briefcase size={14} />
                          <span>Current Position</span>
                        </div>
                      </div>
                    </div>
                    {/* LinkedIn Button */}
                    {alumni.linkedin && (
                      <a
                        href={alumni.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#0077B5] hover:bg-[#005e8c] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        <Linkedin size={16} />
                        Connect on LinkedIn
                      </a>
                    )}
                  </div>
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
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === pageNum
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
          <div className="text-center py-12 bg-slate-50 rounded-lg">
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