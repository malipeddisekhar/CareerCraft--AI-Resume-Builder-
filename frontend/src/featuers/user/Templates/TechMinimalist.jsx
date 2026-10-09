import React from "react";
import "./TechMinimalist.css";
import { FaGithub, FaLinkedin, FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const TechMinimalist = ({ data = {} }) => {
  const {
    fullName = "Alex Chen",
    email = "alex.chen@dev.io",
    phone = "+1 (555) 392-1092",
    location = "Seattle, WA",
    linkedin = "linkedin.com/in/alexchen",
    github = "github.com/alexchen",
    website = "alexchen.dev",
    summary = "Full-stack software engineer with 5+ years of experience building distributed systems and high-throughput web applications. Passionate about clean architecture, cloud infrastructure, and developer productivity.",
    experience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
  } = data;

  const allSkills = Array.isArray(skills)
    ? skills
    : [...(skills?.technical || []), ...(skills?.soft || [])];

  return (
    <div className="tech-minimalist-template">
      {/* ── Top Header ── */}
      <header className="tech-header">
        <div className="tech-header-main">
          <h1 className="tech-name">{fullName}</h1>
          <p className="tech-role-tag">Software Engineer &amp; Full Stack Developer</p>
        </div>

        <div className="tech-contact-bar">
          {email && (
            <a href={`mailto:${email}`} className="tech-contact-item">
              <FaEnvelope className="tech-icon" /> {email}
            </a>
          )}
          {phone && (
            <span className="tech-contact-item">
              <FaPhone className="tech-icon" /> {phone}
            </span>
          )}
          {location && (
            <span className="tech-contact-item">
              <FaMapMarkerAlt className="tech-icon" /> {location}
            </span>
          )}
          {github && (
            <a
              href={github.startsWith("http") ? github : `https://${github}`}
              target="_blank"
              rel="noreferrer"
              className="tech-contact-item"
            >
              <FaGithub className="tech-icon" /> {github.replace(/^https?:\/\//, "")}
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
              target="_blank"
              rel="noreferrer"
              className="tech-contact-item"
            >
              <FaLinkedin className="tech-icon" /> {linkedin.replace(/^https?:\/\//, "")}
            </a>
          )}
          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noreferrer"
              className="tech-contact-item"
            >
              <FaGlobe className="tech-icon" /> {website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </header>

      {/* ── Summary ── */}
      {summary && (
        <section className="tech-section">
          <div className="tech-section-heading">
            <span className="tech-prompt">//</span> ABOUT_ME
          </div>
          <p className="tech-summary-text">{summary}</p>
        </section>
      )}

      {/* ── Skills & Tech Stack ── */}
      {allSkills.length > 0 && (
        <section className="tech-section">
          <div className="tech-section-heading">
            <span className="tech-prompt">//</span> TECH_STACK
          </div>
          <div className="tech-badges-wrap">
            {allSkills.map((skill, idx) => {
              const name = typeof skill === "string" ? skill : skill.name;
              return (
                <span key={idx} className="tech-badge">
                  {name}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Experience ── */}
      {experience && experience.length > 0 && (
        <section className="tech-section">
          <div className="tech-section-heading">
            <span className="tech-prompt">//</span> WORK_EXPERIENCE
          </div>
          <div className="tech-timeline">
            {experience.map((job, idx) => (
              <div key={idx} className="tech-timeline-item">
                <div className="tech-item-header">
                  <div>
                    <h3 className="tech-item-title">{job.title || "Software Engineer"}</h3>
                    <div className="tech-company-name">
                      {job.company} {job.location ? `· ${job.location}` : ""}
                    </div>
                  </div>
                  <div className="tech-date-badge">
                    {job.startDate || ""} {job.startDate && (job.endDate || "Present") ? "–" : ""}{" "}
                    {job.endDate || (job.startDate ? "Present" : "")}
                  </div>
                </div>
                {job.description && (
                  <div className="tech-item-body">
                    {job.description.includes("\n") ? (
                      <ul className="tech-bullet-list">
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

      {/* ── Projects ── */}
      {projects && projects.length > 0 && (
        <section className="tech-section">
          <div className="tech-section-heading">
            <span className="tech-prompt">//</span> FEATURED_PROJECTS
          </div>
          <div className="tech-projects-grid">
            {projects.map((proj, idx) => (
              <div key={idx} className="tech-project-card">
                <div className="tech-proj-header">
                  <h4 className="tech-proj-title">{proj.title || proj.name || "Project"}</h4>
                  {proj.link && (
                    <a
                      href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="tech-proj-link"
                    >
                      Demo &rarr;
                    </a>
                  )}
                </div>
                {proj.technologies && (
                  <div className="tech-proj-tech">{proj.technologies}</div>
                )}
                {proj.description && (
                  <p className="tech-proj-desc">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education & Certifications ── */}
      <div className="tech-two-col">
        {education && education.length > 0 && (
          <section className="tech-section tech-col">
            <div className="tech-section-heading">
              <span className="tech-prompt">//</span> EDUCATION
            </div>
            {education.map((edu, idx) => (
              <div key={idx} className="tech-sub-item">
                <div className="tech-sub-title">{edu.degree || "B.S. in Computer Science"}</div>
                <div className="tech-sub-meta">
                  {edu.school || "University"} · {edu.endDate || edu.graduationDate || "2024"}
                </div>
                {edu.gpa && <div className="tech-sub-detail">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </section>
        )}

        {certifications && certifications.length > 0 && (
          <section className="tech-section tech-col">
            <div className="tech-section-heading">
              <span className="tech-prompt">//</span> CERTIFICATIONS
            </div>
            {certifications.map((cert, idx) => (
              <div key={idx} className="tech-sub-item">
                <div className="tech-sub-title">{cert.name}</div>
                <div className="tech-sub-meta">
                  {cert.issuer} {cert.date ? `· ${cert.date}` : ""}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default TechMinimalist;
