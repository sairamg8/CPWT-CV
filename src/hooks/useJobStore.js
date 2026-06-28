import { useState, useEffect } from 'react';

const KEY = 'cpwtcv_jobs_v1';

const DEMO_JOBS = [
  {
    id: 'demo_1', company: 'Google', role: 'Senior Frontend Engineer', status: 'interview',
    url: '', location: 'Mountain View, CA', salary: '$180k – $250k',
    appliedDate: '2026-06-10', deadline: '2026-06-30',
    contact: 'Sarah Kim (Recruiter) · sarah@google.com',
    notes: 'Referred by college contact. L5 level. Focus on systems design round.',
    todos: [
      { id: 't1', text: 'Research recent Google products & announcements', done: true },
      { id: 't2', text: 'Prepare system design (YouTube, Google Drive)', done: true },
      { id: 't3', text: 'Practice LeetCode hard — trees & graphs', done: false },
      { id: 't4', text: 'Send thank you email after interview', done: false },
    ],
    createdAt: 1749600000000, updatedAt: 1749600000000,
  },
  {
    id: 'demo_2', company: 'Stripe', role: 'Software Engineer II', status: 'offer',
    url: '', location: 'Remote (US)', salary: '$165k – $210k',
    appliedDate: '2026-05-28', deadline: '2026-07-01',
    contact: 'Marcus Lee (HR) · marcus@stripe.com',
    notes: 'Offer in hand. Deadline to respond is July 1. Comparing with Google.',
    todos: [
      { id: 't1', text: 'Review offer letter carefully', done: true },
      { id: 't2', text: 'Negotiate signing bonus', done: true },
      { id: 't3', text: 'Compare benefits with other offers', done: false },
      { id: 't4', text: 'Accept or decline by July 1', done: false },
    ],
    createdAt: 1748400000000, updatedAt: 1748400000000,
  },
  {
    id: 'demo_3', company: 'Notion', role: 'Product Engineer', status: 'phone_screen',
    url: '', location: 'San Francisco, CA', salary: '$150k – $190k',
    appliedDate: '2026-06-15', deadline: '2026-07-05',
    contact: 'Priya Nair (Recruiter)',
    notes: 'Phone screen scheduled for June 28. They use React + TypeScript heavily.',
    todos: [
      { id: 't1', text: 'Review Notion\'s product & recent blog posts', done: true },
      { id: 't2', text: 'Prepare "why Notion" story', done: false },
      { id: 't3', text: 'Brush up on React hooks & performance', done: false },
    ],
    createdAt: 1749700000000, updatedAt: 1749700000000,
  },
  {
    id: 'demo_4', company: 'Vercel', role: 'Developer Experience Engineer', status: 'applied',
    url: '', location: 'Remote', salary: '$140k – $180k',
    appliedDate: '2026-06-20', deadline: '',
    contact: '',
    notes: 'Applied via website. Strong OSS background preferred.',
    todos: [
      { id: 't1', text: 'Tailor resume for DX role', done: true },
      { id: 't2', text: 'Write cover letter', done: true },
      { id: 't3', text: 'Follow up if no response in 2 weeks', done: false },
    ],
    createdAt: 1749800000000, updatedAt: 1749800000000,
  },
  {
    id: 'demo_5', company: 'Linear', role: 'Frontend Engineer', status: 'applied',
    url: '', location: 'Remote', salary: '$130k – $170k',
    appliedDate: '2026-06-22', deadline: '',
    contact: '',
    notes: 'Small team, great product. They value taste & craftsmanship.',
    todos: [
      { id: 't1', text: 'Customize portfolio for Linear aesthetic', done: true },
      { id: 't2', text: 'Apply via referral link', done: true },
      { id: 't3', text: 'Follow up after 10 days', done: false },
    ],
    createdAt: 1749900000000, updatedAt: 1749900000000,
  },
  {
    id: 'demo_6', company: 'Airbnb', role: 'Staff Engineer', status: 'saved',
    url: '', location: 'San Francisco, CA', salary: '$210k – $280k',
    appliedDate: '', deadline: '',
    contact: '',
    notes: 'Saved for after Google/Stripe decision. Dream role.',
    todos: [
      { id: 't1', text: 'Update portfolio with recent projects', done: false },
      { id: 't2', text: 'Research Airbnb eng blog', done: false },
      { id: 't3', text: 'Apply by July 15', done: false },
    ],
    createdAt: 1749500000000, updatedAt: 1749500000000,
  },
  {
    id: 'demo_7', company: 'Netflix', role: 'UI Engineer', status: 'saved',
    url: '', location: 'Los Gatos, CA', salary: '$190k – $260k (top of band)',
    appliedDate: '', deadline: '',
    contact: '',
    notes: 'Top of band comp, no equity but huge salary. Worth exploring.',
    todos: [
      { id: 't1', text: 'Find referral contact at Netflix', done: false },
      { id: 't2', text: 'Review Netflix Culture Memo', done: false },
      { id: 't3', text: 'Prepare freedom & responsibility examples', done: false },
    ],
    createdAt: 1749450000000, updatedAt: 1749450000000,
  },
  {
    id: 'demo_8', company: 'Figma', role: 'Software Engineer — Editor', status: 'rejected',
    url: '', location: 'San Francisco, CA', salary: '$160k – $220k',
    appliedDate: '2026-05-15', deadline: '',
    contact: 'Daniel Park (HR)',
    notes: 'Rejected after final round. Feedback: needed stronger C++/WASM knowledge.',
    todos: [
      { id: 't1', text: 'Study WebAssembly basics', done: false },
      { id: 't2', text: 'Re-apply in 6 months with more graphics experience', done: false },
    ],
    createdAt: 1747800000000, updatedAt: 1747800000000,
  },
  {
    id: 'demo_9', company: 'Shopify', role: 'Senior React Developer', status: 'rejected',
    url: '', location: 'Remote', salary: '$145k – $185k',
    appliedDate: '2026-05-20', deadline: '',
    contact: '',
    notes: 'Rejected at phone screen. Position may have been filled internally.',
    todos: [],
    createdAt: 1747900000000, updatedAt: 1747900000000,
  },
  {
    id: 'demo_10', company: 'Anthropic', role: 'Product Engineer', status: 'applied',
    url: '', location: 'San Francisco, CA', salary: '$170k – $230k',
    appliedDate: '2026-06-18', deadline: '',
    contact: '',
    notes: 'Exciting mission. Applied via AngelList. Strong emphasis on alignment work.',
    todos: [
      { id: 't1', text: 'Read Anthropic\'s research papers', done: true },
      { id: 't2', text: 'Prepare examples of responsible AI work', done: false },
      { id: 't3', text: 'Polish cover letter', done: false },
    ],
    createdAt: 1749750000000, updatedAt: 1749750000000,
  },
  {
    id: 'demo_11', company: 'Loom', role: 'Full Stack Engineer', status: 'withdrawn',
    url: '', location: 'Remote', salary: '$130k – $160k',
    appliedDate: '2026-06-01', deadline: '',
    contact: '',
    notes: 'Withdrew after receiving Stripe offer. Good process, nice team.',
    todos: [],
    createdAt: 1748200000000, updatedAt: 1748200000000,
  },
  {
    id: 'demo_12', company: 'Cursor', role: 'Frontend Engineer', status: 'phone_screen',
    url: '', location: 'Remote', salary: '$140k – $200k + equity',
    appliedDate: '2026-06-14', deadline: '2026-07-10',
    contact: 'Alex Chen (Founder)',
    notes: 'Early stage, directly talking to founders. Very exciting product.',
    todos: [
      { id: 't1', text: 'Demo personal projects in Cursor', done: true },
      { id: 't2', text: 'Prepare startup risk / reward talking points', done: false },
      { id: 't3', text: 'Research Cursor\'s roadmap & recent launches', done: false },
      { id: 't4', text: 'Ask about equity structure', done: false },
    ],
    createdAt: 1749680000000, updatedAt: 1749680000000,
  },
  {
    id: 'demo_13', company: 'Supabase', role: 'Developer Advocate', status: 'saved',
    url: '', location: 'Remote', salary: '$110k – $140k',
    appliedDate: '', deadline: '',
    contact: '',
    notes: 'Lower pay but very visible role. Great for personal brand.',
    todos: [
      { id: 't1', text: 'Write a Supabase tutorial to show interest', done: false },
      { id: 't2', text: 'Apply after current round closes', done: false },
    ],
    createdAt: 1749400000000, updatedAt: 1749400000000,
  },
  {
    id: 'demo_14', company: 'Arc (Browser)', role: 'iOS Engineer', status: 'interview',
    url: '', location: 'New York, NY', salary: '$155k – $200k',
    appliedDate: '2026-06-05', deadline: '2026-06-28',
    contact: 'Jamie Russo (Recruiter) · jamie@arc.net',
    notes: 'Final round scheduled. 3 technical + 1 culture interview panel.',
    todos: [
      { id: 't1', text: 'Review Swift concurrency (async/await)', done: true },
      { id: 't2', text: "Study Arc's product philosophy", done: true },
      { id: 't3', text: 'Prepare portfolio walkthrough (5 min)', done: true },
      { id: 't4', text: 'Mock interview with friend', done: false },
      { id: 't5', text: 'Send follow-up after final round', done: false },
    ],
    createdAt: 1748600000000, updatedAt: 1748600000000,
  },
];

