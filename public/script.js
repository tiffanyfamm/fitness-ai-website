/* FitBuddy AI  Live agent script */
const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const statusEl = document.getElementById('status');

let convo = {
  stage: 'idle',
  minutes: null,
  muscle: null,
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
  const digits = text.match(/\d+/);
  if (digits) return parseInt(digits[0], 10);
  return null;
}

function generateWorkout(minutes, muscle, location) {
  const warmup = 3;
  const cooldown = 3;
  const main = Math.max(0, minutes - warmup - cooldown);
  const rounds = Math.max(1, Math.round(main / 6));
  const on = 40;
  const off = 20;

  const muscleNorm = (muscle || 'full body').toLowerCase();
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

  let plan = `Here's a ${minutes}-minute ${muscle} session${locationNote}:\n\n`;
  plan += `Warm-up: ${warmup} min (dynamic mobility)\n\n`;

  for (let r = 1; r <= rounds; r++) {
    plan += `Round ${r}: `;
    const moves = [];
    for (let i = 0; i < 5; i++) {
      moves.push(pool[(r + i - 1) % pool.length]);
    }
    plan += moves.join('  ');
    plan += `\nWork: ${on}s on / ${off}s off per exercise\n\n`;
  }

  plan += `Cooldown: ${cooldown} min (stretching)\n\n`;
  plan += `Notes: Adjust intensity by adding dumbbells if at the gym, or increase reps/time for a tougher session. Stay hydrated.`;

  return plan;
}

function isGreeting(text) {
  return /^(hi|hello|hey|hey there)/i.test(text.trim());
}

function simulatedReply(userText) {
  const t = userText.toLowerCase();
  if (/plan|workout|train|routine/.test(t)) {
    return "Tell me how long you have, which muscle group, and whether you're at the gym or at home  I'll build a plan.";
  }
  if (/diet|meal|nutrition|protein|calorie/.test(t)) {
    return "I can help with nutrition too, but let's focus on a workout right now. Tell me the time you have and target muscle.";
  }
  if (/cardio|fat|lose/.test(t)) {
    return "For fat loss I recommend a mix of intervals and resistance work. Tell me minutes and preferred muscle focus and I'll create a session.";
  }
  return "Got it! Say 'hi' to start a guided session, or tell me you want a workout and include time and location.";
}

appendMessage("Hey! I'm FitBuddy  Say 'hi' to start a quick guided session. I'll ask how many minutes, which muscle group, and gym or at home.", 'ai');

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

    if (convo.stage === 'idle') {
      if (isGreeting(text)) {
        convo.stage = 'await_minutes';
        removeNode(typing);
        appendMessage("Great  how many minutes do you have for this session?", 'ai');
        setStatus('');
        return;
      } else if (/workout|plan|train|routine|session/.test(text.toLowerCase())) {
        convo.stage = 'await_minutes';
        removeNode(typing);
        appendMessage("Sure  how many minutes do you have?", 'ai');
        setStatus('');
        return;
      } else {
        removeNode(typing);
        appendMessage(simulatedReply(text), 'ai');
        setStatus('');
        return;
      }
    }

    if (convo.stage === 'await_minutes') {
      const mins = parseMinutes(text);
      if (mins && mins >= 5) {
        convo.minutes = mins;
        convo.stage = 'await_muscle';
        removeNode(typing);
        appendMessage("Which muscle group would you like to focus on? (e.g., full body, legs, chest, back, arms, core)", 'ai');
        setStatus('');
        return;
      } else {
        removeNode(typing);
        appendMessage("I didn't catch a valid number of minutes (e.g., 30). How many minutes do you have?", 'ai');
        setStatus('');
        return;
      }
    }

    if (convo.stage === 'await_muscle') {
      convo.muscle = text;
      convo.stage = 'await_location';
      removeNode(typing);
      appendMessage("Will this be at the gym or at home?", 'ai');
      setStatus('');
      return;
    }

    if (convo.stage === 'await_location') {
      convo.location = text;
      const minutes = convo.minutes || 20;
      const muscle = convo.muscle || 'full body';
      const location = convo.location || 'home';
      const plan = generateWorkout(minutes, muscle, location);
      removeNode(typing);
      appendMessage(plan, 'ai');
      convo = { stage: 'idle', minutes: null, muscle: null, location: null };
      setStatus('');
      return;
    }

    removeNode(typing);
    appendMessage(simulatedReply(text), 'ai');
    setStatus('');
  } catch (err) {
    removeNode(typing);
    appendMessage("Sorry  something went wrong. Try again.", 'system');
    setStatus(err.message || String(err));
  }
});
