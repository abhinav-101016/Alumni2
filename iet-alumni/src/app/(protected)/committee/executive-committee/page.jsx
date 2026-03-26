import React from "react";
import Image from "next/image";
import { MapPin, Briefcase, Quote } from "lucide-react";

const ExecutiveCommittee = () => {
  const members = [
    {
      role: "President",
      name: "Mr. Anjani Kumar Srivastava",
      address:
        "SHUBHKAMNA, 4/C-815, Sector-4, Gomtinagar Extension, Lucknow – 226010, Uttar Pradesh",
      occupation: "Self-Employed (Real Estate, Mutual Funds & Railway Consultancy)",
      image: "/images/president.jpeg",
      bio: {
        highlight: "Founder Student, IET Lucknow — Batch of 1984–88 (B.Tech, Electronics & Communication Engineering)",
        points: [
          "Actively contributed to institution-building as a student — initiated the cooperative mess system in A-Block Hostel (1985) and guided similar setups across other blocks.",
          "Co-founded ISSACC (INSTECH Students Sports & Cultural Council) in 1986–87 and served as a student signatory for IET's official emblem.",
          "36+ years of senior experience in Sales & Services with MNCs — specialising in electrical & electronics systems for Railway Rolling Stock, including India's first Vande Bharat rake (T-18).",
          "Took VRS in March 2024; now based in Lucknow as a real estate & mutual fund investor and industry consultant.",
        ],
        quote: "Strong alumni engagement is the backbone of a great institution.",
      },
      details: [
        "S/o (Late) Shri Hari Krishna Srivastava.",
        "Entrusted with executive powers and overall supervision of the Society.",
        "Responsible for governance under the Societies Registration Act, 1860."
      ]
    },
    {
      role: "Vice President",
      name: "Mr. Tej Pratap Narayan",
      address:
        "246/2B, Railway Officers Enclave, PK Road, New Delhi – 110001",
      occupation: "Government Service",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop",
      details: [
        "S/o Shri Ram Piarey.",
        "Assists the President in administrative matters.",
        "Provides strategic direction to the Executive Committee."
      ]
    },
    {
      role: "General Secretary",
      name: "Mr. Ajeet Pratap Singh",
      address:
        "5/210, Gomtinagar Extension, Lucknow – 226010, Uttar Pradesh",
      occupation: "PSU Employee",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&fit=crop",
      details: [
        "S/o Shri M. D. Singh.",
        "Responsible for official documentation and records.",
        "Ensures compliance with the Societies Registration Act, 1860."
      ]
    },
    {
      role: "Treasurer",
      name: "Mr. Dinesh Kumar Maurya",
      address:
        "Bakshi Ka Talab, near Surcoat Paint Factory, Lucknow, Uttar Pradesh",
      occupation: "Business",
      image:
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&h=400&fit=crop",
      details: [
        "S/o Shri Mishrilal Maurya.",
        "Responsible for financial management of the Society.",
        "Maintains accounts and financial transparency."
      ]
    },
    {
      role: "Secretary",
      name: "Ms. Tanya Gupta",
      address:
        "B-528, Trans Yamuna Colony, Agra, Uttar Pradesh",
      occupation: "M.Tech Student at IIT Kanpur",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&fit=crop",
      details: [
        "D/o Shri Sachin Gupta.",
        "Assists in coordination and administrative activities.",
        "Supports communication within the Society."
      ]
    },
    {
      role: "Student Representative",
      name: "Ms. Anjali Tomar",
      address:
        "A-42, Natwar Nagar, Dholi Pyau, Mathura – 281001, Uttar Pradesh",
      occupation: "Student",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=400&fit=crop",
      details: [
        "D/o Mr. Brijesh Tomar.",
        "Represents student members of the Society.",
        "Acts as liaison between students and Executive Committee."
      ]
    },
    {
      role: "Student Representative",
      name: "Mr. Akshit Agarwal",
      address:
        "268/6, SCH No. 7, Shastri Nagar, PO: Meerut City, District: Meerut – 250002, Uttar Pradesh",
      occupation: "Student",
      image:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&h=400&fit=crop",
      details: [
        "S/o Shri Sanjeev Kumar Agarwal.",
        "Represents student community interests.",
        "Participates in executive discussions and decisions."
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans">

      {/* Header */}
      <section className="py-16 px-6 border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="w-16 h-1 bg-[#951114] mx-auto mb-6"></div>
          <h1 className="text-4xl font-bold uppercase mb-4">
            Executive Committee
          </h1>
          <p className="text-sm text-[#951114] font-semibold uppercase tracking-widest">
            Registered under Societies Registration Act XXI of 1860
          </p>
        </div>
      </section>

      {/* Members */}
      <main className="max-w-6xl mx-auto py-16 px-6 space-y-16">
        {members.map((member, index) => (
          <article
            key={index}
            className="border border-slate-200 rounded-lg shadow-sm p-10"
          >
            <div className="flex flex-col md:flex-row gap-10">

              {/* Image */}
              <div className="relative w-52 h-52 mx-auto md:mx-0 flex-shrink-0">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#951114] uppercase">
                  {member.role}
                </h2>

                <h3 className="text-2xl font-semibold mt-3">
                  {member.name}
                </h3>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="flex gap-3">
                    <MapPin className="text-[#951114] flex-shrink-0" size={18} />
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {member.address}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Briefcase className="text-[#951114] flex-shrink-0" size={18} />
                    <p className="text-sm text-slate-700">
                      <strong>Occupation:</strong> {member.occupation}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {member.details.map((detail, i) => (
                    <p key={i} className="text-sm text-slate-600">
                      • {detail}
                    </p>
                  ))}
                </div>

                {/* President Bio — only rendered if bio exists */}
                {member.bio && (
                  <div className="mt-10 border-t border-slate-100 pt-8 space-y-6">

                    {/* Highlight badge */}
                    <p className="inline-block bg-[#951114]/8 text-[#951114] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded">
                      {member.bio.highlight}
                    </p>

                    {/* Bio points */}
                    <ul className="space-y-3">
                      {member.bio.points.map((point, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#951114] flex-shrink-0"></span>
                          {point}
                        </li>
                      ))}
                    </ul>

                    {/* Pull quote */}
                    <blockquote className="flex gap-3 items-start border-l-4 border-[#951114] pl-5 py-1">
                      <Quote className="text-[#951114] flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-sm italic text-slate-600">
                        "{member.bio.quote}"
                      </p>
                    </blockquote>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-200">
        <p className="text-xs text-slate-400 uppercase tracking-widest">
          Association Registration Document • Societies Registration Act XXI of 1860
        </p>
      </footer>
    </div>
  );
};

export default ExecutiveCommittee;