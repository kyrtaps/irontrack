import { useState, useEffect, useRef, useCallback } from "react";
import { openDB } from "idb";

// ─── IndexedDB ────────────────────────────────────────────────────────────────
const DB_NAME  = "irontrack_db";
const DB_STORE = "data";
const KEY      = "gymtracker_v4";

function getDefaultData() {
  return {
    sessions: SEED_SESSIONS,
    lastExercises: {
      pull: ["pull_up", "chest_supported_db_row", "ez_bar_curl"],
      push: ["db_bench", "incline_db_press", "db_ohp"],
      legs: ["squat", "rdl", "leg_curl"],
    },
  };
}

let _db = null;
async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(DB_STORE); },
  });
  return _db;
}

async function loadData() {
  try {
    const db  = await getDB();
    let   val = await db.get(DB_STORE, KEY);
    if (!val) {
      // one-time migration from localStorage
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          val = JSON.parse(raw);
          await db.put(DB_STORE, val, KEY);
          localStorage.removeItem(KEY);
        }
      } catch { /* ignore */ }
    }
    return val || getDefaultData();
  } catch {
    return getDefaultData();
  }
}

async function saveData(d) {
  try {
    const db = await getDB();
    await db.put(DB_STORE, d, KEY);
  } catch { /* ignore */ }
}

// ─── Seed history ─────────────────────────────────────────────────────────────
const SEED_SESSIONS = [
  { id:"imp_20250505", type:"push", date:"2025-05-05T09:00:00.000Z", exercises:[
    { id:"db_bench", name:"Flat DB Bench Press", sets:[
      {weight:"28",reps:"5",rir:1},{weight:"28",reps:"5",rir:1},{weight:"28",reps:"5",rir:1}]},
    { id:"incline_db_press", name:"Incline DB Press", sets:[
      {weight:"24",reps:"8",rir:1},{weight:"26",reps:"5",rir:1},{weight:"26",reps:"5",rir:1}]},
    { id:"db_ohp", name:"Overhead DB Shoulder Press", sets:[
      {weight:"22",reps:"5",rir:1},{weight:"22",reps:"5",rir:1}]},
  ]},
  { id:"imp_20250503", type:"pull", date:"2025-05-03T09:00:00.000Z", exercises:[
    { id:"pull_up", name:"Pull-ups", sets:[
      {weight:"BW",reps:"5",rir:1},{weight:"BW",reps:"6",rir:0},{weight:"BW",reps:"5",rir:0},{weight:"BW",reps:"4",rir:0}]},
    { id:"chest_supported_db_row", name:"Chest Supported DB Row", sets:[
      {weight:"20",reps:"9",rir:1},{weight:"26",reps:"6",rir:1},{weight:"26",reps:"6",rir:1}]},
    { id:"ez_bar_curl", name:"EZ Bar Curl", sets:[{weight:"34",reps:"5",rir:1}]},
  ]},
  { id:"imp_20250501", type:"push", date:"2025-05-01T09:00:00.000Z", exercises:[
    { id:"db_bench", name:"DB Bench Press", sets:[
      {weight:"28",reps:"5",rir:1},{weight:"28",reps:"5",rir:1},{weight:"28",reps:"5",rir:1},{weight:"28",reps:"5",rir:1}]},
    { id:"incline_db_press", name:"Incline DB Press", sets:[
      {weight:"24",reps:"6",rir:1},{weight:"24",reps:"6",rir:1},{weight:"24",reps:"6",rir:1}]},
    { id:"db_ohp", name:"Seated DB Shoulder Press", sets:[
      {weight:"20",reps:"6",rir:2},{weight:"20",reps:"8",rir:1},{weight:"20",reps:"6",rir:1}]},
    { id:"tricep_pushdown", name:"Cable Triceps Pushdown", sets:[
      {weight:"28",reps:"6",rir:1},{weight:"28",reps:"6",rir:1},{weight:"28",reps:"6",rir:1}]},
  ]},
  { id:"imp_20250429", type:"legs", date:"2025-04-29T09:00:00.000Z", exercises:[
    { id:"squat", name:"Back Squat", sets:[
      {weight:"60",reps:"6",rir:1},{weight:"60",reps:"6",rir:1},{weight:"60",reps:"5",rir:1}]},
    { id:"rdl", name:"Romanian Deadlift", sets:[
      {weight:"45",reps:"7",rir:2},{weight:"45",reps:"7",rir:2},{weight:"45",reps:"7",rir:2}]},
    { id:"leg_curl", name:"Leg Curl Machine", sets:[
      {weight:"50",reps:"10",rir:1},{weight:"55",reps:"10",rir:2},{weight:"65",reps:"6",rir:1}]},
  ]},
  { id:"imp_20250427", type:"pull", date:"2025-04-27T09:00:00.000Z", exercises:[
    { id:"pull_up", name:"Pull-ups", sets:[
      {weight:"BW",reps:"5",rir:2},{weight:"BW",reps:"6",rir:2},{weight:"BW",reps:"5",rir:2},{weight:"BW",reps:"5",rir:1}]},
    { id:"cable_row", name:"Seated Cable Row", sets:[
      {weight:"40",reps:"5",rir:1},{weight:"40",reps:"5",rir:1},{weight:"40",reps:"5",rir:1},{weight:"40",reps:"5",rir:1}]},
  ]},
  { id:"imp_20250425", type:"push", date:"2025-04-25T09:00:00.000Z", exercises:[
    { id:"db_bench", name:"DB Bench Press", sets:[
      {weight:"30",reps:"5",rir:1},{weight:"30",reps:"5",rir:1},{weight:"30",reps:"5",rir:1},{weight:"30",reps:"5",rir:1}]},
    { id:"db_ohp", name:"Seated DB Shoulder Press", sets:[
      {weight:"18",reps:"6",rir:2},{weight:"18",reps:"10",rir:2},{weight:"18",reps:"10",rir:2},{weight:"18",reps:"10",rir:2}]},
  ]},
  { id:"imp_20250423", type:"legs", date:"2025-04-23T09:00:00.000Z", exercises:[
    { id:"hack_squat", name:"V-Squat", sets:[
      {weight:"65",reps:"7",rir:2},{weight:"88",reps:"6",rir:2},{weight:"88",reps:"6",rir:2},{weight:"88",reps:"7",rir:2}]},
    { id:"rdl_db", name:"RDL DB", sets:[
      {weight:"24",reps:"8",rir:2},{weight:"24",reps:"8",rir:2},{weight:"24",reps:"8",rir:2}]},
    { id:"leg_curl", name:"Leg Curl", sets:[
      {weight:"20",reps:"12",rir:2},{weight:"25",reps:"9",rir:2},{weight:"25",reps:"9",rir:2}]},
  ]},
  { id:"imp_20250421", type:"pull", date:"2025-04-21T09:00:00.000Z", exercises:[
    { id:"cable_row", name:"Standing Cable Row", sets:[
      {weight:"28",reps:"12",rir:3},{weight:"36",reps:"8",rir:3},{weight:"40",reps:"10",rir:1},{weight:"36",reps:"8",rir:2}]},
    { id:"ez_bar_curl", name:"EZ Bar Curl", sets:[
      {weight:"30",reps:"5",rir:1},{weight:"30",reps:"6",rir:2},{weight:"30",reps:"6",rir:2},{weight:"30",reps:"6",rir:2}]},
  ]},
];

