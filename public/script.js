/* FitBuddy AI  Live agent script */
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
  
  const minsMatch = lowerText.match(/(\d+)\s*(min|mins|minutes)?/);
  if (minsMatch) result.minutes = parseInt(minsMatch[1], 10);
  
  if (/beginner/i.test(text)) result.difficulty = 'beginner';
  else if (/advanced/i.test(text)) result.difficulty = 'advanced';
  else if (/intermediate/i.test(text)) result.difficulty = 'intermediate';
  
  if (/gym/i.test(text)) result.location = 'gym';
  else if (/home/i.test(text)) result.location = 'home';
  
  if (/legs/i.test(text)) result.muscle = 'legs';
  else if (/chest/i.test(text)) result.muscle = 'chest';
  else if (/back/i.test(text)) result.muscle = 'back';
  else if (/arms/i.test(text)) result.muscle = 'arms';
  else if (/core/i.test(text)) result.muscle = 'core';
  else if (/full.?body|fullbody/i.test(text)) result.muscle = 'full body';
  
  return result;
}

const exerciseVideos = {
  'squats': 'https://www.youtube.com/watch?v=xqvCmoLULNY',
  'reverse lunges': 'https://www.youtube.com/watch?v=FfYEGpKOfWs',
  'glute bridges': 'https://www.youtube.com/watch?v=wPM8icPvOYU',
  'jump squats': 'https://www.youtube.com/watch?v=gMNr84IkrAN',
  'calf raises': 'https://www.youtube.com/watch?v=QcaP8MlxJ_0',
  'push-ups': 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  'incline push-ups': 'https://www.youtube.com/watch?v=aYXwCgdeB9E',
  'chest press': 'https://www.youtube.com/watch?v=VmB1G1XG240',
  'chest fly': 'https://www.youtube.com/watch?v=ve2yJ-QNsKc',
  'diamond push-ups': 'https://www.youtube.com/watch?v=C7EpU5lBnHI',
  'bent-over rows': 'https://www.youtube.com/watch?v=N6RdyUUoHHY',
  'supermans': 'https://www.youtube.com/watch?v=--IqtxJFapE',
  'reverse flys': 'https://www.youtube.com/watch?v=PYVq55v0Jk4',
  'single-arm rows': 'https://www.youtube.com/watch?v=WDUK1YWVN8A',
  'deadlifts': 'https://www.youtube.com/watch?v=r4MzxtBKyNE',
  'bicep curls': 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  'tricep dips': 'https://www.youtube.com/watch?v=6VOD-VroIcs',
  'hammer curls': 'https://www.youtube.com/watch?v=zC3nLlEvin4',
  'overhead tricep extension': 'https://www.youtube.com/watch?v=3OwXGloFHvI',
  'tricep pushdowns': 'https://www.youtube.com/watch?v=2-LAMRpjEiE',
  'plank': 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  'russian twists': 'https://www.youtube.com/watch?v=1m8oPwMLXkc',
  'leg raises': 'https://www.youtube.com/watch?v=R7SmNcWpj1M',
  'bicycle crunches': 'https://www.youtube.com/watch?v=9FGz7KwaQSY',
  'mountain climbers': 'https://www.youtube.com/watch?v=kmL1-N_IPKI',
  'jumping jacks': 'https://www.youtube.com/watch?v=c4DL0Gpcyn8'
};

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
    'chest': ['Push-ups', 'Incline push-ups', 'Chest press', 'Chest fly', 'Diamond push-ups'],
    'back': ['Bent-over rows', 'Supermans', 'Reverse flys', 'Single-arm rows', 'Deadlifts'],
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
    plan += `Round ${r}:\n`;
    const moves = [];
    for (let i = 0; i < 5; i++) {
      moves.push(pool[(r + i - 1) % pool.length]);
    }
    
    for (let move of moves) {
      const videoKey = move.toLowerCase();
      const videoUrl = exerciseVideos[videoKey];
      plan += ` ${move}`;
      if (videoUrl) {
        plan += ` - ${videoUrl}`;
      }
      plan += `\n`;
    }
    plan += `Work: ${on}s on / ${off}s off per exercise\n\n`;
  }

  plan += `Cooldown: ${cooldown} min (stretching)\n\n`;
  plan += `${diffNote} Stay hydrated!`;

  return plan;
}

function isGreeting(text) {
  return /^(hi|hello|hey|hey there)/i.test(text.trim());
}

appendMessage("Hello! I'm FitBuddy AI, your fitness coach. To get started, I need a few details from you:\nHow many minutes do you want your workout to be?\nWhat is your target muscle group?\nWhat is your difficulty level (beginner, intermediate, or advanced)?\nAre you at the gym or at home?", 'ai');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  appendMessage(text, 'user');

  const typing = appendTyping();
  setStatus('Thinking');

  try {
    await new Promise(r => setTimeout(r, 400));

    const parsed = parseAllInputs(text);

    if (convo.stage === 'idle' && isGreeting(text)) {
      convo.stage = 'await_minutes';
      removeNode(typing);
      appendMessage("Great  how many minutes do you have for this session?", 'ai');
      setStatus('');
      return;
    }

    if (convo.stage === 'idle' && !isGreeting(text)) {
      convo.minutes = parsed.minutes || convo.minutes;
      convo.muscle = parsed.muscle || convo.muscle;
      convo.difficulty = parsed.difficulty || convo.difficulty;
      convo.location = parsed.location || convo.location;

      if (convo.minutes && convo.muscle && convo.difficulty && convo.location) {
        removeNode(typing);
        const plan = generateWorkout(convo.minutes, convo.muscle, convo.difficulty, convo.location);
        appendMessage(plan, 'ai');
        convo = { stage: 'idle', minutes: null, muscle: null, difficulty: null, location: null };
        setStatus('');
        return;
      }

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

    if (parsed.minutes) convo.minutes = parsed.minutes;
    if (parsed.muscle) convo.muscle = parsed.muscle;
    if (parsed.difficulty) convo.difficulty = parsed.difficulty;
    if (parsed.location) convo.location = parsed.location;

    if (convo.minutes && convo.muscle && convo.difficulty && convo.location) {
      removeNode(typing);
      const plan = generateWorkout(convo.minutes, convo.muscle, convo.difficulty, convo.location);
      appendMessage(plan, 'ai');
      convo = { stage: 'idle', minutes: null, muscle: null, difficulty: null, location: null };
      setStatus('');
      return;
    }

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
    appendMessage("Sorry  something went wrong. Try again.", 'system');
    setStatus(err.message || String(err));
  }
});
