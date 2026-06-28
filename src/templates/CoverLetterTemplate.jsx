import { Mail, Phone, MapPin, Globe, Link2, Code } from 'lucide-react';
import { getFontById } from '@/utils/fonts';

function photoStyle(settings, accent) {
  const sh = settings?.photoShape || 'circle';
  const sz = settings?.photoSize || 'md';
  const br = settings?.photoBorder || 'accent';
  const ph = settings?.photoHeight || 'match';
  const w = sz === 'sm' ? 130 : sz === 'lg' ? 200 : 165;
  const h = sh === 'circle' ? w : ph === 'tall' ? Math.round(w * 1.4) : ph === 'taller' ? Math.round(w * 1.8) : w;
  return {
    width: w + 'px',
    height: h + 'px',
    borderRadius: sh === 'rounded' ? '8px' : sh === 'square' ? '2px' : '50%',
    border: br === 'none' ? 'none' : br === 'thin' ? '1.5px solid #e5e7eb' : `1.5px solid ${accent}60`,
    objectFit: 'cover',
    flexShrink: 0,
  };
}

const CONTACT_FIELDS = [
  { key: 'email',    Icon: Mail   },
  { key: 'phone',    Icon: Phone  },
  { key: 'location', Icon: MapPin },
  { key: 'website',  Icon: Globe  },
  { key: 'linkedin', Icon: Link2  },
  { key: 'github',   Icon: Code   },
];

function contactHref(key, val) {
  if (key === 'email') return `mailto:${val}`;
  if (key === 'phone') return `tel:${val.replace(/\s/g, '')}`;
  if (key === 'website' || key === 'linkedin' || key === 'github') {
    return val.startsWith('http') ? val : `https://${val}`;
  }
  return null;
}

