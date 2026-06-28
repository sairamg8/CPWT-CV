# Tasksheet: Replace window.print() with @react-pdf/renderer

**Goal:** Replace the current `window.print()` PDF export with `@react-pdf/renderer` so the
downloaded resume PDF is 100% ATS-friendly — real searchable text, no font swaps, no empty
pages, no print CSS workarounds.

**Project:** CPWT-CV resume builder (React 19 + Vite 8 + Tailwind v4)
**Repo:** https://github.com/sairamg8/CPWT-CV
**Last worked:** Jun 2026 Session 4. PR #9 (empty page fix) merged to main.

---

## Context — Why This Change

### Current approach (bad)
- `src/utils/pdfExport.js` clones the off-screen HTML div, injects a print portal, and calls `window.print()`
- Print CSS swaps Noto Sans → Arial to get ATS-readable text (Workday fix from PRs #6–#8)
- This causes canvas/PDF mismatch (preview shows Noto Sans, PDF uses Arial)
- Font swap + page reflow causes near-empty trailing pages (fixed in PR #9, but fragile)
- Print approach is fundamentally brittle — browser print dialogs, no programmatic control

### Target approach (good)
- `@react-pdf/renderer` generates a PDF Blob entirely in the browser — no print dialog
- PDF contains real text with proper Unicode font mappings — ATS parsers read it perfectly
- Canvas preview stays as HTML (fast, unchanged)
- Each template has TWO renderers: HTML (preview) and PDF (download)
- Once complete: delete `pdfExport.js`, remove all print CSS, remove ATS font-swap workarounds

---

## Architecture

```
src/
  templates/
    ClassicTemplate.jsx          <- HTML preview (KEEP, unchanged)
    ModernTemplate.jsx           <- HTML preview (KEEP)
    MinimalTemplate.jsx          <- HTML preview (KEEP)
    SidebarTemplate.jsx          <- HTML preview (KEEP)
    ExecutiveTemplate.jsx        <- HTML preview (KEEP)
    pdf/                         <- NEW directory
      shared/
        PdfPage.jsx              <- Page wrapper + font registration + margin constants
        PdfSection.jsx           <- Section with all 6 heading styles
        PdfRichText.jsx          <- HTML string -> PDF Text nodes
      ClassicTemplatePDF.jsx     <- PDF version of Classic
      ModernTemplatePDF.jsx      <- PDF version of Modern
      MinimalTemplatePDF.jsx     <- PDF version of Minimal
      SidebarTemplatePDF.jsx     <- PDF version of Sidebar
      ExecutiveTemplatePDF.jsx   <- PDF version of Executive

  utils/
    pdfExportReactPDF.js         <- NEW: exportToPDFReact(resume, filename) -> triggers download
    pdfExport.js                 <- KEEP during transition, DELETE when all templates done

  constants/
    resume.js                    <- Add PDF_TEMPLATE_MAP alongside TEMPLATE_MAP
```

---

## Step-by-Step Tasks

### TASK 1 — Install @react-pdf/renderer

```bash
npm install @react-pdf/renderer
```

Verify it installed: check `node_modules/@react-pdf/renderer/package.json` — should be v3.x.
React 19 is supported. No extra Vite config needed.

---

### TASK 2 — Create shared PDF primitives

**File: `src/templates/pdf/shared/PdfPage.jsx`**

Page wrapper with font registration and margin constants.

```jsx
import { Font, StyleSheet } from '@react-pdf/renderer';

// Register Noto Sans from Google Fonts CDN
// NOTE: Get the actual woff2 URLs by opening:
//   https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400
// in a browser and copying the src: url(...) values.
// If URLs fail, @react-pdf falls back to Helvetica silently — check browser console.
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNjXhFVZNyB1Wk.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNjThZVZNyB1Wk.woff2', fontWeight: 700 },
    {
      src: 'https://fonts.gstatic.com/s/notosans/v36/o-0OIpQlx3QUlC5A4PNj_j5-UUk.woff2',
      fontStyle: 'italic', fontWeight: 400,
    },
  ],
});

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#111111',
    backgroundColor: 'white',
  },
});
```

---

**File: `src/templates/pdf/shared/PdfSection.jsx`**

Section heading renderer — supports all 6 heading styles.

```jsx
import { View, Text } from '@react-pdf/renderer';

// headingStyle: 'ruled' | 'leftbar' | 'line' | 'underline' | 'box' | 'plain'
export function PdfSectionTitle({ title, headingStyle = 'ruled', accent = '#374151', sectionTitleCase = 'upper' }) {
  const label = sectionTitleCase === 'upper' ? title.toUpperCase() : title;
  const base = { fontSize: 10, fontWeight: 'bold', color: accent };

  if (headingStyle === 'ruled') {
    return (
      <View style={{ marginBottom: 6 }}>
        <Text style={base}>{label}</Text>
        <View style={{ height: 1, backgroundColor: accent }} />
      </View>
    );
  }
  if (headingStyle === 'underline') {
    return (
      <View style={{ marginBottom: 6, borderBottom: `1pt solid ${accent}`, paddingBottom: 1 }}>
        <Text style={base}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'leftbar') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ width: 3, backgroundColor: accent, alignSelf: 'stretch', marginRight: 6 }} />
        <Text style={base}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'box') {
    return (
      <View style={{ backgroundColor: accent, paddingVertical: 3, paddingHorizontal: 6, marginBottom: 6 }}>
        <Text style={{ ...base, color: 'white' }}>{label}</Text>
      </View>
    );
  }
  if (headingStyle === 'line') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ ...base, marginRight: 8 }}>{label}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: accent }} />
      </View>
    );
  }
  // plain
  return <Text style={{ ...base, marginBottom: 6 }}>{label}</Text>;
}
```

---

**File: `src/templates/pdf/shared/PdfRichText.jsx`**

Parses HTML from RichTextEditor (which stores content as HTML strings) into PDF Text nodes.
RichTextEditor produces: `<p>`, `<strong>`, `<em>`, `<ul>/<li>`, `<br>`.

```jsx
import { Text, View } from '@react-pdf/renderer';

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function parseInlineSegments(html, baseStyle) {
  // Marks bold/italic with sentinel characters, then splits into Text nodes
  const marked = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '\x01$1\x02')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '\x01$1\x02')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '\x03$1\x04')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '\x03$1\x04')
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '');

  const clean = decodeEntities(marked);
  const parts = clean.split(/(\x01[\s\S]*?\x02|\x03[\s\S]*?\x04)/);

  return parts.map((part, i) => {
    if (part.startsWith('\x01') && part.endsWith('\x02')) {
      return <Text key={i} style={{ ...baseStyle, fontWeight: 'bold' }}>{part.slice(1, -1)}</Text>;
    }
    if (part.startsWith('\x03') && part.endsWith('\x04')) {
      return <Text key={i} style={{ ...baseStyle, fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
    }
    return part ? <Text key={i} style={baseStyle}>{part}</Text> : null;
  }).filter(Boolean);
}

export function PdfRichText({ html, style = {} }) {
  if (!html) return null;

  const elements = [];
  let src = html;

  // Extract list blocks first (replace with placeholder)
  const lists = [];
  src = src.replace(/<(ul|ol)>([\s\S]*?)<\/\1>/gi, (_, tag, inner) => {
    const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map(m => m[1]);
    const idx = lists.length;
    lists.push(items);
    return `\x05${idx}\x06`;
  });

  // Split remaining into paragraphs
  const parts = src.split(/\x05(\d+)\x06|<\/p>/).filter(Boolean);

  for (const part of parts) {
    const listMatch = part.match(/^(\d+)$/);
    if (listMatch) {
      const items = lists[parseInt(listMatch[1])];
      items.forEach((item, i) => {
        elements.push(
          <View key={`li-${elements.length}-${i}`} style={{ flexDirection: 'row', marginBottom: 1 }}>
            <Text style={{ ...style, width: 10 }}>{'•'}</Text>
            <Text style={{ ...style, flex: 1 }}>{parseInlineSegments(item, style)}</Text>
          </View>
        );
      });
    } else {
      const stripped = part.replace(/<p[^>]*>/gi, '').replace(/<[^>]+>/g, '').trim();
      if (!stripped) continue;
      const inline = parseInlineSegments(part.replace(/<p[^>]*>/gi, ''), style);
      if (inline.length) {
        elements.push(
          <Text key={`p-${elements.length}`} style={{ ...style, marginBottom: 2 }}>
            {inline}
          </Text>
        );
      }
    }
  }

  return <>{elements}</>;
}
```

---

### TASK 3 — Build ClassicTemplatePDF (proof of concept)

File: `src/templates/pdf/ClassicTemplatePDF.jsx`

Reference the HTML version at `src/templates/ClassicTemplate.jsx` to match the layout.

```jsx
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfSectionTitle } from './shared/PdfSection';
import { PdfRichText } from './shared/PdfRichText';
import { styles as pageStyles } from './shared/PdfPage';

const s = StyleSheet.create({
  name:        { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  jobTitle:    { fontSize: 12, marginBottom: 6, color: '#374151' },
  contactRow:  { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  contactItem: { fontSize: 9, color: '#4b5563', marginRight: 14 },
  section:     { marginBottom: 14 },
  entryWrap:   { marginBottom: 8 },
  entryRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  entryTitle:  { fontSize: 10, fontWeight: 'bold', color: '#111111' },
  entryMeta:   { fontSize: 9, color: '#4b5563' },
  entryDate:   { fontSize: 9, color: '#4b5563' },
  body:        { fontSize: 9.5, color: '#333333', lineHeight: 1.5 },
  skillRow:    { flexDirection: 'row', marginBottom: 3 },
  skillCat:    { fontSize: 9.5, fontWeight: 'bold', color: '#111111', width: 100 },
  skillVal:    { fontSize: 9.5, color: '#333333', flex: 1 },
});

function ContactItems({ personal }) {
  const hidden = personal?.hiddenFields || [];
  const items = [
    !hidden.includes('email')    && personal?.email,
    !hidden.includes('phone')    && personal?.phone,
    !hidden.includes('location') && personal?.location,
    !hidden.includes('website')  && (personal?.websiteLabel || personal?.website),
    !hidden.includes('linkedin') && (personal?.linkedinLabel || personal?.linkedin),
    !hidden.includes('github')   && (personal?.githubLabel   || personal?.github),
  ].filter(Boolean);

  return (
    <View style={s.contactRow}>
      {items.map((item, i) => <Text key={i} style={s.contactItem}>{item}</Text>)}
    </View>
  );
}

function ExperienceItem({ item, settings }) {
  return (
    <View style={s.entryWrap} wrap={false}>
      <View style={s.entryRow}>
        <View style={{ flex: 1 }}>
          <Text style={[s.entryTitle, { color: settings?.accentColor || '#111111' }]}>
            {item.role || item.title}
          </Text>
          {item.company && (
            <Text style={s.entryMeta}>
              {item.company}{item.location ? ` · ${item.location}` : ''}
            </Text>
          )}
        </View>
        <Text style={s.entryDate}>
          {item.start}{item.end ? ` – ${item.end}` : ' – Present'}
        </Text>
      </View>
      {item.description && <PdfRichText html={item.description} style={s.body} />}
    </View>
  );
}

function SectionRouter({ section, settings }) {
  if (!section.visible) return null;
  const titleProps = {
    title: section.title,
    headingStyle: settings?.headingStyle,
    accent: settings?.accentColor,
    sectionTitleCase: settings?.sectionTitleCase,
  };

  if (section.type === 'experience') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <ExperienceItem key={i} item={item} settings={settings} />
        ))}
      </View>
    );
  }

  if (section.type === 'skills') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <View key={i} style={s.skillRow}>
            {item.category && <Text style={s.skillCat}>{item.category}:</Text>}
            <Text style={s.skillVal}>
              {Array.isArray(item.skills) ? item.skills.join(', ') : item.skills}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (section.type === 'education') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <View key={i} style={[s.entryWrap, { marginBottom: 6 }]} wrap={false}>
            <View style={s.entryRow}>
              <Text style={s.entryTitle}>{item.institution || item.school}</Text>
              {(item.start || item.end) && (
                <Text style={s.entryDate}>
                  {item.start}{item.end ? ` – ${item.end}` : ''}
                </Text>
              )}
            </View>
            {item.degree && (
              <Text style={s.entryMeta}>
                {item.degree}{item.field ? `, ${item.field}` : ''}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }

  if (section.type === 'certifications') {
    return (
      <View style={s.section}>
        <PdfSectionTitle {...titleProps} />
        {section.items?.map((item, i) => (
          <View key={i} style={[s.entryWrap, { marginBottom: 4 }]} wrap={false}>
            <View style={s.entryRow}>
              <Text style={s.entryTitle}>{item.name || item.title}</Text>
              {item.date && <Text style={s.entryDate}>{item.date}</Text>}
            </View>
            {item.issuer && <Text style={s.entryMeta}>{item.issuer}</Text>}
          </View>
        ))}
      </View>
    );
  }

  // projects / custom / any unknown type
  return (
    <View style={s.section}>
      <PdfSectionTitle {...titleProps} />
      {section.items?.map((item, i) => (
        <View key={i} style={[s.entryWrap, { marginBottom: 6 }]}>
          {item.title && <Text style={s.entryTitle}>{item.title}</Text>}
          {item.description && <PdfRichText html={item.description} style={s.body} />}
        </View>
      ))}
    </View>
  );
}

export function ClassicTemplatePDF({ data }) {
  const { personal, sections = [], settings = {} } = data;
  const vMm = settings.marginV ?? 14;
  const hMm = settings.marginH ?? 18;
  const accent = settings.accentColor || '#374151';

  return (
    <Document>
      <Page
        size="A4"
        style={[
          pageStyles.page,
          {
            paddingTop: vMm,
            paddingBottom: vMm,
            paddingLeft: hMm,
            paddingRight: hMm,
            fontSize: settings.fontSizeBase || 11,
            lineHeight: settings.lineHeightValue || 1.5,
          },
        ]}
      >
        {/* Header */}
        <View style={{ marginBottom: 10 }}>
          <Text style={[s.name, { color: accent, fontSize: (settings.fontSizeBase || 11) + (settings.fontSizeNameDelta || 8) }]}>
            {personal?.name}
          </Text>
          {personal?.title && (
            <Text style={[s.jobTitle, { fontSize: (settings.fontSizeBase || 11) + 1 }]}>
              {personal.title}
            </Text>
          )}
          {personal?.summary && (
            <PdfRichText html={personal.summary} style={{ ...s.body, marginBottom: 6 }} />
          )}
          <ContactItems personal={personal} />
        </View>

        {/* Sections */}
        {sections.map((section) => (
          <SectionRouter key={section.id} section={section} settings={settings} />
        ))}
      </Page>
    </Document>
  );
}
```

---

### TASK 4 — Create pdfExportReactPDF.js

File: `src/utils/pdfExportReactPDF.js`

```js
import { pdf } from '@react-pdf/renderer';

// Lazy imports for code splitting — each template PDF is ~20KB extra gzip
const LOADERS = {
  classic:   () => import('@/templates/pdf/ClassicTemplatePDF').then(m => m.ClassicTemplatePDF),
  modern:    () => import('@/templates/pdf/ModernTemplatePDF').then(m => m.ModernTemplatePDF),
  minimal:   () => import('@/templates/pdf/MinimalTemplatePDF').then(m => m.MinimalTemplatePDF),
  sidebar:   () => import('@/templates/pdf/SidebarTemplatePDF').then(m => m.SidebarTemplatePDF),
  executive: () => import('@/templates/pdf/ExecutiveTemplatePDF').then(m => m.ExecutiveTemplatePDF),
};

export async function exportToPDFReact(resume, filename = 'resume.pdf') {
  const key = resume?.template || 'classic';
  const load = LOADERS[key] || LOADERS.classic;
  const TemplatePDF = await load();

  const element = <TemplatePDF data={resume} />;
  const blob = await pdf(element).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

Note: `pdf()` needs React in scope. Make sure to add `import React from 'react'` at the top
if Vite/esbuild doesn't inject it automatically (check if other files use JSX without the import).

---

### TASK 5 — Wire up Editor.jsx (test Classic first)

Find the PDF export handler in `src/pages/Editor.jsx`. Search for `exportToPDF` to find it.

Add the new import and test with Classic only:

```jsx
import { exportToPDFReact } from '@/utils/pdfExportReactPDF';

// In the handler (replace or augment the existing exportToPDF call):
const handleExportPDF = async () => {
  setIsExporting(true);
  try {
    await exportToPDFReact(resume, `${resume.name || 'resume'}.pdf`);
  } finally {
    setIsExporting(false);
  }
};
```

**Test checklist for Classic before moving on:**
- [ ] PDF downloads without console errors
- [ ] PDF opens and text is selectable (not an image)
- [ ] Copy-paste name from PDF — correct text, no garbled chars
- [ ] All sections appear: skills, experience, education, certs
- [ ] Section headings match canvas preview (try all 6 heading styles)
- [ ] Margin, font size, accent color from settings are applied
- [ ] Long resume: page breaks at correct positions (not mid-sentence)
- [ ] Paste into ATS checker (Jobscan) — all fields parsed correctly

---

### TASK 6 — Build remaining template PDFs

Once Classic is verified, build the other 4. Each one should follow the same pattern.
Reference the HTML template in `src/templates/` to understand the layout.

**ModernTemplatePDF** (`src/templates/pdf/ModernTemplatePDF.jsx`):
- Header: large name with accent color, job title, contact row
- Full-width layout (no sidebar)
- Use `headingStyle === 'line'` as default (matches ModernTemplate HTML default)

**MinimalTemplatePDF** (`src/templates/pdf/MinimalTemplatePDF.jsx`):
- Header: left-aligned, clean, minimal decoration
- Default headingStyle: `underline`
- More whitespace between sections

**SidebarTemplatePDF** (`src/templates/pdf/SidebarTemplatePDF.jsx`):
- TWO-COLUMN LAYOUT — the most complex one:
  ```jsx
  <Page style={{ flexDirection: 'row', ...pageStyles.page }}>
    {/* Sidebar — 35% width, colored background */}
    <View style={{
      width: '35%',
      backgroundColor: settings.sidebarBg || '#1e293b',
      paddingTop: vMm, paddingBottom: vMm,
      paddingLeft: hMm * 0.6, paddingRight: hMm * 0.6,
      minHeight: '100%'
    }}>
      {/* Name, contact, skills in sidebar */}
    </View>
    {/* Main content — remaining 65% */}
    <View style={{ flex: 1, paddingTop: vMm, paddingBottom: vMm, paddingLeft: hMm * 0.8, paddingRight: hMm }}>
      {/* Experience, education, certs in main */}
    </View>
  </Page>
  ```
- Sidebar text color: `settings.headerTextColor || '#ffffff'`
- Section headings in sidebar: use `plain` or `leftbar` style with white accent
- Contact items in sidebar: one per line (vertical, not horizontal row)

**ExecutiveTemplatePDF** (`src/templates/pdf/ExecutiveTemplatePDF.jsx`):
- Default: `headingStyle === 'underline'`, `sectionTitleCase === 'normal'`
- Role: `fontWeight: 'bold'`
- Company: `fontStyle: 'italic'`
- Date and location: stacked right column
- Accent color on name and section headings

---

### TASK 7 — Switch all templates to react-pdf export

Once all 5 PDF templates verified:
1. Change `handleExportPDF` in Editor.jsx to always use `exportToPDFReact` (remove the old call)
2. Keep old `pdfExport.js` for now (safety net)
3. Open PR, describe what changed and ATS improvement

---

### TASK 8 — Cleanup (final PR)

1. Delete `src/utils/pdfExport.js`
2. Remove the `#resume-preview` off-screen div from PaginatedPreview — WAIT, check if it's
   still used for PDF thumbnail or measurement. If pdfExport.js is deleted, check if
   `document.getElementById('resume-preview')` is called anywhere else.
3. Remove `@media print` styles from all CSS files (global and component-level)
4. Remove ATS print-portal logic (no longer needed)

---

## Data Model Quick Reference

Each `resume` object passed to PDF templates has this shape:

```js
{
  id, name, template,
  personal: {
    name, title, email, phone, location,
    website, websiteLabel, websiteUrl,
    linkedin, linkedinLabel, linkedinUrl,
    github, githubLabel, githubUrl,
    summary,                     // may be HTML string
    hiddenFields: string[],      // field names to hide
  },
  sections: [{
    id, type, title,
    visible: boolean,
    items: [...]
  }],
  settings: {
    fontSizeBase: 11,            // px — base font size
    fontSizeNameDelta: 8,        // added to base for the name
    fontSizeSectionDelta: 1,     // added to base for section titles
    lineHeightValue: 1.5,
    marginV: 14,                 // mm top + bottom
    marginH: 18,                 // mm left + right
    accentColor: '#374151',
    textColor: '#111111',
    headingStyle: 'ruled',       // 'ruled'|'leftbar'|'line'|'underline'|'box'|'plain'
    sectionTitleCase: 'upper',   // 'upper'|'normal'
    sectionGap: 16,              // px gap between sections
    itemGap: 12,                 // px gap between items
    sidebarBg: '#1e293b',        // sidebar template only
    headerTextColor: '#ffffff',  // sidebar template only
  }
}
```

### Section item shapes by type

| type | key fields |
|------|-----------|
| `experience` | `role`, `company`, `location`, `start`, `end`, `description` (HTML) |
| `education` | `institution` (or `school`), `degree`, `field`, `start`, `end`, `gpa` |
| `skills` | `category`, `skills` (string or array) |
| `certifications` | `name` (or `title`), `issuer`, `date`, `url` |
| `projects` | `title`, `description` (HTML), `url`, `start`, `end` |
| `custom` | `title`, `description` (HTML) |

---

## Known Gotchas

1. **Font URL validity** — Google Fonts CDN woff2 URLs change when fonts are updated.
   Always test by checking the browser Network tab during PDF generation. If you see a
   font 404, update the URL from Google Fonts CSS. Fallback is Helvetica (built-in).

2. **`gap` property** — react-pdf v3 supports `columnGap` and `rowGap`, not `gap`.
   Use `marginRight` / `marginBottom` on items if these don't work.

3. **No SVG icons** — Do NOT import Lucide or custom SVG into PDF templates.
   Contact info is text-only. This is better for ATS anyway.

4. **`borderBottom` as string** — react-pdf accepts `borderBottom: '1pt solid #000'` as a
   shorthand, but some properties need longhand: `borderBottomWidth`, `borderBottomColor`,
   `borderBottomStyle`.

5. **`wrap={false}` on View** — Prevents a block from splitting across pages. Use this on
   each experience entry so a job description doesn't break mid-sentence.

6. **PDF vs pt vs mm** — react-pdf uses pt (1pt = 1/72 inch) for most measurements, but
   accepts `mm` as a string (e.g., `width: '210mm'`). The `Page size="A4"` is 595pt × 841pt.
   Our margin values are in mm (from settings.marginV/H) — pass them directly as numbers
   since react-pdf accepts them as pt-equivalent when numbers, or use `${n}mm` strings.

   Actually: use string form for mm values: `paddingTop: `${settings.marginV}mm``

7. **Personal summary HTML** — `personal.summary` is stored as an HTML string (from
   RichTextEditor). Always use `<PdfRichText html={personal.summary} />` — never render it
   as raw text.

8. **`minHeight: '100%'` on sidebar** — This ensures the sidebar background extends the full
   page height even when the main column is longer. This is a known react-pdf trick.

---

## Key Files to Read at Session Start

```
src/pages/Editor.jsx              -- find handleExportPDF / exportToPDF call
src/templates/ClassicTemplate.jsx -- reference HTML layout for ClassicTemplatePDF
src/templates/SidebarTemplate.jsx -- reference for two-column layout
src/utils/defaultData.js          -- Sairam's actual resume data (use for testing)
src/utils/pdfExport.js            -- old code being replaced (understand what it does)
```

---

## Session Start Prompt

Copy this into the next Claude session to orient it:

```
Read .claude/TASKSHEET_REACT_PDF.md in this repo. This is the full tasksheet for replacing
window.print() with @react-pdf/renderer for 100% ATS-friendly PDF export. Also read
/home/gudiputi/.claude/projects/-home-gudiputi-Documents-flowcv/memory/MEMORY.md for project context.

Start with TASK 1 (npm install) and TASK 2 (shared primitives in src/templates/pdf/shared/).
Then TASK 3 (ClassicTemplatePDF.jsx as proof of concept). Test it end-to-end before moving
to other templates.

Always branch from origin/main. Use git worktrees for isolation (EnterWorktree tool).
main is at: d3adfb7 (PR #9 merged Jun 2026).
```

---

## Current State of main (Jun 2026)

- PR #9 merged: fixed canvas empty 4th page (tolerance + collapse in computeRanges)
- PRs #6–#8 merged: Workday ATS font fixes (Arial swap, bold removal, SVG hide in print)
- 5 HTML templates working: Classic, Modern, Minimal, Sidebar, Executive
- DATA_VERSION = 5, JOB_VERSION = 2
- Vite path alias: `@/` -> `src/`
- No active PRs or in-flight work on main
