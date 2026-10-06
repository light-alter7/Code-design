import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ExternalLink, FileUp, Mail, MapPin, MessageSquare, Search, Share2, Smartphone, X } from 'lucide-react';

type AppAction = 'open_app' | 'open_url' | 'pick_file' | 'share_file' | 'compose_email' | 'compose_message' | 'create_calendar_event' | 'show_location';

type AppItem = { id: string; label: string; detail: string; actions: AppAction[]; connected: boolean };

const apps: AppItem[] = [
  { id: 'browser', label: 'Browser', detail: 'Open research, docs and URLs', actions: ['open_url', 'open_app'], connected: true },
  { id: 'files', label: 'Files', detail: 'Pick project assets and documents', actions: ['pick_file', 'share_file'], connected: true },
  { id: 'mail', label: 'Mail', detail: 'Prepare messages and email', actions: ['compose_email', 'open_app'], connected: true },
  { id: 'messages', label: 'Messages', detail: 'Prepare a message in your messaging app', actions: ['compose_message', 'open_app'], connected: true },
  { id: 'calendar', label: 'Calendar', detail: 'Create events from project plans', actions: ['create_calendar_event', 'open_app'], connected: true },
  { id: 'maps', label: 'Maps', detail: 'Open locations and navigation', actions: ['show_location', 'open_app'], connected: true },
];

const actionLabels: Record<AppAction, string> = {
  open_app: 'Open', open_url: 'Open URL', pick_file: 'Pick file', share_file: 'Share',
  compose_email: 'Compose email', compose_message: 'Compose message', create_calendar_event: 'Create event', show_location: 'Show location',
};

export function AppsSheet({ open, onClose, onAction }: { open: boolean; onClose: () => void; onAction: (prompt: string) => void }) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const filtered = useMemo(() => apps.filter((app) => `${app.label} ${app.detail}`.toLowerCase().includes(query.toLowerCase())), [query]);
  if (!open) return null;

  return (
    <div className="codesign-mobile-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="codesign-mobile-sheet codesign-apps-sheet" role="dialog" aria-modal="true" aria-label="Use apps" onMouseDown={(e) => e.stopPropagation()}>
        <header className="codesign-mobile-sheet-header">
          <div>
            <div className="codesign-mobile-sheet-kicker">APP BRIDGE</div>
            <h2>Use apps</h2>
            <p>Let the agent use permitted device apps through semantic actions.</p>
          </div>
          <button type="button" className="codesign-mobile-icon-button" onClick={onClose} aria-label="Close apps"><X size={20} /></button>
        </header>
        <label className="codesign-apps-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps" aria-label="Search apps" /></label>
        <div className="codesign-apps-list">
          {filtered.map((app) => (
            <article className="codesign-app-card" key={app.id}>
              <div className="codesign-app-card-top">
                <span className="codesign-app-icon"><AppIcon id={app.id} /></span>
                <span className="codesign-app-copy"><strong>{app.label}</strong><small>{app.detail}</small></span>
                <span className="codesign-app-connected"><Check size={13} /> Ready</span>
              </div>
              <div className="codesign-app-actions">
                {app.actions.map((action) => (
                  <button key={action} type="button" onClick={() => { onAction(appPrompt(app, action)); onClose(); }}>
                    <ActionIcon action={action} />{actionLabels[action]}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="codesign-apps-footnote"><Smartphone size={14} /> Actions are permission-gated and should use native Android intents where available.</div>
      </section>
    </div>
  );
}

function appPrompt(app: AppItem, action: AppAction) {
  const labels = actionLabels[action];
  return `Use the ${app.label} app to ${labels.toLowerCase()} for the current task. Use the device app bridge and semantic native action. Ask for confirmation before any consequential write action.`;
}

function AppIcon({ id }: { id: string }) {
  if (id === 'mail') return <Mail size={18} />;
  if (id === 'messages') return <MessageSquare size={18} />;
  if (id === 'calendar') return <CalendarDays size={18} />;
  if (id === 'maps') return <MapPin size={18} />;
  if (id === 'files') return <FileUp size={18} />;
  return <ExternalLink size={18} />;
}
function ActionIcon({ action }: { action: AppAction }) {
  if (action === 'share_file') return <Share2 size={14} />;
  if (action === 'pick_file') return <FileUp size={14} />;
  return <ExternalLink size={14} />;
}