function ContactRow({ personal, hidden, style, layout, iconSize = 11 }) {
  const items = CONTACT_FIELDS.filter(({ key }) => !hidden.has(key) && personal?.[key]);
  if (!items.length) return null;

  const color = '#64748b';
  const lyt = layout || 'justify';

  function decorated(key, Icon) {
    const val = personal[key];
    const href = contactHref(key, val);
    const display = href
      ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{val}</a>
      : val;
    if (style === 'icon') return (
      <span key={key} className="flex items-center gap-1" style={{ overflowWrap: 'anywhere' }}>
        <Icon size={iconSize} className="shrink-0" />{display}
      </span>
    );
    if (style === 'bullet') return (
      <span key={key} className="flex items-center gap-1" style={{ overflowWrap: 'anywhere' }}>
        <span style={{ color: '#cbd5e1' }}>•</span>{display}
      </span>
    );
    return <span key={key} style={{ overflowWrap: 'anywhere' }}>{display}</span>;
  }

  if (lyt === 'single') {
    return (
      <div className="space-y-0.5" style={{ color }}>
        {items.map(({ key, Icon }) => <div key={key}>{decorated(key, Icon)}</div>)}
      </div>
    );
  }

  if (lyt === '2grid') {
    return (
      <div style={{ color, display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 16px' }}>
        {items.map(({ key, Icon }) => decorated(key, Icon))}
      </div>
    );
  }

  // justify
  if (style === 'icon') {
    return (
      <div className="flex flex-wrap items-center" style={{ color, gap: '2px 14px' }}>
        {items.map(({ key, Icon }) => decorated(key, Icon))}
      </div>
    );
  }
  if (style === 'bullet') {
    return (
      <div className="flex flex-wrap items-center" style={{ color }}>
        {items.map(({ key }, i) => {
          const val = personal[key];
          const href = contactHref(key, val);
          return (
            <span key={key} className="flex items-center">
              {i > 0 && <span className="mx-1.5" style={{ color: '#cbd5e1' }}>•</span>}
              {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{val}</a> : <span>{val}</span>}
            </span>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center" style={{ color }}>
      {items.map(({ key }, i) => {
        const val = personal[key];
        const href = contactHref(key, val);
        return (
          <span key={key} className="flex items-center">
            {i > 0 && <span className="mx-1.5" style={{ color: '#cbd5e1' }}>|</span>}
            {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{val}</a> : <span>{val}</span>}
          </span>
        );
      })}
    </div>
  );
}

export default function CoverLetterTemplate({ data }) {
  const { personal, settings, coverLetter } = data;
  const fontFamily = settings?.customFont || getFontById(settings?.font)?.family || "'Inter', sans-serif";
  const accent = settings?.accentColor || '#2563eb';
  const cl = coverLetter || {};

  // Cover-letter-specific settings (fully independent from resume)
  const clContactStyle  = cl.headerStyle   || settings?.contactStyle  || 'bar';
  const clContactLayout = cl.headerLayout  || settings?.contactLayout || 'justify';
  const clFieldsPos     = cl.fieldsPosition || 'right'; // 'right' | 'below-name' | 'below-all'
  const clPhotoAlign    = cl.photoTextAlign || 'center'; // 'top' | 'center' | 'bottom'

  // Cover letter hidden fields — own set, does NOT inherit resume's hiddenFields
  const clHidden = new Set(cl.hiddenFields ?? []);

  const baseSize = settings?.fontSizeBase || 11;
  const nameSize = baseSize + (settings?.fontSizeNameDelta ?? 8);

  // Photo: prefer cover letter's own photo, else fall back to resume photo
  // INDEPENDENT of personal.hiddenFields — use cl.showPhoto to toggle
  const photoSrc = cl.showPhoto !== false ? (cl.clPhoto || personal?.photo) : null;

  // Vertical alignment of name/title next to photo
  const vAlign = clPhotoAlign === 'top' ? 'flex-start' : clPhotoAlign === 'bottom' ? 'flex-end' : 'center';

  const photoEl = photoSrc ? (
    <img src={photoSrc} alt="" style={photoStyle(settings, accent)} />
  ) : null;

  const nameTitleEl = (
    <div className="min-w-0">
      <h1 className="font-bold leading-tight" style={{ color: '#0f172a', fontSize: nameSize + 'pt' }}>
        {personal?.name || 'Your Name'}
      </h1>
      {personal?.title && (
        <p className="mt-0.5" style={{ color: accent }}>{personal.title}</p>
      )}
    </div>
  );

  // Photo + Name/Title as a unit (with configurable vertical alignment)
  const photoNameEl = (
    <div style={{ display: 'flex', alignItems: vAlign, gap: '12px' }}>
      {photoEl}
      {nameTitleEl}
    </div>
  );

  const contactEl = (
    <ContactRow
      personal={personal}
      hidden={clHidden}
      style={clContactStyle}
      layout={clContactLayout}
      iconSize={settings?.iconSize ?? 11}
    />
  );

  // ── 3 layout modes ───────────────────────────────────────────────────────────
  // right:      [Photo · Name/Title ———————————— Fields →]
  // below-name: [Photo | Name/Title     ]
  //                    | Fields below   ]
  // below-all:  [Photo · Name/Title]
  //             [Fields full-width below]

  function renderHeader() {
    if (clFieldsPos === 'below-name') {
      return (
        <div style={{ display: 'flex', alignItems: vAlign, gap: '12px' }}>
          {photoEl}
          <div style={{ flex: 1, minWidth: 0 }}>
            {nameTitleEl}
            {contactEl && <div style={{ marginTop: '6px' }}>{contactEl}</div>}
          </div>
        </div>
      );
    }

    if (clFieldsPos === 'below-all') {
      return (
        <div>
          {photoNameEl}
          {contactEl && <div style={{ marginTop: '8px' }}>{contactEl}</div>}
        </div>
      );
    }

    // 'right' (default): photo+name on left, fields right-aligned
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flexShrink: 0 }}>{photoNameEl}</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
          {contactEl}
        </div>
      </div>
    );
  }

  const textColor = settings?.textColor || '#1e293b';

  return (
    <div style={{ fontFamily, color: textColor, fontSize: baseSize + 'pt' }}>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: '14px', marginBottom: '20px' }}>
        {renderHeader()}
      </div>

      {/* Body */}
      {cl.body ? (
        <div
          className="mb-6 rich-text-output"
          style={{ color: textColor, minHeight: '160px' }}
          dangerouslySetInnerHTML={{ __html: cl.body }}
        />
      ) : (
        <div className="mb-6 whitespace-pre-wrap" style={{ color: '#9ca3af', minHeight: '160px' }}>
          {'Dear Hiring Manager,\n\nStart writing your cover letter in the "Cover Letter" tab on the left...\n\nBest regards,\n' + (personal?.name || 'Your Name')}
        </div>
      )}

      {/* Closing + Signature */}
      {(() => {
        const signatureGap = cl.signatureSpace === 'wide' ? '32px' : '8px';
        const sigName = cl.signatureName != null ? cl.signatureName : (personal?.name || 'Your Name');
        const sigDesignation = cl.signatureDesignation != null ? cl.signatureDesignation : (personal?.title || '');
        return (
          <div>
            <p>{cl.closing || 'Sincerely'},</p>
            <div style={{ marginTop: signatureGap }}>
              <p className="font-semibold" style={{ color: '#0f172a' }}>{sigName}</p>
              {sigDesignation && <p style={{ color: '#64748b' }}>{sigDesignation}</p>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
