/* ============================================================
   StyleLife — Global Application Logic
   ============================================================ */

const StyleLife = {
    // --- Configuration ---
    config: {
        GEMINI_API_KEY: "AIzaSyDTisdB2hFflPIztzmtbkPmi36Z34djeyA",
        STORAGE_KEY: "StyleLife_Data",
        AUTH_KEY: "StyleLife_Auth",
        THEME_KEY: "StyleLife_Theme"
    },

    // --- State ---
    state: {
        user: null, // Logged in user object
        posts: [],
        messages: [],
        isDark: true
    },

    // --- Initialization ---
    init() {
        console.log("🚀 StyleLife Initializing...");
        this.loadTheme();
        this.loadData();
        this.checkAuth();
        this.setupGlobalEvents();
        this.seedDemoData();
    },

    // --- Theme Management ---
    loadTheme() {
        const savedTheme = localStorage.getItem(this.config.THEME_KEY);
        this.state.isDark = savedTheme !== "light";
        this.applyTheme();
    },

    toggleTheme() {
        this.state.isDark = !this.state.isDark;
        localStorage.setItem(this.config.THEME_KEY, this.state.isDark ? "dark" : "light");
        this.applyTheme();
    },

    applyTheme() {
        document.documentElement.setAttribute("data-theme", this.state.isDark ? "dark" : "light");
        const icon = document.querySelector("#theme-toggle i");
        if (icon) {
            icon.className = this.state.isDark ? "fas fa-moon" : "fas fa-sun";
        }
    },

    // --- Data Persistence ---
    loadData() {
        const savedData = localStorage.getItem(this.config.STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            this.state.posts = parsed.posts || [];
            this.state.messages = parsed.messages || [];
        }
    },

    saveData() {
        const dataToSave = {
            posts: this.state.posts,
            messages: this.state.messages
        };
        localStorage.setItem(this.config.STORAGE_KEY, JSON.stringify(dataToSave));
    },

    // --- Auth Management ---
    checkAuth() {
        const savedAuth = localStorage.getItem(this.config.AUTH_KEY);
        if (savedAuth) {
            this.state.user = JSON.parse(savedAuth);
            this.updateUIAfterAuth();
        }
    },

    login(userData) {
        this.state.user = userData;
        localStorage.setItem(this.config.AUTH_KEY, JSON.stringify(userData));
        this.updateUIAfterAuth();
        this.showToast("Welcome to StyleLife, " + userData.username + "!", "success");
    },

    logout() {
        this.state.user = null;
        localStorage.removeItem(this.config.AUTH_KEY);
        window.location.href = "index.html";
    },

    updateUIAfterAuth() {
        // Navbar updates
        const authBtns = document.getElementById("nav-auth-buttons");
        const userProfile = document.getElementById("nav-user-profile");
        const userAvatar = document.getElementById("nav-user-avatar");
        const mobileAuth = document.getElementById("mobile-auth-links");
        const mobileUser = document.getElementById("mobile-user-links");

        if (this.state.user) {
            if (authBtns) authBtns.style.display = "none";
            if (userProfile) userProfile.style.display = "block";
            if (userAvatar) userAvatar.textContent = this.state.user.username.charAt(0).toUpperCase();

            if (mobileAuth) mobileAuth.style.display = "none";
            if (mobileUser) mobileUser.style.display = "flex";
        }
    },

    // --- Global Helpers ---
    setupGlobalEvents() {
        // Theme Toggle
        const themeBtn = document.getElementById("theme-toggle");
        if (themeBtn) themeBtn.addEventListener("click", () => this.toggleTheme());

        // Mobile Nav
        const mobileToggle = document.getElementById("mobile-nav-toggle");
        const mobileDrawer = document.getElementById("mobile-drawer");
        if (mobileToggle && mobileDrawer) {
            mobileToggle.addEventListener("click", () => {
                mobileDrawer.classList.toggle("open");
                mobileToggle.classList.toggle("open");
            });
        }

        // Logout
        const logoutBtn = document.getElementById("logout-btn");
        const mobileLogout = document.getElementById("mobile-logout");
        if (logoutBtn) logoutBtn.addEventListener("click", () => this.logout());
        if (mobileLogout) mobileLogout.addEventListener("click", (e) => {
            e.preventDefault();
            this.logout();
        });
    },

    showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        let icon = "fa-info-circle";
        if (type === "success") icon = "fa-check-circle";
        if (type === "error") icon = "fa-exclamation-circle";

        toast.innerHTML = `
            <i class="fas ${icon} toast-icon"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 100);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 600);
        }, 4000);
    },

    // --- Gemini AI Integration ---
    async getAISuggestion(prompt) {
        if (!this.config.GEMINI_API_KEY || this.config.GEMINI_API_KEY === "YOUR_API_KEY") {
            console.warn("Gemini API Key missing. Using fallback.");
            return "Try adding matching accessories!";
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini Error:", error);
            return "Classic style never goes out of fashion.";
        }
    },

    // --- Demo Data Seeding ---
    seedDemoData() {
        if (this.state.posts.length === 0) {
            this.state.posts = [
                {
                    id: "p1",
                    userId: "u1",
                    username: "NeonVibes",
                    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=2012",
                    caption: "Loving the new AR footwear tool! 👟 #Style #Neon",
                    likes: 1250,
                    time: "2h ago",
                    comments: 45
                },
                {
                    id: "p2",
                    userId: "u2",
                    username: "StyleArchitect",
                    img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=2070",
                    caption: "Futuristic formal wear is the future. #CyberLuxe",
                    likes: 890,
                    time: "5h ago",
                    comments: 12
                },
                {
                    id: "p3",
                    userId: "u3",
                    username: "FashionForward",
                    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1976",
                    caption: "Morning studio session. Experimenting with layers. 🧥",
                    likes: 2100,
                    time: "8h ago",
                    comments: 88
                }
            ];
            this.saveData();
        }
    }
};

// Start the App
StyleLife.init();
window.StyleLife = StyleLife;
