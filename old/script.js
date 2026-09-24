document.addEventListener('DOMContentLoaded', function() {
    // --- Elements ---
    const checkbox = document.getElementById('themeswitcher');
    const body = document.body; // Use document.body, not getElementById
    const header = document.getElementById('header2');
    const body2 = document.getElementById('body21');
    const headertext = document.getElementById('headertext1');
    const logocontainer = document.getElementById('logo');
    const logoday = document.getElementById('logoday');
    const useractions = document.getElementById('authorization');
    const userLink = useractions?.querySelector('a');
    const cards = document.querySelectorAll('.card'); // Select ALL cards by class

    // --- Constants ---
    const logoDaySrc = 'images/Glass_Bottle_JE2_BE2.webp';
    const logoNightSrc = 'images/Potion_of_Luck_JE3.png';

    // --- Theme Logic ---
    function applyTheme(isDark) {
        // List of elements to toggle safely
        const elementsToToggle = [body, header, body2, headertext, logocontainer, useractions, userLink];

        elementsToToggle.forEach(el => {
            if (el) { // Check if element exists before toggling
                el.classList.toggle('dark-theme', isDark);
                el.classList.toggle('light-theme', !isDark);
            }
        });

        // Toggle all cards and their internal headings
        cards.forEach(card => {
            card.classList.toggle('dark-theme', isDark);
            card.classList.toggle('light-theme', !isDark);
            // Assuming the title inside the card is an h3
            const cardTitle = card.querySelector('h3'); 
            if (cardTitle) {
                cardTitle.classList.toggle('dark-theme', isDark);
                cardTitle.classList.toggle('light-theme', !isDark);
            }
        });

        // Update logo image
        if (logoday) {
            logoday.src = isDark ? logoNightSrc : logoDaySrc;
        }

        // Sync checkbox state
        if (checkbox) {
            checkbox.checked = isDark;
        }

        // Save theme preference to localStorage
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (e) {
            console.error('Could not save theme to localStorage.', e);
        }
    }

    // --- Initialization ---
    function initializeTheme() {
        let isDark = false; // Default to light theme
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme !== null) {
                isDark = savedTheme === 'dark';
            } else {
                // If no saved theme, check system preference
                isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        } catch (e) {
            // If localStorage is unavailable, fallback to system preference
            isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        applyTheme(isDark);
    }

    initializeTheme();

    // --- Event Listeners ---
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            applyTheme(checkbox.checked);
        });
    }

    if (logocontainer) {
        logocontainer.addEventListener('click', () => {
            // Toggle based on the current state of the body
            const isCurrentlyDark = document.body.classList.contains('dark-theme');
            applyTheme(!isCurrentlyDark);
        });
    }

    // Video hover playback logic
    document.querySelectorAll('.card').forEach(card => {
        const video = card.querySelector('video');
        if (video) {
            card.addEventListener('mouseenter', () => {
                // Mute video to allow autoplay in most browsers
                video.muted = true;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Video autoplay was prevented by the browser.");
                    });
                }
            });
            card.addEventListener('mouseleave', () => {
                video.pause();
            });
        }
    });
});