// ─── Exercise library ─────────────────────────────────────────────────────────
const EXERCISES = {
  pull: [
    { id:"pull_up",          name:"Pull-ups",               muscle:"Lats",        cues:["Dead hang, arms fully extended","Pull elbows down to hips, chest to bar","Slow 3-second descent"] },
    { id:"barbell_row",      name:"Barbell Row",             muscle:"Mid Back",    cues:["Hinge ~45°, flat back throughout","Row bar to lower chest","Squeeze shoulder blades at top"] },
    { id:"cable_row",        name:"Seated Cable Row",        muscle:"Mid Back",    cues:["Sit tall, slight back lean","Pull handle to navel","Hold 1s squeeze, slow return"] },
    { id:"lat_pulldown",     name:"Lat Pulldown",            muscle:"Lats",        cues:["Slight back lean, chest up","Pull bar to upper chest","Feel full lat stretch at top"] },
    { id:"face_pull",        name:"Face Pull",               muscle:"Rear Delt",   cues:["Cable at eye height, rope attachment","Pull to face, elbows flared high","Pause and squeeze rear delts"] },
    { id:"hammer_curl",      name:"Hammer Curl",             muscle:"Biceps",      cues:["Neutral grip, thumbs pointing up","Keep elbows pinned to sides","Full ROM top to bottom"] },
    { id:"ez_bar_curl",      name:"EZ Bar Curl",             muscle:"Biceps",      cues:["Shoulder-width grip on angled bar","Curl to chin, elbows stay fixed","3-second eccentric on the way down"] },
    { id:"incline_curl",     name:"Incline DB Curl",         muscle:"Biceps",      cues:["Bench at 45–60°, arms hang freely","Curl without swinging torso","Full stretch at the bottom"] },
    { id:"chest_supported_db_row", name:"Chest Supported DB Row", muscle:"Mid Back", cues:["Chest on incline bench, feet on floor","Row DBs to hip line","Retract scapula before you pull"] },
    { id:"single_arm_row",   name:"Single-Arm DB Row",       muscle:"Lats",        cues:["Knee and hand on bench for support","Row DB to hip, elbow close to body","Full stretch at the bottom"] },
    { id:"cable_curl",       name:"Cable Curl",              muscle:"Biceps",      cues:["Low pulley, supinated grip","Curl keeping upper arm vertical","Peak squeeze at top"] },
    { id:"neutral_pulldown", name:"Neutral-Grip Pulldown",   muscle:"Lats",        cues:["Palms face each other on bar","Pull to chin, elbows track straight down","Control the return"] },
    { id:"reverse_curl",     name:"Reverse Curl",            muscle:"Brachialis",  cues:["Overhand (pronated) grip","Curl without elbow flare","Great for forearm development"] },
    { id:"meadows_row",      name:"Meadows Row",             muscle:"Mid Back",    cues:["Landmine setup, perpendicular stance","Row to hip with full range of motion","Slight torso rotation OK"] },
    { id:"cable_row_seated", name:"Standing Cable Row",      muscle:"Mid Back",    cues:["Stand with slight knee bend","Row to navel, brace core","Squeeze mid-back at top"] },
  ],
  push: [
    { id:"bench_press",      name:"Barbell Bench Press",     muscle:"Chest",       cues:["Arch, retract scapula, feet flat on floor","Bar to lower chest, elbows ~75° from torso","Drive through legs, full lockout"] },
    { id:"incline_db_press", name:"Incline DB Press",        muscle:"Upper Chest", cues:["30–45° incline setting","DBs together at top, deep stretch at bottom","Keep wrists stacked over elbows"] },
    { id:"ohp",              name:"Overhead Press",          muscle:"Shoulders",   cues:["Bar at collarbone, elbows slightly forward","Press overhead to full lockout","Brace core to protect lower back"] },
    { id:"cable_fly",        name:"Cable Fly",               muscle:"Chest",       cues:["Cables at chest height","Arc motion with slight elbow bend throughout","Squeeze hard at centre"] },
    { id:"lateral_raise",    name:"Lateral Raise",           muscle:"Side Delt",   cues:["Slight forward lean, soft elbow bend","Lead with elbows to shoulder height","Slow 3–4s lower — the eccentric matters"] },
    { id:"tricep_pushdown",  name:"Cable Triceps Pushdown",  muscle:"Triceps",     cues:["Elbows pinned to sides throughout","Push to full lockout at the bottom","Don't let elbows drift forward"] },
    { id:"skull_crusher",    name:"Skull Crusher",           muscle:"Triceps",     cues:["EZ bar, upper arms vertical","Lower to forehead, elbows stay narrow","Press back to vertical"] },
    { id:"dip",              name:"Weighted Dip",            muscle:"Chest/Tri",   cues:["Slight forward lean for chest emphasis","Lower until shoulders below elbows","Lock out fully at top"] },
    { id:"db_ohp",           name:"Seated DB Shoulder Press",muscle:"Shoulders",   cues:["Seat upright, DBs at ear height","Press overhead, slight inward arc","Don't shrug at the top"] },
    { id:"incline_cable_fly",name:"Incline Cable Fly",       muscle:"Upper Chest", cues:["Low pulleys, use an incline bench","Arc up and together, feel the stretch","Emphasise the stretch at the bottom"] },
    { id:"overhead_tri",     name:"Overhead Tricep Extension",muscle:"Triceps",    cues:["Elbows point forward, by ears","Lower rope or DB behind head","Extend to full lockout"] },
    { id:"db_bench",         name:"DB Bench Press",          muscle:"Chest",       cues:["DBs touch at the top","Lower with control, elbows ~60°","Full press — don't hard lock"] },
    { id:"arnold_press",     name:"Arnold Press",            muscle:"Shoulders",   cues:["Start with palms facing you at chin","Rotate outward as you press up","Reverse the rotation on descent"] },
    { id:"pec_deck",         name:"Pec Deck",                muscle:"Chest",       cues:["Elbows on pad at chest height","Bring pads together and squeeze hard","3-second eccentric"] },
    { id:"front_raise",      name:"Front Raise",             muscle:"Front Delt",  cues:["Palms down or neutral grip","Raise to eye level — don't swing","Control the descent slowly"] },
  ],
  legs: [
    { id:"squat",            name:"Back Squat",              muscle:"Quads",       cues:["Bar on traps, brace hard before descent","Break at hips and knees simultaneously","Drive knees out, keep chest tall"] },
    { id:"rdl",              name:"Romanian Deadlift",       muscle:"Hamstrings",  cues:["Hip hinge, soft knees throughout","Bar drags down shins until you feel hamstring stretch","Drive hips forward to stand tall"] },
    { id:"leg_press",        name:"Leg Press",               muscle:"Quads",       cues:["Feet shoulder-width, mid-plate position","Lower until 90° knee angle","Don't lock out aggressively at top"] },
    { id:"leg_curl",         name:"Leg Curl Machine",        muscle:"Hamstrings",  cues:["Lie prone, pad just above heels","Curl fully, keep hips pressed down","3-second eccentric on return"] },
    { id:"bulgarian_split",  name:"Bulgarian Split Squat",   muscle:"Quads",       cues:["Rear foot elevated, torso upright","Front knee tracks over toes","Deep stretch at the bottom — go slow"] },
    { id:"hip_thrust",       name:"Hip Thrust",              muscle:"Glutes",      cues:["Shoulders on bench, bar padded on hips","Drive hips to full extension","Squeeze glutes hard at the top"] },
    { id:"hack_squat",       name:"V-Squat / Hack Squat",   muscle:"Quads",       cues:["Feet shoulder-width on the plate","Lower to 90° or below","Push through heels"] },
    { id:"leg_extension",    name:"Leg Extension",           muscle:"Quads",       cues:["Pad positioned just above ankle","Extend fully and flex quads hard at top","Slow 3-second eccentric"] },
    { id:"standing_calf",    name:"Standing Calf Raise",     muscle:"Calves",      cues:["Full ROM — deep stretch at the bottom","Pause at top, squeeze calves hard","Slow eccentric is the key"] },
    { id:"seated_calf",      name:"Seated Calf Raise",       muscle:"Calves",      cues:["Knee bent 90°, pads on quads","Full stretch at the bottom","Soleus focused — great complement to standing"] },
    { id:"sumo_deadlift",    name:"Sumo Deadlift",           muscle:"Hamstrings/Glutes", cues:["Wide stance, toes out ~45°","Grip inside legs, chest up","Push floor away, lock hips at top"] },
    { id:"goblet_squat",     name:"Goblet Squat",            muscle:"Quads",       cues:["DB or KB at chest height","Elbows inside knees at the bottom","Great warm-up squat pattern"] },
    { id:"nordic_curl",      name:"Nordic Curl",             muscle:"Hamstrings",  cues:["Feet anchored, kneel tall","Lower body slowly over 3–5 seconds","Catch with hands if needed at first"] },
    { id:"rdl_db",           name:"RDL DB",                  muscle:"Hamstrings",  cues:["DBs in front of thighs","Hinge forward until you feel a hamstring stretch","Return by driving hips forward"] },
    { id:"step_up",          name:"Weighted Step-Up",        muscle:"Glutes",      cues:["Step height roughly knee level","Drive through heel of the top foot","Don't push off the bottom foot"] },
  ],
};

