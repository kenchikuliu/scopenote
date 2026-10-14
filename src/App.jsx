import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './components/Icon.jsx';
import AgreementForm from './components/AgreementForm.jsx';
import ChangeDialog from './components/ChangeDialog.jsx';
import ChangeList from './components/ChangeList.jsx';
import BudgetPanel from './components/BudgetPanel.jsx';
import { applyChangeEdit, calculateTotals, changeFee, emptyWorkspace, formatHours, formatMoney, MAX_CHANGES, syntheticExample } from './lib/domain.js';
import { translate } from './lib/i18n.js';

function ConfirmDialog({ title, body, confirmLabel, danger, t, onConfirm, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="confirm-dialog" aria-labelledby="confirm-title" onCancel={e => { e.preventDefault(); onClose(); }}><div className={`confirm-symbol ${danger ? 'danger-symbol' : ''}`}><Icon name={danger ? 'trash' : 'info'} size={25} /></div><h2 id="confirm-title">{title}</h2><p>{body}</p><div className="confirm-actions"><button className="button secondary" onClick={onClose} autoFocus>{t('cancel')}</button><button className={`button ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button></div></dialog>;
}

export default function App() {
  const [data, setData] = useState(emptyWorkspace);
  const [locale, setLocale] = useState('zh');
  const [tab, setTab] = useState('changes');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(undefined);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [dirty, setDirty] = useState(false);
  const onDirty = useCallback(value => setDirty(value), []);
  const t = translate(locale);
  const totals = calculateTotals(data);
  const money = cents => formatMoney(cents, data.project?.currency ?? 'USD', locale, true);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = `ScopeNote · ${t('pageTitle')}`;
  }, [locale]);
  useEffect(() => {
    const beforeUnload = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  function guard(action) {
    if (!dirty) { action(); return; }
    setConfirm({ title: 'unsaved', body: 'discardHint', label: 'discard', danger: true, action: () => { setDirty(false); action(); } });
  }
  function navigate(next) { if (next !== tab) guard(() => setTab(next)); }
  function replace(next, message, nextTab = 'changes') {
    const previous = data;
    setData(next); setFilter('all'); setSearch(''); setDirty(false); setTab(nextTab);
    setToast({ key: message, undo: previous });
  }
  function loadExample() {
    const action = () => replace(syntheticExample(locale), 'exampleLoaded');
    if (data.project) setConfirm({ title: 'replaceTitle', body: 'replaceBody', label: 'replace', action });
    else guard(action);
  }
  function newProject() {
    const action = () => replace(emptyWorkspace(), 'newProject', 'agreement');
    if (data.project) setConfirm({ title: 'resetTitle', body: 'resetBody', label: 'reset', danger: true, action });
    else guard(() => setTab('agreement'));
  }
  function addChange() {
    if (!data.project) { navigate('agreement'); return; }
    if (data.changes.length >= MAX_CHANGES) { setToast({ key: 'changeLimit' }); return; }
    guard(() => setEditing(null));
  }
  function saveProject(project) {
    setData(current => ({ ...current, project })); setDirty(false); setTab('changes'); setToast({ key: 'successAgreement' });
  }
  function saveChange(values) {
    let key = 'successChange';
    let changes;
    if (editing) {
      const result = applyChangeEdit(editing, values);
      changes = data.changes.map(c => c.id === editing.id ? result.change : c);
      if (result.reconfirmation) key = 'reconfirmed';
    } else {
      const now = new Date().toISOString();
      changes = [...data.changes, { ...values, id: crypto.randomUUID(), createdAt: now, updatedAt: now }];
    }
    setData({ ...data, changes }); setEditing(undefined); setDirty(false); setToast({ key });
    requestAnimationFrame(() => document.getElementById('main-content')?.focus());
  }
  function deleteChange(change) {
    setConfirm({ title: 'deleteTitle', body: 'deleteBody', label: 'delete', danger: true, action: () => {
      const previous = data; setData({ ...data, changes: data.changes.filter(c => c.id !== change.id) }); setToast({ key: 'deleted', undo: previous });
    } });
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">{t('skipContent')}</a>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Icon name="note" size={25} /></span><div><strong>ScopeNote</strong><p>{t('tagline')}</p></div></div>
      <div className="workspace-label"><span className="live-dot" />{t('workspace')}</div>
      <div className="sidebar-project"><span className="project-avatar"><Icon name="leaf" size={21} /></span><div><small>{data.isExample ? t('demoBadge') : t('navCaption')}</small><strong>{data.project?.title ?? t('newProject')}</strong></div></div>
      <nav aria-label={t('workspace')}>{[['changes', 'list'], ['agreement', 'agreement'], ['document', 'document']].map(([key, icon]) => <button className={`nav-item ${tab === key ? 'active' : ''}`} key={key} onClick={() => navigate(key)} aria-current={tab === key ? 'page' : undefined}><Icon name={icon} size={20} /><span>{t(key)}</span>{key === 'changes' && <span className="nav-count">{data.changes.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="new-project-button" onClick={newProject}><Icon name="plus" size={17} />{t('newProject')}</button><div className="local-info"><Icon name="shield" size={20} /><div><strong>{t('session')}</strong><p>{t('quoteHint')}</p></div></div><span className="sidebar-footnote">SMALL REQUESTS. CLEAR AGREEMENTS.</span></div>
    </aside>
    <div className="workspace-main">
      <header className="topbar"><div className="breadcrumb"><span>{t('workspace')}</span><Icon name="chevron" size={13} /><strong>{t(tab)}</strong></div><div className="topbar-actions"><span className="save-indicator"><span />{t('session')}</span><button className="language-button" onClick={() => setLocale(l => l === 'zh' ? 'en' : 'zh')} aria-label={t('switchLanguage')}><Icon name="globe" size={17} />{locale === 'zh' ? 'EN' : '中文'}</button><button className="button secondary small demo-top-button" onClick={loadExample}>{t('demoButton')}<Icon name="arrow" size={15} /></button></div></header>
      <main id="main-content" tabIndex={-1}>
        <div className="page-heading"><div><div className="page-eyebrow"><span>{t('pageTitle')}</span>{data.isExample && <span className="example-tag">{t('demoBadge')}</span>}</div><h1>{data.project?.title ?? t('tagline')}</h1><p>{data.project ? `${data.project.client} · ${t(`${tab}Subtitle`)}` : t('pageSubtitle')}</p></div>{tab === 'changes' && data.project && <button className="button primary" onClick={addChange}><Icon name="plus" size={18} />{t('addChange')}</button>}</div>
        {data.isExample && <div className="example-banner"><Icon name="info" size={16} /><span>{t('demoNotice')}</span></div>}
        {tab === 'changes' && <><div className="stats-grid">{[['originalBudget', totals.baseline, 'agreement', data.project ? `${formatHours(data.project.hoursHundredths, locale)} ${t('shortHour')} · ${t('originalHours')}` : '—'], ['pendingExtra', totals.pending.fee, 'clock', `${totals.pending.count} ${t('itemCount')} · +${formatHours(totals.pending.hours, locale)} ${t('shortHour')}`], ['acceptedExtra', totals.accepted.fee, 'check', `${totals.accepted.count} ${t('itemCount')} · +${formatHours(totals.accepted.hours, locale)} ${t('shortHour')}`]].map(([label, fee, icon, hint]) => <div className={`stat-card ${label}`} key={label}><div><span>{t(label)}</span><Icon name={icon} size={18} /></div><strong>{data.project ? money(fee) : '—'}</strong><p>{hint}</p></div>)}</div><div className="workspace-columns"><ChangeList data={data} t={t} locale={locale} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} onEdit={setEditing} onDelete={deleteChange} onAdd={addChange} onCreate={() => navigate('agreement')} onExample={loadExample} /><BudgetPanel data={data} totals={totals} t={t} locale={locale} onDocument={() => navigate('document')} /></div></>}
        {tab === 'agreement' && <div className="workspace-columns"><AgreementForm project={data.project} hasChanges={data.changes.length > 0} t={t} onSave={saveProject} onDirty={onDirty} /><div className="agreement-side-note"><span className="section-icon"><Icon name="leaf" size={25} /></span><h2>{t('originalScopeTitle')}</h2><p>{t('originalScopeHint')}</p><div className="quiet-note"><Icon name="info" size={18} /><span>{t('baselineRateHint')}</span></div></div></div>}
        {tab === 'document' && <div className="paper-card"><h2>{t('documentTitle')}</h2>{data.project ? <><p className="preserve-lines">{data.project.scope}</p>{data.changes.map(c => <p key={c.id}>{c.title} · {money(changeFee(c))} · {t(c.status)}</p>)}<p>{t('approvedTotal')}: {money(totals.approved)}</p><p>{t('estimatedTotal')}: {money(totals.estimated)}</p></> : <p>{t('documentEmpty')}</p>}</div>}
        <footer className="workspace-footer"><span>ScopeNote <i>·</i> {t('tagline')}</span><span>{data.project?.currency ?? 'USD'} <i>·</i> {t('approvalHint')}</span></footer>
      </main>
    </div>
    {editing !== undefined && data.project && <ChangeDialog change={editing} project={data.project} t={t} locale={locale} onSave={saveChange} onDirty={onDirty} onClose={() => { setEditing(undefined); setDirty(false); }} />}
    {confirm && <ConfirmDialog title={t(confirm.title)} body={t(confirm.body)} confirmLabel={t(confirm.label)} danger={confirm.danger} t={t} onClose={() => setConfirm(null)} onConfirm={() => { const action = confirm.action; setConfirm(null); action(); }} />}
    {toast && <div className="toast" role="status"><Icon name="check" size={18} /><span>{t(toast.key)}</span>{toast.undo && <button onClick={() => { setData(toast.undo); setDirty(false); setToast({ key: 'undone' }); }}><Icon name="undo" size={15} />{t('undo')}</button>}<button className="toast-close" aria-label={t('close')} onClick={() => setToast(null)}><Icon name="close" size={17} /></button></div>}
  </div>;
}
