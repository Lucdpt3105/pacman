window.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');

    const game = new PacmanGame();
    game.init(boardElement);

    // Initial sound toggle UI state
    updateSoundUI(audioManager.isMuted());

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMuted = audioManager.toggleMute();
            updateSoundUI(isMuted);
        });
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
