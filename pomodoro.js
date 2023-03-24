const timer = document.querySelector('.main__card__timer'),
  logo = document.querySelector('.logo'),
  startButton = document.getElementById('start'),
  stopButton = document.getElementById('stop'),
  resetButton = document.getElementById('reset'),
  pomodoroButton = document.getElementById('pomodoro'),
  shortBreakButton = document.getElementById('short-break'),
  longBreakButton = document.getElementById('long-break'),
  today = document.querySelector('.main__date'),
  wordsOfEncouragement = document.querySelector('.main__card__encourage p'),
  title = document.querySelector('title'),
  intervalCounter = document.querySelector('.main__card__intervals');

let currentTime;
let tab;
let intervalCount = 0;

pomodoroButton.disabled = true;

let time;
let timerId;
let theme;

//get todays date
let date = new Date();
let month = date.toLocaleString('default', {
  month: 'long',
});
let day = date.toLocaleString('default', {
  day: 'numeric',
});
let year = date.toLocaleString('default', {
  year: 'numeric',
});
//

function getOrdinal(n) {
  //gets ordinal of current day
  let ord = 'th';
  if (n % 10 == 1 && n % 100 != 11) {
    ord = 'st';
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = 'nd';
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = 'rd';
  }
  return `${n}${ord}`;
}

let dayWithOrd = getOrdinal(day);

const fullDay = `${month} ${dayWithOrd}, ${year}`;

//set date
today.textContent = fullDay;

// pomodoro timer
function startTimer() {
  if (time > 0) {
    updateTimer();
    wordsOfEncouragement.textContent = 'You got this!';

    timerId = setInterval(() => {
      time--;
      updateTimer();
      if (time === 0) {
        clearInterval(timerId);
        alert('Time is up!');
        console.log(timerId);
        switchTab();

        intervalCount++;

        updateIntervalCount();
      }
    }, 1000);
    startButton.disabled = true;
    stopButton.disabled = false;

    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
    resetButton.classList.remove('hidden');
  }
}

function stopTimer() {
  // console.log(time);
  clearInterval(timerId);
  startButton.disabled = false;
  stopButton.disabled = true;
  startButton.classList.remove('hidden');
  stopButton.classList.add('hidden');
}

function updateTimer() {
  const timeRemaining = calculateTime();
  timer.innerHTML = timeRemaining;
  currentTime = timeRemaining;
  updateTimerOnStorage(tab, time);
  updateTitle();
}

function updateTimerOnStorage(tab, time) {
  itemsInStorage = JSON.parse(localStorage.getItem('times'));
  itemsInStorage.forEach((item) => {
    if (item.state === tab) {
      item.time = time;
    }
  });
  const updatedObjString = JSON.stringify(itemsInStorage);
  // Store the updated string in local storage
  localStorage.setItem('times', updatedObjString);
}

function setUpStorageTimes() {
  if (localStorage.getItem('times') === null) {
    itemsInStorage = [
      { state: 'pomodoro', time: 1500 }, // 25 minutes in seconds
      { state: 'short-break', time: 300 }, // 5 minutes in seconds
      { state: 'long-break', time: 1200 }, // 20 minutes in seconds
    ];
  } else {
    itemsInStorage = JSON.parse(localStorage.getItem('times'));
  }

  localStorage.setItem('times', JSON.stringify(itemsInStorage));
}

function getTimeFromStorage(tab) {
  let itemsInStorage = JSON.parse(localStorage.getItem('times'));

  let countdown = '';

  itemsInStorage.forEach((time) => {
    if (time.state === tab) {
      countdown = time.time;
    }
  });
  return countdown;
}

function updateIntervalCount() {
  intervalCounter.textContent = `${intervalCount} / 4`;
  updateTitle();
}

function updateTitle() {
  const timeRemaining = calculateTime();
  const countDownNumbers = `${timeRemaining} - ${intervalCount} / 4`;

  if (time < 1500) {
    if (tab === 'pomodoro') {
      title.textContent = `${countDownNumbers} - Time to focus!`;
    } else if (tab === 'short-break') {
      title.textContent = `${countDownNumbers} - Take a break!`;
    } else {
      title.textContent = `${countDownNumbers} - Time a long break!`;
    }
  } else {
    title.textContent = 'PomoTodo - Be Productive Today!';
  }
}

function calculateTime() {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  const timeRemaining = `${minutes}:${seconds}`;
  return timeRemaining;
}

function resetTimer() {
  if (time === 0) {
    localStorage.clear();
    switchTab();
  } else {
    const confirmReset = confirm('Are you sure you want to reset the timer?');

    if (confirmReset) {
      localStorage.clear();
      switchTab();
    }
  }

  if (intervalCount === 4) {
    intervalCount = 0;
    updateIntervalCount();
  }
}

function generateEncouragement(theme) {
  if (theme === 'pomodoro') {
    wordsOfEncouragement.textContent = 'Time to Focus!';
  }
  if (theme === 'short-break') {
    wordsOfEncouragement.textContent = 'Great Job! Take a short break!';
  }
  if (theme === 'long-break') {
    wordsOfEncouragement.textContent =
      "You've been working hard! You earned this longer break!";
  }
}

function switchTab() {
  updateIntervalCount();

  setUpStorageTimes();
  if (!tab) {
    tab = 'pomodoro';
  }
  stopTimer();

  switch (tab) {
    case 'pomodoro':
      time = getTimeFromStorage(tab);
      theme = 'pomodoro';
      if (time < 1500) {
        resetButton.classList.remove('hidden');
      }

      longBreakButton.classList.remove('main__card__btn--active');
      shortBreakButton.classList.remove('main__card__btn--active');
      pomodoroButton.classList.add('main__card__btn--active');
      generateEncouragement(theme);
      break;
    case 'short-break':
      time = getTimeFromStorage(tab);
      theme = 'short-break';
      // intervalCounter.classList.add('hidden');

      longBreakButton.classList.remove('main__card__btn--active');
      pomodoroButton.classList.remove('main__card__btn--active');
      shortBreakButton.classList.add('main__card__btn--active');
      generateEncouragement(theme);
      break;
    case 'long-break':
      time = getTimeFromStorage(tab);
      theme = 'long-break';
      // intervalCounter.classList.add('hidden');

      shortBreakButton.classList.remove('main__card__btn--active');
      pomodoroButton.classList.remove('main__card__btn--active');
      longBreakButton.classList.add('main__card__btn--active');
      generateEncouragement(theme);
      break;
  }
  updateTimer();
  document.body.setAttribute('data-theme', theme);
}

pomodoroButton.addEventListener('click', () => {
  tab = 'pomodoro';
  pomodoroButton.disabled = true;
  shortBreakButton.disabled = false;
  longBreakButton.disabled = false;
  switchTab();
});

shortBreakButton.addEventListener('click', () => {
  tab = 'short-break';
  pomodoroButton.disabled = false;
  shortBreakButton.disabled = true;
  longBreakButton.disabled = false;

  switchTab();
});

longBreakButton.addEventListener('click', () => {
  tab = 'long-break';
  pomodoroButton.disabled = false;
  shortBreakButton.disabled = false;
  longBreakButton.disabled = true;

  switchTab();
});

startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', resetTimer);
logo.addEventListener('click', () => {
  tab = 'pomodoro';
  resetTimer();
});

switchTab(); // Start with Pomodoro tab
