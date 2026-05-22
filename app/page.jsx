"use client";

import { useState, useEffect } from "react";

// ─── Tag categories ───────────────────────────────────────────────────────────

const TAG_CATEGORIES = [
  {
    id: "food",
    label: "Food & Taste",
    emoji: "🍽️",
    positive: [
      "Delicious food","Fresh ingredients","Good portion size",
      "Great presentation","Amazing dessert","Authentic flavours","Good variety on menu",
    ],
    negative: [
      "Bad taste","Food was cold","Small portion","Bland food",
      "Overcooked","Undercooked","Stale ingredients","Limited menu options",
    ],
  },
  {
    id: "service",
    label: "Service",
    emoji: "🤝",
    positive: [
      "Friendly staff","Fast service","Attentive staff",
      "Great hospitality","Knowledgeable staff","Exceptional service",
    ],
    negative: [
      "Slow service","Long waiting time","Inattentive staff",
      "Unfriendly staff","Order was wrong","Delayed order","Rude behaviour",
    ],
  },
  {
    id: "ambiance",
    label: "Ambiance & Cleanliness",
    emoji: "✨",
    positive: [
      "Cozy atmosphere","Very clean","Family friendly","Comfortable seating",
      "Romantic atmosphere","Great outdoor seating","Nice music","Good lighting",
    ],
    negative: [
      "Noisy atmosphere","Not clean","Poor lighting",
      "Uncomfortable seating","Dirty washroom","Overcrowded","Bad smell",
    ],
  },
  {
    id: "value",
    label: "Value for Money",
    emoji: "💰",
    positive: [
      "Great value for money","Good combo deals",
    ],
    negative: [
      "Overpriced","Not worth the price","Hidden charges",
    ],
  },
  // Delivery category hidden for now — toggled per restaurant in settings (coming soon)
];

// Flat sets for pos/neg lookup in generate function
const ALL_POS = new Set(TAG_CATEGORIES.flatMap(c => c.positive));
const ALL_NEG = new Set(TAG_CATEGORIES.flatMap(c => c.negative));

