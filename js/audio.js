class AudioManager {
    constructor() {
        this.muted = localStorage.getItem('pacman_muted') === 'true';
        this.sounds = {
            ready: new Audio('./sound/ready.mp3'),
            eating: new Audio('./sound/eating.mp3'),
            eatPill: new Audio('./sound/eat-pill.mp3'),
            eatFruit: new Audio('./sound/eat-fruit.mp3'),
            eatGhost: new Audio('./sound/eat-ghost.mp3'),
            die: new Audio('./sound/die.mp3'),
            siren: new Audio('./sound/siren.mp3'),
            waza: new Audio('./sound/waza.mp3'),
            extraLife: new Audio('./sound/extra-life.mp3')
        };

        this.sounds.eating.loop = true;
        this.sounds.siren.loop = true;
        this.sounds.waza.loop = true;

        this.unlocked = false;
        this.initUnlock();
    }

    initUnlock() {
        const unlock = () => {
            if (this.unlocked) return;
            this.unlocked = true;
            for (let key in this.sounds) {
                const s = this.sounds[key];
                s.play().then(() => {
                    s.pause();
                    s.currentTime = 0;
                }).catch(() => {});
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    play(name) {
        if (this.muted) return;
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }

    loop(name) {
        if (this.muted) return;
        const sound = this.sounds[name];
        if (sound) {
            sound.loop = true;
            if (sound.paused) {
                sound.play().catch(() => {});
            }
        }
    }

    stop(name) {
        const sound = this.sounds[name];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    stopAll() {
        for (let key in this.sounds) {
            this.sounds[key].pause();
            this.sounds[key].currentTime = 0;
        }
    }

    pauseAll() {
        for (let key in this.sounds) {
            this.sounds[key].pause();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('pacman_muted', this.muted);
        if (this.muted) {
            this.stopAll();
        }
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }
}

const audioManager = new AudioManager();
