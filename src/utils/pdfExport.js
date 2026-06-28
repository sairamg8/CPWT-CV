// Replicated from App.jsx — needed to compute page breaks for print
function collectLeaves(root) {
  const base = root.getBoundingClientRect().top;
  const leaves = [];
  function isBlockish(el) {
    const d = getComputedStyle(el).display;
    return d.includes('block') || d.includes('flex') || d.includes('grid') || d.includes('list-item') || d.includes('table');
  }
  function walk(el) {
    for (const child of el.children) {
      const hasBlockChild = Array.from(child.children).some(isBlockish);
      if (!hasBlockChild) {
        const r = child.getBoundingClientRect();
        if (r.height > 0) leaves.push({ top: r.top - base, bottom: r.bottom - base });
      } else {
        walk(child);
      }
    }
  }
  walk(root);
  leaves.sort((a, b) => a.top - b.top || a.bottom - b.bottom);
  return leaves;
}

function computeRanges(contentEl, pageContentPx) {
  const leaves = collectLeaves(contentEl);
  const total = contentEl.scrollHeight;
  if (!leaves.length) return [{ start: 0, height: total }];

  const ranges = [];
  let start = 0;
  let i = 0;
  while (i < leaves.length && ranges.length < 40) {
    const limit = start + pageContentPx;
    let j = i;
    while (j < leaves.length && leaves[j].bottom <= limit + 0.5) j++;
    if (j === i) {
      ranges.push({ start, height: pageContentPx });
      start += pageContentPx;
      while (i < leaves.length && leaves[i].top < start - 0.5) i++;
    } else {
      const nextStart = j < leaves.length ? leaves[j].top : total;
      ranges.push({ start, height: nextStart - start });
      start = nextStart;
      i = j;
    }
  }
  if (start < total - 1) ranges.push({ start, height: total - start });
  return ranges;
}

const PX_PER_MM = 3.7795275591;

// Parse '14mm 18mm' → { v: 14, h: 18 } (values in mm)
function parseMargin(margin) {
  const parts = margin.trim().split(/\s+/);
  const v = parseFloat(parts[0]) || 0;
  const h = parseFloat(parts[1] ?? parts[0]) || 0;
  return { v, h };
}

export function exportToPDF(elementId, filename = 'resume.pdf', pageMargin = '14mm 18mm') {
  // The outer wrapper: id="resume-preview", has width:210mm, padding:margin, fontSize, lineHeight
  // Its firstElementChild is the measured content div (contentRef)
  const outer = document.getElementById(elementId);
  if (!outer) return Promise.resolve();

  const contentEl = outer.firstElementChild;
  if (!contentEl) return Promise.resolve();

  return new Promise(resolve => {
    const { v: vMm } = parseMargin(pageMargin);
    const pageContentMm = 297 - 2 * vMm;
    const pageContentPx = pageContentMm * PX_PER_MM;

    const ranges = computeRanges(contentEl, pageContentPx);

    const fontSize = outer.style.fontSize || '11px';
    const lineHeight = outer.style.lineHeight || '1.5';

    // Build one explicit A4 div per page so each page gets correct margins
    // and @page { margin: 0 } suppresses browser URL/date/title decorations
    const portal = document.createElement('div');
    portal.id = '__cpwtcv_print_portal__';

    ranges.forEach(range => {
      const page = document.createElement('div');
      page.className = '__cpwtcv_page__';
      page.style.cssText = [
        'width: 210mm',
        'height: 297mm',
        `padding: ${pageMargin}`,
        'box-sizing: border-box',
        'overflow: hidden',
        'background: white',
        `font-size: ${fontSize}`,
        `line-height: ${lineHeight}`,
      ].join('; ');

      const clip = document.createElement('div');
      clip.style.cssText = `overflow: hidden; height: ${Math.min(range.height, pageContentPx)}px`;

      const contentClone = contentEl.cloneNode(true);
      contentClone.style.transform = `translateY(-${range.start}px)`;
      // Preserve any inline positioning overrides from the original
      contentClone.style.position = '';

      clip.appendChild(contentClone);
      page.appendChild(clip);
      portal.appendChild(page);
    });

    document.body.appendChild(portal);

    const style = document.createElement('style');
    style.id = '__cpwtcv_print_style__';
    style.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          height: auto !important;
          overflow: visible !important;
        }
        body > *:not(#__cpwtcv_print_portal__) { display: none !important; }
        #__cpwtcv_print_portal__ { display: block !important; }
        .__cpwtcv_page__ { page-break-after: always; }
        .__cpwtcv_page__:last-child { page-break-after: auto; }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* ATS COMPATIBILITY — override web font with a system font so Chrome's PDF
           engine uses standard glyph-to-Unicode mappings instead of a custom subset
           that some ATS parsers (e.g. Workday) misread (e.g. "WoW" → "Work"). */
        #__cpwtcv_print_portal__ * {
          font-family: Arial, Helvetica, 'Liberation Sans', sans-serif !important;
        }

        /* ATS COMPATIBILITY — strip bold from job-description content.
           Bold <strong>/<b> project sub-headers inside descriptions (e.g.
           "RFP Tool – Philips") look like new company/entry headers to ATS parsers,
           causing them to lose the actual company name for that entry. */
        #__cpwtcv_print_portal__ .rich-text-output strong,
        #__cpwtcv_print_portal__ .rich-text-output b {
          font-weight: normal !important;
        }
      }
    `;
    document.head.appendChild(style);

    const originalTitle = document.title;
    document.title = '';

    function cleanup() {
      document.title = originalTitle;
      style.remove();
      portal.remove();
      window.removeEventListener('afterprint', cleanup);
      resolve();
    }

    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 60000);
  });
}