const PLATFORMS = [
  { id: "google",  label: "Google Reviews", emoji: "🌐", color: "#4285F4", bg: "rgba(66,133,244,0.09)",  border: "rgba(66,133,244,0.28)",  url: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4", cta: "Copy & Open Google" },
  { id: "tripadvisor", label: "TripAdvisor",    emoji: "🦉", color: "#00AA6C", bg: "rgba(0,170,108,0.09)",  border: "rgba(0,170,108,0.28)",   url: "https://www.tripadvisor.com",  cta: "Copy & Open TripAdvisor" },
  { id: "yelp",     label: "Yelp",            emoji: "⭐", color: "#D32323", bg: "rgba(211,35,35,0.09)",  border: "rgba(211,35,35,0.28)",   url: "https://www.yelp.com",         cta: "Copy & Open Yelp" },
  { id: "private", label: "Private Feedback",emoji: "💬", color: "#B07820", bg: "rgba(232,160,48,0.09)", border: "rgba(232,160,48,0.28)",  url: null,                          cta: "Send Private Feedback" },
];

const HERO_STEPS = [
  { stars: 0,  tags: [],                                                              review: null },
  { stars: 4,  tags: [],                                                              review: null },
  { stars: 4,  tags: ["Delicious food","Friendly staff","Great value for money"],     review: null },
  { stars: 4,  tags: ["Delicious food","Friendly staff","Great value for money"],     review: "The food was genuinely delicious and great value for the quality. The staff were warm and attentive throughout — exactly what you hope for in a neighbourhood restaurant." },
];

const C = {
  amber: "#E8A030", amberLight: "#F5C060", amberDark: "#B07820",
  dark: "#0E0904", darkMid: "#1C1208", darkSurface: "#251708", darkCard: "#1A1006",
  cream: "#F5E8CC", creamMid: "#EDD9A8", creamDark: "#E0C882",
  card: "#FBF3E0",
  text: "#1A1008", textMuted: "#6B503A",
  borderA: "rgba(232,160,48,0.22)", borderALight: "rgba(232,160,48,0.15)",
  green: "#1B6B3A", greenBg: "rgba(76,175,80,0.09)", greenBorder: "rgba(76,175,80,0.22)",
  tripadvisorGreen: "#00AA6C", yelpRed: "#D32323",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { background:#F5E8CC; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes starPop  { 0%{transform:scale(0) rotate(-20deg)} 70%{transform:scale(1.25) rotate(5deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes tagSlide { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} }
  @keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .fu  { animation:fadeUp 0.75s cubic-bezier(.22,1,.36,1) forwards; }
  .fu2 { animation:fadeUp 0.75s .2s cubic-bezier(.22,1,.36,1) both; }
  .lift { transition:transform .2s,box-shadow .2s; }
  .lift:hover { transform:translateY(-3px); box-shadow:0 14px 44px rgba(232,160,48,0.11); }
  .nav-a  { color:rgba(255,255,255,.58); text-decoration:none; font-size:14px; font-weight:500; transition:color .2s; }
  .nav-a:hover  { color:${C.amber}; }
  .nav-ad { color:${C.textMuted}; text-decoration:none; font-size:14px; font-weight:500; transition:color .2s; }
  .nav-ad:hover { color:${C.amber}; }
  .chip { cursor:pointer; user-select:none; transition:all .15s cubic-bezier(.22,1,.36,1); }
  .chip:hover { transform:translateY(-1px) scale(1.025); }
  .chip:active { transform:scale(.97); }
  .plat-card { cursor:pointer; transition:all .18s; border-radius:14px; padding:14px 16px; border:1.5px solid transparent; display:flex; align-items:flex-start; gap:12px; }
  .plat-card:hover { transform:translateY(-2px); }
  button,textarea,input { font-family:'DM Sans',sans-serif; }
  textarea:focus,input:focus { outline:none; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-thumb { background:rgba(232,160,48,.22); border-radius:4px; }
`;

// ─── Small helpers ────────────────────────────────────────────────────────────

const Badge = ({ children, s }) => (
  <span style={{ display:"inline-flex", alignItems:"center", fontSize:11, fontWeight:600, letterSpacing:".09em", textTransform:"uppercase", color:C.amber, background:"rgba(232,160,48,.12)", border:`1px solid rgba(232,160,48,.28)`, borderRadius:100, padding:"5px 14px", ...s }}>{children}</span>
);

const Heading = ({ badge, title, sub, dark, maxW=520 }) => (
  <div style={{ textAlign:"center", marginBottom:60 }}>
    <Badge s={{ marginBottom:14 }}>{badge}</Badge>
    <h2 style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:"clamp(30px,3.5vw,44px)", fontWeight:700, color:dark?"white":C.text, margin:"0 0 16px", lineHeight:1.2 }}>{title}</h2>
    <p style={{ fontSize:17, color:dark?"rgba(255,255,255,.5)":C.textMuted, maxWidth:maxW, margin:"0 auto", lineHeight:1.65 }}>{sub}</p>
  </div>
);

const Stars = ({ count, size=30, animated=false }) => (
  <div style={{ display:"flex", gap:5 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize:size, color:i<=count?C.amber:"rgba(255,255,255,.1)", lineHeight:1, animation:animated&&i<=count?`starPop .35s ${i*.07}s cubic-bezier(.22,1,.36,1) both`:"none" }}>★</span>
    ))}
  </div>
);

// ─── Hero animated card ───────────────────────────────────────────────────────

function HeroCard({ step }) {
  const s = HERO_STEPS[step];
  const previewTags = ["Delicious food","Great value for money","Friendly staff","Cozy atmosphere"];
  const showPlatforms = !!s.review;

  return (
    <div style={{ width:"100%", maxWidth:370, background:C.darkSurface, borderRadius:22, border:"1px solid rgba(232,160,48,.14)", boxShadow:"0 48px 96px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.03)", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:"rgba(232,160,48,.07)", borderBottom:"1px solid rgba(232,160,48,.1)", padding:"18px 22px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:46, height:46, borderRadius:12, background:`linear-gradient(135deg,${C.amber},${C.amberDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🍛</div>
        <div>
          <div style={{ color:"white", fontWeight:600, fontSize:15 }}>Spice Garden</div>
          <div style={{ color:"rgba(255,255,255,.38)", fontSize:12 }}>Share your experience</div>
        </div>
      </div>

      <div style={{ padding:"22px 22px 26px" }}>
        {/* Stars */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Your rating</div>
          <Stars count={s.stars} animated={step===1} />
        </div>

        {/* Tags */}
        {!showPlatforms && (
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Select experience</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {previewTags.map((tag, i) => {
                const active = s.tags.includes(tag);
                return (
                  <span key={tag} style={{ fontSize:12, padding:"5px 12px", borderRadius:100, background:active?"rgba(232,160,48,.18)":"rgba(255,255,255,.05)", border:`1px solid ${active?"rgba(232,160,48,.45)":"rgba(255,255,255,.08)"}`, color:active?C.amber:"rgba(255,255,255,.32)", transition:"all .4s", animation:active&&step===2?`tagSlide .35s ${i*.1}s ease both`:"none" }}>
                    {active&&"✓ "}{tag}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Platform choice (step 3) */}
        {showPlatforms ? (
          <div style={{ animation:"slideUp .45s ease both" }}>
            <div style={{ fontSize:11, color:C.amber, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", marginBottom:10 }}>✨ Review ready — where to share?</div>
            <div style={{ background:"rgba(232,160,48,.07)", borderRadius:11, padding:"13px", border:"1px solid rgba(232,160,48,.18)", marginBottom:12 }}>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.7)", lineHeight:1.6, margin:0 }}>{s.review.slice(0,90)}…</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[
                { emoji:"🌐", label:"Google Reviews", color:"#4285F4" },
                { emoji:"🦉", label:"TripAdvisor",    color:"#00AA6C" },
                { emoji:"⭐", label:"Yelp",            color:"#D32323" },
              ].map(p => (
                <div key={p.label} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 11px", borderRadius:9, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)" }}>
                  <span style={{ fontSize:15 }}>{p.emoji}</span>
                  <span style={{ fontSize:12.5, color:"rgba(255,255,255,.75)", flex:1 }}>{p.label}</span>
                  <span style={{ fontSize:10, color:p.color, background:`${p.color}18`, padding:"2px 8px", borderRadius:100, fontWeight:600 }}>Suggested</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding:"13px", background:"rgba(255,255,255,.03)", borderRadius:11, border:"1px dashed rgba(255,255,255,.07)", textAlign:"center" }}>
            <span style={{ fontSize:12.5, color:"rgba(255,255,255,.2)" }}>
              {s.stars===0?"← Tap a star to begin":s.tags.length===0?"← Select what you experienced":"Generating your review…"}
            </span>
          </div>
        )}

        {/* Step dots */}
        <div style={{ display:"flex", gap:5, justifyContent:"center", marginTop:18 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ height:5, width:i===step?22:5, borderRadius:3, background:i===step?C.amber:"rgba(255,255,255,.12)", transition:"all .4s" }} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Platform Card (used in demo) ─────────────────────────────────────────────

function PlatCard({ p, recommended, onSelect, selected }) {
  return (
    <div className="plat-card" onClick={() => onSelect(p.id)}
      style={{ background:selected===p.id?p.bg:recommended?"rgba(255,255,255,.04)":"rgba(255,255,255,.02)", borderColor:selected===p.id?p.border:recommended?"rgba(255,255,255,.1)":"rgba(255,255,255,.06)" }}>
      <span style={{ fontSize:22, lineHeight:1, flexShrink:0, paddingTop:1 }}>{p.emoji}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
          <span style={{ fontSize:13.5, fontWeight:600, color:selected===p.id?p.color:"rgba(255,255,255,.75)" }}>{p.label}</span>
          {recommended && <span style={{ fontSize:10, color:p.color, background:`${p.color}18`, padding:"2px 9px", borderRadius:100, fontWeight:700, letterSpacing:".04em" }}>SUGGESTED</span>}
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,.38)", lineHeight:1.45 }}>
          {p.id==="google"  && "Helps your restaurant rank higher in Search & Maps"}
          {p.id==="tripadvisor"  && "Reaches travelers and tourists planning their visit"}
          {p.id==="yelp"  && "Strong signal on the platform diners check most often"}
          {p.id==="private" && "Stays with the restaurant team — never public"}
        </div>
      </div>
      {selected===p.id && <span style={{ color:p.color, fontSize:18, flexShrink:0 }}>✓</span>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TapveyLanding() {
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setTags]       = useState([]);
  const [notes, setNotes]             = useState("");
  const [review, setReview]           = useState("");
  const [editedReview, setEdited]     = useState("");
  const [generating, setGenerating]   = useState(false);
  const [platform, setPlatform]       = useState(null);
  const [copied, setCopied]           = useState(false);
  const [sent, setSent]               = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [heroStep, setHeroStep]       = useState(0);

  // Waitlist form state
  const [wlRestaurant, setWlRestaurant] = useState("");
  const [wlEmail, setWlEmail]           = useState("");
  const [wlPhone, setWlPhone]           = useState("");
  const [wlLocation, setWlLocation]     = useState("");
  const [wlHoneypot, setWlHoneypot]     = useState("");
  const [wlSubmitting, setWlSubmitting] = useState(false);
  const [wlSubmitted, setWlSubmitted]   = useState(false);
  const [wlError, setWlError]           = useState("");

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    const iv = setInterval(() => setHeroStep(h => (h+1)%HERO_STEPS.length), 2800);
    return () => { window.removeEventListener("scroll", onScroll); clearInterval(iv); };
  }, []);

  const isPos  = rating >= 4;
  const selPlat = PLATFORMS.find(p => p.id === platform);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = key => setExpanded(p => ({ ...p, [key]: !p[key] }));
  const toggleTag = t => { setTags(p => p.includes(t)?p.filter(x=>x!==t):[...p,t]); setReview(""); setEdited(""); setPlatform(null); };

  const generate = async () => {
    if (!rating || selectedTags.length===0) return;
    setGenerating(true); setReview(""); setEdited(""); setPlatform(null);

    const posTags  = selectedTags.filter(t => ALL_POS.has(t));
    const negTags  = selectedTags.filter(t => ALL_NEG.has(t));
    const mixed    = posTags.length > 0 && negTags.length > 0;
    const posHeavy = posTags.length > negTags.length;
    const negHeavy = negTags.length > posTags.length;

    const prompt = `Write a natural, human-sounding restaurant review based only on these inputs:

Rating: ${rating}/5 stars
${posTags.length > 0 ? `Highlights: ${posTags.join(", ")}` : ""}
${negTags.length > 0 ? `Areas to improve: ${negTags.join(", ")}` : ""}
${notes ? `Customer notes: ${notes}` : ""}

Rules:
- 2–3 sentences only
- Sound completely human — not like AI or marketing copy
- Only reference the selected tags. Do not invent any detail.
- No emojis
- ${mixed && posHeavy ? "Mostly positive tone — acknowledge the issue briefly at the end" : ""}
- ${mixed && negHeavy ? "Lead with the main concerns, but acknowledge what worked" : ""}
- ${mixed && !posHeavy && !negHeavy ? "Balanced — give equal weight to positives and negatives" : ""}
- ${!mixed && isPos ? "Positive tone — suitable for public review platforms" : ""}
- ${!mixed && !isPos ? "Constructive, empathetic tone — suitable for private feedback to the restaurant" : ""}
- Output only the review text. No preamble.`;

    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] }) });
      const data = await res.json();
      const txt  = data.content[0].text;
      setReview(txt); setEdited(txt);
    } catch { setReview("Could not generate. Please try again."); }
    setGenerating(false);
  };

  const handleAction = async () => {
    if (!selPlat) return;
    if (selPlat.id === "private") { setSent(true); return; }
    await navigator.clipboard.writeText(editedReview);
    setCopied(true);
    setTimeout(() => { window.open(selPlat.url, "_blank"); setTimeout(() => setCopied(false), 1500); }, 600);
  };

  const reset = () => { setReview(""); setEdited(""); setRating(0); setTags([]); setNotes(""); setPlatform(null); setCopied(false); setSent(false); };

  // Waitlist validation + submission
  const wlIsValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wlEmail.trim());
  const wlIsValid = wlRestaurant.trim().length >= 2 && wlIsValidEmail;

  const submitWaitlist = async () => {
    if (!wlIsValid || wlSubmitting) return;
    setWlSubmitting(true);
    setWlError("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          access_key: "9dfa40bf-e82c-448c-8375-764fed417a59",
          subject: `New Tapvey waitlist signup: ${wlRestaurant.trim()}`,
          from_name: "Tapvey Waitlist",
          restaurant: wlRestaurant.trim(),
          email: wlEmail.trim(),
          phone: wlPhone.trim() || "(not provided)",
          location: wlLocation.trim() || "(not provided)",
          botcheck: wlHoneypot,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWlSubmitted(true);
      } else {
        setWlError(data.message || "Something went wrong. Email us at hello@tapvey.com and we'll get you on the list.");
      }
    } catch {
      setWlError("Couldn't connect. Check your network and try again, or email hello@tapvey.com directly.");
    } finally {
      setWlSubmitting(false);
    }
  };

  const Btn = ({ onClick, disabled, children, style }) => (
    <button onClick={onClick} disabled={disabled} style={{ padding:"13px", borderRadius:11, fontSize:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer", border:"none", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8, ...style }}>{children}</button>
  );

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:C.text, background:C.cream }}>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, background:scrolled?"rgba(250,247,242,.96)":"transparent", backdropFilter:scrolled?"blur(16px)":"none", borderBottom:scrolled?`1px solid ${C.borderALight}`:"none", transition:"all .35s" }}>
        <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between", height:66 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:34, height:34, background:C.amber, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1L11.5 6.5L17.5 7.3L13 11.6L14.1 17.5L9 14.7L3.9 17.5L5 11.6L0.5 7.3L6.5 6.5Z" fill="#0E0904"/></svg>
            </div>
            <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:21, fontWeight:700, color:scrolled?C.text:"white" }}>tapvey</span>
          </div>
          <div style={{ display:"flex", gap:28, alignItems:"center" }}>
            {[["How it works","how-it-works"],["Why Tapvey","why"],["Features","features"]].map(([item,id]) => (
              <a key={item} href="#" onClick={e=>{ e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); }} className={scrolled?"nav-ad":"nav-a"}>{item}</a>
            ))}
            <button style={{ padding:"9px 22px", borderRadius:9, fontSize:14, fontWeight:600, cursor:"pointer", background:C.amber, color:C.dark, border:"none" }}
              onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior:"smooth" })}
              onMouseEnter={e=>e.target.style.background=C.amberLight} onMouseLeave={e=>e.target.style.background=C.amber}>
              Join Waitlist
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ background:C.dark, minHeight:"100vh", display:"flex", alignItems:"center", position:"relative", overflow:"hidden", padding:"90px 5% 80px" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 60% 60% at 15% 50%,rgba(232,160,48,.07) 0%,transparent 70%),radial-gradient(ellipse 40% 50% at 85% 25%,rgba(232,160,48,.04) 0%,transparent 60%)" }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(to right,transparent,rgba(232,160,48,.3),transparent)" }} />

        <div style={{ maxWidth:1240, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 420px", gap:72, alignItems:"center" }}>
          <div className="fu">
            {/* Legal-clear framing badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(27,107,58,.14)", border:"1px solid rgba(27,107,58,.3)", borderRadius:100, padding:"6px 16px", marginBottom:26 }}>
              <span style={{ fontSize:11, color:"#4CAF80", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase" }}>Google &amp; FTC Compliant</span>
            </div>

            <h1 style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:"clamp(36px,4vw,64px)", fontWeight:700, color:"white", lineHeight:1.12, margin:"0 0 22px" }}>
              Google now reads your reviews with AI.<br />
              <em style={{ color:C.amber }}>Yours need to be ready.</em>
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,.55)", lineHeight:1.72, maxWidth:520, margin:"0 0 34px" }}>
              Tapvey turns happy guests into the kind of detailed, specific reviews AI can actually extract answers from. Unhappy guests are offered a private way to share concerns.
            </p>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button style={{ padding:"14px 28px", borderRadius:11, fontSize:15, fontWeight:600, cursor:"pointer", background:C.amber, color:C.dark, border:"none" }}
                onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior:"smooth" })}
                onMouseEnter={e=>e.target.style.background=C.amberLight} onMouseLeave={e=>e.target.style.background=C.amber}>
                Join the Waitlist
              </button>
              <button style={{ padding:"14px 24px", borderRadius:11, fontSize:15, cursor:"pointer", background:"transparent", color:"rgba(255,255,255,.75)", border:"1.5px solid rgba(255,255,255,.18)" }}
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior:"smooth" })}
                onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,.06)";}} onMouseLeave={e=>{e.target.style.background="transparent";}}>
                ↓ Try Live Demo
              </button>
            </div>

            {/* Platform logos */}
            <div style={{ marginTop:36, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,.3)", marginRight:4 }}>Routes to</span>
              {[["🌐","Google"],["🦉","TripAdvisor"],["⭐","Yelp"],["💬","Private"]].map(([e,l]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:100, padding:"4px 12px" }}>
                  <span style={{ fontSize:13 }}>{e}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,.55)", fontWeight:500 }}>{l}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ marginTop:44, display:"flex", gap:0 }}>
              {[["&lt;60s","Customer time"],["0","Typing required"],["4","Review platforms"]].map(([v,l],i) => (
                <div key={l} style={{ paddingRight:32, marginRight:32, borderRight:i<2?"1px solid rgba(255,255,255,.08)":"none" }}>
                  <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:28, fontWeight:700, color:C.amber }} dangerouslySetInnerHTML={{ __html:v }} />
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="fu2" style={{ display:"flex", justifyContent:"flex-end" }}>
            <HeroCard step={heroStep} />
          </div>
        </div>
      </section>



      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding:"96px 5%", background:C.cream }}>
        <div style={{ maxWidth:1240, margin:"0 auto" }}>
          <Heading badge="Simple by design" title="How Tapvey Works" sub="From QR code scan to published review in under 60 seconds. Every customer. Every platform." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:24 }}>
            {[
              { n:"01", icon:"📱", t:"Customer Scans QR", d:"They scan your unique QR code — displayed at the table, counter, or receipt. No app download. No login." },
              { n:"02", icon:"⭐", t:"Rates & Selects Tags", d:"Star rating + curated experience tags. The whole interaction takes under 30 seconds. Works in 30+ languages." },
              { n:"03", icon:"✨", t:"AI Writes the Review", d:"AI transforms their tag selections into a natural, human-sounding review — using only the words they actually chose." },
              { n:"04", icon:"🔀", t:"Customer Chooses Where", d:"They pick where to share: Google, TripAdvisor, Yelp, or privately with your team. All options are always available." },
            ].map((s, i) => (
              <div key={i} className="lift" style={{ background:C.card, borderRadius:18, padding:"32px 26px", border:`1px solid ${C.borderALight}`, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:18, right:22, fontFamily:"'Libre Baskerville',serif", fontSize:52, fontWeight:700, color:"rgba(232,160,48,.07)", lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:38, marginBottom:18 }}>{s.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:600, margin:"0 0 10px" }}>{s.t}</h3>
                <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.65, margin:0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO TAPVEY IS BUILT FOR ──────────────────────────────────────────── */}
      <section style={{ padding:"96px 5%", background:C.cream }}>
        <div style={{ maxWidth:1240, margin:"0 auto" }}>
          <Heading badge="Who it's for" title="Built for restaurants where reviews really matter" sub="Three kinds of restaurants where Tapvey changes the most." maxW={580} />

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
            {[
              {
                icon:"🌱",
                accent:"#4CAF80",
                t:"New restaurants",
                d:"A first-year opening with 8 Google reviews is invisible next to the 5-year-old place down the street. Tapvey closes that gap fast — turning every happy guest into a detailed, search-friendly review from day one.",
              },
              {
                icon:"✨",
                accent:C.amber,
                t:"Premium independents",
                d:"Where one surprise 2-star review can mean a quiet Saturday. For owners who treat reputation as a real budget line — not a marketing afterthought.",
              },
              {
                icon:"🏨",
                accent:"#9C78E0",
                t:"Hotel & resort restaurants",
                d:"Where guest reviews drive TripAdvisor, Booking, and Google Maps decisions for the next traveler. For F&B managers who want their restaurant to lift the room rate, not drag it down.",
              },
            ].map((s, i) => (
              <div key={i} className="lift" style={{ background:C.card, borderRadius:20, padding:"36px 32px", border:`1px solid ${C.borderALight}` }}>
                <div style={{ width:54, height:54, borderRadius:14, background:`${s.accent}1A`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22, fontSize:26 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:22, fontWeight:700, margin:"0 0 12px", lineHeight:1.25 }}>{s.t}</h3>
                <p style={{ fontSize:14.5, color:C.textMuted, lineHeight:1.7, margin:0 }}>{s.d}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign:"center", marginTop:36, fontSize:13.5, color:C.textMuted, fontStyle:"italic" }}>
            Run a different kind of restaurant? Tapvey still works — these are just the segments where it makes the biggest difference.
          </p>
        </div>
      </section>

      {/* ── WHY TAPVEY ────────────────────────────────────────────────────────── */}
      <section id="why" style={{ padding:"96px 5%", background:C.darkSurface, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 50% 60% at 80% 20%,rgba(232,160,48,.05) 0%,transparent 65%),radial-gradient(ellipse 40% 50% at 10% 80%,rgba(232,160,48,.04) 0%,transparent 60%)" }} />
        <div style={{ maxWidth:1240, margin:"0 auto", position:"relative" }}>
          <Heading dark badge="Why Tapvey" title="Built for how reviews actually get read in 2026" sub="Three reasons reviews need to work differently than they did last year." maxW={620} />

          {/* ── Lead reason: Ask Maps ─────────────────────────────────────────── */}
          <div className="lift" style={{ background:C.darkCard, borderRadius:22, border:"1px solid rgba(232,160,48,.14)", padding:"clamp(28px,3.5vw,48px)", marginBottom:24, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:44, alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:13, fontWeight:700, color:C.amber, letterSpacing:".18em", textTransform:"uppercase", marginBottom:14 }}>01 — The Ask Maps shift</div>
              <h3 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(24px,2.4vw,32px)", fontWeight:700, color:"white", lineHeight:1.22, margin:"0 0 18px" }}>
                Your reviews now have a second reader: AI.
              </h3>
              <p style={{ fontSize:15.5, color:"rgba(255,255,255,.62)", lineHeight:1.72, margin:"0 0 16px" }}>
                In March 2026, Google Maps rolled out Ask Maps — a Gemini-powered assistant that answers customer questions by reading reviews. <span style={{ color:"rgba(255,255,255,.88)", fontWeight:500 }}>"Good for kids?" "Quiet enough for a date?" "Worth the price?"</span> The answer comes from what your customers wrote.
              </p>
              <p style={{ fontSize:15.5, color:"rgba(255,255,255,.62)", lineHeight:1.72, margin:0 }}>
                Generic five-star reviews can't answer any of these. Specific, detail-rich ones can. Tapvey's tag system was built for exactly this — every tag a customer taps becomes a structured detail Gemini can extract. <span style={{ color:"white", fontWeight:600 }}>One Tapvey review can surface your restaurant for five different searches.</span> A blank text box rarely produces even one.
              </p>
            </div>

            {/* Visual: Ask Maps comparison */}
            <div style={{ background:"rgba(0,0,0,.28)", borderRadius:16, padding:22, border:"1px solid rgba(255,255,255,.05)" }}>
              <div style={{ background:"rgba(66,133,244,.08)", borderRadius:11, padding:"12px 14px", border:"1px solid rgba(66,133,244,.22)", marginBottom:14 }}>
                <div style={{ fontSize:10.5, fontWeight:700, color:"#7BA8F0", letterSpacing:".09em", textTransform:"uppercase", marginBottom:5 }}>🔍 Customer asks Maps</div>
                <div style={{ fontSize:13.5, color:"rgba(255,255,255,.82)" }}>"Is Spice Garden good for families with kids?"</div>
              </div>
              <div style={{ textAlign:"center", color:"rgba(255,255,255,.32)", fontSize:11, marginBottom:12, letterSpacing:".05em" }}>↓ Gemini reads your reviews</div>

              {/* Generic review */}
              <div style={{ background:"rgba(255,255,255,.03)", borderRadius:11, padding:"13px 14px", border:"1px solid rgba(255,255,255,.06)", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <div style={{ fontSize:10.5, fontWeight:600, color:"rgba(255,255,255,.45)", textTransform:"uppercase", letterSpacing:".09em" }}>Generic review</div>
                  <div style={{ color:C.amber, fontSize:11, letterSpacing:"1px" }}>★★★★★</div>
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.68)", marginBottom:9, fontStyle:"italic", lineHeight:1.5 }}>"Great place! Loved it!"</div>
                <div style={{ fontSize:11.5, color:"#E27272" }}>✗ Can't answer the question</div>
              </div>

              {/* Tapvey review */}
              <div style={{ background:"rgba(27,107,58,.09)", borderRadius:11, padding:"13px 14px", border:"1px solid rgba(76,175,80,.3)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:"#4CAF80", textTransform:"uppercase", letterSpacing:".09em" }}>Tapvey review</div>
                  <div style={{ color:C.amber, fontSize:11, letterSpacing:"1px" }}>★★★★★</div>
                </div>
                {/* Input chips — every word in the review below traces back to one of these */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
                  {["Family friendly","Good portion size","Very clean","Comfortable seating","Attentive staff"].map(t => (
                    <span key={t} style={{ fontSize:10.5, fontWeight:500, color:"rgba(255,255,255,.72)", background:"rgba(232,160,48,.13)", border:"1px solid rgba(232,160,48,.26)", borderRadius:100, padding:"3px 9px", lineHeight:1.4 }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.82)", marginBottom:10, lineHeight:1.55 }}>"Generous portions, clean place, comfortable seating, and attentive staff — a family-friendly spot you can actually relax in."</div>
                <div style={{ fontSize:11.5, color:"#4CAF80", lineHeight:1.55 }}>✓ Surfaces for: family-friendly · generous portions · clean · comfortable seating · attentive service</div>
              </div>
            </div>
          </div>

          {/* ── Supporting reasons: 2-column grid ─────────────────────────────── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 }}>
            {/* Reason 2: Articulation */}
            <div className="lift" style={{ background:C.darkCard, borderRadius:22, border:"1px solid rgba(232,160,48,.14)", padding:"36px 34px" }}>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:13, fontWeight:700, color:C.amber, letterSpacing:".18em", textTransform:"uppercase", marginBottom:14 }}>02 — The articulation gap</div>
              <h3 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(20px,1.8vw,26px)", fontWeight:700, color:"white", lineHeight:1.25, margin:"0 0 16px" }}>
                Customers know what they liked. They just can't find the words.
              </h3>
              <p style={{ fontSize:14.5, color:"rgba(255,255,255,.6)", lineHeight:1.7, margin:"0 0 14px" }}>
                Staring at an empty review box, most customers manage "Great food!" before quitting — not because the experience wasn't great, but because turning a feeling into specific words is genuinely hard work.
              </p>
              <p style={{ fontSize:14.5, color:"rgba(255,255,255,.6)", lineHeight:1.7, margin:0 }}>
                Tapvey's tag chips surface the vocabulary. <span style={{ color:"rgba(255,255,255,.88)", fontWeight:500 }}>"Fresh ingredients"</span> makes them remember the crisp salad. <span style={{ color:"rgba(255,255,255,.88)", fontWeight:500 }}>"Attentive staff"</span> jogs the memory of the waiter who refilled the glass unprompted. They don't write from nothing — they tap what's true, and the AI assembles only what they confirmed.
              </p>
            </div>

            {/* Reason 3: Graceful exit */}
            <div className="lift" style={{ background:C.darkCard, borderRadius:22, border:"1px solid rgba(232,160,48,.14)", padding:"36px 34px" }}>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:13, fontWeight:700, color:C.amber, letterSpacing:".18em", textTransform:"uppercase", marginBottom:14 }}>03 — The graceful exit</div>
              <h3 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(20px,1.8vw,26px)", fontWeight:700, color:"white", lineHeight:1.25, margin:"0 0 16px" }}>
                Most unhappy customers don't actually want a public fight.
              </h3>
              <p style={{ fontSize:14.5, color:"rgba(255,255,255,.6)", lineHeight:1.7, margin:"0 0 14px" }}>
                They want to vent, be heard, maybe get an apology. But if the only channel you offer is Google, they post publicly — and your listing takes the hit for an issue you'd have happily fixed.
              </p>
              <p style={{ fontSize:14.5, color:"rgba(255,255,255,.6)", lineHeight:1.7, margin:0 }}>
                Tapvey shows them a private feedback channel right alongside the public options. Customers who choose it tell <span style={{ color:"rgba(255,255,255,.88)", fontWeight:500 }}>you</span> what went wrong — so you can act on it before it shows up in your rating. Nothing is ever blocked. Every option stays visible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ────────────────────────────────────────────────────────── */}
      <section id="demo" style={{ padding:"96px 5%", background:C.darkMid }}>
        <div style={{ maxWidth:1240, margin:"0 auto" }}>
          <Heading dark badge="Try it yourself" title="Live AI Demo" sub="Rate, select tags, generate a real AI review, then choose where to share it." />

          <div style={{ maxWidth:680, margin:"0 auto", background:C.darkSurface, borderRadius:22, border:`1px solid ${C.borderA}`, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,.4)" }}>
            {/* Restaurant header */}
            <div style={{ background:"rgba(232,160,48,.06)", borderBottom:"1px solid rgba(232,160,48,.1)", padding:"22px 28px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:13, background:`linear-gradient(135deg,${C.amber},${C.amberDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🍛</div>
              <div style={{ flex:1 }}>
                <div style={{ color:"white", fontWeight:700, fontSize:18 }}>Spice Garden</div>
                <div style={{ color:"rgba(255,255,255,.38)", fontSize:13 }}>London, United Kingdom</div>
              </div>
              <span style={{ fontSize:11, color:C.amber, background:"rgba(232,160,48,.12)", border:"1px solid rgba(232,160,48,.25)", padding:"4px 12px", borderRadius:100, fontWeight:600, letterSpacing:".06em" }}>DEMO</span>
            </div>

            <div style={{ padding:"28px 28px 32px" }}>
              {/* Stars */}
              {!sent && (
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.38)", textTransform:"uppercase", letterSpacing:".07em", fontWeight:500, marginBottom:11 }}>How was your visit?</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[1,2,3,4,5].map(i => (
                      <span key={i}
                        onClick={()=>{ setRating(i); setTags([]); setReview(""); setEdited(""); setPlatform(null); setSent(false); }}
                        onMouseEnter={()=>setHoverRating(i)} onMouseLeave={()=>setHoverRating(0)}
                        style={{ fontSize:42, cursor:"pointer", color:i<=(hoverRating||rating)?C.amber:"rgba(255,255,255,.11)", transition:"all .15s", lineHeight:1 }}>★</span>
                    ))}
                  </div>
                  {rating>0 && (
                    <div style={{ marginTop:10, fontSize:13, color:"rgba(255,255,255,.45)", animation:"fadeIn .3s ease" }}>
                      Your review will be ready to share wherever you choose.
                    </div>
                  )}
                </div>
              )}

              {/* Tags — categorised expandable */}
              {rating>0 && !review && !sent && (
                <div style={{ marginBottom:20, animation:"fadeUp .3s ease" }}>
                  <div style={{ fontSize:12.5, color:"rgba(255,255,255,.4)", marginBottom:16, lineHeight:1.5 }}>
                    Select at least one tag. Pick from any category — or mix positives and negatives.
                  </div>

                  {TAG_CATEGORIES.map(cat => {
                    const VISIBLE = 4;
                    const posExpanded = expanded[`${cat.id}-pos`];
                    const negExpanded = expanded[`${cat.id}-neg`];
                    const visPos = posExpanded ? cat.positive : cat.positive.slice(0, VISIBLE);
                    const visNeg = negExpanded ? cat.negative : cat.negative.slice(0, VISIBLE);
                    const selInCat = selectedTags.filter(t => [...cat.positive,...cat.negative].includes(t)).length;

                    return (
                      <div key={cat.id} style={{ marginBottom:20, background:"rgba(255,255,255,.03)", borderRadius:14, padding:"14px 14px 16px", border:"1px solid rgba(255,255,255,.06)" }}>

                        {/* Category header */}
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:13 }}>
                          <span style={{ fontSize:16 }}>{cat.emoji}</span>
                          <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.55)", textTransform:"uppercase", letterSpacing:".07em", flex:1 }}>{cat.label}</span>
                          {selInCat > 0 && (
                            <span style={{ fontSize:11, color:C.amber, background:"rgba(232,160,48,.15)", border:"1px solid rgba(232,160,48,.3)", padding:"2px 9px", borderRadius:100, fontWeight:600 }}>
                              {selInCat} selected
                            </span>
                          )}
                        </div>

                        {/* Positive tags */}
                        <div style={{ marginBottom:10 }}>
                          <div style={{ fontSize:11, color:"rgba(76,175,80,.6)", fontWeight:500, marginBottom:7, letterSpacing:".04em" }}>✓ Highlights</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {visPos.map(tag => {
                              const active = selectedTags.includes(tag);
                              return (
                                <span key={tag} onClick={()=>toggleTag(tag)} className="chip" style={{ fontSize:12, padding:"5px 12px", borderRadius:100, background:active?"rgba(76,175,80,.18)":"rgba(255,255,255,.04)", border:`1px solid ${active?"rgba(76,175,80,.45)":"rgba(255,255,255,.07)"}`, color:active?"#4CAF80":"rgba(255,255,255,.4)", fontWeight:active?500:400 }}>
                                  {active&&"✓ "}{tag}
                                </span>
                              );
                            })}
                            {cat.positive.length > VISIBLE && (
                              <span onClick={()=>toggleExpand(`${cat.id}-pos`)} className="chip" style={{ fontSize:12, padding:"5px 12px", borderRadius:100, background:"transparent", border:"1px dashed rgba(255,255,255,.12)", color:"rgba(255,255,255,.3)" }}>
                                {posExpanded ? "Show less ↑" : `+${cat.positive.length - VISIBLE} more ↓`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height:1, background:"rgba(255,255,255,.05)", margin:"10px 0" }} />

                        {/* Negative tags */}
                        <div>
                          <div style={{ fontSize:11, color:"rgba(229,115,115,.6)", fontWeight:500, marginBottom:7, letterSpacing:".04em" }}>△ Concerns</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {visNeg.map(tag => {
                              const active = selectedTags.includes(tag);
                              return (
                                <span key={tag} onClick={()=>toggleTag(tag)} className="chip" style={{ fontSize:12, padding:"5px 12px", borderRadius:100, background:active?"rgba(232,100,80,.18)":"rgba(255,255,255,.04)", border:`1px solid ${active?"rgba(232,100,80,.45)":"rgba(255,255,255,.07)"}`, color:active?"#E57373":"rgba(255,255,255,.4)", fontWeight:active?500:400 }}>
                                  {active&&"✓ "}{tag}
                                </span>
                              );
                            })}
                            {cat.negative.length > VISIBLE && (
                              <span onClick={()=>toggleExpand(`${cat.id}-neg`)} className="chip" style={{ fontSize:12, padding:"5px 12px", borderRadius:100, background:"transparent", border:"1px dashed rgba(255,255,255,.12)", color:"rgba(255,255,255,.3)" }}>
                                {negExpanded ? "Show less ↑" : `+${cat.negative.length - VISIBLE} more ↓`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Selected summary */}
                  {selectedTags.length > 0 && (
                    <div style={{ fontSize:12.5, color:C.amber, marginTop:4 }}>
                      {selectedTags.length} tag{selectedTags.length>1?"s":""} selected — ready to generate.
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {rating>0 && selectedTags.length>0 && !review && !sent && (
                <div style={{ marginBottom:22, animation:"fadeUp .3s ease" }}>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anything else to add? (optional)" style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.09)", borderRadius:11, padding:"12px 16px", fontSize:14, color:"white", resize:"none", height:70, lineHeight:1.55 }} />
                </div>
              )}

              {/* Generate */}
              {rating>0 && selectedTags.length>0 && !review && !sent && (
                <Btn onClick={generate} disabled={generating} style={{ width:"100%", background:generating?"rgba(232,160,48,.35)":C.amber, color:C.dark }}>
                  {generating?<><span style={{ animation:"spin 1s linear infinite", fontSize:18, display:"inline-block" }}>⟳</span> Generating…</>:"✨ Generate with AI"}
                </Btn>
              )}

              {/* ── Review + Platform Choice ── */}
              {review && !sent && (
                <div style={{ animation:"fadeUp .4s ease" }}>
                  {/* Editable review */}
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.42)", fontWeight:500, textTransform:"uppercase", letterSpacing:".07em", marginBottom:9 }}>Your review — edit freely</div>
                  <textarea value={editedReview} onChange={e=>setEdited(e.target.value)} style={{ width:"100%", borderRadius:12, padding:"15px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", fontSize:14, color:"rgba(255,255,255,.82)", lineHeight:1.65, resize:"vertical", minHeight:96 }} />

                  {/* Platform picker — layout changes based on rating */}
                  {!isPos ? (
                    // ── LOW RATING: private feedback featured at top ──
                    <div style={{ margin:"18px 0" }}>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,.42)", fontWeight:500, textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>
                        How would you like to share?
                      </div>

                      {/* Featured private card */}
                      <div onClick={() => setPlatform("private")} style={{
                        cursor:"pointer",
                        background: platform==="private" ? "rgba(232,160,48,.2)" : "rgba(232,160,48,.09)",
                        border: `2px solid ${platform==="private" ? C.amber : "rgba(232,160,48,.45)"}`,
                        borderRadius:16, padding:"18px 16px", marginBottom:14, transition:"all .18s",
                      }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(232,160,48,.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💬</div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                              <span style={{ color:C.amber, fontWeight:700, fontSize:14.5 }}>Share privately with the restaurant</span>
                              <span style={{ fontSize:10, color:C.dark, background:C.amber, padding:"2px 9px", borderRadius:100, fontWeight:700, letterSpacing:".04em", flexShrink:0 }}>SUGGESTED</span>
                            </div>
                            <div style={{ fontSize:12.5, color:"rgba(255,255,255,.5)", lineHeight:1.55 }}>
                              Stays with the team — never posted publicly. They may reach out to make it right.
                            </div>
                          </div>
                          {platform==="private" && <span style={{ color:C.amber, fontSize:22, flexShrink:0, marginLeft:4 }}>✓</span>}
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }} />
                        <span style={{ fontSize:11, color:"rgba(255,255,255,.28)", fontWeight:500 }}>or share publicly</span>
                        <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }} />
                      </div>

                      {/* Public platforms — smaller, secondary */}
                      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                        {PLATFORMS.filter(p => p.id !== "private").map(p => (
                          <PlatCard key={p.id} p={p} recommended={false} onSelect={setPlatform} selected={platform} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    // ── HIGH RATING: only public platforms, no private ──
                    <div style={{ margin:"18px 0" }}>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,.42)", fontWeight:500, textTransform:"uppercase", letterSpacing:".07em", marginBottom:10 }}>
                        Where would you like to share?
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {PLATFORMS.filter(p => p.id !== "private").map(p => {
                          const recommended = p.id==="google" || p.id==="tripadvisor";
                          return <PlatCard key={p.id} p={p} recommended={recommended} onSelect={setPlatform} selected={platform} />;
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display:"flex", gap:10, marginTop:4 }}>
                    <Btn onClick={handleAction} disabled={!platform} style={{ flex:1, background:platform?selPlat?.color:"rgba(255,255,255,.08)", color:platform?"white":"rgba(255,255,255,.3)", opacity:platform?1:0.6 }}>
                      {copied?"✓ Copied! Opening…":platform?selPlat?.cta:"Select a platform above"}
                    </Btn>
                    <Btn onClick={reset} style={{ padding:"13px 16px", background:"rgba(255,255,255,.05)", color:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.09)" }}>↺</Btn>
                  </div>
                </div>
              )}

              {/* Sent confirmation */}
              {sent && (
                <div style={{ textAlign:"center", padding:"32px 0", animation:"fadeIn .4s ease" }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>💌</div>
                  <div style={{ fontSize:18, fontWeight:600, color:"white", marginBottom:8 }}>Feedback sent. Thank you.</div>
                  <div style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.6, maxWidth:320, margin:"0 auto 24px" }}>
                    The restaurant team will review your feedback. They may reach out to make things right.
                  </div>
                  <Btn onClick={reset} style={{ margin:"0 auto", background:C.amber, color:C.dark, display:"inline-flex" }}>Try again ↺</Btn>
                </div>
              )}

              {rating===0 && (
                <div style={{ textAlign:"center", padding:"12px 0 4px", fontSize:13, color:"rgba(255,255,255,.2)" }}>↑ Tap a star rating above to begin</div>
              )}
            </div>
          </div>
          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:"rgba(255,255,255,.25)" }}>Live demo — real AI is generating your review. Platform links open the actual site.</p>
        </div>
      </section>

      {/* ── EVERY VOICE MATTERS (compliance-reframed routing) ────────────────── */}
      <section style={{ padding:"96px 5%", background:C.cream }}>
        <div style={{ maxWidth:1240, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div>
            <Badge s={{ marginBottom:18 }}>Compliant by design</Badge>
            <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(28px,3vw,42px)", fontWeight:700, margin:"0 0 18px", lineHeight:1.2 }}>Smart Routing.<br />Always Compliant.</h2>
            <p style={{ fontSize:17, color:C.textMuted, lineHeight:1.72, marginBottom:28 }}>
              Happy customers see Google, TripAdvisor, and Yelp — the platforms where their review makes the most impact. Customers with concerns see private feedback first, prominently — with public options still available below. Nobody is ever blocked from posting publicly.
            </p>
            <div style={{ background:"rgba(27,107,58,.07)", border:"1px solid rgba(27,107,58,.2)", borderRadius:14, padding:"18px 20px", marginBottom:18 }}>
              <div style={{ fontWeight:600, fontSize:14, color:"#1B6B3A", marginBottom:6 }}>✓ Google ToS (April 2026) Compliant</div>
              <div style={{ fontSize:13.5, color:C.textMuted, lineHeight:1.55 }}>No star rating is prefilled. Google links are never blocked. Reviews are always voluntary and user-edited.</div>
            </div>
            <div style={{ background:"rgba(27,107,58,.07)", border:"1px solid rgba(27,107,58,.2)", borderRadius:14, padding:"18px 20px" }}>
              <div style={{ fontWeight:600, fontSize:14, color:"#1B6B3A", marginBottom:6 }}>✓ FTC Rule (Oct 2024) Compliant</div>
              <div style={{ fontSize:13.5, color:C.textMuted, lineHeight:1.55 }}>No sentiment-based gating. All customers receive all options. Violating this carries fines up to $53,088 per incident — Tapvey keeps you safe.</div>
            </div>
          </div>

          {/* Diagram */}
          <div className="lift" style={{ background:C.card, borderRadius:22, padding:32, border:`1px solid ${C.borderALight}` }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ display:"inline-block", background:C.creamMid, borderRadius:14, padding:"11px 22px", border:`2px solid ${C.amber}` }}>
                <div style={{ fontSize:13.5, fontWeight:600, color:C.amberDark }}>Customer submits rating + tags</div>
              </div>
              <div style={{ fontSize:12, color:C.textMuted, marginTop:10 }}>AI generates review → customer sees options ↓</div>
            </div>

            {/* High rating flow */}
            <div style={{ background:C.greenBg, borderRadius:14, padding:"16px", border:`1px solid ${C.greenBorder}`, marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.green, marginBottom:10 }}>⭐⭐⭐⭐⭐ High rating (4–5 stars)</div>
              <div style={{ display:"flex", gap:8 }}>
                {[["🌐","Google"],["🦉","TripAdvisor"],["⭐","Yelp"]].map(([e,l]) => (
                  <div key={l} style={{ flex:1, background:C.card, borderRadius:9, padding:"8px 6px", textAlign:"center", border:`1px solid ${C.greenBorder}` }}>
                    <div style={{ fontSize:18, marginBottom:3 }}>{e}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:C.green }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:"#4CAF80", marginTop:8 }}>Private feedback not shown — not relevant to their experience.</div>
            </div>

            {/* Low rating flow */}
            <div style={{ background:"rgba(232,160,48,.07)", borderRadius:14, padding:"16px", border:`1px solid ${C.borderA}` }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.amberDark, marginBottom:10 }}>⭐⭐⭐ Low rating (1–3 stars)</div>
              <div style={{ background:"rgba(232,160,48,.12)", borderRadius:10, padding:"10px 12px", border:`1.5px solid rgba(232,160,48,.4)`, marginBottom:8 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.amber }}>💬 Private Feedback — shown first, highlighted</div>
                <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>Path of least resistance. Stays with the restaurant.</div>
              </div>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:7 }}>— or share publicly —</div>
              <div style={{ display:"flex", gap:7 }}>
                {[["🌐","Google"],["🦉","TripAdvisor"],["⭐","Yelp"]].map(([e,l]) => (
                  <div key={l} style={{ flex:1, background:"rgba(255,255,255,.5)", borderRadius:9, padding:"7px 5px", textAlign:"center", border:`1px solid ${C.borderALight}` }}>
                    <div style={{ fontSize:16, marginBottom:2 }}>{e}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:C.textMuted }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:"#4CAF80", marginTop:8 }}>Google link always visible. Never blocked. ✓ Compliant.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR RESTAURANTS EVERYWHERE ─────────────────────────────────── */}
      <section id="features" style={{ padding:"96px 5%", background:C.dark }}>
        <div style={{ maxWidth:1240, margin:"0 auto" }}>
          <Heading dark badge="Global" title="Built for Restaurants Everywhere" sub="Multi-platform routing. Reviews in any language. Adapts to your region, cuisine, and customer base." maxW={560} />

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:22 }}>
            {[
              { icon:"🌐", color:"#4285F4",                t:"Multi-Platform Routing", d:"Routes happy customers wherever their review matters most — Google, TripAdvisor, Yelp, OpenTable, and regional platforms across India, Europe, and beyond." },
              { icon:"🗣️", color:C.tripadvisorGreen,      t:"30+ Languages",          d:"Customers review in their native language — English, Spanish, French, German, Italian, Portuguese, Hindi, Arabic, Japanese, Mandarin, and more." },
              { icon:"🎯", color:C.yelpRed,                t:"Adapts to Your Region",  d:"Chip libraries adjust to your cuisine, customer base, and country — a vegan café in Berlin sees different tags than a steakhouse in Texas." },
              { icon:"📊", color:C.amber,                  t:"Feedback Analytics",     d:"See which tags appear most often, track sentiment over time, and understand exactly what your customers experience." },
              { icon:"💬", color:"#9C78E0",                t:"Private Feedback Inbox", d:"Every concern a customer raises stays between them and you — never posted publicly without their choice." },
              { icon:"🤖", color:"#4CAF80",                t:"AI Improvement Tips",    d:"Tapvey analyses private feedback and surfaces the top issues your customers keep mentioning — with concrete suggestions for your team." },
            ].map((f, i) => (
              <div key={i} className="lift" style={{ background:C.darkCard, borderRadius:18, padding:"28px 24px", border:"1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize:32, marginBottom:16, color:f.color }}>{f.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:600, color:"white", margin:"0 0 9px" }}>{f.t}</h3>
                <p style={{ fontSize:13.5, color:"rgba(255,255,255,.45)", lineHeight:1.65, margin:0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST ──────────────────────────────────────────────────────────── */}
      <section id="waitlist" style={{ padding:"96px 5%", background:C.cream }}>
        <div style={{ maxWidth:760, margin:"0 auto", textAlign:"center" }}>
          <Badge s={{ marginBottom:18 }}>Now onboarding</Badge>
          <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(28px,3vw,42px)", fontWeight:700, margin:"0 0 16px", lineHeight:1.2 }}>
            Join the Waitlist
          </h2>
          <p style={{ fontSize:17, color:C.textMuted, lineHeight:1.7, maxWidth:480, margin:"0 auto 36px" }}>
            Leave your details below. We will reach out personally to learn about your restaurant before we onboard you.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20, marginBottom:44 }}>
            {[
              { icon:"🎯", t:"Shape the product", d:"Direct access to the founder. Your feedback directly influences what gets built next." },
              { icon:"⚡", t:"Personal setup", d:"We help you set up your QR code and review page — no tech knowledge needed." },
              { icon:"💬", t:"Direct support", d:"Reach us directly. No support tickets, no waiting." },
            ].map((f,i) => (
              <div key={i} style={{ background:C.card, borderRadius:16, padding:"24px 20px", border:`1px solid ${C.borderALight}`, textAlign:"left" }}>
                <div style={{ fontSize:30, marginBottom:12 }}>{f.icon}</div>
                <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{f.t}</div>
                <div style={{ fontSize:13.5, color:C.textMuted, lineHeight:1.6 }}>{f.d}</div>
              </div>
            ))}
          </div>

          {/* Waitlist capture */}
          <div style={{ background:C.card, borderRadius:20, padding:"32px 28px", border:`1px solid ${C.borderALight}`, maxWidth:520, margin:"0 auto" }}>
            {wlSubmitted ? (
              <div style={{ textAlign:"center", padding:"24px 8px", animation:"fadeIn .4s ease" }}>
                <div style={{ fontSize:42, marginBottom:14 }}>✓</div>
                <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:22, fontWeight:700, color:C.text, marginBottom:10 }}>You're on the list.</div>
                <p style={{ fontSize:14.5, color:C.textMuted, lineHeight:1.65, margin:"0 0 18px" }}>
                  Thanks, <span style={{ color:C.text, fontWeight:500 }}>{wlRestaurant.trim()}</span>. I'll reach out personally within 24 hours to learn more about your restaurant before onboarding.
                </p>
                <p style={{ fontSize:12.5, color:C.textMuted, lineHeight:1.55 }}>
                  Reply will land in your inbox at <span style={{ color:C.text, fontWeight:500 }}>{wlEmail.trim()}</span>.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
                  <input
                    type="text"
                    placeholder="Restaurant name *"
                    value={wlRestaurant}
                    onChange={e => setWlRestaurant(e.target.value)}
                    disabled={wlSubmitting}
                    style={{ width:"100%", padding:"13px 16px", borderRadius:10, border:`1px solid ${C.borderA}`, background:C.card, fontSize:14, color:C.text }}
                  />
                  <input
                    type="email"
                    placeholder="Email address *"
                    value={wlEmail}
                    onChange={e => setWlEmail(e.target.value)}
                    disabled={wlSubmitting}
                    style={{ width:"100%", padding:"13px 16px", borderRadius:10, border:`1px solid ${C.borderA}`, background:C.card, fontSize:14, color:C.text }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional, WhatsApp friendly)"
                    value={wlPhone}
                    onChange={e => setWlPhone(e.target.value)}
                    disabled={wlSubmitting}
                    style={{ width:"100%", padding:"13px 16px", borderRadius:10, border:`1px solid ${C.borderA}`, background:C.card, fontSize:14, color:C.text }}
                  />
                  <input
                    type="text"
                    placeholder="City &amp; country (optional)"
                    value={wlLocation}
                    onChange={e => setWlLocation(e.target.value)}
                    disabled={wlSubmitting}
                    style={{ width:"100%", padding:"13px 16px", borderRadius:10, border:`1px solid ${C.borderA}`, background:C.card, fontSize:14, color:C.text }}
                  />
                  {/* Honeypot: bots fill this in; humans never see it */}
                  <input
                    type="text"
                    name="botcheck"
                    value={wlHoneypot}
                    onChange={e => setWlHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position:"absolute", left:"-9999px", width:1, height:1, opacity:0 }}
                  />
                </div>
                <button
                  onClick={submitWaitlist}
                  disabled={!wlIsValid || wlSubmitting}
                  style={{
                    width:"100%", padding:"14px",
                    background: wlSubmitting ? `${C.amber}99` : (wlIsValid ? C.amber : `${C.amber}55`),
                    color: C.dark, border:"none", borderRadius:10, fontSize:15, fontWeight:600,
                    cursor: (!wlIsValid || wlSubmitting) ? "not-allowed" : "pointer",
                    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
                    transition:"background .2s"
                  }}>
                  {wlSubmitting ? (
                    <><span style={{ animation:"spin 1s linear infinite", fontSize:16, display:"inline-block" }}>⟳</span> Submitting…</>
                  ) : (
                    <>Join the Waitlist →</>
                  )}
                </button>
                {wlError && (
                  <p style={{ fontSize:12.5, color:"#C44", marginTop:10, lineHeight:1.55, animation:"fadeIn .3s ease" }}>{wlError}</p>
                )}
                <p style={{ fontSize:12, color:C.textMuted, marginTop:12, lineHeight:1.6 }}>We'll reach out personally to learn about your restaurant before we onboard you.</p>
              </>
            )}
          </div>
        </div>
      </section>


      {/* ── FOUNDER / WHY WE BUILT THIS ──────────────────────────────────────── */}
      <section style={{ padding:"96px 5%", background:C.darkSurface, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 60% 50% at 50% 0%,rgba(232,160,48,.06) 0%,transparent 70%)" }} />
        <div style={{ maxWidth:920, margin:"0 auto", position:"relative" }}>
          <div className="lift" style={{ background:C.darkCard, borderRadius:24, padding:"clamp(32px,4vw,56px)", border:"1px solid rgba(232,160,48,.14)", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:48, alignItems:"center" }}>

            {/* Founder photo placeholder + name */}
            <div style={{ textAlign:"center" }}>
              {/* TODO: Replace placeholder circle with a real <img src="/path/to/founder.jpg" .../> when ready */}
              <div style={{ width:148, height:148, borderRadius:"50%", background:`linear-gradient(135deg, ${C.amber} 0%, ${C.amberDark} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", border:"3px solid rgba(232,160,48,.3)", boxShadow:"0 8px 32px rgba(232,160,48,.15)" }}>
                <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:52, fontWeight:700, color:C.dark, letterSpacing:"-.02em" }}>RS</span>
              </div>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700, color:"white", marginBottom:4 }}>Roshan Shetty</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.5)", marginBottom:12 }}>Founder, Tapvey</div>
              <a href="https://linkedin.com/in/rshshetty" target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,.55)", textDecoration:"none", padding:"5px 12px", borderRadius:100, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", transition:"all .2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,.09)"; e.currentTarget.style.color="rgba(255,255,255,.85)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.05)"; e.currentTarget.style.color="rgba(255,255,255,.55)"; }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            </div>

            {/* Story */}
            <div>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:13, fontWeight:700, color:C.amber, letterSpacing:".18em", textTransform:"uppercase", marginBottom:14 }}>Why I built Tapvey</div>
              <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(22px,2.2vw,30px)", fontWeight:700, color:"white", lineHeight:1.25, margin:"0 0 22px" }}>
                Reviews are the next thing AI breaks. Restaurants are most exposed.
              </h2>
              <p style={{ fontSize:15.5, color:"rgba(255,255,255,.65)", lineHeight:1.72, margin:"0 0 16px" }}>
                I'm an engineer working with large-scale data systems. When Google Maps launched Ask Maps in early 2026 — turning reviews into a structured signal that Gemini reads to answer customer questions — I saw what was coming. The reviews most restaurants have today aren't built for that. Generic five-star praise tells Gemini nothing. Specific, detail-rich reviews surface restaurants for the exact queries customers ask.
              </p>
              <p style={{ fontSize:15.5, color:"rgba(255,255,255,.65)", lineHeight:1.72, margin:"0 0 24px" }}>
                The problem is that customers don't naturally write that way. They want to leave a review; they just can't find the words. Tapvey gives them the words. If you run a restaurant and reviews matter to you, I'd genuinely like to hear from you — every early customer shapes what we build next.
              </p>
              <a href="#waitlist" onClick={e=>{ e.preventDefault(); document.getElementById("waitlist")?.scrollIntoView({ behavior:"smooth" }); }}
                style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:14, fontWeight:500, color:C.amber, textDecoration:"none", borderBottom:`1px solid ${C.amber}66`, paddingBottom:2 }}>
                Reach me directly →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding:"96px 5%", background:C.amber, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:360, height:360, borderRadius:"50%", background:"rgba(255,255,255,.09)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-50, left:-50, width:240, height:240, borderRadius:"50%", background:"rgba(0,0,0,.06)", pointerEvents:"none" }} />
        <div style={{ maxWidth:720, margin:"0 auto", textAlign:"center", position:"relative" }}>
          <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:"clamp(30px,4vw,52px)", fontWeight:700, color:C.dark, margin:"0 0 18px", lineHeight:1.18 }}>
            Get More Reviews.<br />Understand Every Guest.
          </h2>
          <p style={{ fontSize:18, color:C.darkMid, margin:"0 0 36px", lineHeight:1.65, maxWidth:520, marginLeft:"auto", marginRight:"auto" }}>
            A QR code, a 30-second experience for your guests, and a steady stream of genuine reviews — on the platforms that matter most to your restaurant.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior:"smooth" })} style={{ padding:"15px 34px", background:C.dark, color:"white", border:"none", borderRadius:12, fontSize:16, fontWeight:600, cursor:"pointer" }}>Join the Waitlist</button>
            <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior:"smooth" })} style={{ padding:"15px 28px", background:"rgba(0,0,0,.1)", color:C.dark, border:"1.5px solid rgba(0,0,0,.18)", borderRadius:12, fontSize:16, cursor:"pointer" }}>Try Live Demo</button>
          </div>
          <p style={{ fontSize:13, color:"rgba(14,9,4,.55)", marginTop:22 }}>FTC &amp; Google compliant · Built for restaurants of any size, anywhere</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background:C.dark, padding:"40px 5%", borderTop:"1px solid rgba(232,160,48,.06)" }}>
        <div style={{ maxWidth:1240, margin:"0 auto" }}>

          {/* Single horizontal row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:24, marginBottom:32 }}>

            {/* Logo with tagline */}
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:34, height:34, background:C.amber, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1L11.5 6.5L17.5 7.3L13 11.6L14.1 17.5L9 14.7L3.9 17.5L5 11.6L0.5 7.3L6.5 6.5Z" fill="#0E0904"/></svg>
              </div>
              <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
                <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700, color:"white" }}>tapvey</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,.4)", letterSpacing:".02em", marginTop:3 }}>Reviews ready for the AI era</span>
              </div>
            </div>

            {/* Nav links */}
            <div style={{ display:"flex", alignItems:"center", gap:32, flexWrap:"wrap" }}>
              {[
                ["How it works", () => document.getElementById("how-it-works")?.scrollIntoView({ behavior:"smooth" })],
                ["Why Tapvey",   () => document.getElementById("why")?.scrollIntoView({ behavior:"smooth" })],
                ["Live Demo",    () => document.getElementById("demo")?.scrollIntoView({ behavior:"smooth" })],
                ["Features",     () => document.getElementById("features")?.scrollIntoView({ behavior:"smooth" })],
                ["Join Waitlist",() => document.getElementById("waitlist")?.scrollIntoView({ behavior:"smooth" })],
                ["Contact us",   () => window.open("https://wa.me/919999999999?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20Tapvey.", "_blank")],
              ].map(([l, action]) => (
                <a key={l} href="#" onClick={e=>{ e.preventDefault(); action(); }} className="nav-a" style={{ fontSize:14 }}>{l}</a>
              ))}
            </div>

          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>© 2025 Tapvey Technologies Pvt Ltd. All rights reserved.</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>Made in Tulu Nadu 🇮🇳</span>
          </div>

        </div>
      </footer>
    </div>
  );
}