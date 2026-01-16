/* FitBuddy AI — Live agent script */
const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const statusEl = document.getElementById('status');

let convo = {
  stage: 'idle',
  minutes: null,
  muscle: null,
  difficulty: null,
  location: null
};

function appendMessage(text, role = 'ai') {
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendTyping() {
  const wrapper = document.createElement('div');
  wrapper.className = 'msg ai';
  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  wrapper.appendChild(typing);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrapper;
}

function removeNode(node) { if (node && node.parentNode) node.parentNode.removeChild(node); }
function setStatus(text) { statusEl.textContent = text || ''; }

function parseMinutes(text) {
  const m = text.match(/(\d+)\s*(min|mins|minutes)?/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

function parseAllInputs(text) {
  const result = { minutes: null, muscle: null, difficulty: null, location: null };
  const lowerText = text.toLowerCase();
  
  // Extract minutes
  const minsMatch = lowerText.match(/(\d+)\s*(min|mins|minutes)?/);
  if (minsMatch) result.minutes = parseInt(minsMatch[1], 10);
  
  // Extract difficulty
  if (/beginner/i.test(text)) result.difficulty = 'beginner';
  else if (/advanced/i.test(text)) result.difficulty = 'advanced';
  else if (/intermediate/i.test(text)) result.difficulty = 'intermediate';
  
  // Extract location
  if (/gym/i.test(text)) result.location = 'gym';
  else if (/home/i.test(text)) result.location = 'home';
  
  // Extract muscle group
  if (/legs/i.test(text)) result.muscle = 'legs';
  else if (/chest/i.test(text)) result.muscle = 'chest';
  else if (/back/i.test(text)) result.muscle = 'back';
  else if (/arms/i.test(text)) result.muscle = 'arms';
  else if (/core/i.test(text)) result.muscle = 'core';
  else if (/full.?body|fullbody/i.test(text)) result.muscle = 'full body';
  
  return result;
}

function generateWorkout(minutes, muscle, difficulty, location) {
  const warmup = 3;
  const cooldown = 3;
  const main = Math.max(0, minutes - warmup - cooldown);
  const rounds = Math.max(1, Math.round(main / 6));
  const on = 40;
  const off = 20;

  const muscleNorm = (muscle || 'full body').toLowerCase();
  const diffNorm = (difficulty || 'intermediate').toLowerCase();
  const locationNorm = (location || 'home').toLowerCase();

  const exercises = {
    'legs': ['Squats', 'Reverse lunges', 'Glute bridges', 'Jump squats', 'Calf raises'],
    'chest': ['Push-ups', 'Incline push-ups', 'Chest press (dumbbells)', 'Chest fly (dumbbells)', 'Diamond push-ups'],
    'back': ['Bent-over rows', 'Supermans', 'Reverse flys', 'Single-arm rows', 'Deadlifts (if gym)'],
    'arms': ['Bicep curls', 'Tricep dips', 'Hammer curls', 'Overhead tricep extension', 'Tricep pushdowns'],
    'core': ['Plank', 'Russian twists', 'Leg raises', 'Bicycle crunches', 'Mountain climbers'],
    'full body': ['Jumping jacks', 'Push-ups', 'Squats', 'Mountain climbers', 'Plank']
  };

  let pool = exercises['full body'];
  if (muscleNorm.includes('leg')) pool = exercises['legs'];
  else if (muscleNorm.includes('chest')) pool = exercises['chest'];
  else if (muscleNorm.includes('back')) pool = exercises['back'];
  else if (muscleNorm.includes('arm')) pool = exercises['arms'];
  else if (muscleNorm.includes('core')) pool = exercises['core'];

  const locationNote = locationNorm.includes('gym') ? ' (gym-friendly: include weights where possible)' : ' (bodyweight-friendly)';
  const diffNote = diffNorm.includes('advanced') ? ' Advanced level: push for heavier weights or more reps.' : diffNorm.includes('beginner') ? ' Beginner level: focus on form and control.' : ' Intermediate level: balanced challenge.';

  let plan = `You've set your workout for ${minutes} minutes, focusing on ${muscle} strength at an ${difficulty} level, at the ${location}. Here is your workout routine:\n\n`;
  plan += `Warm-up: ${warmup} min (dynamic mobility)\n\n`;

  for (let r = 1; r <= rounds; r++) {
    plan += `Round ${r}: `;
    const moves = [];
    for (let i = 0; i < 5; i++) {
      moves.push(pool[(r + i - 1) % pool.length]);
    }
    plan += moves.join(' — ');
    plan += `\nWork: ${on}s on / ${off}s off per exercise\n\n`;
  }

  plan += `Cooldown: ${cooldown} min (stretching)\n\n`;
  plan += `${diffNote} Stay hydrated!`;

  return plan;
}

function isGreeting(text) {
  return /^(hi|hello|hey|hey there)/i.test(text.trim());
}

function getMissingField(parsed, currentMin, currentMuscle, currentDiff, currentLoc) {
  if (!currentMin && !parsed.minutes) return 'minutes';
  if (!currentMuscle && !parsed.muscle) return 'muscle';
  if (!currentDiff && !parsed.difficulty) return 'difficulty';
  if (!currentLoc && !parsed.location) return 'location';
  return null;
}

appendMessage("Hello! I'm FitBuddy AI, your fitness coach. To get started, I need a few details from you:\nHow many minutes do you want your workout to be?\nWhat is your target muscle group?\nWhat is your difficulty level (beginner, intermediate, or advanced)?\nAre you at the gym or at home?", 'ai');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  appendMessage(text, 'user');

  const typing = appendTyping();
  setStatus('Thinking…');

  try {
    await new Promise(r => setTimeout(r, 400));

    const parsed = parseAllInputs(text);

    // If user said hi, start asking
    if (convo.stage === 'idle' && isGreeting(text)) {
      convo.stage = 'await_minutes';
      removeNode(typing);
      appendMessage("Great — how many minutes do you have for this session?", 'ai');
      setStatus('');
      return;
    }

    // If idle and user provides some info, smart fill and ask for missing
    if (convo.stage === 'idle' && !isGreeting(text)) {
      convo.minutes = parsed.minutes || convo.minutes;
      convo.muscle = parsed.muscle || convo.muscle;
      convo.difficulty = parsed.difficulty || convo.difficulty;
      convo.location = parsed.location || convo.location;

      // If all 4 are now filled, generate workout
      if (convo.minutes && convo.muscle && convo.difficulty && convo.location) {
        removeNode(typing);
        const plan = generateWorkout(convo.minutes, convo.muscle, convo.difficulty, convo.location);
        appendMessage(plan, 'ai');
        convo = { stage: 'idle', minutes: null, muscle: null, difficulty: null, location: null };
        setStatus('');
        return;
      }

      // Otherwise ask for the first missing field
      removeNode(typing);
      if (!convo.minutes) {
        convo.stage = 'await_minutes';
        appendMessage("How many minutes do you have for this session?", 'ai');
      } else if (!convo.muscle) {
        convo.stage = 'await_muscle';
        appendMessage("Which muscle group would you like to focus on? (e.g., full body, legs, chest, back, arms, core)", 'ai');
      } else if (!convo.difficulty) {
        convo.stage = 'await_difficulty';
        appendMessage("What is your difficulty level (beginner, intermediate, or advanced)?", 'ai');
      } else if (!convo.location) {
        convo.stage = 'await_location';
        appendMessage("Will this be at the gym or at home?", 'ai');
      }
      setStatus('');
      return;
    }

    // Fill in parsed data
    if (parsed.minutes) convo.minutes = parsed.minutes;
    if (parsed.muscle) convo.muscle = parsed.muscle;
    if (parsed.difficulty) convo.difficulty = parsed.difficulty;
    if (parsed.location) convo.location = parsed.location;

    // Check if all 4 fields are now complete
    if (convo.minutes && convo.muscle && convo.difficulty && convo.location) {
      removeNode(typing);
      const plan = generateWorkout(convo.minutes, convo.muscle, convo.difficulty, convo.location);
      appendMessage(plan, 'ai');
      convo = { stage: 'idle', minutes: null, muscle: null, difficulty: null, location: null };
      setStatus('');
      return;
    }

    // Otherwise move to next missing field
    removeNode(typing);
    if (!convo.minutes) {
      convo.stage = 'await_minutes';
      appendMessage("How many minutes do you have for this session?", 'ai');
    } else if (!convo.muscle) {
      convo.stage = 'await_muscle';
      appendMessage("Which muscle group would you like to focus on? (e.g., full body, legs, chest, back, arms, core)", 'ai');
    } else if (!convo.difficulty) {
      convo.stage = 'await_difficulty';
      appendMessage("What is your difficulty level (beginner, intermediate, or advanced)?", 'ai');
    } else if (!convo.location) {
      convo.stage = 'await_location';
      appendMessage("Will this be at the gym or at home?", 'ai');
    }
    setStatus('');

  } catch (err) {
    removeNode(typing);
    appendMessage("Sorry — something went wrong. Try again.", 'system');
    setStatus(err.message || String(err));
  }
});
