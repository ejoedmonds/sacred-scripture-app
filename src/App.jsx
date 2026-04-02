import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OLD_TESTAMENT, NEW_TESTAMENT, ALL_BOOKS, THEMES, TRANSLATIONS, POPULAR_PASSAGES, fetchChapter, fetchVerse, generateCommentary } from './data/bible.js';
import { getSetting, setSetting, getNotes, getChapterNotes, saveNote, deleteNote, getBookmarks, isBookmarked, toggleBookmark, getMemoryVerses, addMemoryVerse, deleteMemoryVerse, reviewVerse, getDueVerses, getPlans, addPlan, deletePlan, toggleReading, getGroups, addGroup, deleteGroup, addMessage, getSermons, addSermon, deleteSermon, getDrawingStrokes, saveDrawingStrokes, clearDrawing } from './utils/storage.js';

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const Ic = ({ d, size = 20, fill = 'none', ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const BookOpen = (p) => <Ic {...p} d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>} />;
const SearchIc = (p) => <Ic {...p} d={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>} />;
const ChevL = (p) => <Ic {...p} d="m15 18-6-6 6-6" />;
const ChevR = (p) => <Ic {...p} d="m9 18 6-6 6-6" />;
const ChevD = (p) => <Ic {...p} d="m6 9 6 6 6-6" />;
const Plus = (p) => <Ic {...p} d={<><path d="M5 12h14"/><path d="M12 5v14"/></>} />;
const Trash = (p) => <Ic {...p} d={<><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></>} />;
const Edit2 = (p) => <Ic {...p} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />;
const X = (p) => <Ic {...p} d={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>} />;
const Star = (p) => <Ic {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const Check = (p) => <Ic {...p} d="M20 6 9 17l-5-5" />;
const Copy = (p) => <Ic {...p} d={<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>} />;
const Menu = (p) => <Ic {...p} d={<><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></>} />;
const Mic = (p) => <Ic {...p} d={<><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></>} />;
const Settings = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />;
const BookmarkIc = (p) => <Ic {...p} d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />;
const Note = (p) => <Ic {...p} d={<><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/><polyline points="15 3 15 8 20 8"/></>} />;
const Undo = (p) => <Ic {...p} d={<><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></>} />;
const Redo = (p) => <Ic {...p} d={<><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></>} />;
const Pause = (p) => <Ic {...p} d={<><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>} />;
const Play = (p) => <Ic {...p} d="M5 3l14 9-14 9V3z" />;
const Stop = (p) => <Ic {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/></>} />;
const Users = (p) => <Ic {...p} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const Clock = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;

// Drawing tool icons
const PencilIc = (p) => <Ic {...p} d={<><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>} />;
const PenIc = (p) => <Ic {...p} d={<><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></>} />;
const MarkerIc = (p) => <Ic {...p} d={<><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></>} />;
const HighlighterIc = (p) => <Ic {...p} d={<><path d="M4 22 1 18l14-14 3 3L4 22z"/><path d="M14.5 4.5 19 9"/><path d="M22 22H11"/></>} />;
const EraserIc = (p) => <Ic {...p} d={<><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></>} />;
const FountainPen = (p) => <Ic {...p} d={<><path d="M20 6 9 17 4 22l5-5L20 6z"/><path d="M20 6c0 0-2-2-4 0s0 4 0 4"/><path d="M4 22c0 0 1-1 2-2"/></>} />;

// ─────────────────────────────────────────────
// DRAWING CANVAS  — Bible Tiles–style
// ─────────────────────────────────────────────
const TOOL_CONFIG = {
  pencil:    { label: 'Pencil',     defaultSize: 1.5,  defaultOpacity: 0.75, composite: 'source-over', smooth: true,  varyWidth: false },
  ballpoint: { label: 'Ballpoint',  defaultSize: 2.5,  defaultOpacity: 1.0,  composite: 'source-over', smooth: true,  varyWidth: false },
  fountain:  { label: 'Fountain',   defaultSize: 3,    defaultOpacity: 0.92, composite: 'source-over', smooth: true,  varyWidth: true  },
  marker:    { label: 'Marker',     defaultSize: 10,   defaultOpacity: 0.70, composite: 'source-over', smooth: false, varyWidth: false },
  highlighter:{ label: 'Highlight', defaultSize: 20,   defaultOpacity: 0.30, composite: 'source-over', smooth: false, varyWidth: false },
  eraser:    { label: 'Eraser',     defaultSize: 18,   defaultOpacity: 1.0,  composite: 'destination-out', smooth: true, varyWidth: false },
};

const PEN_COLORS = ['#1a1512','#3D2E1F','#B48C50','#dc2626','#2563eb','#16a34a','#7c3aed','#0891b2','#c026d3','#ea580c','#4b5563','#ffffff'];
const HL_COLORS  = ['#fef08a','#bbf7d0','#fed7aa','#bfdbfe','#fce7f3','#ddd6fe','#a5f3fc','#fde68a'];

function DrawingCanvas({ book, chapter, theme, isActive, onClose }) {
  const canvasRef      = useRef(null);
  const containerRef   = useRef(null);
  const strokesRef     = useRef([]);     // committed strokes
  const redoRef        = useRef([]);     // redo stack
  const currentRef     = useRef(null);   // stroke being drawn
  const drawingRef     = useRef(false);
  const lastPtRef      = useRef(null);
  const lastTimeRef    = useRef(0);
  const rafRef         = useRef(null);
  const dirty          = useRef(false);

  const [tool, setTool]       = useState('ballpoint');
  const [color, setColor]     = useState('#1a1512');
  const [size, setSize]       = useState(2.5);
  const [opacity, setOpacity] = useState(1.0);
  const [hlColor, setHlColor] = useState('#fef08a');
  const [showColors, setShowColors] = useState(false);
  const T = THEMES[theme];

  // Init canvas size + load saved strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const r = container.getBoundingClientRect();
      canvas.width  = r.width  * window.devicePixelRatio;
      canvas.height = r.height * window.devicePixelRatio;
      canvas.style.width  = r.width  + 'px';
      canvas.style.height = r.height + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      redrawAll();
    };

    const saved = getDrawingStrokes(book, chapter);
    strokesRef.current = saved || [];
    redoRef.current = [];

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [book, chapter]);

  // When tool changes, update defaults
  useEffect(() => {
    const cfg = TOOL_CONFIG[tool];
    if (!cfg) return;
    setSize(cfg.defaultSize);
    setOpacity(cfg.defaultOpacity);
    if (tool === 'highlighter') setColor(hlColor);
    else if (tool !== 'eraser') setColor(PEN_COLORS[0]);
  }, [tool]);

  const getLogicalCoords = (e) => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    let cx, cy;
    if (e.touches) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else           { cx = e.clientX;             cy = e.clientY; }
    return { x: cx - r.left, y: cy - r.top };
  };

  const renderStroke = useCallback((ctx, stroke) => {
    if (!stroke || stroke.points.length < 1) return;
    const pts = stroke.points;
    ctx.save();
    ctx.globalCompositeOperation = stroke.composite;
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';

    if (pts.length === 1) {
      // dot
      ctx.globalAlpha = stroke.opacity;
      ctx.fillStyle   = stroke.color;
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore(); return;
    }

    if (stroke.tool === 'fountain') {
      // variable-width segments based on velocity
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1], p1 = pts[i];
        const v = p1.v ?? 1;
        const w = Math.max(0.5, stroke.size * (1.5 - Math.min(v, 1)));
        ctx.globalAlpha = stroke.opacity;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth   = w;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    } else if (stroke.tool === 'pencil') {
      // pencil: draw slightly jittered thin lines
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth   = stroke.size;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const mp = { x: (pts[i-1].x + pts[i].x)/2, y: (pts[i-1].y + pts[i].y)/2 };
        ctx.quadraticCurveTo(pts[i-1].x, pts[i-1].y, mp.x, mp.y);
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
      ctx.stroke();
    } else if (stroke.smooth) {
      // smooth Catmull-Rom spline
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth   = stroke.size;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i-1)];
        const p1 = pts[i];
        const p2 = pts[i+1];
        const p3 = pts[Math.min(pts.length-1, i+2)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.stroke();
    } else {
      // straight segments (marker, highlighter)
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth   = stroke.size;
      ctx.lineCap = stroke.tool === 'highlighter' ? 'square' : 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, w, h);
    strokesRef.current.forEach(s => renderStroke(ctx, s));
    if (currentRef.current) renderStroke(ctx, currentRef.current);
  }, [renderStroke]);

  const scheduleDraw = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    redrawAll();
    rafRef.current = requestAnimationFrame(scheduleDraw);
  }, [redrawAll]);

  const onPointerDown = useCallback((e) => {
    if (!isActive) return;
    e.preventDefault();
    const pt = getLogicalCoords(e);
    const cfg = TOOL_CONFIG[tool];
    const col = tool === 'highlighter' ? hlColor : color;
    currentRef.current = {
      tool, color: col, size, opacity,
      composite: cfg.composite, smooth: cfg.smooth,
      points: [{ ...pt, v: 0, t: Date.now() }]
    };
    lastPtRef.current  = pt;
    lastTimeRef.current = Date.now();
    drawingRef.current = true;
    dirty.current = true;
    rafRef.current = requestAnimationFrame(scheduleDraw);
  }, [isActive, tool, color, hlColor, size, opacity, scheduleDraw]);

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current || !isActive) return;
    e.preventDefault();
    const pt   = getLogicalCoords(e);
    const now  = Date.now();
    const dt   = Math.max(1, now - lastTimeRef.current);
    const last = lastPtRef.current;
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    const v    = Math.min(1, dist / dt * 5); // normalised velocity
    currentRef.current.points.push({ ...pt, v, t: now });
    lastPtRef.current   = pt;
    lastTimeRef.current = now;
    dirty.current = true;
  }, [isActive]);

  const onPointerUp = useCallback((e) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentRef.current && currentRef.current.points.length > 0) {
      strokesRef.current = [...strokesRef.current, currentRef.current];
      redoRef.current = [];
      saveDrawingStrokes(book, chapter, strokesRef.current);
    }
    currentRef.current = null;
    dirty.current = true;
    redrawAll();
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, [book, chapter, redrawAll]);

  const undo = () => {
    if (!strokesRef.current.length) return;
    const last = strokesRef.current.pop();
    redoRef.current.push(last);
    saveDrawingStrokes(book, chapter, strokesRef.current);
    redrawAll();
  };
  const redo = () => {
    if (!redoRef.current.length) return;
    strokesRef.current.push(redoRef.current.pop());
    saveDrawingStrokes(book, chapter, strokesRef.current);
    redrawAll();
  };
  const clearAll = () => {
    redoRef.current = [...strokesRef.current, ...redoRef.current];
    strokesRef.current = [];
    clearDrawing(book, chapter);
    redrawAll();
  };

  const toolBtn = (t, Icon, label) => (
    <button key={t} title={label} onClick={() => setTool(t)} style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap:2,
      padding:'8px 6px', border:'none', borderRadius:8, cursor:'pointer',
      background: tool === t ? T.accent+'22' : 'transparent',
      color: tool === t ? T.accent : T.textSec,
      outline: tool === t ? `2px solid ${T.accent}` : 'none',
      transition:'all .15s'
    }}>
      <Icon size={18} />
      <span style={{fontSize:9, fontFamily:"'DM Sans',sans-serif", fontWeight:500}}>{label}</span>
    </button>
  );

  return (
    <div ref={containerRef} style={{ position:'absolute', inset:0, zIndex: isActive ? 30 : 4, pointerEvents: isActive ? 'auto' : 'none' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ position:'absolute', inset:0, cursor: isActive ? (tool==='eraser' ? 'cell' : 'crosshair') : 'default', touchAction:'none' }}
      />

      {isActive && (
        <div style={{
          position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8,
          zIndex:200, maxWidth:'98vw'
        }}>
          {/* TOOL ROW */}
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 12px', background: T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:'0 4px 24px rgba(0,0,0,.18)', flexWrap:'wrap', justifyContent:'center' }}>
            {toolBtn('pencil',    PencilIc,      'Pencil')}
            {toolBtn('ballpoint', PenIc,         'Pen')}
            {toolBtn('fountain',  FountainPen,   'Fountain')}
            {toolBtn('marker',    MarkerIc,      'Marker')}
            {toolBtn('highlighter', HighlighterIc, 'Highlight')}
            {toolBtn('eraser',    EraserIc,      'Eraser')}
            <div style={{width:1, height:32, background: T.border, margin:'0 4px'}} />
            <button title="Undo" onClick={undo} style={{ padding:'8px', border:'none', borderRadius:8, cursor:'pointer', background:'transparent', color: T.textSec }}>
              <Undo size={18} />
            </button>
            <button title="Redo" onClick={redo} style={{ padding:'8px', border:'none', borderRadius:8, cursor:'pointer', background:'transparent', color: T.textSec }}>
              <Redo size={18} />
            </button>
            <button title="Clear All" onClick={clearAll} style={{ padding:'8px', border:'none', borderRadius:8, cursor:'pointer', background:'transparent', color: T.error }}>
              <Trash size={18} />
            </button>
            <div style={{width:1, height:32, background: T.border, margin:'0 4px'}} />
            <button onClick={onClose} style={{ padding:'6px 14px', border:'none', borderRadius:8, cursor:'pointer', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600 }}>
              Done
            </button>
          </div>

          {/* COLOR + SIZE ROW */}
          {tool !== 'eraser' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background: T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:'0 4px 24px rgba(0,0,0,.12)', flexWrap:'wrap', justifyContent:'center' }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, marginRight:2 }}>
                {tool === 'highlighter' ? 'Highlight:' : 'Color:'}
              </span>
              {(tool === 'highlighter' ? HL_COLORS : PEN_COLORS).map(c => (
                <button key={c} onClick={() => tool==='highlighter' ? setHlColor(c) : setColor(c)}
                  style={{ width:22, height:22, borderRadius:'50%', background:c, border: (tool==='highlighter' ? hlColor : color)===c ? `3px solid ${T.text}` : `2px solid ${T.border}`, cursor:'pointer', outline: (tool==='highlighter' ? hlColor : color)===c ? `2px solid ${T.accent}` : 'none', outlineOffset:2 }} />
              ))}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:8 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec }}>Size:</span>
                <input type="range" min={0.5} max={tool==='highlighter'?30:12} step={0.5} value={size}
                  onChange={e=>setSize(+e.target.value)}
                  style={{ width:80, accentColor: T.accent }} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, minWidth:24 }}>{size}</span>
              </div>
              {tool !== 'highlighter' && (
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec }}>Opacity:</span>
                  <input type="range" min={10} max={100} step={5} value={Math.round(opacity*100)}
                    onChange={e=>setOpacity(+e.target.value/100)}
                    style={{ width:70, accentColor: T.accent }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMMENTARY MODAL
// ─────────────────────────────────────────────
function CommentaryModal({ book, chapter, verse, verseText, theme, onClose, onMemorize, onSaveNote }) {
  const [src, setSrc] = useState('ai');
  const T = THEMES[theme];
  const sources = [
    { id:'ai',          label:'✦ AI Study' },
    { id:'matthewHenry',label:'📖 M. Henry' },
    { id:'albertBarnes',label:'📜 A. Barnes' },
    { id:'johnCalvin',  label:'⛪ Calvin' },
    { id:'johnMacArthur',label:'🎓 MacArthur' },
  ];
  const commentary = generateCommentary(book, chapter, verse, verseText, src);

  const renderContent = (text) => text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,marginTop:16,marginBottom:4,color:T.text}}>{line.slice(2,-2)}</div>;
    if (line.startsWith('- ')) return <div key={i} style={{paddingLeft:16,marginBottom:4,color:T.text,fontSize:15,fontFamily:"'Crimson Pro',serif"}}>• {line.slice(2)}</div>;
    if (line.trim()==='') return <div key={i} style={{height:8}} />;
    return <p key={i} style={{marginBottom:6,color:T.text,fontSize:15,fontFamily:"'Crimson Pro',serif",lineHeight:1.8}}>{line}</p>;
  });

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background: T.surface, borderRadius:16, maxWidth:620, width:'100%', maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,.35)', animation:'slideUp .3s ease' }}>
        <div style={{ padding:'20px 24px 0', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:T.accent,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Commentary</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:T.text}}>{book} {chapter}:{verse}</div>
            </div>
            <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',color:T.textSec,padding:4}}><X size={20}/></button>
          </div>
          <div style={{background:T.bg,borderLeft:`3px solid ${T.accent}`,padding:'10px 14px',borderRadius:'0 8px 8px 0',marginBottom:12}}>
            <p style={{fontStyle:'italic',color:T.text,fontSize:15,fontFamily:"'Crimson Pro',serif",lineHeight:1.7,margin:0}}>{verseText}</p>
          </div>
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:12}}>
            {sources.map(s=>(
              <button key={s.id} onClick={()=>setSrc(s.id)} style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${src===s.id?T.accent:T.border}`,background:src===s.id?T.accent+'18':'transparent',color:src===s.id?T.accent:T.textSec,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,whiteSpace:'nowrap'}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{padding:'16px 24px',overflowY:'auto',flex:1}}>{renderContent(commentary)}</div>
        <div style={{padding:'12px 24px',borderTop:`1px solid ${T.border}`,display:'flex',gap:8,flexShrink:0}}>
          <button onClick={onMemorize} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.text,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
            <Star size={15}/> Memorize
          </button>
          <button onClick={()=>onSaveNote(commentary)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.text,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
            <Note size={15}/> Save Note
          </button>
          <button onClick={()=>navigator.clipboard?.writeText(verseText)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.text,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
            <Copy size={15}/> Copy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LIBRARY PAGE
// ─────────────────────────────────────────────
function LibraryPage({ theme, onNavigate }) {
  const [testament, setTestament] = useState('old');
  const T = THEMES[theme];
  const books = testament === 'old' ? OLD_TESTAMENT : NEW_TESTAMENT;

  return (
    <div style={{ padding:'24px 20px', maxWidth:1200, margin:'0 auto', animation:'fadeIn .35s ease' }}>
      <div style={{ textAlign:'center', padding:'40px 20px 32px' }}>
        <div style={{ fontSize:36, marginBottom:8, color: T.accent }}>✦</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:42, fontWeight:600, color: T.text, marginBottom:8 }}>Sacred Scripture</h1>
        <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', color: T.textSec, fontSize:17 }}>
          "Your word is a lamp to my feet and a light to my path" — Psalm 119:105
        </p>
      </div>

      {/* Quick Access */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:32 }}>
        {[
          { icon:'🔍', label:'Search',    page:'search' },
          { icon:'⭐', label:'Memory',    page:'memory' },
          { icon:'📋', label:'Plans',     page:'plans' },
          { icon:'👥', label:'Community', page:'community' },
          { icon:'🎙️', label:'Sermons',   page:'sermons' },
        ].map(c => (
          <button key={c.page} onClick={() => onNavigate(c.page)} style={{ padding:'18px 12px', borderRadius:12, border:`1px solid ${T.border}`, background: T.surface, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'all .2s' }}>
            <span style={{ fontSize:24 }}>{c.icon}</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color: T.text }}>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Testament toggle */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
        <div style={{ display:'flex', background: T.surface, borderRadius:30, border:`1px solid ${T.border}`, padding:3 }}>
          {['old','new'].map(t => (
            <button key={t} onClick={() => setTestament(t)} style={{ padding:'8px 24px', borderRadius:26, border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, background: testament===t ? T.bg : 'transparent', color: testament===t ? T.accent : T.textSec, boxShadow: testament===t ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition:'all .2s' }}>
              {t === 'old' ? 'Old Testament' : 'New Testament'}
            </button>
          ))}
        </div>
      </div>

      {/* Books grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
        {books.map((book, i) => (
          <button key={book.name} onClick={() => onNavigate('reader', { book: book.name, chapter: 1 })}
            style={{ padding:'14px 16px', borderRadius:10, border:`1px solid ${T.border}`, background: T.surface, cursor:'pointer', textAlign:'left', transition:'all .2s', animation:`fadeIn .35s ease ${i*15}ms both` }}>
            <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:16, color: T.text, marginBottom:3 }}>{book.name}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec }}>{book.chapters} chapters</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// READER PAGE
// ─────────────────────────────────────────────
function ReaderPage({ theme, initialBook, initialChapter, onNavigate }) {
  const [book, setBook]         = useState(initialBook || 'Genesis');
  const [chapter, setChapter]   = useState(initialChapter || 1);
  const [verses, setVerses]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [translation, setTrans] = useState(getSetting('translation','asv'));
  const [fontSize, setFontSize] = useState(getSetting('fontSize', 18));
  const [lineH, setLineH]       = useState(getSetting('lineHeight', 1.8));
  const [fontFam, setFontFam]   = useState(getSetting('fontFamily','serif'));
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes]       = useState(false);
  const [isDrawing, setIsDrawing]       = useState(false);
  const [bookmarked, setBookmarked]     = useState(false);
  const [selVerse, setSelVerse]         = useState(null);
  const [notes, setNotes]               = useState([]);
  const [noteText, setNoteText]         = useState('');
  const [editNoteId, setEditNoteId]     = useState(null);
  const [chapterTabOffset, setChapterTabOffset] = useState(0);
  const T = THEMES[theme];
  const bookData = ALL_BOOKS.find(b => b.name === book) || { chapters: 1 };
  const bodyFont = fontFam === 'serif' ? "'Crimson Pro',Georgia,serif" : "'DM Sans',system-ui,sans-serif";
  const scrollTopRef = useRef(null);

  useEffect(() => {
    setBookmarked(isBookmarked(book, chapter));
    setNotes(getChapterNotes(book, chapter));
    loadVerses();
    setSelVerse(null);
    // Align chapter tab window
    const offset = Math.max(0, chapter - 4);
    setChapterTabOffset(offset);
  }, [book, chapter, translation]);

  const loadVerses = async () => {
    setLoading(true);
    const data = await fetchChapter(book, chapter, translation);
    setVerses(data || []);
    setLoading(false);
    scrollTopRef.current?.scrollIntoView();
  };

  const saveSettings = (key, val) => {
    setSetting(key, val);
    if (key==='fontSize') setFontSize(val);
    if (key==='lineHeight') setLineH(val);
    if (key==='fontFamily') setFontFam(val);
    if (key==='translation') { setTrans(val); }
  };

  const handleBookmark = () => {
    toggleBookmark(book, chapter);
    setBookmarked(isBookmarked(book, chapter));
  };

  const handleSaveNote = (text = noteText) => {
    if (!text.trim()) return;
    const note = { id: editNoteId || Date.now().toString(), book, chapter, verse: selVerse?.verse || null, content: text, date: new Date().toISOString() };
    saveNote(note);
    setNotes(getChapterNotes(book, chapter));
    setNoteText(''); setEditNoteId(null);
  };

  const handleDeleteNote = (id) => { deleteNote(id); setNotes(getChapterNotes(book, chapter)); };

  const numTabs = 7;
  const tabStart = chapterTabOffset;
  const tabEnd   = Math.min(bookData.chapters, tabStart + numTabs);
  const tabNums  = Array.from({ length: tabEnd - tabStart }, (_, i) => tabStart + i + 1);

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <div ref={scrollTopRef} />
      {/* Chapter tab strip */}
      <div style={{ position:'sticky', top:60, zIndex:20, background: T.navBg, borderBottom:`1px solid ${T.border}`, backdropFilter:'blur(8px)', padding:'8px 12px', display:'flex', alignItems:'center', gap:4, overflowX:'auto' }}>
        <button onClick={() => setChapterTabOffset(Math.max(0, chapterTabOffset-numTabs))} disabled={chapterTabOffset===0}
          style={{ background:'transparent', border:'none', cursor:'pointer', color: T.textSec, padding:'4px 6px', opacity: chapterTabOffset===0?0.3:1 }}><ChevL size={16}/></button>
        {tabNums.map(n => (
          <button key={n} onClick={() => setChapter(n)} style={{ padding:'4px 10px', borderRadius:6, border: chapter===n ? `1.5px solid ${T.accent}` : `1px solid ${T.border}`, background: chapter===n ? T.accent+'18' : 'transparent', color: chapter===n ? T.accent : T.textSec, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight: chapter===n ? 600 : 400, cursor:'pointer', minWidth:32, whiteSpace:'nowrap' }}>
            {n}
          </button>
        ))}
        <button onClick={() => setChapterTabOffset(Math.min(bookData.chapters - numTabs, chapterTabOffset+numTabs))} disabled={tabEnd >= bookData.chapters}
          style={{ background:'transparent', border:'none', cursor:'pointer', color: T.textSec, padding:'4px 6px', opacity: tabEnd>=bookData.chapters?0.3:1 }}><ChevR size={16}/></button>
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color: T.text, fontWeight:600, whiteSpace:'nowrap' }}>{book} {chapter}</span>
      </div>

      {/* Header actions */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', maxWidth:900, margin:'0 auto' }}>
        <button onClick={() => onNavigate('library')} style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', cursor:'pointer', color: T.accent, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>
          <ChevL size={16}/> Library
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setIsDrawing(!isDrawing)} title="Draw" style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${T.border}`, background: isDrawing ? T.accent : T.surface, color: isDrawing ? '#fff' : T.text, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:13, display:'flex', alignItems:'center', gap:5 }}>
            <PencilIc size={15}/> {isDrawing ? 'Drawing…' : 'Draw'}
          </button>
          <button onClick={handleBookmark} title="Bookmark" style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.surface, color: bookmarked ? T.accent : T.textSec, cursor:'pointer' }}>
            <BookmarkIc size={16}/>
          </button>
          <button onClick={() => setShowNotes(!showNotes)} title="Notes" style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: showNotes ? T.accent+'18' : T.surface, color: showNotes ? T.accent : T.textSec, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <Note size={16}/> {notes.length > 0 && <span style={{ background: T.accent, color:'#fff', borderRadius:10, fontSize:10, padding:'0 5px', fontFamily:"'DM Sans',sans-serif" }}>{notes.length}</span>}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.surface, color: T.textSec, cursor:'pointer' }}>
            <Settings size={16}/>
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={{ margin:'0 20px 16px', maxWidth:860, marginLeft:'auto', marginRight:'auto', background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 20px', animation:'slideUp .25s ease' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'center' }}>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, marginBottom:6, textTransform:'uppercase', letterSpacing:.5 }}>Theme</div>
              <div style={{ display:'flex', gap:8 }}>
                {['light','sepia','dark'].map(t => (
                  <button key={t} onClick={() => setSetting('theme', t)} style={{ width:28, height:28, borderRadius:'50%', background: THEMES[t].bg, border: theme===t ? `3px solid ${T.accent}` : `2px solid ${T.border}`, cursor:'pointer' }} title={t} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, marginBottom:6 }}>Font Size: {fontSize}px</div>
              <input type="range" min={14} max={28} value={fontSize} onChange={e => saveSettings('fontSize',+e.target.value)} style={{ width:120, accentColor: T.accent }} />
            </div>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, marginBottom:6 }}>Line Height: {lineH}</div>
              <input type="range" min={1.4} max={2.4} step={0.1} value={lineH} onChange={e => saveSettings('lineHeight',+e.target.value)} style={{ width:100, accentColor: T.accent }} />
            </div>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, marginBottom:6 }}>Font</div>
              <div style={{ display:'flex', gap:6 }}>
                {['serif','sans'].map(f => (
                  <button key={f} onClick={() => saveSettings('fontFamily',f)} style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${fontFam===f?T.accent:T.border}`, background: fontFam===f?T.accent+'15':'transparent', color: fontFam===f?T.accent:T.textSec, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>{f==='serif'?'Serif':'Sans'}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, marginBottom:6 }}>Translation</div>
              <select value={translation} onChange={e => saveSettings('translation', e.target.value)} style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:'pointer' }}>
                {TRANSLATIONS.map(tr => <option key={tr.code} value={tr.code}>{tr.label} — {tr.full}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', maxWidth:1160, margin:'0 auto', padding:'0 16px', gap:20 }}>
        {/* Verse area */}
        <div style={{ flex:1, position:'relative', minHeight:300 }}>
          <DrawingCanvas book={book} chapter={chapter} theme={theme} isActive={isDrawing} onClose={() => setIsDrawing(false)} />
          <div style={{ maxWidth:680, margin:'0 auto', padding:'8px 0 80px', position:'relative', zIndex: isDrawing?0:10 }}>
            {loading ? (
              <div style={{ textAlign:'center', padding:60, color: T.textSec, animation:'pulse 1.5s infinite' }}>
                <div style={{ fontSize:30, marginBottom:12 }}>✦</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Loading scripture…</div>
              </div>
            ) : verses.length ? (
              <p style={{ fontFamily: bodyFont, fontSize, lineHeight: lineH, color: T.text, textAlign:'justify' }}>
                {verses.map(v => (
                  <span key={v.verse} onClick={() => !isDrawing && setSelVerse(v)} style={{ cursor: isDrawing?'default':'pointer', background: selVerse?.verse===v.verse ? T.accent+'25' : 'transparent', borderRadius:3, padding:'1px 2px', transition:'background .15s' }}>
                    <sup style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.6em', color: T.accent, fontWeight:500, marginRight:2 }}>{v.verse}</sup>
                    {v.text}{' '}
                  </span>
                ))}
              </p>
            ) : (
              <div style={{ textAlign:'center', padding:60, color: T.textSec }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Could not load chapter. Check your internet connection.</div>
              </div>
            )}
          </div>
        </div>

        {/* Notes sidebar */}
        {showNotes && (
          <div style={{ width:300, flexShrink:0, position:'sticky', top:120, alignSelf:'flex-start', maxHeight:'calc(100vh - 140px)', overflowY:'auto', background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16, animation:'slideUp .25s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color: T.textSec }}>Notes</span>
              <button onClick={() => setShowNotes(false)} style={{ background:'transparent', border:'none', cursor:'pointer', color: T.textSec }}><X size={16}/></button>
            </div>
            {selVerse && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.accent, marginBottom:6 }}>Verse {selVerse.verse} selected</div>}
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note…" rows={4}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:15, resize:'vertical', marginBottom:8, outline:'none' }} />
            <button onClick={() => handleSaveNote()} style={{ width:'100%', padding:'8px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:'pointer', marginBottom:16 }}>
              {editNoteId ? 'Update Note' : 'Save Note'}
            </button>
            {notes.length === 0 ? (
              <p style={{ fontStyle:'italic', color: T.textSec, fontSize:14, fontFamily:"'Crimson Pro',serif" }}>No notes for this chapter yet.</p>
            ) : notes.map(n => (
              <div key={n.id} style={{ background: T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
                {n.verse && <span style={{ background: T.accent, color:'#fff', borderRadius:4, fontSize:10, padding:'2px 6px', fontFamily:"'DM Sans',sans-serif", marginBottom:6, display:'inline-block' }}>v. {n.verse}</span>}
                <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:14, color: T.text, margin:'6px 0' }}>{n.content}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec }}>{new Date(n.date).toLocaleDateString()}</span>
                  <div style={{ display:'flex', gap:4 }}>
                    <button onClick={() => { setNoteText(n.content); setEditNoteId(n.id); }} style={{ background:'transparent', border:'none', cursor:'pointer', color: T.textSec, padding:4 }}><Edit2 size={14}/></button>
                    <button onClick={() => handleDeleteNote(n.id)} style={{ background:'transparent', border:'none', cursor:'pointer', color: T.error, padding:4 }}><Trash size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chapter nav */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'16px 20px', display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'center', borderTop:`1px solid ${T.border}` }}>
        <button onClick={() => setChapter(c => Math.max(1, c-1))} disabled={chapter===1} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, border:`1px solid ${T.border}`, background: T.surface, color: chapter===1 ? T.textSec : T.text, cursor: chapter===1 ? 'default' : 'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:14, opacity: chapter===1?0.4:1 }}>
          <ChevL size={16}/> Previous
        </button>
        <select value={chapter} onChange={e => setChapter(+e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, cursor:'pointer' }}>
          {Array.from({ length: bookData.chapters }, (_, i) => <option key={i+1} value={i+1}>Chapter {i+1}</option>)}
        </select>
        <button onClick={() => setChapter(c => Math.min(bookData.chapters, c+1))} disabled={chapter===bookData.chapters} style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:6, padding:'8px 16px', borderRadius:8, border:`1px solid ${T.border}`, background: T.surface, color: chapter===bookData.chapters ? T.textSec : T.text, cursor: chapter===bookData.chapters ? 'default' : 'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:14, opacity: chapter===bookData.chapters?0.4:1 }}>
          Next <ChevR size={16}/>
        </button>
      </div>

      {/* Commentary modal */}
      {selVerse && !isDrawing && (
        <CommentaryModal
          book={book} chapter={chapter} verse={selVerse.verse} verseText={selVerse.text} theme={theme}
          onClose={() => setSelVerse(null)}
          onMemorize={() => { addMemoryVerse({ book, chapter, verse: selVerse.verse, text: selVerse.text }); setSelVerse(null); }}
          onSaveNote={(txt) => { handleSaveNote(txt); setSelVerse(null); setShowNotes(true); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SEARCH PAGE
// ─────────────────────────────────────────────
function SearchPage({ theme, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const T = THEMES[theme];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setResults(null);
    // Search popular passages by fetching a few books
    // For demo: search Genesis 1, John 3, Psalm 23
    const searchBooks = ['Genesis','John','Psalms','Romans','Matthew','Proverbs','Isaiah','Revelation'];
    const found = [];
    for (const book of searchBooks) {
      if (found.length >= 30) break;
      const data = await fetchChapter(book, 1);
      if (data) {
        data.forEach(v => { if (v.text.toLowerCase().includes(query.toLowerCase()) && found.length < 30) found.push({ book, chapter: v.chapter, verse: v.verse, text: v.text }); });
      }
    }
    setResults(found); setLoading(false);
  };

  const highlight = (text) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return text;
    return <>{text.slice(0, idx)}<mark style={{ background: THEMES[theme].accent+'40', borderRadius:2 }}>{text.slice(idx, idx+query.length)}</mark>{text.slice(idx+query.length)}</>;
  };

  return (
    <div style={{ padding:'32px 20px', maxWidth:680, margin:'0 auto', animation:'fadeIn .35s ease' }}>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color: T.text, marginBottom:24 }}>Search</h2>
      <div style={{ display:'flex', gap:10, marginBottom:24 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSearch()}
          placeholder="Search words, phrases, or references…"
          style={{ flex:1, padding:'12px 16px', borderRadius:10, border:`1px solid ${T.border}`, background: T.surface, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:16, outline:'none' }} />
        <button onClick={handleSearch} style={{ padding:'12px 20px', borderRadius:10, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          <SearchIc size={16}/> Search
        </button>
      </div>
      {!results && !loading && (
        <div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color: T.textSec, marginBottom:12 }}>Popular Passages</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {POPULAR_PASSAGES.map(p => (
              <button key={p.label} onClick={() => onNavigate('reader', { book: p.book, chapter: p.chapter })}
                style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${T.border}`, background: T.surface, color: T.text, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {loading && <div style={{ textAlign:'center', padding:40, color: T.textSec, fontFamily:"'DM Sans',sans-serif" }}>Searching…</div>}
      {results && (
        <div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color: T.textSec, marginBottom:16 }}>{results.length} result(s) found</div>
          {results.length === 0 && <p style={{ fontFamily:"'Crimson Pro',serif", color: T.textSec, fontStyle:'italic' }}>No results found. Try a different search term.</p>}
          {results.map((r, i) => (
            <div key={i} onClick={() => onNavigate('reader', { book: r.book, chapter: r.chapter })}
              style={{ padding:'12px 16px', borderRadius:10, border:`1px solid ${T.border}`, background: T.surface, marginBottom:10, cursor:'pointer', animation:`slideUp .3s ease ${i*40}ms both` }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color: T.accent, marginBottom:4 }}>{r.book} {r.chapter}:{r.verse}</div>
              <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color: T.text, lineHeight:1.6 }}>{highlight(r.text)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MEMORY PAGE
// ─────────────────────────────────────────────
function MemoryPage({ theme }) {
  const [verses, setVerses]       = useState(getMemoryVerses());
  const [showAdd, setShowAdd]     = useState(false);
  const [addBook, setAddBook]     = useState('Genesis');
  const [addCh, setAddCh]         = useState(1);
  const [addV, setAddV]           = useState(1);
  const [reviewing, setReviewing] = useState(false);
  const [revIdx, setRevIdx]       = useState(0);
  const [revealed, setRevealed]   = useState(false);
  const T = THEMES[theme];
  const due = getDueVerses();

  const refresh = () => setVerses(getMemoryVerses());

  const handleAdd = async () => {
    const text = await fetchVerse(addBook, addCh, addV);
    if (text) { addMemoryVerse({ book: addBook, chapter: addCh, verse: addV, text }); refresh(); setShowAdd(false); }
  };

  const handleReview = (q) => {
    reviewVerse(due[revIdx].id, q);
    refresh();
    if (revIdx < due.length - 1) { setRevIdx(r => r+1); setRevealed(false); }
    else { setReviewing(false); setRevIdx(0); setRevealed(false); }
  };

  return (
    <div style={{ padding:'32px 20px', maxWidth:680, margin:'0 auto', animation:'fadeIn .35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color: T.text }}>Memory Verses</h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color: T.textSec, marginTop:4 }}>{verses.length} verses · {due.length} due for review</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {due.length > 0 && <button onClick={() => { setReviewing(true); setRevIdx(0); setRevealed(false); }} style={{ padding:'8px 16px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:'pointer' }}>Review ({due.length})</button>}
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${T.border}`, background: T.surface, color: T.text, cursor:'pointer' }}><Plus size={18}/></button>
        </div>
      </div>

      {showAdd && (
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:20, animation:'slideUp .25s ease' }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <select value={addBook} onChange={e => setAddBook(e.target.value)} style={{ flex:2, padding:'8px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
              {ALL_BOOKS.map(b => <option key={b.name}>{b.name}</option>)}
            </select>
            <input type="number" min={1} value={addCh} onChange={e => setAddCh(+e.target.value)} placeholder="Ch" style={{ width:70, padding:'8px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }} />
            <input type="number" min={1} value={addV} onChange={e => setAddV(+e.target.value)} placeholder="Vs" style={{ width:70, padding:'8px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }} />
            <button onClick={handleAdd} style={{ padding:'8px 16px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:'pointer' }}>Add Verse</button>
          </div>
        </div>
      )}

      {reviewing && due[revIdx] && (
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:28, marginBottom:24, textAlign:'center', animation:'slideUp .25s ease' }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color: T.textSec, marginBottom:8 }}>{revIdx+1} of {due.length}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color: T.accent, marginBottom:16 }}>{due[revIdx].book} {due[revIdx].chapter}:{due[revIdx].verse}</div>
          {!revealed ? (
            <button onClick={() => setRevealed(true)} style={{ padding:'10px 24px', borderRadius:10, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, cursor:'pointer' }}>Show Verse</button>
          ) : (
            <>
              <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, color: T.text, lineHeight:1.7, marginBottom:20 }}>{due[revIdx].text}</p>
              <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
                {[{label:'Hard',q:2,color:'#C77C5A'},{label:'Good',q:4,color:T.accent},{label:'Easy',q:5,color:'#7A9B6D'}].map(b => (
                  <button key={b.label} onClick={() => handleReview(b.q)} style={{ padding:'10px 20px', borderRadius:10, border:'none', background: b.color, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:'pointer' }}>{b.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {verses.length === 0 && !reviewing ? (
        <div style={{ textAlign:'center', padding:60, color: T.textSec }}>
          <Star size={32} style={{ marginBottom:12, opacity:.4 }} />
          <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', fontSize:16 }}>No memory verses yet. Add your first verse to begin memorizing.</p>
        </div>
      ) : verses.map((v, i) => (
        <div key={v.id} style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'14px 18px', marginBottom:10, animation:`fadeIn .35s ease ${i*25}ms both` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color: T.accent }}>{v.book} {v.chapter}:{v.verse}</div>
            <button onClick={() => { deleteMemoryVerse(v.id); refresh(); }} style={{ background:'transparent', border:'none', cursor:'pointer', color: T.error, padding:4 }}><Trash size={14}/></button>
          </div>
          <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color: T.text, lineHeight:1.7, margin:'6px 0' }}>{v.text}</p>
          <div style={{ display:'flex', gap:16, fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec }}>
            <span>Reviews: {v.reviewCount}</span>
            <span>Interval: {v.interval}d</span>
            <span>Next: {new Date(v.nextReview).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// PLANS PAGE
// ─────────────────────────────────────────────
function PlansPage({ theme, onNavigate }) {
  const [plans, setPlans]     = useState(getPlans());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]     = useState('');
  const [desc, setDesc]       = useState('');
  const [readings, setReadings] = useState([]);
  const [rBook, setRBook]     = useState('Genesis');
  const [rCh, setRCh]         = useState(1);
  const T = THEMES[theme];
  const refresh = () => setPlans(getPlans());

  const handleCreate = () => {
    if (!title.trim() || readings.length === 0) return;
    addPlan({ title, description: desc, readings });
    setTitle(''); setDesc(''); setReadings([]); setShowForm(false); refresh();
  };

  return (
    <div style={{ padding:'32px 20px', maxWidth:680, margin:'0 auto', animation:'fadeIn .35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color: T.text }}>Study Plans</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'8px 16px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          <Plus size={16}/> New Plan
        </button>
      </div>

      {showForm && (
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:20, animation:'slideUp .25s ease' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Plan title…" style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:16, marginBottom:10, outline:'none' }} />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)…" rows={2} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:15, marginBottom:12, outline:'none', resize:'none' }} />
          <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
            <select value={rBook} onChange={e => setRBook(e.target.value)} style={{ flex:2, padding:'7px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
              {ALL_BOOKS.map(b => <option key={b.name}>{b.name}</option>)}
            </select>
            <input type="number" min={1} value={rCh} onChange={e => setRCh(+e.target.value)} placeholder="Ch" style={{ width:70, padding:'7px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }} />
            <button onClick={() => setReadings(r => [...r, { book: rBook, chapter: rCh, completed: false }])} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>Add</button>
          </div>
          {readings.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
              {readings.map((r, i) => (
                <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', background: T.accent+'18', borderRadius:14, fontFamily:"'DM Sans',sans-serif", fontSize:12, color: T.accent }}>
                  {r.book} {r.chapter}
                  <button onClick={() => setReadings(rd => rd.filter((_,j)=>j!==i))} style={{ background:'transparent', border:'none', cursor:'pointer', color: T.accent, padding:0, lineHeight:1 }}><X size={12}/></button>
                </span>
              ))}
            </div>
          )}
          <button onClick={handleCreate} disabled={!title.trim()||readings.length===0} style={{ padding:'9px 20px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:'pointer', opacity: (!title.trim()||readings.length===0)?0.5:1 }}>Create Plan</button>
        </div>
      )}

      {plans.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color: T.textSec }}>
          <Clock size={32} style={{ marginBottom:12, opacity:.4 }} />
          <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', fontSize:16 }}>No study plans yet. Create your first plan to start your journey.</p>
        </div>
      ) : plans.map((plan, pi) => {
        const done = plan.readings.filter(r=>r.completed).length;
        const pct  = Math.round((done/plan.readings.length)*100);
        return (
          <div key={plan.id} style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 20px', marginBottom:14, animation:`fadeIn .35s ease ${pi*30}ms both` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color: T.text }}>{plan.title}</div>
                {plan.description && <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:14, color: T.textSec, marginTop:2 }}>{plan.description}</div>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ padding:'3xx 10px', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, background: plan.status==='completed' ? '#7A9B6D22' : T.accent+'18', color: plan.status==='completed' ? '#7A9B6D' : T.accent }}>{plan.status}</span>
                <button onClick={() => { deletePlan(plan.id); refresh(); }} style={{ background:'transparent', border:'none', cursor:'pointer', color: T.error }}><Trash size={15}/></button>
              </div>
            </div>
            <div style={{ height:4, background: T.border, borderRadius:2, marginBottom:6, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background: T.accent, borderRadius:2, transition:'width .4s' }} />
            </div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec, marginBottom:10 }}>{done} of {plan.readings.length} completed</div>
            {plan.readings.map((r, ri) => (
              <div key={ri} onClick={() => toggleReading(plan.id, ri) || refresh()} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', cursor:'pointer', borderTop: ri>0 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${r.completed ? '#7A9B6D' : T.border}`, background: r.completed ? '#7A9B6D' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {r.completed && <Check size={12} style={{ color:'#fff', strokeWidth:3 }} />}
                </div>
                <span onClick={e => { e.stopPropagation(); onNavigate('reader', { book: r.book, chapter: r.chapter }); }}
                  style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color: r.completed ? T.textSec : T.text, textDecoration: r.completed ? 'line-through' : 'none', cursor:'pointer' }}>
                  {r.book} {r.chapter}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMMUNITY PAGE
// ─────────────────────────────────────────────
function CommunityPage({ theme }) {
  const [groups, setGroups]   = useState(getGroups());
  const [activeGroup, setActiveGroup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [gName, setGName]     = useState('');
  const [gDesc, setGDesc]     = useState('');
  const [gPublic, setGPublic] = useState(true);
  const [msgText, setMsgText] = useState('');
  const T = THEMES[theme];
  const refresh = () => setGroups(getGroups());

  const handleCreate = () => {
    if (!gName.trim()) return;
    const code = Math.random().toString(36).substr(2,6).toUpperCase();
    addGroup({ name: gName, description: gDesc, is_public: gPublic, members: ['You'], invite_code: code });
    setGName(''); setGDesc(''); setShowForm(false); refresh();
  };

  const handlePost = () => {
    if (!msgText.trim() || !activeGroup) return;
    addMessage(activeGroup.id, { author: 'You', content: msgText });
    setMsgText(''); refresh();
    setActiveGroup(getGroups().find(g => g.id === activeGroup.id) || null);
  };

  if (activeGroup) {
    const group = groups.find(g => g.id === activeGroup.id) || activeGroup;
    return (
      <div style={{ padding:'24px 20px', maxWidth:680, margin:'0 auto', animation:'fadeIn .35s ease' }}>
        <button onClick={() => setActiveGroup(null)} style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', cursor:'pointer', color: T.accent, fontFamily:"'DM Sans',sans-serif", fontSize:14, marginBottom:20 }}>
          <ChevL size={16}/> Back to Groups
        </button>
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color: T.text, marginBottom:4 }}>{group.name}</div>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:14, color: T.textSec, marginBottom:8 }}>{group.description}</div>
          <div style={{ display:'flex', gap:12, fontFamily:"'DM Sans',sans-serif", fontSize:12, color: T.textSec }}>
            <span>{group.members.length} members</span>
            <span>Code: <strong style={{color:T.accent}}>{group.invite_code}</strong></span>
          </div>
        </div>
        {group.discussions.length === 0 ? (
          <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', color: T.textSec, marginBottom:20 }}>No discussions yet. Start the conversation!</p>
        ) : group.discussions.map(d => (
          <div key={d.id} style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'12px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color: T.accent }}>{d.author}</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color: T.textSec }}>{new Date(d.date).toLocaleString()}</span>
            </div>
            <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color: T.text, lineHeight:1.6 }}>{d.content}</p>
          </div>
        ))}
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key==='Enter' && handlePost()} placeholder="Share your thoughts…" style={{ flex:1, padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.surface, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:15, outline:'none' }} />
          <button onClick={handlePost} style={{ padding:'10px 18px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:'pointer' }}>Post</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'32px 20px', maxWidth:680, margin:'0 auto', animation:'fadeIn .35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color: T.text }}>Community</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'8px 16px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          <Plus size={16}/> New Group
        </button>
      </div>
      {showForm && (
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:20, animation:'slideUp .25s ease' }}>
          <input value={gName} onChange={e => setGName(e.target.value)} placeholder="Group name…" style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:16, marginBottom:10, outline:'none' }} />
          <textarea value={gDesc} onChange={e => setGDesc(e.target.value)} placeholder="Description…" rows={2} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:15, marginBottom:10, outline:'none', resize:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            {[{v:true,l:'Public'},{v:false,l:'Private'}].map(o => (
              <label key={String(o.v)} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:13, color: T.text }}>
                <input type="radio" checked={gPublic===o.v} onChange={() => setGPublic(o.v)} style={{ accentColor: T.accent }} /> {o.l}
              </label>
            ))}
          </div>
          <button onClick={handleCreate} style={{ padding:'9px 20px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:'pointer' }}>Create Group</button>
        </div>
      )}
      {groups.map((g, i) => (
        <div key={g.id} onClick={() => setActiveGroup(g)} style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 20px', marginBottom:12, cursor:'pointer', animation:`fadeIn .35s ease ${i*25}ms both`, transition:'border-color .2s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color: T.text }}>{g.name}</div>
            <span style={{ padding:'3px 10px', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, background: g.is_public ? '#7A9B6D22' : T.accent+'18', color: g.is_public ? '#7A9B6D' : T.accent }}>{g.is_public?'Public':'Private'}</span>
          </div>
          <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:14, color: T.textSec, margin:'4px 0 8px' }}>{g.description}</p>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color: T.textSec }}>{g.members.length} members · {g.discussions.length} discussions</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SERMONS PAGE
