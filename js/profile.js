/* ============================================================
   StyleScroll — Profile Page Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initProfile();
});

function initProfile() {
    const usernameDisplay = document.getElementById("user-username-display");
    const avatarDisplay = document.getElementById("user-avatar-display");
    const bioDisplay = document.getElementById("user-bio-display");
    const postCount = document.getElementById("post-count");
    const postsGrid = document.getElementById("posts-grid");
    const savedGrid = document.getElementById("saved-grid");
    const tabs = document.querySelectorAll(".profile-tab");
    const emptyState = document.getElementById("empty-posts-state");

    // --- Loading User Data ---
    const user = StyleScroll.state.user || {
        username: "StyleEnthusiast_26",
        avatar: "👤",
        bio: "Fashion creator and AR lover. 👗✨"
    };

    if (usernameDisplay) usernameDisplay.textContent = user.username;
    if (avatarDisplay) avatarDisplay.textContent = user.avatar;
    if (bioDisplay) bioDisplay.textContent = user.bio;

    // --- Rendering Posts ---
    function renderUserPosts() {
        if (!postsGrid) return;
        
        // Filter posts created by this user
        const userPosts = StyleScroll.state.posts.filter(p => 
            p.userId === user.id || p.username === user.username
        );

        if (userPosts.length > 0) {
            if (emptyState) emptyState.style.display = "none";
            postsGrid.innerHTML = userPosts.map(post => `
                <div class="profile-grid-item">
                    <img src="${post.img}" alt="Style" class="profile-grid-img">
                    <div class="profile-grid-overlay">
                        <span class="profile-grid-stat"><i class="fas fa-heart"></i> ${post.likes}</span>
                        <span class="profile-grid-stat"><i class="fas fa-comment"></i> ${post.comments}</span>
                    </div>
                </div>
            `).join("");
        } else {
            if (emptyState) emptyState.style.display = "flex";
        }
        
        if (postCount) postCount.textContent = userPosts.length;
    }
    renderUserPosts();

    // --- Tab Switching ---
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const target = tab.dataset.tab;
            if (target === "posts") {
                postsGrid.style.display = "grid";
                savedGrid.style.display = "none";
            } else if (target === "saved") {
                postsGrid.style.display = "none";
                savedGrid.style.display = "grid";
            }
        });
    });

    // --- Edit Profile ---
    const editBtn = document.getElementById("edit-profile-btn");
    const modal = document.getElementById("edit-profile-modal");
    const closeBtn = document.getElementById("close-modal-btn");
    const form = document.getElementById("edit-profile-form");

    if (editBtn && modal) {
        editBtn.addEventListener("click", () => {
            document.getElementById("edit-bio").value = user.bio;
            modal.classList.add("open");
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("open"));

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const newBio = document.getElementById("edit-bio").value;
            user.bio = newBio;
            if (bioDisplay) bioDisplay.textContent = newBio;
            
            // Save to state/auth
            StyleScroll.state.user = user;
            localStorage.setItem(StyleScroll.config.AUTH_KEY, JSON.stringify(user));
            
            StyleScroll.showToast("Profile updated successfully!", "success");
            modal.classList.remove("open");
        });
    }
}
