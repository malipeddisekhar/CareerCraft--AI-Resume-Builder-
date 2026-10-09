import React from "react";
import "./ExecutiveLeadership.css";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGlobe } from "react-icons/fa";

const ExecutiveLeadership = ({ data = {} }) => {
  const {
    fullName = "Jonathan R. Vance",
    email = "j.vance@executive.corp",
    phone = "+1 (555) 481-9920",
    location = "New York, NY",
    linkedin = "linkedin.com/in/jonathanvance",
    website = "jonathanvance.com",
    summary = "Visionary Chief Operating Officer and Executive Leader with 15+ years orchestrating global enterprise transformations, multi-million dollar P&L turnarounds, and cross-functional expansions. Proven acumen in capital allocation, strategic partnerships, and governance.",
    experience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
  } = data;

  const allSkills = Array.isArray(skills)
    ? skills
    : [...(skills?.technical || []), ...(skills?.soft || [])];

  const defaultExpertise = [
    "P&L & Fiscal Governance",
    "Global Operations & Scale",
    "Cross-Border M&A",
    "Strategic Transformation",
    "Board & Stakeholder Relations",
    "Executive Team Mentorship",
  ];

  const expertiseList = allSkills.length > 0 ? allSkills : defaultExpertise;

  return (
    <div className="exec-leadership-template">
      {/* ── Top Header ── */}
      <header className="exec-header">
        <div className="exec-header-bar" />
        <h1 className="exec-name">{fullName}</h1>
        <p className="exec-title-sub">Executive Leadership &amp; Corporate Strategy</p>

        <div className="exec-contact-grid">
          {location && (
            <div className="exec-contact-item">
              <FaMapMarkerAlt className="exec-icon" /> {location}
            </div>
          )}
          {phone && (
            <div className="exec-contact-item">
              <FaPhone className="exec-icon" /> {phone}
            </div>
          )}
          {email && (
            <div className="exec-contact-item">
              <FaEnvelope className="exec-icon" />
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          )}
          {linkedin && (
            <div className="exec-contact-item">
              <FaLinkedin className="exec-icon" />
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn Profile
              </a>
            </div>
          )}
          {website && (
            <div className="exec-contact-item">
              <FaGlobe className="exec-icon" />
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
              >
                {website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* ── Executive Summary ── */}
      {summary && (
        <section className="exec-section">
          <div className="exec-section-title">Executive Profile</div>
          <p className="exec-summary-text">{summary}</p>
        </section>
      )}

      {/* ── Core Competencies / Areas of Expertise ── */}
      {expertiseList.length > 0 && (
        <section className="exec-section">
          <div className="exec-section-title">Areas of Executive Expertise</div>
          <div className="exec-competencies-grid">
            {expertiseList.map((skill, idx) => {
              const name = typeof skill === "string" ? skill : skill.name;
              return (
                <div key={idx} className="exec-comp-pill">
                  <span className="exec-comp-bullet">◆</span> {name}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Executive Experience ── */}
      {experience && experience.length > 0 && (
        <section className="exec-section">
          <div className="exec-section-title">Career History &amp; Key Accomplishments</div>
          <div className="exec-exp-list">
            {experience.map((job, idx) => (
              <div key={idx} className="exec-exp-card">
                <div className="exec-exp-header">
                  <div>
                    <h3 className="exec-exp-role">{job.title || "Executive Role"}</h3>
                    <div className="exec-exp-org">
                      <strong>{job.company}</strong> {job.location ? `| ${job.location}` : ""}
                    </div>
                  </div>
                  <div className="exec-exp-period">
                    {job.startDate || ""} {job.startDate && (job.endDate || "Present") ? "–" : ""}{" "}
                    {job.endDate || (job.startDate ? "Present" : "")}
                  </div>
                </div>
                {job.description && (
                  <div className="exec-exp-body">
                    {job.description.includes("\n") ? (
                      <ul className="exec-bullets">
                        {job.description
                          .split("\n")
                          .filter((l) => l.trim())
                          .map((line, i) => (
                            <li key={i}>{line.replace(/^[-•*]\s*/, "")}</li>
                          ))}
                      </ul>
                    ) : (
                      <p>{job.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Strategic Initiatives / Projects ── */}
      {projects && projects.length > 0 && (
        <section className="exec-section">
          <div className="exec-section-title">Strategic Initiatives</div>
          <div className="exec-projects-list">
            {projects.map((proj, idx) => (
              <div key={idx} className="exec-proj-entry">
                <div className="exec-proj-head">
                  <span className="exec-proj-name">{proj.title || proj.name}</span>
                  {proj.date && <span className="exec-proj-date">{proj.date}</span>}
                </div>
                {proj.technologies && (
                  <div className="exec-proj-meta">{proj.technologies}</div>
                )}
                {proj.description && (
                  <p className="exec-proj-text">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education & Credentials ── */}
      <div className="exec-footer-two-col">
        {education && education.length > 0 && (
          <section className="exec-section exec-sub-col">
            <div className="exec-section-title">Education</div>
            {education.map((edu, idx) => (
              <div key={idx} className="exec-edu-entry">
                <div className="exec-edu-degree">{edu.degree}</div>
                <div className="exec-edu-school">
                  {edu.school} {edu.endDate || edu.graduationDate ? `(${edu.endDate || edu.graduationDate})` : ""}
                </div>
              </div>
            ))}
          </section>
        )}

        {certifications && certifications.length > 0 && (
          <section className="exec-section exec-sub-col">
            <div className="exec-section-title">Board &amp; Credentials</div>
            {certifications.map((cert, idx) => (
              <div key={idx} className="exec-edu-entry">
                <div className="exec-edu-degree">{cert.name}</div>
                <div className="exec-edu-school">
                  {cert.issuer} {cert.date ? `(${cert.date})` : ""}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default ExecutiveLeadership;
