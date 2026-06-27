import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType,
  TabStopPosition, TabStopType, convertInchesToTwip, LevelFormat,
} from 'docx';
import { saveAs } from 'file-saver';

const CM = 567; // 1 cm in twips (approx)
const PAGE_MARGIN = 1.27 * CM * 2; // 1.27cm margins on each side

function accent2Hex(color) {
  return color?.replace('#', '') || '2563eb';
}

function bold(text, extra = {}) {
  return new TextRun({ text: String(text || ''), bold: true, ...extra });
}

function normal(text, extra = {}) {
  return new TextRun({ text: String(text || ''), ...extra });
}

function separator() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '94a3b8', space: 4 } },
    spacing: { after: 60 },
  });
}

function sectionHeading(title, accentHex) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 20, color: accentHex })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: accentHex, space: 4 } },
    spacing: { before: 180, after: 60 },
  });
}

function bulletPoint(text) {
  return new Paragraph({
    children: [new TextRun({ text: String(text || ''), size: 20 })],
    bullet: { level: 0 },
    spacing: { before: 20, after: 20 },
    indent: { left: 360 },
  });
}

// Convert a rich-text HTML description string into an array of docx Paragraphs,
// handling <p>, <ul>/<ol><li>, and inline <strong>/<b>, <em>/<i>, <u>.
function descriptionToParagraphs(html) {
  if (!html) return [];
  const trimmed = String(html).trim();
  if (!trimmed) return [];

  // Plain text (no tags) → single paragraph
  if (!/[<]/.test(trimmed)) {
    return [new Paragraph({ children: [normal(trimmed, { size: 20, color: '374151' })], spacing: { before: 20, after: 20 } })];
  }

  let doc;
  try {
    doc = new DOMParser().parseFromString(`<div>${trimmed}</div>`, 'text/html');
  } catch {
    return [new Paragraph({ children: [normal(trimmed.replace(/<[^>]+>/g, ''), { size: 20, color: '374151' })] })];
  }
  const root = doc.body.firstChild;
  const paras = [];

  function runsFromNode(node, fmt = {}) {
    const runs = [];
    node.childNodes.forEach(child => {
      if (child.nodeType === 3) {
        const text = child.textContent;
        if (text) runs.push(new TextRun({ text, size: 20, color: '374151', ...fmt }));
      } else if (child.nodeType === 1) {
        const tag = child.tagName.toLowerCase();
        const nextFmt = { ...fmt };
        if (tag === 'strong' || tag === 'b') nextFmt.bold = true;
        if (tag === 'em' || tag === 'i') nextFmt.italics = true;
        if (tag === 'u') nextFmt.underline = {};
        runs.push(...runsFromNode(child, nextFmt));
      }
    });
    return runs;
  }

  function walk(node) {
    node.childNodes.forEach(child => {
      if (child.nodeType === 3) {
        const text = child.textContent.trim();
        if (text) paras.push(new Paragraph({ children: [normal(text, { size: 20, color: '374151' })], spacing: { before: 20, after: 20 } }));
        return;
      }
      if (child.nodeType !== 1) return;
      const tag = child.tagName.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        child.querySelectorAll(':scope > li').forEach(li => {
          paras.push(new Paragraph({ children: runsFromNode(li), bullet: { level: 0 }, indent: { left: 360 }, spacing: { before: 20, after: 20 } }));
        });
      } else if (tag === 'p' || tag === 'div') {
        const runs = runsFromNode(child);
        if (runs.length) paras.push(new Paragraph({ children: runs, spacing: { before: 20, after: 20 } }));
      } else if (tag === 'br') {
        // skip
      } else {
        const runs = runsFromNode(child);
        if (runs.length) paras.push(new Paragraph({ children: runs, spacing: { before: 20, after: 20 } }));
      }
    });
  }

  walk(root);
  return paras;
}

