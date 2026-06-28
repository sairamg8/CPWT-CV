import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { registerPdfFont } from '@/templates/pdf/shared/pdfFontLoader';

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

  // Register the user's chosen font with react-pdf, get back the family name.
  // For unknown/custom fonts, react-pdf silently falls back to Helvetica if the CDN file 404s.
  const fontFamily = registerPdfFont(resume?.settings);

  const [TemplatePDF] = await Promise.all([load()]);

  // Inject resolved font family into settings so the template Page can apply it.
  const data = {
    ...resume,
    settings: { ...resume?.settings, _pdfFontFamily: fontFamily },
  };

  const element = React.createElement(TemplatePDF, { data });
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
