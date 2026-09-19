window.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const pauseToggleBtn = document.getElementById('pause-toggle');

    const game = new PacmanGame();
    game.init(boardElement);

    // Initial sound toggle UI state
    updateSoundUI(audioManager.isMuted());

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            soundToggleBtn.blur();
            const isMuted = audioManager.toggleMute();
            updateSoundUI(isMuted);
        });
    }

    if (pauseToggleBtn) {
        pauseToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pauseToggleBtn.blur();
            game.togglePause();
        });
    }

    game.onPauseChange = (isPaused) => {
        updatePauseUI(isPaused);
    };

    function updatePauseUI(isPaused) {
        if (!pauseToggleBtn) return;
        if (isPaused) {
            pauseToggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fdff00">
                    <polygon points="6,4 20,12 6,20"/>
                </svg>
            `;
            pauseToggleBtn.title = "Resume Game (P / Space)";
        } else {
            pauseToggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fdff00">
                    <rect x="5" y="4" width="4" height="16" rx="1"/>
                    <rect x="15" y="4" width="4" height="16" rx="1"/>
                </svg>
            `;
            pauseToggleBtn.title = "Pause Game (P / Space)";
        }
    }

    function updateSoundUI(muted) {
        if (soundIcon) {
            soundIcon.src = muted ? './img/sound-off.png' : './img/sound-on.png';
            soundIcon.alt = muted ? 'Sound Off' : 'Sound On';
        }
        if (soundToggleBtn) {
            soundToggleBtn.title = muted ? 'Enable Sound' : 'Disable Sound';
        }
    }
});
