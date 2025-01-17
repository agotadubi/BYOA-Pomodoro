class PomodoroTimer {
    constructor() {
        // Default times in minutes
        this.defaultWorkTime = 25;
        this.defaultBreakTime = 5;
        
        this.workTime = this.defaultWorkTime * 60;
        this.breakTime = this.defaultBreakTime * 60;
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isWorkMode = true;
        this.timer = null;
        this.isEmpireTheme = true;

        // DOM elements
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startPauseButton = document.getElementById('start-pause');
        this.resetButton = document.getElementById('reset');
        this.workButton = document.getElementById('work');
        this.breakButton = document.getElementById('break');
        this.empireThemeButton = document.getElementById('empire-theme');
        this.rebelThemeButton = document.getElementById('rebel-theme');

        // Replace the time settings HTML with simpler version
        this.timeSettingsHTML = `
            <div class="time-settings">
                <input type="number" id="work-time" min="1" max="60" value="${this.defaultWorkTime}">
                <span class="separator">/</span>
                <input type="number" id="break-time" min="1" max="60" value="${this.defaultBreakTime}">
            </div>
        `;
        
        // Add to body instead of inside container
        document.body.insertAdjacentHTML('beforeend', this.timeSettingsHTML);
        
        // Add event listeners for automatic saving
        document.getElementById('work-time').addEventListener('input', () => this.saveNewTimes());
        document.getElementById('break-time').addEventListener('input', () => this.saveNewTimes());

        // Sound effects - update paths to local files
        this.sounds = {
            empire: {
                start: 'sounds/empire-start.mp3',
                complete: 'sounds/empire-complete.mp3'
            },
            rebel: {
                start: 'sounds/rebel-start.mp3',
                complete: 'sounds/rebel-complete.mp3'
            }
        };

        // Pre-load sounds
        this.audioElements = {
            empire: {
                start: new Audio(this.sounds.empire.start),
                complete: new Audio(this.sounds.empire.complete)
            },
            rebel: {
                start: new Audio(this.sounds.rebel.start),
                complete: new Audio(this.sounds.rebel.complete)
            }
        };

        // Event listeners
        this.startPauseButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.reset());
        this.workButton.addEventListener('click', () => this.setWorkMode());
        this.breakButton.addEventListener('click', () => this.setBreakMode());
        this.empireThemeButton.addEventListener('click', () => this.setTheme('empire'));
        this.rebelThemeButton.addEventListener('click', () => this.setTheme('rebel'));
        document.getElementById('test-sound').addEventListener('click', () => this.playSound('start'));

        this.updateDisplay();

        // Add space bar control
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat && 
                // Prevent triggering when typing in time settings
                document.activeElement !== document.getElementById('work-time') &&
                document.activeElement !== document.getElementById('break-time')) {
                e.preventDefault(); // Prevent page scrolling
                this.toggleTimer();
            }
        });

        this.timerTitle = document.querySelector('h1');
    }

    setTheme(theme) {
        this.isEmpireTheme = theme === 'empire';
        document.body.classList.toggle('rebel-theme', !this.isEmpireTheme);
        this.empireThemeButton.classList.toggle('active', this.isEmpireTheme);
        this.rebelThemeButton.classList.toggle('active', !this.isEmpireTheme);
        
        // Update title based on theme
        const icon = this.isEmpireTheme ? 
            '<i class="fab fa-galactic-empire"></i> Imperial Timer' : 
            '<i class="fab fa-rebel"></i> Rebel Timer';
        this.timerTitle.innerHTML = icon;
    }

    playSound(type) {
        try {
            const theme = this.isEmpireTheme ? 'empire' : 'rebel';
            const audio = this.audioElements[theme][type];
            audio.currentTime = 0; // Reset audio to start
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio playback failed:", error);
                });
            }
        } catch (error) {
            console.log("Error playing sound:", error);
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
            this.startPauseButton.textContent = 'Resume Mission';
            this.startPauseButton.classList.add('paused');
        } else {
            this.start();
            this.startPauseButton.textContent = 'Abort';
            this.startPauseButton.classList.remove('paused');
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.playSound('start');
            this.timer = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();

                if (this.currentTime === 0) {
                    this.playSound('complete');
                    this.pause();
                    
                    // Auto-switch to rest mode if we're in work mode
                    if (this.isWorkMode) {
                        this.setBreakMode();
                        this.start();  // Automatically start the rest timer
                    } else {
                        this.setWorkMode();  // Switch back to work mode but don't auto-start
                        this.startPauseButton.textContent = 'Start Mission';
                        this.startPauseButton.classList.remove('paused');
                    }
                }
            }, 1000);
        }
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timer);
    }

    reset() {
        this.pause();
        this.startPauseButton.textContent = 'Start Mission';
        this.startPauseButton.classList.remove('paused');
        this.currentTime = this.isWorkMode ? this.workTime : this.breakTime;
        this.updateDisplay();
    }

    setWorkMode() {
        this.isWorkMode = true;
        this.workButton.classList.add('active');
        this.breakButton.classList.remove('active');
        this.reset();
    }

    setBreakMode() {
        this.isWorkMode = false;
        this.workButton.classList.remove('active');
        this.breakButton.classList.add('active');
        this.reset();
    }

    saveNewTimes() {
        const newWorkTime = parseInt(document.getElementById('work-time').value);
        const newBreakTime = parseInt(document.getElementById('break-time').value);
        
        if (newWorkTime > 0 && newBreakTime > 0) {
            this.workTime = newWorkTime * 60;
            this.breakTime = newBreakTime * 60;
            if (!this.isRunning) {
                this.reset();
            }
        }
    }
}

// Initialize the timer
const pomodoro = new PomodoroTimer(); 