const workouts = ["LOWER BODY", "CORE", "UPPER BODY"];

function saveDate(){
  const date = document.getElementById("startDate").value;
  localStorage.setItem("trxStartDate", date);
  calculateDay();
}

function calculateDay(){
  const start = localStorage.getItem("trxStartDate");
  if(!start){
    document.getElementById("dayInfo").innerText = "Please set your start date.";
    return;
  }

  const startDate = new Date(start);
  const today = new Date();

  const diff = Math.floor((today - startDate) / (1000*60*60*24)) + 1;

  if(diff < 1){
    document.getElementById("dayInfo").innerText = "Before Day 1";
    return;
  }

  if(diff > 120){
    document.getElementById("dayInfo").innerText = "120-Day Plan Completed 🎉";
    return;
  }

  if(diff % 2 === 0){
    document.getElementById("dayInfo").innerText = "Day " + diff + " – Rest Day";
    document.getElementById("workoutInfo").innerText = "Walk 20 minutes + stretch.";
  } else {
    const index = Math.floor((diff - 1) / 2) % 3;
    document.getElementById("dayInfo").innerText = "Day " + diff + " – " + workouts[index];
    document.getElementById("workoutInfo").innerText = "Follow your printed workout sheet for today.";
  }
}

function markDone(){
  alert("Workout completed. Stay consistent!");
}

calculateDay();
