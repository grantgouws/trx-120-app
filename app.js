// TRX 120-Day App (Shows full workouts)
// Stores everything locally in your phone browser (localStorage)

const ROTATION = ["LOWER", "CORE", "UPPER"];  // workout types rotate every workout day
const TOTAL_DAYS = 120;

// Phase by day number
function phaseForDay(dayNum){
  if (dayNum <= 28) return 1;
  if (dayNum <= 56) return 2;
  if (dayNum <= 84) return 3;
  return 4;
}

// Workouts per phase
const WORKOUTS = {
  1: {
    LOWER: [
      { name:"TRX Supported Squat", sets:3, reps:"12" },
      { name:"TRX Reverse Lunge (assisted)", sets:3, reps:"8/leg" },
      { name:"TRX Glute Bridge", sets:3, reps:"12" },
      { name:"TRX Standing Hamstring Curl", sets:3, reps:"10" }
    ],
    CORE: [
      { name:"TRX Plank (knees bent if needed)", sets:3, reps:"20 sec" },
      { name:"TRX Dead Bug (feet in straps)", sets:3, reps:"8" },
      { name:"TRX Pallof Press (standing)", sets:3, reps:"10/side" },
      { name:"TRX Side Plank", sets:2, reps:"20 sec/side" }
    ],
    UPPER: [
      { name:"TRX Incline Row (high angle)", sets:3, reps:"10" },
      { name:"TRX Chest Press (high angle)", sets:3, reps:"10" },
      { name:"TRX Biceps Curl", sets:3, reps:"10" },
      { name:"TRX Triceps Press", sets:3, reps:"10" }
    ]
  },
  2: {
    LOWER: [
      { name:"TRX Squat (deeper lean)", sets:4, reps:"12" },
      { name:"TRX Bulgarian Split Squat", sets:3, reps:"8/leg" },
      { name:"TRX Hamstring Curl (straps)", sets:3, reps:"12" },
      { name:"TRX Hip Thrust (feet elevated)", sets:3, reps:"12" }
    ],
    CORE: [
      { name:"TRX Plank", sets:3, reps:"40 sec" },
      { name:"TRX Knee Tuck", sets:3, reps:"10" },
      { name:"TRX Side Plank Reach Through", sets:3, reps:"10/side" },
      { name:"TRX Body Saw (short range)", sets:3, reps:"10" }
    ],
    UPPER: [
      { name:"TRX Low Row", sets:4, reps:"10" },
      { name:"TRX Chest Press (mid angle)", sets:4, reps:"10" },
      { name:"TRX Y Raise", sets:3, reps:"12" },
      { name:"TRX Atomic Push-up (small range)", sets:3, reps:"6" }
    ]
  },
  3: {
    LOWER: [
      { name:"TRX Assisted Pistol Squat", sets:4, reps:"6/leg" },
      { name:"TRX Lunge to Knee Drive", sets:3, reps:"10/leg" },
      { name:"TRX Single-Leg Ham Curl (alternating)", sets:3, reps:"8/leg" },
      { name:"TRX Squat to Calf Raise", sets:3, reps:"12" }
    ],
    CORE: [
      { name:"TRX Pike", sets:4, reps:"8" },
      { name:"TRX Plank Shoulder Taps", sets:3, reps:"20 taps" },
      { name:"TRX Oblique Knee Tuck", sets:3, reps:"10/side" },
      { name:"TRX Body Saw", sets:3, reps:"12" }
    ],
    UPPER: [
      { name:"TRX Archer Row", sets:4, reps:"8/side" },
      { name:"TRX Chest Press (lower angle)", sets:4, reps:"8" },
      { name:"TRX Face Pull", sets:3, reps:"12" },
      { name:"TRX Triceps Extension", sets:3, reps:"10" }
    ]
  },
  4: {
    LOWER: [
      { name:"TRX Pistol Squat (assisted if needed)", sets:4, reps:"8/leg" },
      { name:"TRX Hamstring Curl", sets:4, reps:"12" },
      { name:"TRX Lateral Lunge", sets:3, reps:"10/side" }
    ],
    CORE: [
      { name:"TRX Pike", sets:4, reps:"10" },
      { name:"TRX Plank to Push-up", sets:3, reps:"10" },
      { name:"TRX Mountain Climbers", sets:3, reps:"30/side" }
    ],
    UPPER: [
      { name:"TRX Low Row (feet elevated optional)", sets:4, reps:"8" },
      { name:"TRX Chest Press (low angle)", sets:4, reps:"8" },
      { name:"TRX Y–T–I Raise (each)", sets:3, reps:"8" },
      { name:"TRX Atomic Push-up", sets:3, reps:"10" }
    ]
  }
};