// ─── Body diagram ─────────────────────────────────────────────────────────────
function BodyDiagram({ muscle }) {
  const m = (muscle||"").toLowerCase();
  const hi = "#f97316";
  const base = "#1e1e28";
  const line = "rgba(255,255,255,0.1)";
  const isLat      = m.includes("lat");
  const isMidBack  = m.includes("mid back");
  const isRearDelt = m.includes("rear delt");
  const isBiceps   = m.includes("bicep")||m.includes("brach");
  const isChest    = m.includes("chest");
  const isShoulder = (m.includes("shoulder")||m.includes("delt"))&&!isRearDelt;
  const isTriceps  = m.includes("tri");
  const isQuads    = m.includes("quad");
  const isHams     = m.includes("ham")||m.includes("glute");
  const isCalves   = m.includes("calve");
  return (
    <svg viewBox="0 0 120 200" width="110" height="200" style={{display:"block",margin:"0 auto"}}>
      <circle cx="60" cy="16" r="12" fill={base} stroke={line} strokeWidth="1.5"/>
      <rect x="55" y="27" width="10" height="7" rx="3" fill={base} stroke={line} strokeWidth="1"/>
      <rect x="38" y="34" width="44" height="50" rx="6" fill={base} stroke={line} strokeWidth="1.5"/>
      {isChest  && <rect x="40" y="36" width="40" height="20" rx="4" fill={hi} opacity=".5"/>}
      {isMidBack&& <rect x="44" y="36" width="32" height="46" rx="4" fill={hi} opacity=".35"/>}
      {isLat && <><rect x="31" y="42" width="8" height="28" rx="4" fill={hi} opacity=".6"/><rect x="81" y="42" width="8" height="28" rx="4" fill={hi} opacity=".6"/></>}
      <ellipse cx="34" cy="39" rx="9" ry="8" fill={base} stroke={line} strokeWidth="1.5"/>
      <ellipse cx="86" cy="39" rx="9" ry="8" fill={base} stroke={line} strokeWidth="1.5"/>
      {isShoulder && <><ellipse cx="34" cy="39" rx="9" ry="8" fill={hi} opacity=".6"/><ellipse cx="86" cy="39" rx="9" ry="8" fill={hi} opacity=".6"/></>}
      {isRearDelt&& <><ellipse cx="31" cy="41" rx="7" ry="6" fill={hi} opacity=".6"/><ellipse cx="89" cy="41" rx="7" ry="6" fill={hi} opacity=".6"/></>}
      <rect x="21" y="47" width="12" height="30" rx="6" fill={base} stroke={line} strokeWidth="1.5"/>
      <rect x="87" y="47" width="12" height="30" rx="6" fill={base} stroke={line} strokeWidth="1.5"/>
      {isBiceps  && <><rect x="22" y="48" width="10" height="18" rx="5" fill={hi} opacity=".65"/><rect x="88" y="48" width="10" height="18" rx="5" fill={hi} opacity=".65"/></>}
      {isTriceps && <><rect x="22" y="62" width="10" height="16" rx="5" fill={hi} opacity=".65"/><rect x="88" y="62" width="10" height="16" rx="5" fill={hi} opacity=".65"/></>}
      <rect x="19" y="77" width="12" height="24" rx="5" fill={base} stroke={line} strokeWidth="1"/>
      <rect x="89" y="77" width="12" height="24" rx="5" fill={base} stroke={line} strokeWidth="1"/>
      <ellipse cx="25" cy="104" rx="7" ry="5" fill={base} stroke={line} strokeWidth="1"/>
      <ellipse cx="95" cy="104" rx="7" ry="5" fill={base} stroke={line} strokeWidth="1"/>
      <rect x="38" y="84" width="44" height="14" rx="5" fill={base} stroke={line} strokeWidth="1.5"/>
      {isHams && <rect x="40" y="85" width="40" height="12" rx="4" fill={hi} opacity=".5"/>}
      <rect x="38" y="97" width="18" height="44" rx="7" fill={base} stroke={line} strokeWidth="1.5"/>
      <rect x="64" y="97" width="18" height="44" rx="7" fill={base} stroke={line} strokeWidth="1.5"/>
      {isQuads && <><rect x="39" y="98" width="16" height="42" rx="6" fill={hi} opacity=".55"/><rect x="65" y="98" width="16" height="42" rx="6" fill={hi} opacity=".55"/></>}
      {isHams  && <><rect x="39" y="114" width="16" height="26" rx="5" fill={hi} opacity=".4"/><rect x="65" y="114" width="16" height="26" rx="5" fill={hi} opacity=".4"/></>}
      <rect x="40" y="140" width="14" height="34" rx="6" fill={base} stroke={line} strokeWidth="1.5"/>
      <rect x="66" y="140" width="14" height="34" rx="6" fill={base} stroke={line} strokeWidth="1.5"/>
      {isCalves && <><rect x="41" y="141" width="12" height="32" rx="5" fill={hi} opacity=".65"/><rect x="67" y="141" width="12" height="32" rx="5" fill={hi} opacity=".65"/></>}
      <ellipse cx="47" cy="177" rx="9" ry="5" fill={base} stroke={line} strokeWidth="1"/>
      <ellipse cx="73" cy="177" rx="9" ry="5" fill={base} stroke={line} strokeWidth="1"/>
    </svg>
  );
}

