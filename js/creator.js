/* ============================================================
   StyleScroll — Post Creator Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initCreator();
});

function initCreator() {
    const previewImg = document.getElementById("creator-preview-img");
    const imageInput = document.getElementById("creator-image-input");
    const uploadZone = document.getElementById("image-upload-zone");
    const privacyToggle = document.getElementById("privacy-mode-toggle");
    const privacyCard = document.getElementById("privacy-toggle-card");
    const publishBtn = document.getElementById("publish-btn");
    const captionInput = document.getElementById("creator-caption");
    const importStudioBtn = document.getElementById("import-from-studio");

    // Check for Imports (e.g., from AR or Studio)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("import") === "lastCapture" && StyleScroll.state.lastCapture) {
        setPreviewImage(StyleScroll.state.lastCapture);
        StyleScroll.showToast("Imported capture from AR mode!", "success");
    }

    if (importStudioBtn) {
        importStudioBtn.addEventListener("click", () => {
            // Simulated import from Studio
            setPreviewImage("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000");
            StyleScroll.showToast("Imported from Studio", "info");
        });
    }

    // Image Upload
    if (uploadZone) {
        uploadZone.addEventListener("click", () => imageInput.click());
        imageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setPreviewImage(ev.target.result);
                reader.readAsDataURL(file);
            }
        });
    }

    function setPreviewImage(src) {
        previewImg.innerHTML = `<img src="${src}" alt="Preview" id="main-preview-img" style="width:100%; height:100%; object-fit:cover;">`;
        uploadZone.style.display = "none";
    }

    // Privacy Mode Toggle
    if (privacyToggle && privacyCard) {
        privacyToggle.addEventListener("change", () => {
            privacyCard.classList.toggle("active", privacyToggle.checked);
            if (privacyToggle.checked) {
                StyleScroll.showToast("Privacy Mode ON: All metadata will be stripped.", "info");
                simulatePrivacyWash();
            }
        });
    }

    function simulatePrivacyWash() {
        const img = document.getElementById("main-preview-img");
        if (!img) return;
        
        // Add a subtle "processing" look
        img.style.filter = "contrast(1.1) brightness(1.05)";
        
        // Background blur simulation
        const blurToggle = document.getElementById("toggle-bg-blur");
        if (blurToggle && blurToggle.checked) {
            img.style.filter += " blur(0px)"; // Simulation of AI focus
            StyleScroll.showToast("AI: Background detected and ready to blur", "info");
        }
    }

    // Publish Logic
    const form = document.getElementById("creator-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const imgEl = document.getElementById("main-preview-img");
            if (!imgEl) {
                StyleScroll.showToast("Please add an image first!", "error");
                return;
            }

            const caption = captionInput.value || "New style released! ✨";
            const isPrivacyOn = privacyToggle.checked;
            
            // Generate New Post
            const newPost = {
                id: "p-" + Date.now(),
                userId: StyleScroll.state.user ? StyleScroll.state.user.id : "guest",
                username: StyleScroll.state.user ? StyleScroll.state.user.username : "GuestCreator",
                img: imgEl.src,
                caption: caption,
                likes: 0,
                comments: 0,
                time: "Just now",
                privacy: isPrivacyOn
            };

            // Save to State
            StyleScroll.state.posts.unshift(newPost);
            StyleScroll.saveData();

            StyleScroll.showToast("Successfully published!", "success");
            
            setTimeout(() => {
                window.location.href = "feed.html";
            }, 1500);
        });
    }
}