function dateRightPara(leftChildren, rightText, accentHex) {
  return new Paragraph({
    children: [
      ...leftChildren,
      new TextRun({ text: '\t' }),
      new TextRun({ text: String(rightText || ''), color: accentHex, size: 20 }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  });
}

function buildPersonalSection(personal, settings) {
  const hidden = new Set(personal.hiddenFields || []);
  const accentHex = accent2Hex(settings?.accentColor);
  const paragraphs = [];

  // Name
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 40, color: '0f172a' })],
    spacing: { after: 40 },
  }));

  // Title
  if (personal.title) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: personal.title, size: 24, color: accentHex })],
      spacing: { after: 60 },
    }));
  }

  // Contact line
  const contactParts = [];
  if (!hidden.has('email')    && personal.email)    contactParts.push(personal.email);
  if (!hidden.has('phone')    && personal.phone)    contactParts.push(personal.phone);
  if (!hidden.has('location') && personal.location) contactParts.push(personal.location);
  if (!hidden.has('website')  && personal.website)  contactParts.push(personal.website);
  if (!hidden.has('linkedin') && personal.linkedin) contactParts.push(personal.linkedin);
  if (!hidden.has('github')   && personal.github)   contactParts.push(personal.github);

  if (contactParts.length) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join('  |  '), size: 18, color: '64748b' })],
      spacing: { after: 80 },
    }));
  }

  // Summary
  if (personal.summary) {
    paragraphs.push(separator());
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: personal.summary, size: 20, italics: true, color: '374151' })],
      spacing: { after: 80 },
    }));
  }

  return paragraphs;
}

function buildExperience(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    const dateStr = item.startDate
      ? `${item.startDate} – ${item.current ? 'Present' : (item.endDate || '')}`
      : (item.endDate || '');

    const leftChildren = [
      bold(item.company || '', { size: 20 }),
      ...(item.role ? [normal(` — ${item.role}`, { size: 20 })] : []),
      ...(section.settings?.showLocation !== false && item.location ? [normal(`, ${item.location}`, { size: 20, color: '6b7280' })] : []),
    ];

    paras.push(dateRightPara(leftChildren, section.settings?.showDates !== false ? dateStr : '', accentHex));

    if (item.description) paras.push(...descriptionToParagraphs(item.description));
    for (const b of (item.bullets || [])) {
      if (b) paras.push(bulletPoint(b));
    }
    paras.push(new Paragraph({ children: [], spacing: { after: 60 } }));
  }
  return paras;
}

function buildEducation(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    const dateStr = item.startDate ? `${item.startDate} – ${item.endDate || ''}` : (item.endDate || '');
    const leftChildren = [
      bold(item.degree || '', { size: 20 }),
      ...(item.institution ? [normal(` — ${item.institution}`, { size: 20 })] : []),
      ...(item.gpa ? [normal(` · GPA: ${item.gpa}`, { size: 20, color: '6b7280' })] : []),
    ];
    paras.push(dateRightPara(leftChildren, section.settings?.showDates !== false ? dateStr : '', accentHex));
    if (item.description) paras.push(...descriptionToParagraphs(item.description));
    for (const b of (item.bullets || [])) { if (b) paras.push(bulletPoint(b)); }
    paras.push(new Paragraph({ children: [], spacing: { after: 60 } }));
  }
  return paras;
}

function buildSkills(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  const sep = section.settings?.separator === 'dash' ? ' – ' : ': ';
  const bulletStyle = section.settings?.skillsStyle === 'bullet';
  for (const item of section.items) {
    const children = [];
    if (item.category) children.push(bold(`${item.category}${item.skills ? sep : ''}`, { size: 20, color: accentHex }));
    if (item.skills) children.push(normal(item.skills, { size: 20 }));
    if (children.length) {
      paras.push(new Paragraph({
        children,
        spacing: { after: 40 },
        ...(bulletStyle ? { bullet: { level: 0 }, indent: { left: 360 } } : {}),
      }));
    }
  }
  return paras;
}

function buildProjects(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    const dateStr = item.startDate ? `${item.startDate} – ${item.endDate || ''}` : (item.endDate || '');
    const leftChildren = [
      bold(item.name || '', { size: 20 }),
      ...(item.technologies ? [normal(` · ${item.technologies}`, { size: 20, color: '6b7280' })] : []),
      ...(item.url ? [normal(` · ${item.url}`, { size: 20, color: accentHex })] : []),
    ];
    paras.push(dateRightPara(leftChildren, section.settings?.showDates !== false ? dateStr : '', accentHex));
    if (item.description) paras.push(...descriptionToParagraphs(item.description));
    for (const b of (item.bullets || [])) { if (b) paras.push(bulletPoint(b)); }
    paras.push(new Paragraph({ children: [], spacing: { after: 60 } }));
  }
  return paras;
}

function buildLanguages(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  const row = [];
  for (const item of section.items) {
    row.push(new Paragraph({
      children: [bold(item.language, { size: 20 }), normal(` — ${item.proficiency}`, { size: 20, color: '6b7280' })],
      spacing: { after: 40 },
    }));
  }
  return [...paras, ...row];
}

