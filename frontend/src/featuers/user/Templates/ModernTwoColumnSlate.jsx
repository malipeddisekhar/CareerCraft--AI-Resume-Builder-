import React from "react";
import "./ModernTwoColumnSlate.css";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaGlobe } from "react-icons/fa";

const ModernTwoColumnSlate = ({ data = {} }) => {
  const {
    fullName = "Marcus Sterling",
    email = "m.sterling@domain.com",
    phone = "+1 (555) 782-9901",
    location = "San Francisco, CA",
    linkedin = "linkedin.com/in/msterling",
    github = "",
    website = "marcussterling.com",
    summary = "Versatile product and operations strategist with over 7 years of leadership driving product adoption, managing high-performing teams, and optimizing business operations across hyper-growth environments.",
    experience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
  } = data;

  const initials = fullName
    ? fullName
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "MS";

  const allSkills = Array.isArray(skills)
    ? skills
    : [...(skills?.technical || []), ...(skills?.soft || [])];

  return (
    <div className="slate-two-column-template">
      {/* ── Left Sidebar (Slate Navy) ── */}
      <aside className="slate-sidebar">
        {/* Monogram */}
        <div className="slate-avatar-circle">{initials}</div>

        {/* Contact Information */}
        <div className="slate-sidebar-group">
          <h3 className="slate-sidebar-title">Contact</h3>
          <div className="slate-contact-list">
            {email && (
              <div className="slate-contact-row">
                <FaEnvelope className="slate-icon" />
                <a href={`mailto:${email}`}>{email}</a>
              </div>
            )}
            {phone && (
              <div className="slate-contact-row">
                <FaPhone className="slate-icon" />
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="slate-contact-row">
                <FaMapMarkerAlt className="slate-icon" />
                <span>{location}</span>
              </div>
            )}
            {linkedin && (
              <div className="slate-contact-row">
                <FaLinkedin className="slate-icon" />
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {linkedin.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {github && (
              <div className="slate-contact-row">
                <FaGithub className="slate-icon" />
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {github.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {website && (
              <div className="slate-contact-row">
                <FaGlobe className="slate-icon" />
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
        </div>

        {/* Education in Sidebar */}
        {education && education.length > 0 && (
          <div className="slate-sidebar-group">
            <h3 className="slate-sidebar-title">Education</h3>
            {education.map((edu, idx) => (
              <div key={idx} className="slate-sidebar-edu">
                <div className="slate-edu-degree">{edu.degree || "Degree"}</div>
                <div className="slate-edu-school">{edu.school}</div>
                <div className="slate-edu-year">
                  {edu.endDate || edu.graduationDate || edu.startDate}
                </div>
                {edu.gpa && <div className="slate-edu-gpa">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Skills in Sidebar */}
        {allSkills.length > 0 && (
          <div className="slate-sidebar-group">
            <h3 className="slate-sidebar-title">Core Skills</h3>
            <div className="slate-skills-wrap">
              {allSkills.map((skill, idx) => {
                const name = typeof skill === "string" ? skill : skill.name;
                return (
                  <span key={idx} className="slate-skill-pill">
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications in Sidebar */}
        {certifications && certifications.length > 0 && (
          <div className="slate-sidebar-group">
            <h3 className="slate-sidebar-title">Certifications</h3>
            {certifications.map((cert, idx) => (
              <div key={idx} className="slate-sidebar-cert">
                <div className="slate-cert-name">{cert.name}</div>
                <div className="slate-cert-issuer">{cert.issuer} {cert.date ? `(${cert.date})` : ""}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main Content Area ── */}
      <main className="slate-main">
        {/* Header */}
        <header className="slate-main-header">
          <h1 className="slate-main-name">{fullName}</h1>
          <div className="slate-main-accent-bar" />
        </header>

        {/* Summary */}
        {summary && (
          <section className="slate-main-section">
            <h2 className="slate-main-title">Professional Summary</h2>
            <p className="slate-main-summary">{summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section className="slate-main-section">
            <h2 className="slate-main-title">Work Experience</h2>
            <div className="slate-exp-list">
              {experience.map((job, idx) => (
                <div key={idx} className="slate-exp-card">
                  <div className="slate-exp-header">
                    <div>
                      <h3 className="slate-exp-role">{job.title || "Position Title"}</h3>
                      <div className="slate-exp-company">
                        {job.company} {job.location ? `· ${job.location}` : ""}
                      </div>
                    </div>
                    <div className="slate-exp-date">
                      {job.startDate || ""} {job.startDate && (job.endDate || "Present") ? "–" : ""}{" "}
                      {job.endDate || (job.startDate ? "Present" : "")}
                    </div>
                  </div>
                  {job.description && (
                    <div className="slate-exp-desc">
                      {job.description.includes("\n") ? (
                        <ul className="slate-bullets">
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="slate-main-section">
            <h2 className="slate-main-title">Key Projects</h2>
            <div className="slate-projects-list">
              {projects.map((proj, idx) => (
                <div key={idx} className="slate-proj-item">
                  <div className="slate-proj-head">
                    <span className="slate-proj-name">{proj.title || proj.name}</span>
                    {proj.technologies && (
                      <span className="slate-proj-tech">[{proj.technologies}]</span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="slate-proj-desc">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ModernTwoColumnSlate;
