const P = 'sacred_';
const get = (k, def) => { try { const v = localStorage.getItem(P+k); return v ? JSON.parse(v) : def; } catch { return def; } };
const set = (k, v) => { try { localStorage.setItem(P+k, JSON.stringify(v)); } catch(e) { console.warn('Storage error', e); } };

// Settings
export const getSetting = (k, def) => get(k, def);
export const setSetting = (k, v) => set(k, v);

// Notes
export const getNotes = () => get('notes', []);
export const getChapterNotes = (book, chapter) => getNotes().filter(n => n.book === book && n.chapter === chapter);
export const saveNote = (note) => { const notes = getNotes(); const idx = notes.findIndex(n => n.id === note.id); if (idx >= 0) notes[idx] = note; else notes.push({ ...note, id: note.id || Date.now().toString(), date: new Date().toISOString() }); set('notes', notes); };
export const deleteNote = (id) => set('notes', getNotes().filter(n => n.id !== id));

// Bookmarks
export const getBookmarks = () => get('bookmarks', []);
export const isBookmarked = (book, chapter) => getBookmarks().some(b => b.book === book && b.chapter === chapter);
export const toggleBookmark = (book, chapter) => {
  const bm = getBookmarks();
  const idx = bm.findIndex(b => b.book === book && b.chapter === chapter);
  if (idx >= 0) { bm.splice(idx, 1); } else { bm.push({ book, chapter, date: new Date().toISOString() }); }
  set('bookmarks', bm);
};

// Memory Verses — SM-2 spaced repetition
export const getMemoryVerses = () => get('memory', []);
export const addMemoryVerse = (v) => {
  const all = getMemoryVerses();
  if (all.find(m => m.book === v.book && m.chapter === v.chapter && m.verse === v.verse)) return null;
  const newV = { ...v, id: Date.now().toString(), ef: 2.5, interval: 0, reps: 0, nextReview: new Date().toISOString(), reviewCount: 0 };
  all.push(newV); set('memory', all); return newV;
};
export const deleteMemoryVerse = (id) => set('memory', getMemoryVerses().filter(v => v.id !== id));
export const reviewVerse = (id, quality) => {
  const all = getMemoryVerses(); const v = all.find(m => m.id === id); if (!v) return;
  let { ef, interval, reps } = v;
  if (quality < 3) { reps = 0; interval = 1; }
  else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
    ef = Math.max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }
  const next = new Date(); next.setDate(next.getDate() + interval);
  Object.assign(v, { ef, interval, reps, nextReview: next.toISOString(), reviewCount: v.reviewCount + 1, lastReviewed: new Date().toISOString() });
  set('memory', all);
};
export const getDueVerses = () => { const now = new Date(); return getMemoryVerses().filter(v => new Date(v.nextReview) <= now); };

// Study Plans
export const getPlans = () => get('plans', []);
export const addPlan = (plan) => { const plans = getPlans(); const p = { ...plan, id: Date.now().toString(), status: 'active', created: new Date().toISOString() }; plans.push(p); set('plans', plans); return p; };
export const deletePlan = (id) => set('plans', getPlans().filter(p => p.id !== id));
export const toggleReading = (planId, idx) => { const plans = getPlans(); const p = plans.find(pl => pl.id === planId); if (p && p.readings[idx]) { p.readings[idx].completed = !p.readings[idx].completed; p.status = p.readings.every(r => r.completed) ? 'completed' : 'active'; set('plans', plans); } };

// Groups
export const getGroups = () => get('groups', [
  { id: 'demo1', name: 'Morning Devotions', description: 'Daily scripture reading and prayer together.', members: ['You', 'Sarah', 'Michael'], is_public: true, invite_code: 'MORN01', discussions: [{ id: 'd1', author: 'Sarah', content: 'Psalm 23 really spoke to me today. The idea of God as our shepherd is so comforting.', date: new Date(Date.now()-86400000).toISOString() }, { id: 'd2', author: 'Michael', content: 'I love how verse 4 promises God\'s presence even in the darkest valleys.', date: new Date(Date.now()-43200000).toISOString() }], created: new Date(Date.now()-604800000).toISOString() },
  { id: 'demo2', name: 'Deep Dive Theology', description: 'In-depth study of doctrinal passages and systematic theology.', members: ['You', 'Pastor James', 'Rebecca', 'Thomas'], is_public: false, invite_code: 'DEEP01', discussions: [], created: new Date(Date.now()-1209600000).toISOString() }
]);
export const addGroup = (g) => { const groups = getGroups(); const ng = { ...g, id: Date.now().toString(), discussions: [], created: new Date().toISOString() }; groups.push(ng); set('groups', groups); return ng; };
export const deleteGroup = (id) => set('groups', getGroups().filter(g => g.id !== id));
export const addMessage = (groupId, msg) => { const groups = getGroups(); const g = groups.find(gr => gr.id === groupId); if (g) { g.discussions.push({ id: Date.now().toString(), ...msg, date: new Date().toISOString() }); set('groups', groups); } };

// Sermons
export const getSermons = () => get('sermons', [
  { id: 'demo1', title: 'Walking in Faith', speaker: 'Pastor James Williams', date: '2026-03-15', book: 'Hebrews', chapter: 11, verses: '1-6', transcript: 'Now faith is the substance of things hoped for, the evidence of things not seen. Today we explore what it means to truly walk by faith and not by sight...', summary: 'An exploration of Hebrews 11 and the nature of biblical faith as both trust and action.', key_points: ['Faith is the foundation of our relationship with God', 'The heroes of faith acted despite uncertainty', 'True faith produces obedience and sacrifice', 'God rewards those who earnestly seek Him'], audioUrl: null, duration: 0 }
]);
export const addSermon = (s) => { const sermons = getSermons(); const ns = { ...s, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] }; sermons.push(ns); set('sermons', sermons); return ns; };
export const deleteSermon = (id) => set('sermons', getSermons().filter(s => s.id !== id));

// Drawings — stored as stroke vectors for undo support
export const getDrawingStrokes = (book, chapter) => {
  const all = get('drawings_v2', {});
  return all[`${book}_${chapter}`] || [];
};
export const saveDrawingStrokes = (book, chapter, strokes) => {
  const all = get('drawings_v2', {});
  all[`${book}_${chapter}`] = strokes;
  set('drawings_v2', all);
};
export const clearDrawing = (book, chapter) => {
  const all = get('drawings_v2', {});
  delete all[`${book}_${chapter}`];
  set('drawings_v2', all);
};