// ─── Rest timer ───────────────────────────────────────────────────────────────
const REST_SECS = 120;
function useRestTimer() {
  const [state, setState] = useState("idle");
  const [secs,  setSecs]  = useState(REST_SECS);
  const iv = useRef(null);

  const tick = useCallback(() => {
    setSecs(s => {
      if (s <= 1) { setState("done"); return 0; }
      return s - 1;
    });
  }, []);

  useEffect(() => { if (state === "done") clearInterval(iv.current); }, [state]);
  useEffect(() => () => clearInterval(iv.current), []);

  const toggle = () => {
    if (state === "idle") {
      setSecs(REST_SECS);
      setState("running");
      iv.current = setInterval(tick, 1000);
    } else {
      clearInterval(iv.current);
      setState("idle");
      setSecs(REST_SECS);
    }
  };

  const display = `${Math.floor(secs/60)}:${String(secs%60).padStart(2,"0")}`;
  return { state, display, toggle };
}

// ─── Constants / helpers ──────────────────────────────────────────────────────
const SESSION_LABELS = { pull:"Pull", push:"Push", legs:"Legs" };
const SESSION_COLORS = { pull:"#4f9cf9", push:"#f97316", legs:"#22c55e" };
const SESSION_ICONS  = { pull:"↙", push:"↗", legs:"⬆" };
const SETS_N = 4;
const EX_N   = 5;

function isBW(w)  { return String(w).toUpperCase().trim()==="BW"||String(w).trim()===""; }
function parseRIR(v) {
  if (v===null||v===undefined) return null;
  if (typeof v==="number") return v;
  const s=String(v).replace(/\s*RIR/i,"").trim();
  if (s.includes("-")){const p=s.split("-").map(Number);return(p[0]+p[1])/2;}
  const n=parseFloat(s);return isNaN(n)?null:n;
}
function latestOf(sessions,type){
  return [...sessions].filter(s=>s.type===type).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;
}
function pickExercises(type, last){
  const pool=[...EXERCISES[type]];
  const prev=last[type]||[];
  pool.sort((a,b)=>{
    const ai=prev.indexOf(a.id),bi=prev.indexOf(b.id);
    if(ai===-1&&bi!==-1)return -1;if(ai!==-1&&bi===-1)return 1;
    return Math.random()-.5;
  });
  return pool.slice(0,EX_N);
}
function getSuggestion(exId,exName,sessions){
  const sorted=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date));
  for(const s of sorted){
    const ex=s.exercises?.find(e=>e.id===exId||e.name?.toLowerCase()===exName?.toLowerCase());
    if(!ex?.sets?.length)continue;
    const done=ex.sets.filter(ss=>ss.reps&&!isBW(ss.weight));
    if(!done.length){
      const bw=ex.sets.filter(ss=>ss.reps);if(!bw.length)continue;
      const avgRIR=bw.reduce((a,ss)=>a+(parseRIR(ss.rir)??2),0)/bw.length;
      const avgReps=bw.reduce((a,ss)=>a+(parseInt(ss.reps)||0),0)/bw.length;
      const hint=avgRIR<=1&&avgReps>=5?"Try adding 2.5kg belt":avgRIR>=3?"Focus on reps first":"Maintain";
      return{bw:true,hint,prevReps:Math.round(avgReps),avgRIR:avgRIR.toFixed(1)};
    }
    const avgRIR=done.reduce((a,ss)=>a+(parseRIR(ss.rir)??2),0)/done.length;
    const top=Math.max(...done.map(ss=>parseFloat(ss.weight)||0));
    let sug=top;
    if(avgRIR<=1)sug=Math.round((top*1.025)/2.5)*2.5;
    else if(avgRIR>=3.5)sug=Math.max(0,Math.round((top*0.975)/2.5)*2.5);
    return{weight:sug,prevWeight:top,avgRIR:avgRIR.toFixed(1),bw:false};
  }
  return null;
}
function getHistory(exId,exName,sessions){
  const pts=[];
  [...sessions].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s=>{
    const ex=s.exercises?.find(e=>e.id===exId||e.name?.toLowerCase()===exName?.toLowerCase());
    if(!ex?.sets?.length)return;
    const done=ex.sets.filter(ss=>ss.reps&&!isBW(ss.weight));
    if(!done.length)return;
    const top=Math.max(...done.map(ss=>parseFloat(ss.weight)||0));
    pts.push({date:s.date,weight:top,reps:parseInt(done.find(ss=>parseFloat(ss.weight)===top)?.reps||0)});
  });
  return pts;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({points,color,h=60}){
  if(points.length<2)return<div style={{fontSize:12,color:"rgba(255,255,255,.3)",padding:"10px 0",textAlign:"center"}}>Need 2+ sessions to show chart</div>;
  const W=280,pad=10;
  const vals=points.map(p=>p.weight);
  const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;
  const xs=points.map((_,i)=>pad+(i/(points.length-1))*(W-pad*2));
  const ys=points.map(p=>pad+((mx-p.weight)/rng)*(h-pad*2));
  const path=xs.map((x,i)=>`${i===0?"M":"L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area=path+` L${xs[xs.length-1].toFixed(1)},${h} L${xs[0].toFixed(1)},${h} Z`;
  const gid=`g${color.replace("#","")}`;
  return(
    <svg viewBox={`0 0 ${W} ${h}`} style={{width:"100%",height:h,overflow:"visible"}}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".28"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <path d={area} fill={`url(#${gid})`}/>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((p,i)=>(
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r="3.5" fill={color}/>
          <text x={xs[i]} y={ys[i]-7} textAnchor="middle" fill={color} fontSize="9" fontFamily="DM Sans,sans-serif">{p.weight}kg</text>
        </g>
      ))}
    </svg>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#09090f;--s1:#111118;--s2:#18181f;--border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.13);--text:#eeeef5;--muted:#5a5a70;--muted2:#888899;--danger:#ef4444;--accent:#4f9cf9;--r:12px}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
.app{max-width:480px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}

.hdr{padding:20px 20px 12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.logo{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px}
.logo em{opacity:.28;font-style:normal}
.ib{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);background:var(--s1);color:var(--muted2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:.2s;flex-shrink:0}
.ib:hover{color:var(--text);border-color:var(--border2)}

.sb{flex:1;overflow-y:auto;padding:0 20px 24px}
.sb::-webkit-scrollbar{width:2px}
.sb::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

.bnav{padding:10px 20px 16px;border-top:1px solid var(--border);display:flex;gap:8px;flex-shrink:0}
.nb{flex:1;padding:9px 4px;border:1px solid var(--border);background:var(--s1);border-radius:10px;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:.2s}
.nb .ni{font-size:17px}
.nb.on{background:color-mix(in srgb,var(--accent) 10%,transparent);border-color:color-mix(in srgb,var(--accent) 35%,transparent);color:var(--accent)}

.sl{font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;margin-top:20px}

.streak{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:16px 20px;display:flex;align-items:center;gap:16px;margin-bottom:4px}
.streak-n{font-family:'Bebas Neue',sans-serif;font-size:50px;line-height:1;color:var(--accent)}
.streak-i{color:var(--muted2);font-size:13px}
.streak-i strong{display:block;color:var(--text);font-size:15px;font-weight:600;margin-bottom:2px}

.sc{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:16px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden;margin-bottom:8px}
.sc::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent)}
.sc:hover{background:var(--s2);transform:translateX(2px)}
.sc-icon{width:44px;height:44px;border-radius:50%;background:color-mix(in srgb,var(--accent) 12%,transparent);border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}
.sc-name{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px}
.sc-meta{font-size:12px;color:var(--muted2);margin-top:2px}

