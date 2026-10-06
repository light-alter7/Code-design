import { useEffect } from 'react';
import { Accessibility, Code2, Download, Eye, FileCode2, Layers3, Palette, SearchCheck, Settings2, Sparkles, Smartphone, X } from 'lucide-react';

type MobileStudioSheetProps = {
  open: boolean;
  onClose: () => void;
  onAction: (prompt: string) => void;
  onFiles: () => void;
  onPreview: () => void;
  onComments: () => void;
  onApps: () => void;
};

const actions = [
  { icon: Sparkles, title: 'Generate', description: 'Create or transform the design', prompt: 'Create a polished, production-ready design for this request. Use the existing design system and keep the result responsive.' },
  { icon: Palette, title: 'Refine design', description: 'Improve hierarchy, spacing and visual quality', prompt: 'Refine this design. Improve visual hierarchy, spacing, typography, composition, consistency, and responsive behavior without changing the core intent.' },
  { icon: Accessibility, title: 'Accessibility review', description: 'Check contrast, semantics and interaction', prompt: 'Review this design for accessibility. Check contrast, typography, focus states, semantics, touch targets, keyboard navigation, and reduced-motion behavior. Fix issues you find.' },
  { icon: SearchCheck, title: 'Visual QA', description: 'Inspect the rendered result and fix defects', prompt: 'Perform a visual QA pass on the current design. Inspect layout, overflow, alignment, responsive behavior, empty states, loading states, and visual consistency. Fix concrete issues.' },
  { icon: Code2, title: 'Code review', description: 'Review generated code for quality and safety', prompt: 'Review the generated code for correctness, maintainability, performance, accessibility, security, and responsive behavior. Make only safe, justified improvements.' },
  { icon: Layers3, title: 'Design system', description: 'Extract and strengthen reusable patterns', prompt: 'Inspect the current project and strengthen its design system. Identify reusable tokens, components, spacing, typography, states, and responsive patterns, then apply them consistently.' },
];

export function MobileStudioSheet({ open, onClose, onAction, onFiles, onPreview, onComments, onApps }: MobileStudioSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="codesign-mobile-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="codesign-mobile-sheet" role="dialog" aria-modal="true" aria-label="Studio tools" onMouseDown={(e) => e.stopPropagation()}>
        <header className="codesign-mobile-sheet-header">
          <div>
            <div className="codesign-mobile-sheet-kicker">LOCAL STUDIO</div>
            <h2>Everything in one workspace</h2>
            <p>Design, inspect, refine and ship without leaving the project.</p>
          </div>
          <button type="button" className="codesign-mobile-icon-button" onClick={onClose} aria-label="Close studio tools"><X size={20} /></button>
        </header>

        <div className="codesign-mobile-sheet-grid">
          {actions.map(({ icon: Icon, title, description, prompt }) => (
            <button key={title} type="button" className="codesign-mobile-tool" onClick={() => { onAction(prompt); onClose(); }}>
              <span className="codesign-mobile-tool-icon"><Icon size={18} /></span>
              <span><strong>{title}</strong><small>{description}</small></span>
            </button>
          ))}
        </div>

        <div className="codesign-mobile-sheet-divider" />
        <div className="codesign-mobile-sheet-shortcuts">
          <button type="button" onClick={() => { onPreview(); onClose(); }}><Eye size={17} />Preview</button>
          <button type="button" onClick={() => { onFiles(); onClose(); }}><FileCode2 size={17} />Files</button>
          <button type="button" onClick={() => { onComments(); onClose(); }}><Settings2 size={17} />Comments</button>
          <button type="button" onClick={() => { onApps(); onClose(); }}><Smartphone size={17} />Apps</button>
          <button type="button" onClick={() => { onAction('Prepare this project for export. Check the current design, generated code, assets, and responsive behavior, then tell me what should be exported.'); onClose(); }}><Download size={17} />Export</button>
        </div>
      </section>
    </div>
  );
}
