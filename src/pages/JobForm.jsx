import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X as XIcon, CheckCircle2 } from 'lucide-react';
import { useJobStore } from '@/hooks/useJobStore';
import { useJobStages, PREDEFINED_STAGES } from '@/hooks/useJobStages';
import { useAppStore } from '@/hooks/useResumeStore';
import { JOB_STATUSES } from '@/constants/jobs';

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

export function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs, addJob, updateJob } = useJobStore();
  const { appState } = useAppStore();
  const resumes = appState.resumes;
  const { customStages, addCustomStage, removeCustomStage } = useJobStages();

  const isEdit = !!id;
  const existing = isEdit ? jobs.find(j => j.id === id) : null;

  const [form, setForm] = useState(() => ({
    company: '', role: '', status: 'applied', stage: '',
    url: '', location: '', salary: '',
    contact: '', resumeId: '', notes: '',
    appliedDate: new Date().toISOString().slice(0, 10), deadline: '',
    ...(existing || {}),
  }));

  const [newStageInput, setNewStageInput] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSave = form.company.trim() || form.role.trim();
  const backPath = isEdit ? `/jobs/${id}` : '/jobs';

  function handleAddStage() {
    const trimmed = newStageInput.trim();
    if (!trimmed) return;
    addCustomStage(trimmed);
    set('stage', trimmed);
    setNewStageInput('');
  }

  function handleSave() {
    if (!canSave) return;
    if (isEdit) {
      updateJob(id, form);
      navigate(`/jobs/${id}`);
    } else {
      const newId = addJob(form);
      navigate(`/jobs/${newId}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef]">

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(backPath)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Job Application' : 'Add Job Application'}
          </h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => navigate(backPath)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {isEdit ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">

        {/* Basic Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company" required>
              <input
                autoFocus
                value={form.company}
                onChange={e => set('company', e.target.value)}
                placeholder="Google, Stripe, Notion…"
                className={INPUT}
              />
            </Field>
            <Field label="Role / Position" required>
              <input
                value={form.role}
                onChange={e => set('role', e.target.value)}
                placeholder="Software Engineer, Product Manager…"
                className={INPUT}
              />
            </Field>
            <Field label="Location">
              <input
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="Remote, New York…"
                className={INPUT}
              />
            </Field>
            <Field label="Salary / Comp">
              <input
                value={form.salary}
                onChange={e => set('salary', e.target.value)}
                placeholder="$150k – $200k"
                className={INPUT}
              />
            </Field>
            <div className="col-span-2">
              <Field label="Job Posting URL">
                <input
                  value={form.url}
                  onChange={e => set('url', e.target.value)}
                  placeholder="https://jobs.company.com/…"
                  className={INPUT}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Status & Dates */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status & Dates</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Application Status">
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className={INPUT + ' bg-white cursor-pointer'}
              >
                {JOB_STATUSES.map((s, i) => (
                  <option key={s.id} value={s.id}>{i + 1}. {s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Applied Date">
              <input
                type="date"
                value={form.appliedDate}
                onChange={e => set('appliedDate', e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Deadline / Follow-up">
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
        </section>

        {/* Interview Stage */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Interview Stage</h2>
              <p className="text-xs text-gray-400 mt-1">Select where you are in the process. Custom stages are saved for future use.</p>
            </div>
            {form.stage && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 shrink-0 ml-4">
                <CheckCircle2 size={12} className="text-indigo-500" />
                {form.stage}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">

            {/* Predefined stages */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Predefined</p>
              <div className="space-y-0.5">
                {PREDEFINED_STAGES.map((s, i) => {
                  const active = form.stage === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('stage', active ? '' : s)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        active
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-[11px] font-bold w-5 text-right shrink-0 tabular-nums ${active ? 'text-indigo-400' : 'text-gray-300'}`}>{i + 1}.</span>
                      <span className="flex-1 leading-snug">{s}</span>
                      {active && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom stages */}
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Your Stages</p>

              <div className="flex-1">
                {customStages.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No custom stages yet — add one below.</p>
                ) : (
                  <div className="space-y-0.5">
                    {customStages.map((s, i) => {
                      const active = form.stage === s;
                      return (
                        <div
                          key={s}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
                            active ? 'bg-indigo-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => set('stage', active ? '' : s)}
                            className="flex-1 flex items-center gap-2.5 text-left"
                          >
                            <span className={`text-[11px] font-bold w-5 text-right shrink-0 tabular-nums ${active ? 'text-indigo-400' : 'text-gray-300'}`}>{i + 1}.</span>
                            <span className={`text-sm flex-1 leading-snug ${active ? 'text-indigo-700 font-semibold' : 'text-gray-600'}`}>{s}</span>
                            {active && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (form.stage === s) set('stage', '');
                              removeCustomStage(s);
                            }}
                            className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors shrink-0"
                            title="Remove"
                          >
                            <XIcon size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add new stage input */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 mb-2">Add Custom Stage</p>
                <div className="flex gap-2">
                  <input
                    value={newStageInput}
                    onChange={e => setNewStageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddStage(); } }}
                    placeholder="e.g. 2nd Round, Founder Chat…"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddStage}
                    disabled={!newStageInput.trim()}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Resume */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contact & Resume</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Person">
              <input
                value={form.contact}
                onChange={e => set('contact', e.target.value)}
                placeholder="Recruiter name, email…"
                className={INPUT}
              />
            </Field>
            <Field label="Resume Used">
              <select
                value={form.resumeId}
                onChange={e => set('resumeId', e.target.value)}
                className={INPUT + ' bg-white cursor-pointer'}
              >
                <option value="">— Not linked yet —</option>
                {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Notes</h2>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={4}
            placeholder="Key contacts, interview format, compensation details, next steps…"
            className={INPUT + ' resize-none'}
          />
        </section>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => navigate(backPath)}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isEdit ? 'Save Changes' : 'Add Job'}
          </button>
        </div>

      </div>
    </div>
  );
}