// Utilities
function $(id){ return document.getElementById(id); }
function fmtDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function daysBetween(a, b){
  const ms = 24*60*60*1000;
  const aa = new Date(a); aa.setHours(12,0,0,0);
  const bb = new Date(b); bb.setHours(12,0,0,0);
  return Math.round((bb - aa) / ms);
}
function isWorkoutDay(dayNum){ return dayNum >= 1 && dayNum <= TOTAL_DAYS && (dayNum % 2 === 1); }
function workoutIndex(dayNum){ return (dayNum + 1) / 2; } // 1..60
function workoutTypeFromIndex(idx){ return ROTATION[(idx - 1) % ROTATION.length]; }

function saveDate(){
  const date = $("startDate").value;
  if(!date){ alert("Please select a start date."); return; }
  localStorage.setItem("trxStartDate", date);
  render();
}

function goToday(){
  localStorage.setItem("trxViewDate", fmtDate(new Date()));
  render();
}

function markDone(){
  const key = currentSessionKey();
  if(!key) return;
  const done = JSON.parse(localStorage.getItem("trxDone") || "{}");
  done[key] = true;
  localStorage.setItem("trxDone", JSON.stringify(done));
  render();
}

function resetDone(){
  const key = currentSessionKey();
  if(!key) return;
  const done = JSON.parse(localStorage.getItem("trxDone") || "{}");
  delete done[key];
  localStorage.setItem("trxDone", JSON.stringify(done));
  render();
}

function currentSessionKey(){
  const start = localStorage.getItem("trxStartDate");
  if(!start) return null;
  const view = localStorage.getItem("trxViewDate") || fmtDate(new Date());
  const dayNum = daysBetween(new Date(start), new Date(view)) + 1;
  if(dayNum < 1 || dayNum > TOTAL_DAYS) return null;
  return "day" + dayNum;
}

function render(){
  // Register service worker for offline (safe to call many times)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  }

  // Set default view date (today)
  if(!localStorage.getItem("trxViewDate")){
    localStorage.setItem("trxViewDate", fmtDate(new Date()));
  }

  const start = localStorage.getItem("trxStartDate");
  if(start) $("startDate").value = start;

  if(!start){
    $("dayInfo").innerText = "Please set your start date (Day 1).";
    $("phaseInfo").innerText = "";
    $("workoutInfo").innerHTML = "";
    $("doneInfo").innerText = "";
    return;
  }

  const startDate = new Date(start);
  const view = new Date(localStorage.getItem("trxViewDate"));
  const dayNum = daysBetween(startDate, view) + 1;

  if(dayNum < 1){
    $("dayInfo").innerText = "This date is before Day 1.";
    $("phaseInfo").innerText = "";
    $("workoutInfo").innerHTML = "";
    $("doneInfo").innerText = "";
    return;
  }

  if(dayNum > TOTAL_DAYS){
    $("dayInfo").innerText = "120-Day Plan Completed 🎉";
    $("phaseInfo").innerText = "";
    $("workoutInfo").innerHTML = "";
    $("doneInfo").innerText = "";
    return;
  }

  const phase = phaseForDay(dayNum);
  $("phaseInfo").innerText = `Phase ${phase} • Day ${dayNum} of ${TOTAL_DAYS}`;

  const done = JSON.parse(localStorage.getItem("trxDone") || "{}");
  const sessionKey = "day" + dayNum;
  const isDone = !!done[sessionKey];
  $("doneInfo").innerText = isDone ? "Saved: Workout marked as DONE ✅" : "Not marked done yet.";

  // Rest day
  if(!isWorkoutDay(dayNum)){
    $("dayInfo").innerHTML = `Day ${dayNum} – <span class="badge">Rest Day</span>`;
    $("workoutInfo").innerHTML = `
      <div class="muted">Suggested:</div>
      <div class="exercise">
        <div class="exName">20–30 min walk</div>
        <div class="meta">Easy pace</div>
      </div>
      <div class="exercise">
        <div class="exName">5–10 min mobility</div>
        <div class="meta">Hips, hamstrings, chest</div>
      </div>
    `;
    return;
  }

  // Workout day
  const idx = workoutIndex(dayNum);
  const type = workoutTypeFromIndex(idx);
  $("dayInfo").innerHTML = `Day ${dayNum} – <span class="workoutType">${type}</span> (Workout #${idx})`;

  const plan = WORKOUTS[phase][type];

  let html = `
    <div class="muted">Guidelines: controlled reps • stop with 2–3 reps left • rest 60–90s</div>
  `;

  plan.forEach(ex => {
    html += `
      <div class="exercise">
        <div class="exName">${ex.name}</div>
        <div class="meta">${ex.sets} sets × ${ex.reps}</div>
      </div>
    `;
  });

  $("workoutInfo").innerHTML = html;
}

render();
