/* ============================================================
   StyleScroll — Social Feed Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initFeed();
});

function initFeed() {
    const postsContainer = document.getElementById("posts-container");
    const storiesStrip = document.getElementById("stories-strip");
    const feedTabs = document.querySelectorAll(".feed-tab");
    const fab = document.getElementById("fab-post");

    // --- Story Data ---
    const users = [
        { name: "NeonAura", avatar: "🎨", seed: "neon" },
        { name: "RetroPunk", avatar: "🎸", seed: "retro" },
        { name: "SolarChic", avatar: "☀️", seed: "solar" },
        { name: "CyberMod", avatar: "🦾", seed: "cyber" },
        { name: "EcoStyle", avatar: "🍃", seed: "eco" },
        { name: "GlowUp", avatar: "💎", seed: "glow" }
    ];

    function renderStories() {
        if (!storiesStrip) return;
        storiesStrip.innerHTML = users.map(user => `
            <div class="story-item">
                <div class="story-circle">
                    <div class="story-inner">
                        <img src="https://api.dicebear.com/6.x/avataaars/svg?seed=${user.seed}" alt="${user.name}" class="story-img">
                    </div>
                </div>
                <span class="story-name">${user.name}</span>
            </div>
        `).join("");
    }
    renderStories();

    // --- Post Rendering ---
    function renderPosts() {
        if (!postsContainer) return;
        const posts = StyleScroll.state.posts;
        
        postsContainer.innerHTML = posts.map(post => `
            <article class="post-card reveal" data-id="${post.id}">
                <div class="post-header">
                    <div class="post-user-info">
                        <div class="avatar avatar-sm avatar-grad">${post.username.charAt(0)}</div>
                        <div>
                            <div class="post-username">${post.username}</div>
                            <div class="post-time">${post.time}</div>
                        </div>
                    </div>
                    <div class="post-more-btn"><i class="fas fa-ellipsis-h"></i></div>
                </div>
                
                <div class="post-media">
                    <img src="${post.img}" alt="Look" class="post-img">
                    ${post.privacy ? `
                        <div class="post-privacy-overlay">
                            <i class="fas fa-shield-alt"></i> Privacy ON
                        </div>
                    ` : ""}
                </div>
                
                <div class="post-actions">
                    <div class="action-btn like-btn" data-id="${post.id}">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="action-btn comment-btn" data-id="${post.id}">
                        <i class="far fa-comment"></i>
                    </div>
                    <div class="action-btn share-btn" data-id="${post.id}">
                        <i class="far fa-paper-plane"></i>
                    </div>
                    <div class="action-btn save-btn" data-id="${post.id}" style="margin-left: auto;">
                        <i class="far fa-bookmark"></i>
                    </div>
                </div>
                
                <div class="post-likes">${post.likes.toLocaleString()} likes</div>
                
                <div class="post-description">
                    <strong>${post.username}</strong> ${post.caption}
                    <div class="post-hashtags">#fashion #ar #style</div>
                </div>
                
                <div class="post-comments-summary" data-id="${post.id}">
                    View all ${post.comments} comments
                </div>
            </article>
        `).join("");

        // Reveal Animation
        const reveals = postsContainer.querySelectorAll(".reveal");
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add("visible");
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(r => obs.observe(r));

        setupPostInteractions();
    }
    renderPosts();

    function setupPostInteractions() {
        // Likes
        postsContainer.querySelectorAll(".like-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                btn.classList.toggle("liked");
                const icon = btn.querySelector("i");
                if (btn.classList.contains("liked")) {
                    icon.classList.replace("far", "fas");
                    StyleScroll.showToast("Added to liked looks", "info");
                } else {
                    icon.classList.replace("fas", "far");
                }
            });
        });

        // Comments Modal
        const commentsModal = document.getElementById("comments-modal");
        const closeComments = document.getElementById("close-comments-btn");
        const commentsList = document.getElementById("comments-list");

        postsContainer.querySelectorAll(".comment-btn, .post-comments-summary").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                modalPopulateComments(id);
                commentsModal.classList.add("open");
            });
        });

        if (closeComments) closeComments.addEventListener("click", () => commentsModal.classList.remove("open"));

        function modalPopulateComments(postId) {
            const demoComments = [
                { user: "Stylist_24", text: "Obsessed with these layers! 🔥", avatar: "S" },
                { user: "ArtyGal", text: "The AI choice on colors is perfect here.", avatar: "A" },
                { user: "CoolKid_26", text: "Drop the studio item IDs pls?", avatar: "C" }
            ];
            
            commentsList.innerHTML = demoComments.map(c => `
                <div style="display: flex; gap: 12px;">
                    <div class="avatar avatar-sm avatar-grad">${c.avatar}</div>
                    <div>
                        <div style="font-weight: 700; font-size: 0.85rem;">${c.user}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${c.text}</div>
                    </div>
                </div>
            `).join("");
        }

        // Save
        postsContainer.querySelectorAll(".save-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("active");
                const icon = btn.querySelector("i");
                if (btn.classList.contains("active")) {
                    icon.className = "fas fa-bookmark";
                    StyleScroll.showToast("Saved to collection", "success");
                } else {
                    icon.className = "far fa-bookmark";
                }
            });
        });
    }

    // Tabs
    feedTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            feedTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            StyleScroll.showToast("Loading " + tab.textContent + " feed...", "info");
            // In a real app, refresh content here
        });
    });

    // FAB Hide/Show on Scroll
    let lastScroll = 0;
    window.addEventListener("scroll", () => {
        const current = window.pageYOffset;
        if (current > lastScroll && current > 200) {
            fab.style.transform = "scale(0)";
        } else {
            fab.style.transform = "scale(1)";
        }
        lastScroll = current;
    });
}