// ─────────────────────────────────────────────
function SermonsPage({ theme }) {
  const [sermons, setSermons]   = useState(getSermons());
  const [active, setActive]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]       = useState('');
  const [speaker, setSpeaker]   = useState('');
  const [sBook, setSBook]       = useState('Genesis');
  const [sCh, setSCh]           = useState(1);
  const [sVs, setSVs]           = useState('');
  const [notes, setNotes]       = useState('');
  const [recording, setRecording] = useState(false);
  const [recPaused, setRecPaused] = useState(false);
  const [recTime, setRecTime]     = useState(0);
  const [audioUrl, setAudioUrl]   = useState(null);
  const mediaRecRef = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const T = THEMES[theme];
  const refresh = () => setSermons(getSermons());

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(100);
      mediaRecRef.current = mr;
      setRecording(true); setRecPaused(false); setRecTime(0);
      timerRef.current = setInterval(() => setRecTime(t => t+1), 1000);
    } catch(e) { alert('Microphone access denied. Please allow microphone access to record.'); }
  };

  const pauseRecording = () => {
    if (mediaRecRef.current?.state === 'recording') { mediaRecRef.current.pause(); setRecPaused(true); clearInterval(timerRef.current); }
    else if (mediaRecRef.current?.state === 'paused') { mediaRecRef.current.resume(); setRecPaused(false); timerRef.current = setInterval(() => setRecTime(t => t+1), 1000); }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop(); setRecording(false); setRecPaused(false); clearInterval(timerRef.current);
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleSave = () => {
    if (!title.trim()) return;
    addSermon({ title, speaker, book: sBook, chapter: sCh, verses: sVs, transcript: notes, audioUrl, duration: recTime,
      summary: `A message on ${sBook} ${sCh}${sVs?':'+sVs:''} exploring the depths of scriptural truth and its application to daily Christian living.`,
      key_points: ['Understand the historical context', 'Apply the timeless principles', 'Walk in obedience to the Word', 'Share these truths with others'] });
    setTitle(''); setSpeaker(''); setNotes(''); setAudioUrl(null); setRecTime(0); setShowForm(false); refresh();
  };

  if (active) {
    return (
      <div style={{ padding:'24px 20px', maxWidth:680, margin:'0 auto', animation:'fadeIn .35s ease' }}>
        <button onClick={() => setActive(null)} style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', cursor:'pointer', color: T.accent, fontFamily:"'DM Sans',sans-serif", fontSize:14, marginBottom:20 }}>
          <ChevL size={16}/> Back
        </button>
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'24px 28px' }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color: T.accent, marginBottom:4 }}>{active.book} {active.chapter}{active.verses?':'+active.verses:''}</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color: T.text, marginBottom:6 }}>{active.title}</h2>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color: T.textSec, marginBottom:20 }}>{active.speaker} · {active.date}</div>
          {active.audioUrl && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color: T.textSec, marginBottom:6 }}>Recording</div>
              <audio src={active.audioUrl} controls style={{ width:'100%' }} />
            </div>
          )}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color: T.textSec, marginBottom:6 }}>Summary</div>
            <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color: T.text, lineHeight:1.7 }}>{active.summary}</p>
          </div>
          {active.key_points?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color: T.textSec, marginBottom:6 }}>Key Points</div>
              {active.key_points.map((pt, i) => <div key={i} style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color: T.text, lineHeight:1.7 }}>{i+1}. {pt}</div>)}
            </div>
          )}
          {active.transcript && (
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color: T.textSec, marginBottom:6 }}>Notes / Transcript</div>
              <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color: T.text, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{active.transcript}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'32px 20px', maxWidth:680, margin:'0 auto', animation:'fadeIn .35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color: T.text }}>Sermons</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'8px 16px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          <Plus size={16}/> Record
        </button>
      </div>

      {showForm && (
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:20, animation:'slideUp .25s ease' }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Sermon title…" style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:16, marginBottom:10, outline:'none' }} />
          <input value={speaker} onChange={e=>setSpeaker(e.target.value)} placeholder="Speaker name…" style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, marginBottom:10, outline:'none' }} />
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <select value={sBook} onChange={e=>setSBook(e.target.value)} style={{ flex:2, padding:'8px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
              {ALL_BOOKS.map(b=><option key={b.name}>{b.name}</option>)}
            </select>
            <input type="number" min={1} value={sCh} onChange={e=>setSCh(+e.target.value)} placeholder="Ch" style={{ width:70, padding:'8px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }} />
            <input value={sVs} onChange={e=>setSVs(e.target.value)} placeholder="Verses (1-6)" style={{ width:100, padding:'8px 10px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }} />
          </div>

          {/* Recording UI */}
          <div style={{ textAlign:'center', padding:'20px 0', borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, marginBottom:16 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:28, fontWeight:600, color: recording ? '#dc2626' : T.textSec, marginBottom:8, letterSpacing:2, animation: recording&&!recPaused?'recPulse 1s infinite':undefined }}>{fmt(recTime)}</div>
            <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
              {!recording ? (
                <button onClick={startRecording} style={{ width:56, height:56, borderRadius:'50%', border:`2px solid ${T.accent}`, background:'transparent', color: T.accent, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Mic size={24}/>
                </button>
              ) : (
                <>
                  <button onClick={pauseRecording} style={{ width:44, height:44, borderRadius:'50%', border:`2px solid ${T.textSec}`, background:'transparent', color: T.textSec, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {recPaused ? <Play size={18}/> : <Pause size={18}/>}
                  </button>
                  <button onClick={stopRecording} style={{ width:44, height:44, borderRadius:'50%', border:`2px solid #dc2626`, background:'transparent', color:'#dc2626', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Stop size={18}/>
                  </button>
                </>
              )}
            </div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color: T.textSec, marginTop:8 }}>{recording ? (recPaused?'Paused':'Recording…') : 'Tap mic to record'}</div>
            {audioUrl && <audio src={audioUrl} controls style={{ marginTop:12, width:'100%' }} />}
          </div>

          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Sermon notes / transcript…" rows={5} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${T.border}`, background: T.bg, color: T.text, fontFamily:"'Crimson Pro',serif", fontSize:15, resize:'vertical', outline:'none', marginBottom:12 }} />
          <button onClick={handleSave} disabled={!title.trim()} style={{ padding:'10px 24px', borderRadius:8, border:'none', background: T.accent, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:'pointer', opacity: !title.trim()?0.5:1 }}>Save Sermon</button>
        </div>
      )}

      {sermons.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color: T.textSec }}><Mic size={32} style={{marginBottom:12,opacity:.4}}/><p style={{fontFamily:"'Crimson Pro',serif",fontStyle:'italic',fontSize:16}}>No sermons yet. Record your first message.</p></div>
      ) : sermons.map((s, i) => (
        <div key={s.id} onClick={() => setActive(s)} style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'14px 18px', marginBottom:10, cursor:'pointer', animation:`fadeIn .35s ease ${i*25}ms both` }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color: T.accent, marginBottom:4 }}>{s.book} {s.chapter}{s.verses?':'+s.verses:''}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color: T.text, marginBottom:4 }}>{s.title}</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color: T.textSec }}>{s.speaker}{s.speaker&&' · '}{s.date}{s.duration>0&&' · '+fmt(s.duration)}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
function NavBar({ page, theme, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const T = THEMES[theme];
  const tabs = [
    { id:'library',   label:'Library',   icon:'📖' },
    { id:'search',    label:'Search',    icon:'🔍' },
    { id:'memory',    label:'Memory',    icon:'⭐' },
    { id:'plans',     label:'Plans',     icon:'📋' },
    { id:'community', label:'Community', icon:'👥' },
    { id:'sermons',   label:'Sermons',   icon:'🎙️' },
  ];
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, height:60, zIndex:50, background: T.navBg, backdropFilter:'blur(12px)', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px' }}>
      <button onClick={() => onNavigate('library')} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color: T.accent, background:'transparent', border:'none', cursor:'pointer' }}>✦ Sacred Scripture</button>
      <div className="nav-tabs" style={{ display:'flex', gap:4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { onNavigate(t.id); setMenuOpen(false); }}
            style={{ padding:'6px 12px', borderRadius:8, border:'none', background: page===t.id ? T.accent+'18' : 'transparent', color: page===t.id ? T.accent : T.textSec, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight: page===t.id?600:400, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{fontSize:14}}>{t.icon}</span>
            <span style={{display:'none'}} className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage]       = useState('library');
  const [readerBook, setReaderBook]     = useState('Genesis');
  const [readerChapter, setReaderChapter] = useState(1);
  const [theme, setTheme]     = useState(() => getSetting('theme', 'light'));

  // Listen for theme changes
  useEffect(() => {
    const handler = () => setTheme(getSetting('theme', 'light'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleNavigate = (dest, params = {}) => {
    if (dest === 'reader') {
      setReaderBook(params.book || readerBook);
      setReaderChapter(params.chapter || 1);
    }
    setPage(dest);
  };

  const T = THEMES[theme];

  return (
    <div style={{ minHeight:'100vh', background: T.bg, color: T.text, transition:'background .3s, color .3s' }}>
      <style>{`
        @media (min-width: 640px) {
          .tab-label { display: inline !important; }
        }
      `}</style>
      <NavBar page={page} theme={theme} onNavigate={handleNavigate} />
      <div style={{ paddingTop:60 }}>
        {page === 'library'   && <LibraryPage   theme={theme} onNavigate={handleNavigate} />}
        {page === 'reader'    && <ReaderPage    theme={theme} initialBook={readerBook} initialChapter={readerChapter} onNavigate={handleNavigate} />}
        {page === 'search'    && <SearchPage    theme={theme} onNavigate={handleNavigate} />}
        {page === 'memory'    && <MemoryPage    theme={theme} />}
        {page === 'plans'     && <PlansPage     theme={theme} onNavigate={handleNavigate} />}
        {page === 'community' && <CommunityPage theme={theme} />}
        {page === 'sermons'   && <SermonsPage   theme={theme} />}
      </div>
    </div>
  );
}