.ri{background:var(--s1);border:1px solid var(--border);border-radius:10px;padding:11px 14px;margin-bottom:8px}
.ri-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.rbadge{font-size:10px;font-weight:700;letter-spacing:.5px;padding:3px 8px;border-radius:20px;color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent)}
.rdate{font-size:12px;color:var(--muted2)}
.rexs{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.btn{border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;border-radius:var(--r);padding:13px 16px;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-p{background:var(--accent);color:#000;flex:1}
.btn-p:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-g{background:var(--s1);border:1px solid var(--border);color:var(--muted2)}
.btn-g:hover{color:var(--text);border-color:var(--border2)}

.wu{flex:1;display:flex;flex-direction:column;align-items:center;padding:20px 20px 16px;overflow-y:auto}
.wu-icon{width:76px;height:76px;border-radius:50%;background:color-mix(in srgb,var(--accent) 12%,transparent);border:2px solid color-mix(in srgb,var(--accent) 40%,transparent);display:flex;align-items:center;justify-content:center;font-size:34px;margin-bottom:14px;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
.wu-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;margin-bottom:4px}
.wu-sub{color:var(--muted2);font-size:13px;text-align:center;line-height:1.6;max-width:280px;margin-bottom:12px}
.wu-tips{background:var(--s1);border:1px solid var(--border);border-radius:10px;padding:10px 14px;width:100%;margin-bottom:14px}
.wu-tip{font-size:12px;color:var(--muted2);padding:5px 0;border-bottom:1px solid var(--border)}
.wu-tip:last-child{border-bottom:none}
.wu-tip::before{content:'✓ ';color:var(--accent)}
.wu-exlist{width:100%;display:flex;flex-direction:column;gap:5px;margin-bottom:16px}
.wu-ex{background:var(--s1);border:1px solid var(--border);border-radius:8px;padding:8px 12px;display:flex;align-items:center;gap:10px}
.wu-exn{font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--muted);width:16px;text-align:center}

.sess-hdr{padding:12px 20px 10px;border-bottom:1px solid rgba(255,255,255,.1);flex-shrink:0;background:#0e0e16}
.sess-top{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.exname{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;text-align:center;line-height:1.1;color:#f0f0ff}
.exname-row{display:flex;align-items:center;justify-content:center;gap:6px;flex:1}
.exmuscle{font-size:11px;color:rgba(255,255,255,.45);text-align:center;margin-top:1px}
.exc{font-size:12px;color:rgba(255,255,255,.4);white-space:nowrap;flex-shrink:0}
.prog-bar{height:3px;background:var(--border);border-radius:2px}
.prog-fill{height:100%;border-radius:2px;background:var(--accent);transition:width .4s}

.timer{min-width:58px;height:32px;border-radius:20px;border:1.5px solid var(--border);background:var(--s2);color:var(--muted2);font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px;cursor:pointer;transition:.2s;padding:0 8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.timer.running{border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent)}
.timer.done{border-color:var(--danger);color:var(--danger);background:color-mix(in srgb,var(--danger) 10%,transparent);animation:blink .6s ease-in-out infinite alternate}
@keyframes blink{from{opacity:1}to{opacity:.45}}

.sess-body{flex:1;overflow-y:auto;padding:12px 20px;background:#0e0e16}
.sess-body::-webkit-scrollbar{width:2px}
.sess-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}

.suggest{background:color-mix(in srgb,var(--accent) 10%,#111118);border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:12px}
.sug-w{font-family:'Bebas Neue',sans-serif;font-size:30px;color:var(--accent);line-height:1;flex-shrink:0}
.sug-w span{font-size:14px}
.sug-info{font-size:12px;color:var(--muted2);line-height:1.55}
.sug-info strong{color:var(--text);font-size:13px}
.sug-tag{font-size:10px;padding:2px 6px;border-radius:12px;margin-left:4px;font-weight:700}
.up{background:color-mix(in srgb,#22c55e 15%,transparent);color:#22c55e}
.hold{background:color-mix(in srgb,#f59e0b 15%,transparent);color:#f59e0b}
.down{background:color-mix(in srgb,#ef4444 15%,transparent);color:#ef4444}

.set-hdr{display:flex;align-items:center;padding:0 8px 6px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.3)}
.shc-n{width:32px;flex-shrink:0;text-align:center}
.shc-kg{flex:1;text-align:center}
.shc-rp{flex:1;text-align:center}
.shc-rir{flex:1;text-align:center}
.set-row{display:flex;align-items:center;background:#111118;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:0 10px;margin-bottom:4px;height:50px;cursor:pointer;transition:border-color .15s,background .15s;user-select:none;-webkit-user-select:none}
.set-row:active{background:#16161f}
.set-row.active-row{border-color:var(--accent);background:#12121e}
.set-row.done{border-color:color-mix(in srgb,var(--accent) 40%,transparent);cursor:default}
.sr-num{font-family:'Bebas Neue',sans-serif;font-size:18px;width:32px;flex-shrink:0;text-align:center;color:rgba(255,255,255,.25);line-height:1}
.sr-num.done{color:var(--accent)}
.sr-val{flex:1;text-align:center;font-size:15px;font-weight:600;color:rgba(255,255,255,.85)}
.sr-val.empty{color:rgba(255,255,255,.2);font-weight:400;font-size:13px}
.sr-rir{flex:1;text-align:center}
.rir-dot{display:inline-block;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:700}
.set-editor{background:#16161f;border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:12px;padding:12px 12px 10px;margin-bottom:4px;margin-top:-2px}
.se-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:8px;text-align:center}
.se-inputs{display:flex;gap:8px;margin-bottom:10px}
.se-field{flex:1;display:flex;flex-direction:column;gap:4px}
.se-field label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.3);text-align:center}
.se-input{background:#1c1c28;border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#fff;font-family:'DM Sans',sans-serif;font-size:18px;font-weight:700;height:48px;text-align:center;width:100%;outline:none;box-sizing:border-box;-webkit-appearance:none}
.se-input:focus{border-color:var(--accent);background:#1e1e2e}
.se-rir{display:flex;gap:6px}
.se-rir-lbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px;text-align:center}
.srb{flex:1;height:42px;background:#1c1c28;border:1px solid rgba(255,255,255,.1);border-radius:8px;color:rgba(255,255,255,.5);font-size:15px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
.srb.on{background:color-mix(in srgb,var(--accent) 25%,transparent);border-color:var(--accent);color:var(--accent)}
.se-done-btn{width:100%;margin-top:8px;height:40px;background:var(--accent);border:none;border-radius:8px;color:#000;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer}
.info-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);font-size:14px;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:.2s;padding:0;flex-shrink:0}
.info-btn:hover{color:var(--accent)}

.rir-leg{font-size:11px;color:var(--muted);padding:8px 0 2px;border-top:1px solid var(--border);margin-top:2px}
.rir-leg strong{color:var(--muted2)}

.sess-foot{padding:12px 20px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:8px;flex-shrink:0;background:#0e0e16}

.overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.modal{background:var(--s1);border:1px solid var(--border2);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:480px;max-height:82vh;overflow-y:auto}
.modal-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px}
.modal-muscle{font-size:12px;color:var(--muted2);margin-top:2px}
.modal-body{display:flex;gap:16px;align-items:flex-start}
.modal-cues{flex:1}
.modal-cue{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--muted2);line-height:1.5}
.modal-cue:last-child{border-bottom:none}
.modal-cue-n{font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--accent);width:16px;flex-shrink:0}

.done{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center}
.done-icon{font-size:56px;margin-bottom:14px;animation:pop .4s cubic-bezier(.175,.885,.32,1.275) both}
@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.done-title{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:2px;margin-bottom:6px}
.done-sub{color:var(--muted2);margin-bottom:20px;line-height:1.6;font-size:14px}
.done-stats{width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
.dstat{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 6px;text-align:center}
.dstat-n{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--accent)}
.dstat-l{font-size:11px;color:var(--muted2);margin-top:2px}

.hi{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);margin-bottom:9px;overflow:hidden}
.hi-hdr{padding:11px 14px;display:flex;align-items:center;gap:10px;cursor:pointer}
.hi-hdr:hover{background:var(--s2)}
.hbadge{font-size:10px;font-weight:700;letter-spacing:.5px;padding:3px 9px;border-radius:20px;color:var(--accent);background:color-mix(in srgb,var(--accent) 15%,transparent)}
.hdate{font-size:13px;color:var(--muted2);flex:1}
.hbody{border-top:1px solid var(--border);padding:8px 14px}
.hex{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)}
.hex:last-child{border-bottom:none}
.hex-name{font-size:13px;flex:1}
.hex-meta{font-size:12px;color:var(--muted2)}
.cbtn{font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;padding:2px 6px;font-family:'DM Sans',sans-serif}
.cwrap{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-top:6px}
.ctitle{font-size:10px;font-weight:700;letter-spacing:1px;color:var(--muted2);margin-bottom:6px;text-transform:uppercase}

.pec{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:10px}
.pec-name{font-size:15px;font-weight:600;margin-bottom:2px}
.pec-stats{display:flex;gap:8px;margin-bottom:10px}
.ps{background:var(--s2);border-radius:8px;padding:8px;flex:1;text-align:center}
.ps-n{font-family:'Bebas Neue',sans-serif;font-size:21px;color:var(--accent)}
.ps-l{font-size:10px;color:var(--muted2)}

.empty{text-align:center;padding:48px 20px;color:var(--muted);font-size:14px}
.empty-icon{font-size:40px;margin-bottom:12px}

.loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090f;color:#4f9cf9;font-family:'DM Sans',sans-serif;font-size:15px;letter-spacing:1px}
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [data,    setData]    = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [screen,  setScreen]  = useState("home");
  const [tab,     setTab]     = useState("home");
  const [aType,   setAType]   = useState(null);
  const [exs,     setExs]     = useState([]);
  const [exIdx,   setExIdx]   = useState(0);
  const [sets,    setSets]    = useState({});
  const [expanded,setExpanded]= useState(null);
  const [chartKey,setChartKey]= useState(null);
  const [instrEx, setInstrEx] = useState(null);
  const [activeSet, setActiveSet] = useState(0);
  const timer = useRestTimer();

  // Load from IndexedDB on mount
  useEffect(() => {
    loadData().then(d => { setData(d); setDbReady(true); });
  }, []);

  // Persist to IndexedDB on every data change
  useEffect(() => {
    if (dbReady && data) saveData(data);
  }, [data, dbReady]);

  if (!dbReady) return <div className="loading">Loading…</div>;

  const accent   = aType ? SESSION_COLORS[aType] : "#4f9cf9";
  const curEx    = exs[exIdx];
  const curSets  = curEx ? (sets[curEx.id]||Array.from({length:SETS_N},()=>({weight:"",reps:"",rir:null}))) : [];
  const sug      = curEx ? getSuggestion(curEx.id,curEx.name,data.sessions) : null;

  const upd = (si,f,v) => setSets(prev=>{
    const blank = ()=>({weight:"",reps:"",rir:null});
    const cur = prev[curEx.id]||Array.from({length:SETS_N},blank);
    const updated = cur.map((s,i)=>i===si?{...s,[f]:v}:s);
    if(f==="rir"){
      const thisWeight = updated[si].weight;
      const next = si+1;
      if(thisWeight!==""&&next<updated.length&&updated[next].weight===""){
        const rir=Number(v);
        const nextW = rir>=3
          ? String(Math.round((parseFloat(thisWeight)+2.5)*4)/4)
          : thisWeight;
        updated[next]={...updated[next],weight:nextW};
      }
    }
    return{...prev,[curEx.id]:updated};
  });

  const logSetAndAdvance = (si) => {
    const s = (sets[curEx.id]||[])[si]||{};
    if(s.reps!==""&&s.rir!==null&&si+1<SETS_N) setActiveSet(si+1);
  };

  const isDone = s => s.reps!==""&&s.rir!==null;

  const startSession = type => {
    const picked=pickExercises(type,data.lastExercises);
    setAType(type);setExs(picked);setExIdx(0);setSets({});setScreen("warmup");
  };

  const nextEx = () => { if(exIdx<exs.length-1){setExIdx(exIdx+1);setActiveSet(0);} else finish(); };

  const finish = () => {
    const session={id:Date.now(),type:aType,date:new Date().toISOString(),
      exercises:exs.map(ex=>({id:ex.id,name:ex.name,sets:sets[ex.id]||[]}))};
    setData(prev=>({...prev,sessions:[...prev.sessions,session],
      lastExercises:{...prev.lastExercises,[aType]:exs.map(e=>e.id)}}));
    setScreen("done");
  };

  const totalSets = Object.values(sets).reduce((a,s)=>a+s.filter(isDone).length,0);
  const totalVol  = Object.values(sets).reduce((t,s)=>
    t+s.filter(isDone).reduce((a,ss)=>a+(isBW(ss.weight)?0:(parseFloat(ss.weight)||0)*(parseInt(ss.reps)||0)),0),0);

  const streak = (()=>{
    const sorted=[...data.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date));
    let c=0,prev=new Date();
    for(const s of sorted){if((prev-new Date(s.date))/86400000<=3){c++;prev=new Date(s.date);}else break;}
    return c;
  })();

  const sortedSessions=[...data.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date));

  const histExercises=(()=>{
    const map=new Map();
    data.sessions.forEach(s=>s.exercises?.forEach(ex=>{
      if(!map.has(ex.name))map.set(ex.name,{id:ex.id,name:ex.name,
        sType:data.sessions.find(ss=>ss.exercises?.some(e=>e.name===ex.name))?.type||"pull"});
    }));
    return[...map.values()];
  })();

  const trendTag = s=>{
    if(!s||s.bw)return null;
    if(s.weight>s.prevWeight)return{cls:"up",lbl:"↑ Increase"};
    if(s.weight<s.prevWeight)return{cls:"down",lbl:"↓ Reduce"};
    return{cls:"hold",lbl:"= Maintain"};
  };

  const fmt = d => new Date(d).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
  const fmtL = d => new Date(d).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short"});

  return(<>
    <style>{CSS}</style>
    <style>{`:root{--accent:${accent}}`}</style>

    {instrEx&&(
      <div className="overlay" onClick={()=>setInstrEx(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-head">
            <div><div className="modal-title">{instrEx.name}</div><div className="modal-muscle">{instrEx.muscle}</div></div>
            <button className="ib" onClick={()=>setInstrEx(null)}>✕</button>
          </div>
          <div className="modal-body">
            <BodyDiagram muscle={instrEx.muscle}/>
            <div className="modal-cues">
              {(instrEx.cues||[]).map((c,i)=>(
                <div key={i} className="modal-cue">
                  <span className="modal-cue-n">{i+1}</span><span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="app">

    {screen==="home"&&tab==="home"&&(<>
      <div className="hdr"><div className="logo">IRON<em>TRACK</em></div></div>
      <div className="sb">
        <div className="streak">
          <div className="streak-n">{streak}</div>
          <div className="streak-i"><strong>Session Streak</strong>{data.sessions.length} total sessions</div>
        </div>
        <div className="sl">Start Session</div>
        {["pull","push","legs"].map(type=>{
          const last=latestOf(data.sessions,type);
          const lastDate=last?fmt(last.date):"Never done";
          return(
            <div key={type} className="sc" style={{"--accent":SESSION_COLORS[type]}} onClick={()=>startSession(type)}>
              <div className="sc-icon">{SESSION_ICONS[type]}</div>
              <div style={{flex:1}}>
                <div className="sc-name">{SESSION_LABELS[type]} Day</div>
                <div className="sc-meta">Last: {lastDate}</div>
              </div>
              <span style={{color:"var(--muted)",fontSize:18}}>›</span>
            </div>
          );
        })}
        <div className="sl">Recent Sessions</div>
        {sortedSessions.slice(0,5).map(s=>(
          <div key={s.id} className="ri" style={{"--accent":SESSION_COLORS[s.type]}}>
            <div className="ri-top">
              <span className="rbadge">{SESSION_LABELS[s.type]}</span>
              <span className="rdate">{fmt(s.date)}</span>
              {String(s.id).startsWith("imp")&&<span style={{fontSize:10,color:"var(--muted)"}}>· imported</span>}
            </div>
            <div className="rexs">{s.exercises?.map(e=>e.name).join(" · ")}</div>
          </div>
        ))}
      </div>
      <div className="bnav">
        <button className="nb on"><span className="ni">🏋️</span>Train</button>
        <button className="nb" onClick={()=>setTab("history")}><span className="ni">📋</span>History</button>
        <button className="nb" onClick={()=>setTab("progress")}><span className="ni">📈</span>Progress</button>
      </div>
    </>)}

    {screen==="home"&&tab==="history"&&(<>
      <div className="hdr"><div className="logo">SESSION <em>LOG</em></div></div>
      <div className="sb">
        {sortedSessions.length===0
          ?<div className="empty"><div className="empty-icon">📭</div>No sessions yet.</div>
          :sortedSessions.map(s=>(
          <div key={s.id} className="hi" style={{"--accent":SESSION_COLORS[s.type]}}>
            <div className="hi-hdr" onClick={()=>setExpanded(expanded===s.id?null:s.id)}>
              <span className="hbadge">{SESSION_LABELS[s.type]}</span>
              <span className="hdate">{fmtL(s.date)}{String(s.id).startsWith("imp")&&<span style={{fontSize:10,color:"var(--muted)"}}> · imported</span>}</span>
              <span style={{color:"var(--muted)",fontSize:13}}>{expanded===s.id?"▲":"▼"}</span>
            </div>
            {expanded===s.id&&(
              <div className="hbody">
                {s.exercises?.map(ex=>{
                  const done=(ex.sets||[]).filter(ss=>ss.reps&&!isBW(ss.weight));
                  const bwS=(ex.sets||[]).filter(ss=>ss.reps&&isBW(ss.weight));
                  const top=done.length?done.reduce((b,ss)=>parseFloat(ss.weight)>parseFloat(b.weight||0)?ss:b,{}):null;
                  const pts=getHistory(ex.id,ex.name,data.sessions);
                  const k=`${s.id}-${ex.name}`;
                  return(
                    <div key={ex.name||ex.id}>
                      <div className="hex">
                        <div className="hex-name">{ex.name}</div>
                        <div className="hex-meta">{top?`${(ex.sets||[]).filter(ss=>ss.reps).length}s · ${top.weight}kg×${top.reps}`:bwS.length?`${bwS.length}s · BW`:"—"}</div>
                        {pts.length>=2&&<button className="cbtn" onClick={()=>setChartKey(chartKey===k?null:k)}>{chartKey===k?"Hide":"Chart"}</button>}
                      </div>
                      {chartKey===k&&<div className="cwrap"><div className="ctitle">Top set weight over time</div><Sparkline points={pts} color={SESSION_COLORS[s.type]}/></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bnav">
        <button className="nb" onClick={()=>setTab("home")}><span className="ni">🏋️</span>Train</button>
        <button className="nb on"><span className="ni">📋</span>History</button>
        <button className="nb" onClick={()=>setTab("progress")}><span className="ni">📈</span>Progress</button>
      </div>
    </>)}

    {screen==="home"&&tab==="progress"&&(<>
      <div className="hdr"><div className="logo">PROGRESS <em>CHARTS</em></div></div>
      <div className="sb">
        {histExercises.length===0
          ?<div className="empty"><div className="empty-icon">📊</div>No data yet.</div>
          :histExercises.map(ex=>{
            const pts=getHistory(ex.id,ex.name,data.sessions);
            if(!pts.length)return null;
            const latest=pts[pts.length-1]?.weight,first=pts[0]?.weight;
            const gain=latest&&first?(latest-first).toFixed(1):null;
            const color=SESSION_COLORS[ex.sType]||"#4f9cf9";
            return(
              <div key={ex.name} className="pec" style={{"--accent":color}}>
                <div className="pec-name">{ex.name}</div>
                <div className="pec-stats">
                  <div className="ps"><div className="ps-n">{latest??"BW"}{latest?"kg":""}</div><div className="ps-l">Latest</div></div>
                  <div className="ps"><div className="ps-n">{pts.length}</div><div className="ps-l">Sessions</div></div>
                  {gain!==null&&<div className="ps"><div className="ps-n" style={{color:parseFloat(gain)>=0?"#22c55e":"#ef4444"}}>{parseFloat(gain)>=0?"+":""}{gain}kg</div><div className="ps-l">Total gain</div></div>}
                </div>
                {pts.length>=2
                  ?<div className="cwrap"><div className="ctitle">Top set weight · kg</div><Sparkline points={pts} color={color}/></div>
                  :<div style={{fontSize:12,color:"var(--muted)",padding:"6px 0"}}>Log one more session to chart</div>}
              </div>
            );
          })
        }
      </div>
      <div className="bnav">
        <button className="nb" onClick={()=>setTab("home")}><span className="ni">🏋️</span>Train</button>
        <button className="nb" onClick={()=>setTab("history")}><span className="ni">📋</span>History</button>
        <button className="nb on"><span className="ni">📈</span>Progress</button>
      </div>
    </>)}

    {screen==="warmup"&&(<>
      <div className="hdr">
        <div className="logo" style={{color:accent}}>{SESSION_LABELS[aType]} <em>DAY</em></div>
        <button className="ib" onClick={()=>setScreen("home")}>✕</button>
      </div>
      <div className="wu">
        <div className="wu-icon">🔥</div>
        <div className="wu-title">Warmup Time</div>
        <div className="wu-sub">Prepare joints and muscles before going heavy.</div>
        <div className="sl" style={{alignSelf:"flex-start",marginTop:0}}>Today's Exercises</div>
        <div className="wu-exlist">
          {exs.map((ex,i)=>(
            <div key={ex.id} className="wu-ex">
              <span className="wu-exn">{i+1}</span>
              <span style={{flex:1,fontSize:13}}>{ex.name}</span>
              <span style={{fontSize:11,color:"var(--muted2)",marginRight:6}}>{ex.muscle}</span>
              <button className="ib" style={{width:26,height:26,fontSize:13}} onClick={()=>setInstrEx(ex)}>ℹ</button>
            </div>
          ))}
        </div>
        <button className="btn btn-p" style={{width:"100%",fontSize:15}} onClick={()=>setScreen("session")}>
          Warmup Done — Let's Go 💪
        </button>
      </div>
    </>)}

    {screen==="session"&&curEx&&(<>
      <div className="sess-hdr">
        <div className="sess-top">
          <button className="ib" onClick={()=>{if(window.confirm("Quit session?"))setScreen("home")}}>✕</button>
          <div className="exname-row">
            <div className="exname">{curEx.name}</div>
            <button className="info-btn" onClick={()=>setInstrEx(curEx)}>ℹ</button>
          </div>
          <div className="exmuscle">{curEx.muscle}</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span className="exc">{exIdx+1}/{exs.length}</span>
            <button className={`timer ${timer.state}`} onClick={timer.toggle}
              title={timer.state==="idle"?"Start 2 min rest":timer.state==="done"?"Tap to reset":"Tap to cancel"}>
              {timer.state==="idle"?"2:00":timer.display}
            </button>
          </div>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width:`${(exIdx/exs.length)*100}%`}}/></div>
      </div>

      <div className="sess-body">
        {sug ? (
          <div className="suggest">
            {sug.bw?(<>
              <div className="sug-w">BW</div>
              <div className="sug-info"><strong>Bodyweight</strong><br/>Last avg: {sug.prevReps} reps · RIR {sug.avgRIR}<br/>{sug.hint}</div>
            </>):(<>
              <div className="sug-w">{sug.weight}<span>kg</span></div>
              <div className="sug-info">
                <strong>Suggested</strong>
                {(()=>{const t=trendTag(sug);return t?<span className={`sug-tag ${t.cls}`}>{t.lbl}</span>:null;})()}
                <br/>Last: {sug.prevWeight}kg · RIR {sug.avgRIR}
              </div>
            </>)}
          </div>
        ):(
          <div style={{background:"var(--s1)",border:"1px solid var(--border)",borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:12,color:"var(--muted2)"}}>
            💡 First time logging this — pick a comfortable starting weight.
          </div>
        )}

        <div className="set-hdr">
          <span className="shc-n">#</span>
          <span className="shc-kg">KG</span>
          <span className="shc-rp">REPS</span>
          <span className="shc-rir">RIR</span>
        </div>
        {curSets.map((s,i)=>{
          const done=isDone(s);
          const isActive=activeSet===i&&!done;
          const rirColors=["#ef4444","#f97316","#eab308","#22c55e"];
          return(
            <div key={i}>
              <div
                className={`set-row${done?" done":""}${isActive?" active-row":""}`}
                onClick={()=>{ if(!done) setActiveSet(i); }}
              >
                <span className={`sr-num${done?" done":""}`}>{i+1}</span>
                <span className={`sr-val${!s.weight?" empty":""}`}>{s.weight||"—"}</span>
                <span className={`sr-val${!s.reps?" empty":""}`}>{s.reps||"—"}</span>
                <span className="sr-rir">
                  {s.rir!==null
                    ? <span className="rir-dot" style={{background:`${rirColors[s.rir]}22`,color:rirColors[s.rir]}}>RIR {s.rir}</span>
                    : <span className="rir-dot" style={{color:"rgba(255,255,255,.2)"}}>—</span>}
                </span>
              </div>
              {isActive&&(
                <div className="set-editor">
                  <div className="se-inputs">
                    <div className="se-field">
                      <label>KG</label>
                      <input
                        className="se-input"
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={s.weight}
                        autoFocus
                        onChange={e=>upd(i,"weight",e.target.value.replace(/[^0-9.]/g,""))}
                      />
                    </div>
                    <div className="se-field">
                      <label>REPS</label>
                      <input
                        className="se-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={s.reps}
                        onChange={e=>upd(i,"reps",e.target.value.replace(/[^0-9]/g,""))}
                      />
                    </div>
                  </div>
                  <div className="se-rir-lbl">RIR — Reps In Reserve</div>
                  <div className="se-rir">
                    {[{r:0,lbl:"0 — Max"},{r:1,lbl:"1"},{r:2,lbl:"2"},{r:3,lbl:"3 — Easy"}].map(({r,lbl})=>(
                      <button
                        key={r}
                        className={`srb${s.rir===r?" on":""}`}
                        style={s.rir===r?{background:`${rirColors[r]}22`,borderColor:rirColors[r],color:rirColors[r]}:{}}
                        onClick={()=>{
                          upd(i,"rir",r);
                          if(s.reps!=="") setTimeout(()=>logSetAndAdvance(i),80);
                        }}
                      >{lbl}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div className="rir-leg" style={{marginTop:8}}><strong style={{color:"rgba(255,255,255,.5)"}}>Tap a row</strong> to log · RIR 0 = max effort · 3 = easy</div>
      </div>

      <div className="sess-foot">
        {exIdx>0&&<button className="btn btn-g" onClick={()=>setExIdx(exIdx-1)}>← Back</button>}
        <button className="btn btn-p" onClick={nextEx}>
          {exIdx<exs.length-1?"Next Exercise →":"Finish Session ✓"}
        </button>
      </div>
    </>)}

    {screen==="done"&&(
      <div className="done">
        <div className="done-icon">🏆</div>
        <div className="done-title">Session Done!</div>
        <div className="done-sub">{SESSION_LABELS[aType]} day logged.<br/>Weights saved for next time.</div>
        <div className="done-stats">
          <div className="dstat"><div className="dstat-n">{exs.length}</div><div className="dstat-l">Exercises</div></div>
          <div className="dstat"><div className="dstat-n">{totalSets}</div><div className="dstat-l">Sets</div></div>
          <div className="dstat"><div className="dstat-n">{Math.round(totalVol)}</div><div className="dstat-l">Vol kg</div></div>
        </div>
        <button className="btn btn-p" style={{width:"100%",marginBottom:8}} onClick={()=>{setScreen("home");setTab("home")}}>Back to Home</button>
        <button className="btn btn-g" style={{width:"100%"}} onClick={()=>{setScreen("home");setTab("progress")}}>View Progress →</button>
      </div>
    )}

    </div>
  </>);
}