function buildCertifications(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    const leftChildren = [
      bold(item.name || '', { size: 20 }),
      ...(item.issuer ? [normal(` — ${item.issuer}`, { size: 20 })] : []),
    ];
    paras.push(dateRightPara(leftChildren, section.settings?.showDates !== false ? item.date : '', accentHex));
    paras.push(new Paragraph({ children: [], spacing: { after: 40 } }));
  }
  return paras;
}

function buildAwards(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    const leftChildren = [
      bold(item.title || '', { size: 20 }),
      ...(item.issuer ? [normal(` — ${item.issuer}`, { size: 20 })] : []),
    ];
    paras.push(dateRightPara(leftChildren, section.settings?.showDates !== false ? item.date : '', accentHex));
    if (item.description) paras.push(...descriptionToParagraphs(item.description));
    paras.push(new Paragraph({ children: [], spacing: { after: 40 } }));
  }
  return paras;
}

function buildVolunteering(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    const dateStr = item.startDate ? `${item.startDate} – ${item.endDate || ''}` : '';
    const leftChildren = [
      bold(item.role || '', { size: 20 }),
      ...(item.org ? [normal(` — ${item.org}`, { size: 20 })] : []),
    ];
    paras.push(dateRightPara(leftChildren, section.settings?.showDates !== false ? dateStr : '', accentHex));
    if (item.description) paras.push(...descriptionToParagraphs(item.description));
    for (const b of (item.bullets || [])) { if (b) paras.push(bulletPoint(b)); }
    paras.push(new Paragraph({ children: [], spacing: { after: 60 } }));
  }
  return paras;
}

function buildReferences(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    paras.push(new Paragraph({ children: [bold(item.name, { size: 20 })], spacing: { after: 20 } }));
    if (item.jobTitle) paras.push(new Paragraph({ children: [normal(item.jobTitle, { size: 20, color: '6b7280' })], spacing: { after: 20 } }));
    if (item.company) paras.push(new Paragraph({ children: [normal(item.company, { size: 20, color: '6b7280' })], spacing: { after: 20 } }));
    if (item.email) paras.push(new Paragraph({ children: [normal(item.email, { size: 20, color: accentHex })], spacing: { after: 20 } }));
    paras.push(new Paragraph({ children: [], spacing: { after: 60 } }));
  }
  return paras;
}

function buildInterests(section, accentHex) {
  const allInterests = section.items.map(i => i.interests).filter(Boolean).join(', ');
  return [
    sectionHeading(section.title, accentHex),
    new Paragraph({ children: [normal(allInterests, { size: 20 })], spacing: { after: 60 } }),
  ];
}

function buildCustom(section, accentHex) {
  const paras = [sectionHeading(section.title, accentHex)];
  for (const item of section.items) {
    const leftChildren = [
      ...(item.title ? [bold(item.title, { size: 20 })] : []),
      ...(item.subtitle ? [normal(` — ${item.subtitle}`, { size: 20 })] : []),
    ];
    paras.push(dateRightPara(leftChildren, item.date || '', accentHex));
    if (item.description) paras.push(...descriptionToParagraphs(item.description));
    for (const b of (item.bullets || [])) { if (b) paras.push(bulletPoint(b)); }
    paras.push(new Paragraph({ children: [], spacing: { after: 60 } }));
  }
  return paras;
}

function buildSection(section, accentHex) {
  if (!section.items?.length) return [];
  switch (section.type) {
    case 'experience':     return buildExperience(section, accentHex);
    case 'education':      return buildEducation(section, accentHex);
    case 'skills':         return buildSkills(section, accentHex);
    case 'projects':       return buildProjects(section, accentHex);
    case 'languages':      return buildLanguages(section, accentHex);
    case 'certifications': return buildCertifications(section, accentHex);
    case 'awards':         return buildAwards(section, accentHex);
    case 'volunteering':   return buildVolunteering(section, accentHex);
    case 'references':     return buildReferences(section, accentHex);
    case 'interests':      return buildInterests(section, accentHex);
    default:               return buildCustom(section, accentHex);
  }
}

export async function exportToWord(resumeData, filename = 'resume.docx') {
  const { personal, sections, settings } = resumeData;
  const accentHex = accent2Hex(settings?.accentColor);

  const children = [
    ...buildPersonalSection(personal, settings),
    ...sections.flatMap(s => buildSection(s, accentHex)),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 20 },
          paragraph: { spacing: { after: 40 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.75),
            right: convertInchesToTwip(0.75),
            bottom: convertInchesToTwip(0.75),
            left: convertInchesToTwip(0.75),
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
