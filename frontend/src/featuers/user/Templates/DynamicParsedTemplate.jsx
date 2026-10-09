import React, { useEffect, useState, useMemo, forwardRef } from "react";
import axiosInstance from "../../../api/axios";
import "./DynamicParsedTemplate.css";

// Cache parsed HTML by template ID so we do not refetch on every keystroke
const parsedHtmlCache = new Map();

/**
 * Injects user resume data into parsed DOCX / HTML template and formats it
 * to faithfully match the professional ATS resume layout shown in the template preview.
 */
function injectResumeData(rawHtml, data) {
  if (!rawHtml) return "";

  const {
    fullName = "",
    summary = "",
    email = "",
    phone = "",
    location = "",
    website = "",
    linkedin = "",
    github = "",
    experience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
  } = data || {};

  // 1. Token-based replacements for templates with handlebars/curly braces
  let processed = rawHtml;
  const tokenMap = {
    fullName: fullName || "YOUR NAME",
    name: fullName || "YOUR NAME",
    email: email || "email@example.com",
    phone: phone || "+1 234 567 890",
    location: location || "City, State",
    website: website || "",
    linkedin: linkedin || "",
    github: github || "",
    summary: summary || "",
  };

  let hadTokens = false;
  for (const [key, val] of Object.entries(tokenMap)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
    if (regex.test(processed)) {
      hadTokens = true;
      processed = processed.replace(regex, val);
    }
  }

  if (hadTokens) return processed;

  // 2. Intelligent DOM injection & ATS styling for Mammoth/DOCX converted HTML
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(processed, "text/html");

    // A. Format Header Row (Name + Contact details + Horizontal rule)
    const firstRow = doc.querySelector("tr");
    if (firstRow) {
      firstRow.classList.add("ats-header-row");
      const cells = firstRow.querySelectorAll("td");

      // Left cell: Full Name (Two-line big bold font)
      if (cells.length > 0) {
        const firstCell = cells[0];
        firstCell.style.verticalAlign = "bottom";
        firstCell.style.width = "48%";

        const displayName = fullName || "LIANE CORMIER";
        const nameParts = displayName.trim().split(/\s+/);

        let nameHtml = "";
        if (nameParts.length >= 2) {
          nameHtml = `
            <div class="ats-name-title" style="font-size: 26px; font-weight: 800; letter-spacing: 2px; line-height: 1.05; text-transform: uppercase; color: #111111;">
              <div>${nameParts[0]}</div>
              <div>${nameParts.slice(1).join(" ")}</div>
            </div>
          `;
        } else {
          nameHtml = `
            <div class="ats-name-title" style="font-size: 26px; font-weight: 800; letter-spacing: 2px; line-height: 1.05; text-transform: uppercase; color: #111111;">
              ${displayName}
            </div>
          `;
        }
        firstCell.innerHTML = nameHtml;
      }

      // Right cell: Contact Info (Right aligned with clean pipe separators)
      if (cells.length > 1) {
        const contactCell = cells[1];
        contactCell.style.textAlign = "right";
        contactCell.style.verticalAlign = "bottom";
        contactCell.style.width = "52%";
        contactCell.style.fontSize = "11px";
        contactCell.style.lineHeight = "1.5";
        contactCell.style.color = "#222222";

        const loc = location || "Detroit, MI";
        const web = website || "www.greatsiteaddress.com";
        const ph = phone || "313.555.0100";
        const em = email || "liane@example.com";

        const line1 = [loc, web ? `<a href="${web.startsWith("http") ? web : `http://${web}`}" target="_blank" style="color: #111; text-decoration: none;">${web}</a>` : ""].filter(Boolean).join(" | ");
        const line2 = [ph, em ? `<a href="mailto:${em}" style="color: #111; text-decoration: none;">${em}</a>` : ""].filter(Boolean).join(" | ");
        const line3 = [linkedin, github].filter(Boolean).map((link) => {
          const url = link.startsWith("http") ? link : `https://${link}`;
          return `<a href="${url}" target="_blank" style="color: #2563eb; text-decoration: none;">${link}</a>`;
        }).join(" | ");

        const contactLines = [line1, line2, line3].filter(Boolean);
        contactCell.innerHTML = contactLines
          .map((l) => `<div style="margin: 1px 0;">${l}</div>`)
          .join("");
      }
    }

    // B. Format Summary
    const allRows = doc.querySelectorAll("tr");
    for (const row of allRows) {
      const p = row.querySelector("p");
      if (
        p &&
        (p.textContent.toLowerCase().includes("analytical") ||
          p.textContent.toLowerCase().includes("motivated") ||
          p.textContent.toLowerCase().includes("summary") ||
          p.textContent.toLowerCase().includes("results-driven") ||
          p.textContent.toLowerCase().includes("professional") ||
          row.getAttribute("colspan") === "2" ||
          row.querySelector("td[colspan='2']"))
      ) {
        if (
          !p.textContent.includes("EXPERIENCE") &&
          !p.textContent.includes("EDUCATION") &&
          !p.textContent.includes("SKILLS")
        ) {
          const targetCell = row.querySelector("td");
          if (targetCell) {
            const summaryText =
              summary ||
              "Analytical, organized and detail-oriented accountant with GAAP expertise and experience in the full spectrum of public accounting. Collaborative team player with ownership mentality and a track record of delivering the highest quality strategic solutions to resolve challenges and propel business growth.";
            targetCell.innerHTML = `
              <div class="ats-summary" style="font-size: 11.5px; line-height: 1.55; color: #222222; margin: 10px 0 14px 0; text-align: justify;">
                ${summaryText}
              </div>
            `;
          }
          break;
        }
      }
    }

    // C. Format Experience Section
    for (const row of Array.from(doc.querySelectorAll("tr"))) {
      const text = row.textContent || "";
      if (
        text.includes("EXPERIENCE") ||
        text.includes("WORK HISTORY") ||
        text.includes("EMPLOYMENT")
      ) {
        const targetCell = row.querySelector("td");
        if (targetCell) {
          let expHtml = `
            <div class="ats-section-heading" style="font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #111111; border-bottom: 1.5px solid #111111; padding-bottom: 2px; margin-top: 12px; margin-bottom: 8px;">
              EXPERIENCE
            </div>
          `;

          if (experience && experience.length > 0) {
            experience.forEach((job) => {
              expHtml += `
                <div class="ats-job-item" style="margin-bottom: 10px;">
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #111111; letter-spacing: 0.5px;">
                    ${(job.title || "Position").toUpperCase()}
                  </div>
                  <div style="font-size: 11.5px; color: #222222; margin: 1px 0 3px 0;">
                    ${job.company || ""}${job.location ? ` | ${job.location}` : ""} ${
                      job.startDate ? ` ${job.startDate} – ${job.endDate || "PRESENT"}` : ""
                    }
                  </div>
                  ${
                    job.description
                      ? `<div style="font-size: 11px; line-height: 1.45; color: #333333;">${job.description}</div>`
                      : ""
                  }
                </div>
              `;
            });
          } else {
            // Keep default sample experience structured cleanly
            expHtml += `
              <div class="ats-job-item" style="margin-bottom: 10px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #111111; letter-spacing: 0.5px;">ACCOUNTANT</div>
                <div style="font-size: 11.5px; color: #222222; margin: 1px 0 3px 0;">Trey Research | San Francisco, CA 20XX – PRESENT</div>
                <div style="font-size: 11px; line-height: 1.45; color: #333333;">
                  Working in a mid-sized public accounting firm to provide professional accounting services for individuals and business clients. Provide full range of services, including income tax preparation, audit support, preparation of financial statements, pro forma budgeting, general ledger accounting, and bank reconciliation.
                </div>
              </div>
            `;
          }

          targetCell.innerHTML = expHtml;

          // Remove trailing sample experience sub-rows if any
          let nextRow = row.nextElementSibling;
          while (
            nextRow &&
            !nextRow.textContent.includes("EDUCATION") &&
            !nextRow.textContent.includes("SKILLS")
          ) {
            const toRemove = nextRow;
            nextRow = nextRow.nextElementSibling;
            toRemove.remove();
          }
        }
        break;
      }
    }

    // D. Format Education Section
    for (const row of Array.from(doc.querySelectorAll("tr"))) {
      const text = row.textContent || "";
      if (text.includes("EDUCATION")) {
        const targetCell = row.querySelector("td");
        if (targetCell) {
          let eduHtml = `
            <div class="ats-section-heading" style="font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #111111; border-bottom: 1.5px solid #111111; padding-bottom: 2px; margin-top: 12px; margin-bottom: 8px;">
              EDUCATION
            </div>
          `;

          if (education && education.length > 0) {
            education.forEach((edu) => {
              eduHtml += `
                <div class="ats-edu-item" style="margin-bottom: 8px;">
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #111111; letter-spacing: 0.5px;">
                    ${(edu.degree || edu.fieldOfStudy || "BACHELOR").toUpperCase()}
                  </div>
                  <div style="font-size: 11.5px; color: #222222; margin: 1px 0 2px 0;">
                    ${edu.school || ""}${edu.location ? ` | ${edu.location}` : ""} ${
                      edu.endDate || edu.graduationDate ? `JUNE ${edu.endDate || edu.graduationDate}` : ""
                    }
                  </div>
                  ${
                    edu.gpa
                      ? `<div style="font-size: 11px; color: #333333; margin-left: 12px;">• GPA ${edu.gpa}</div>`
                      : ""
                  }
                  ${
                    edu.description
                      ? `<div style="font-size: 11px; color: #333333; margin-left: 12px;">• ${edu.description}</div>`
                      : ""
                  }
                </div>
              `;
            });
          } else {
            eduHtml += `
              <div class="ats-edu-item" style="margin-bottom: 8px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #111111; letter-spacing: 0.5px;">
                  BACHELOR OF SCIENCE IN ACCOUNTING, MINOR IN BUSINESS ADMINISTRATION
                </div>
                <div style="font-size: 11.5px; color: #222222; margin: 1px 0 2px 0;">Bellows College JUNE 20XX</div>
                <ul style="list-style-type: disc; margin: 2px 0 0 16px; padding: 0; font-size: 11px; line-height: 1.5; color: #333333;">
                  <li>Distinguished member of the university’s Accounting Society</li>
                  <li>Relevant coursework: Advanced Financial Accounting &amp; Reporting</li>
                  <li>GPA 3.8</li>
                </ul>
              </div>
            `;
          }

          targetCell.innerHTML = eduHtml;
        }
        break;
      }
    }

    // E. Format Skills Section
    for (const row of Array.from(doc.querySelectorAll("tr"))) {
      const text = row.textContent || "";
      if (text.includes("SKILLS")) {
        const targetCell = row.querySelector("td");
        if (targetCell) {
          targetCell.innerHTML = `
            <div class="ats-section-heading" style="font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #111111; border-bottom: 1.5px solid #111111; padding-bottom: 2px; margin-top: 12px; margin-bottom: 8px;">
              SKILLS
            </div>
          `;
        }

        const skillRow = row.nextElementSibling || row;
        const skillCells = skillRow.querySelectorAll("td");

        const allSkillsList = Array.isArray(skills)
          ? skills
          : [...(skills.technical || []), ...(skills.soft || [])];

        const skillItems =
          allSkillsList.length > 0
            ? allSkillsList.map((s) => (typeof s === "string" ? s : s.name || "")).filter(Boolean)
            : [
                "Microsoft NAV Dynamics",
                "Cashflow planning and management",
                "State & federal tax codes",
                "Bookkeeping",
                "Exceptional communication",
                "Fluent in German",
              ];

        const half = Math.ceil(skillItems.length / 2);
        const col1 = skillItems.slice(0, half);
        const col2 = skillItems.slice(half);

        const makeListHtml = (items) => `
          <ul style="list-style-type: disc; margin: 2px 0 0 16px; padding: 0; font-size: 11.5px; line-height: 1.55; color: #222222;">
            ${items.map((it) => `<li>${it}</li>`).join("")}
          </ul>
        `;

        if (skillCells.length >= 2) {
          skillCells[0].innerHTML = makeListHtml(col1);
          skillCells[1].innerHTML = makeListHtml(col2);
        } else if (skillCells.length === 1) {
          skillCells[0].innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>${makeListHtml(col1)}</div>
              <div>${makeListHtml(col2)}</div>
            </div>
          `;
        }
        break;
      }
    }

    return doc.body.innerHTML;
  } catch (err) {
    console.warn("DOM injection failed, rendering fallback HTML:", err);
    return processed;
  }
}

/**
 * DynamicParsedTemplate component.
 * Used for templates uploaded via Admin that are parsed from DOCX or HTML.
 */
const DynamicParsedTemplate = forwardRef(function DynamicParsedTemplate(
  { template, data = {}, rawHtml = null },
  ref
) {
  const [htmlContent, setHtmlContent] = useState(
    rawHtml || (template?.id ? parsedHtmlCache.get(template.id) : null) || ""
  );
  const [loading, setLoading] = useState(!htmlContent && !!template?.id);

  useEffect(() => {
    if (rawHtml) {
      setHtmlContent(rawHtml);
      return;
    }

    const templateId = template?.id || template?._id;
    if (!templateId) return;

    if (parsedHtmlCache.has(templateId)) {
      setHtmlContent(parsedHtmlCache.get(templateId));
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    axiosInstance
      .get(`/api/template/parse/${templateId}`)
      .then((res) => {
        if (!isMounted) return;
        const html = res.data?.html || "";
        parsedHtmlCache.set(templateId, html);
        setHtmlContent(html);
      })
      .catch((err) => {
        console.error("Failed to fetch parsed template HTML:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [template?.id, template?._id, rawHtml]);

  // Merge user form data into template HTML with polished ATS styles
  const renderedHtml = useMemo(() => {
    if (!htmlContent) return "";
    return injectResumeData(htmlContent, data);
  }, [htmlContent, data]);

  if (loading) {
    return (
      <div
        ref={ref}
        className="dynamic-docx-container flex flex-col items-center justify-center p-12 text-slate-400"
      >
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Loading uploaded template layout...</p>
      </div>
    );
  }

  if (!renderedHtml) {
    return (
      <div
        ref={ref}
        className="dynamic-docx-container p-6 bg-white text-slate-800"
      >
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
            {data.fullName || template?.name || "Your Name"}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {[data.location, data.phone, data.email, data.website]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>
        {data.summary && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="dynamic-docx-container"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
});

export default DynamicParsedTemplate;
