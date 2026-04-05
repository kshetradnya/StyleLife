/* ============================================================
   StyleScroll — Authentication Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initAuthFlow();
});

function initAuthFlow() {
    const tabs = document.querySelectorAll(".auth-tab");
    const title = document.getElementById("auth-title");
    const subtitle = document.getElementById("auth-subtitle");
    const submitBtn = document.getElementById("auth-submit-btn");
    const switchBtn = document.getElementById("switch-to-signup");
    const authForm = document.getElementById("auth-form");
    const togglePass = document.getElementById("toggle-password");
    const passInput = document.getElementById("auth-password");

    let currentMode = "login";

    // Handle URL Params for Signup Mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("mode") === "signup") {
        setMode("signup");
    }

    // Toggle Pass Visibility
    if (togglePass && passInput) {
        togglePass.addEventListener("click", () => {
            const isPass = passInput.type === "password";
            passInput.type = isPass ? "text" : "password";
            togglePass.className = isPass ? "fas fa-eye input-eye" : "fas fa-eye-slash input-eye";
        });
    }

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener("click", () => setMode(tab.dataset.tab));
    });

    if (switchBtn) {
        switchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            setMode("signup");
        });
    }

    function setMode(mode) {
        currentMode = mode;
        tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === mode));
        
        if (mode === "login") {
            title.textContent = "Welcome Back";
            subtitle.textContent = "Sign in to your virtual style universe.";
            submitBtn.textContent = "Sign In";
        } else {
            title.textContent = "Create Account";
            subtitle.textContent = "Start your high-fidelity fashion journey.";
            submitBtn.textContent = "Join StyleScroll";
        }
    }

    // Form Submission
    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("auth-email").value;
            
            if (currentMode === "signup") {
                // Move to Profile Setup Step
                showProfileSetup(email);
            } else {
                // Direct Login
                const username = email.split("@")[0];
                StyleScroll.login({
                    email: email,
                    username: username,
                    avatar: "👤",
                    prefs: []
                });
                window.location.href = "feed.html";
            }
        });
    }
}

// --- Step 2: Profile Setup ---
function showProfileSetup(email) {
    const mainStep = document.getElementById("auth-step-main");
    const profileStep = document.getElementById("auth-step-profile");
    const finishBtn = document.getElementById("finish-setup-btn");
    const skipBtn = document.getElementById("skip-setup-btn");
    
    if (!mainStep || !profileStep) return;

    mainStep.classList.remove("active");
    profileStep.classList.add("active");

    // Avatar Picker
    const avatars = document.querySelectorAll(".avatar-option");
    let selectedAvatar = "👤";
    avatars.forEach(av => {
        av.addEventListener("click", () => {
            avatars.forEach(a => a.classList.remove("selected"));
            av.classList.add("selected");
            selectedAvatar = av.dataset.avatar;
        });
    });

    // Pref Chips
    const prefs = document.querySelectorAll(".pref-chip");
    let selectedPrefs = [];
    prefs.forEach(p => {
        p.addEventListener("click", () => {
            p.classList.toggle("selected");
            const val = p.dataset.pref;
            if (selectedPrefs.includes(val)) {
                selectedPrefs = selectedPrefs.filter(x => x !== val);
            } else {
                selectedPrefs.push(val);
            }
        });
    });

    // Finish Actions
    const complete = () => {
        const username = document.getElementById("setup-username").value || email.split("@")[0];
        StyleScroll.login({
            email,
            username,
            avatar: selectedAvatar,
            prefs: selectedPrefs
        });
        window.location.href = "studio.html";
    };

    if (finishBtn) finishBtn.addEventListener("click", complete);
    if (skipBtn) skipBtn.addEventListener("click", complete);
}
