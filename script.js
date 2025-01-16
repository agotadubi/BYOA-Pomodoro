class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60;
        this.breakTime = 5 * 60;
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

        // Sound effects
        this.sounds = {
            empire: {
                start: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
                complete: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'
            },
            rebel: {
                start: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
                complete: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
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
    }

    setTheme(theme) {
        this.isEmpireTheme = theme === 'empire';
        document.body.classList.toggle('rebel-theme', !this.isEmpireTheme);
        this.empireThemeButton.classList.toggle('active', this.isEmpireTheme);
        this.rebelThemeButton.classList.toggle('active', !this.isEmpireTheme);
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
                    this.reset();
                    this.startPauseButton.textContent = 'Start Mission';
                    this.startPauseButton.classList.remove('paused');
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
}

// Initialize the timer
const pomodoro = new PomodoroTimer(); 