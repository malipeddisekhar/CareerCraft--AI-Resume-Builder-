import React from "react";
import "./HarvardClassic.css";

const HarvardClassic = ({ data = {} }) => {
  const {
    fullName = "Your Name",
    email = "email@example.com",
    phone = "+1-123-456-7890",
    location = "City, State",
    linkedin = "",
    github = "",
    website = "",
    summary = "",
    experience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
  } = data;

  const contactItems = [];
  if (location) contactItems.push(<span>{location}</span>);
  if (phone) contactItems.push(<span>{phone}</span>);
  if (email) contactItems.push(<a href={`mailto:${email}`}>{email}</a>);
  if (linkedin) {
    const url = linkedin.startsWith("http") ? linkedin : `https://${linkedin}`;
    contactItems.push(<a href={url} target="_blank" rel="noreferrer">LinkedIn</a>);
  }
  if (github) {
    const url = github.startsWith("http") ? github : `https://${github}`;
    contactItems.push(<a href={url} target="_blank" rel="noreferrer">GitHub</a>);
  }
  if (website) {
    const url = website.startsWith("http") ? website : `https://${website}`;
    contactItems.push(<a href={url} target="_blank" rel="noreferrer">Portfolio</a>);
  }

  const allSkills = Array.isArray(skills)
    ? skills
    : [...(skills?.technical || []), ...(skills?.soft || [])];

  return (
    <div className="harvard-classic-template">
      {/* ── Header ── */}
      <header className="harvard-header">
        <h1 className="harvard-name">{fullName}</h1>
        <div className="harvard-contact">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="harvard-dot">•</span>}
              {item}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* ── Summary (if provided) ── */}
      {summary && (
        <section className="harvard-section">
          <div className="harvard-section-title">Objective / Summary</div>
          <p className="harvard-summary">{summary}</p>
        </section>
      )}

      {/* ── Education ── */}
      {education && education.length > 0 && (
        <section className="harvard-section">
          <div className="harvard-section-title">Education</div>
          {education.map((edu, idx) => (
            <div key={idx} className="harvard-entry">
              <div className="harvard-entry-row">
                <span className="harvard-entry-main">
                  <strong>{edu.school || "University Name"}</strong>
                  {edu.location ? `, ${edu.location}` : ""}
                </span>
                <span className="harvard-entry-meta">
                  {edu.endDate || edu.graduationDate || edu.startDate || "Graduation Year"}
                </span>
              </div>
              <div className="harvard-entry-row">
                <span className="harvard-entry-sub">
                  <em>{edu.degree || "Degree Name"}</em>
                  {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                </span>
                {edu.location && !edu.school?.includes(edu.location) && (
                  <span className="harvard-entry-sub">{edu.location}</span>
                )}
              </div>
              {edu.description && (
                <p className="harvard-entry-desc">{edu.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Experience ── */}
      {experience && experience.length > 0 && (
        <section className="harvard-section">
          <div className="harvard-section-title">Experience</div>
          {experience.map((job, idx) => (
            <div key={idx} className="harvard-entry">
              <div className="harvard-entry-row">
                <span className="harvard-entry-main">
                  <strong>{job.company || "Company Name"}</strong>
                  {job.location ? `, ${job.location}` : ""}
                </span>
                <span className="harvard-entry-meta">
                  {job.startDate || ""} {job.startDate && (job.endDate || "Present") ? "–" : ""}{" "}
                  {job.endDate || (job.startDate ? "Present" : "")}
                </span>
              </div>
              <div className="harvard-entry-row">
                <span className="harvard-entry-sub">
                  <em>{job.title || "Job Title"}</em>
                </span>
              </div>
              {job.description && (
                <div className="harvard-entry-desc">
                  {job.description.includes("\n") ? (
                    <ul className="harvard-bullets">
                      {job.description
                        .split("\n")
                        .filter((line) => line.trim())
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
        </section>
      )}

      {/* ── Projects ── */}
      {projects && projects.length > 0 && (
        <section className="harvard-section">
          <div className="harvard-section-title">Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} className="harvard-entry">
              <div className="harvard-entry-row">
                <span className="harvard-entry-main">
                  <strong>{proj.title || proj.name || "Project Title"}</strong>
                  {proj.technologies ? ` | ${proj.technologies}` : ""}
                </span>
                {proj.date && <span className="harvard-entry-meta">{proj.date}</span>}
              </div>
              {proj.link && (
                <div className="harvard-entry-sub">
                  <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer">
                    {proj.link}
                  </a>
                </div>
              )}
              {proj.description && (
                <p className="harvard-entry-desc">{proj.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Skills & Additional ── */}
      {allSkills.length > 0 && (
        <section className="harvard-section">
          <div className="harvard-section-title">Skills &amp; Additional</div>
          <div className="harvard-skills-grid">
            {skills?.technical && skills.technical.length > 0 && (
              <div className="harvard-skill-line">
                <strong>Technical Skills: </strong>
                <span>
                  {skills.technical
                    .map((s) => (typeof s === "string" ? s : s.name))
                    .join(", ")}
                </span>
              </div>
            )}
            {skills?.soft && skills.soft.length > 0 && (
              <div className="harvard-skill-line">
                <strong>Soft Skills: </strong>
                <span>
                  {skills.soft
                    .map((s) => (typeof s === "string" ? s : s.name))
                    .join(", ")}
                </span>
              </div>
            )}
            {(!skills?.technical?.length && !skills?.soft?.length) && (
              <div className="harvard-skill-line">
                <strong>Core Competencies: </strong>
                <span>
                  {allSkills
                    .map((s) => (typeof s === "string" ? s : s.name))
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Certifications ── */}
      {certifications && certifications.length > 0 && (
        <section className="harvard-section">
          <div className="harvard-section-title">Certifications</div>
          <ul className="harvard-bullets">
            {certifications.map((cert, idx) => (
              <li key={idx}>
                <strong>{cert.name || "Certificate"}</strong>
                {cert.issuer ? ` — ${cert.issuer}` : ""}
                {cert.date ? ` (${cert.date})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default HarvardClassic;
