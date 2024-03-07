let tasks = []

// Plays a button click sound
function playButton() {
    const audio = new Audio(chrome.runtime.getURL('audio/button-sound.mp3'));
    audio.play();
}

// Plays a specific "Tuturu" sound
function playTuturu() {
    const audio = new Audio(chrome.runtime.getURL('audio/tuturu.mp3'));
    audio.play();
}

// Updates the timer display and controls button text based on timer state
function updateTime() {
    chrome.storage.local.get(["timer", "timeOption", "isRunning", "audioPlayed"], (res) => {
        const time = document.getElementById("time");
        const minutes = `${res.timeOption - Math.ceil(res.timer / 60)}`.padStart(2, "0");
        let seconds = "00";
        if (res.timer % 60 != 0) {
            seconds = `${60 - res.timer % 60}`.padStart(2, "0");
        }
        time.textContent = `${minutes}:${seconds}`;

        const startTimerBtn = document.getElementById("start-timer-btn");
        startTimerBtn.textContent = res.isRunning ? "Pause Timer" : "Start Timer";

        if (res.timer == 0 && !res.isRunning && !res.audioPlayed) {
            playTuturu();
            chrome.storage.local.set({audioPlayed: true}, () => {});
        }
    });
}

// Call updateTime initially and then every second
updateTime();
setInterval(updateTime, 1000);

// Adds click event listeners to buttons with sound effect logic
function addButtonListeners() {
    const startTimerBtn = document.getElementById("start-timer-btn");
    startTimerBtn.addEventListener("click", () => {
        playButton(); // Play button sound on click
        chrome.storage.local.get(["isRunning", "audioPlayed"], (res) => {
            chrome.storage.local.set({
                isRunning: !res.isRunning,
                audioPlayed: false,
            }, () => {
                startTimerBtn.textContent = !res.isRunning ? "Pause Timer" : "Start Timer";
            });
        });
    });

    const resetTimerBtn = document.getElementById("reset-timer-btn");
    resetTimerBtn.addEventListener("click", () => {
        chrome.storage.local.set({
            timer: 0,
            isRunning: false,
            audioPlayed: true // Ensure the end-of-timer sound does not play right after resetting
        }, () => {
            startTimerBtn.textContent = "Start Timer";
        });
    });

    const addTaskBtn = document.getElementById("add-task-btn");
    addTaskBtn.addEventListener("click", () => {
        playButton(); // Play button sound on click
        addTask();
    });
}

addButtonListeners(); // Initialize button listeners

// Loads tasks from storage and renders them
chrome.storage.sync.get(["tasks"], (res) => {
    tasks = res.tasks ? res.tasks : [];
    renderTasks();
});

// Adds a new task
function addTask() {
    tasks.push("");
    saveTasks();
    renderTasks();
}

// Deletes a task and updates the display
function deleteTask(taskNum) {
    tasks.splice(taskNum, 1);
    saveTasks();
    renderTasks();
}

// Saves tasks to storage
function saveTasks() {
    chrome.storage.sync.set({ tasks });
}

// Renders all tasks
function renderTasks() {
    const taskContainer = document.getElementById("task-container");
    taskContainer.innerHTML = ''; // Clear existing tasks
    tasks.forEach((task, index) => {
        renderTask(task, index);
    });
}

// Renders a single task
function renderTask(task, index) {
    const taskContainer = document.getElementById("task-container");

    const taskRow = document.createElement("div");
    const text = document.createElement("input");
    text.type = "text";
    text.placeholder = "Enter a task...";
    text.value = task;
    text.className = "task-input";
    text.addEventListener("change", () => {
        tasks[index] = text.value;
        saveTasks();
    });

    const deleteBtn = document.createElement("input");
    deleteBtn.type = "button";
    deleteBtn.value = "X";
    deleteBtn.className = "task-delete";
    deleteBtn.addEventListener("click", () => {
        playButton(); // Play button sound on click
        deleteTask(index);
    });

    taskRow.appendChild(text);
    taskRow.appendChild(deleteBtn);
    taskContainer.appendChild(taskRow);
}