function load() {
  try {
    const s = localStorage.getItem(KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.jobs?.length > 0) return parsed;
    }
  } catch {}
  return { jobs: DEMO_JOBS };
}

export function useJobStore() {
  const [state, setState] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  function addJob(data = {}) {
    const now = Date.now();
    const initialStatus = data.status || 'saved';
    const job = {
      id: `job_${now}`,
      company: '', role: '', status: 'saved',
      url: '', location: '', salary: '',
      contact: '', resumeId: '', notes: '',
      appliedDate: '', deadline: '',
      todos: [],
      statusHistory: [{ status: initialStatus, changedAt: now }],
      createdAt: now, updatedAt: now,
      ...data,
      // ensure statusHistory always exists (imports may lack it)
    };
    if (!job.statusHistory) {
      job.statusHistory = [{ status: job.status, changedAt: job.createdAt || now }];
    }
    setState(s => ({ jobs: [...s.jobs, job] }));
    return job.id;
  }

  function updateJob(id, updates) {
    setState(s => ({
      jobs: s.jobs.map(j => {
        if (j.id !== id) return j;
        const updated = { ...j, ...updates, updatedAt: Date.now() };
        if (updates.status && updates.status !== j.status) {
          const prev = j.statusHistory || [{ status: j.status, changedAt: j.createdAt || Date.now() }];
          updated.statusHistory = [...prev, { status: updates.status, changedAt: Date.now() }];
        }
        return updated;
      }),
    }));
  }

  function deleteJob(id) {
    setState(s => ({ jobs: s.jobs.filter(j => j.id !== id) }));
  }

  function importJobs(incoming) {
    const stamped = incoming.map(j => ({
      todos: [],
      contact: '',
      deadline: '',
      ...j,
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: j.createdAt || Date.now(),
      updatedAt: Date.now(),
    }));
    setState(s => ({ jobs: [...s.jobs, ...stamped] }));
  }

  function clearDemoData() {
    setState({ jobs: [] });
  }

  return { jobs: state.jobs, addJob, updateJob, deleteJob, importJobs, clearDemoData };
}
