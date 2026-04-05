/* ============================================================
   StyleScroll — Styling Studio Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initStudio();
});

function initStudio() {
    const canvas = document.getElementById("base-canvas");
    const overlayCanvas = document.getElementById("overlay-canvas");
    const uploadInput = document.getElementById("photo-upload");
    const uploadZone = document.getElementById("upload-zone");
    const canvasContainer = document.getElementById("canvas-container");
    const toolbar = document.getElementById("canvas-toolbar");
    const layersList = document.getElementById("layers-list");

    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext("2d");
    const octx = overlayCanvas.getContext("2d");

    let baseImage = null;
    let overlays = []; // { img, x, y, w, h, id, emoji, type }
    let selectedOverlayIndex = -1;
    let isDragging = false;
    let startX, startY;
    let currentTool = "move"; // move, resize, rotate

    // --- Asset Library Data ---
    const assets = {
        hair: [
            { id: "h1", emoji: "💇", label: "Classic Trim" },
            { id: "h2", emoji: "💆", label: "Top Knot" },
            { id: "h3", emoji: "👱", label: "Blonde Wave" },
            { id: "h4", emoji: "🧔", label: "Modern Beard" },
            { id: "h5", emoji: "👩‍🦳", label: "Silver Bob" },
            { id: "h6", emoji: "👨‍🎤", label: "Cyber Punk" }
        ],
        clothing: [
            { id: "c1", emoji: "🧥", label: "Varsity Jacket" },
            { id: "c2", emoji: "👗", label: "Evening Gown" },
            { id: "c3", emoji: "👔", label: "Formal Suit" },
            { id: "c4", emoji: "👕", label: "Oversized Tee" },
            { id: "c5", emoji: "👘", label: "Urban Kimono" }
        ],
        accessories: [
            { id: "a1", emoji: "👓", label: "Tech Frames" },
            { id: "a2", emoji: "👑", label: "Grand Crown" },
            { id: "a3", emoji: "💎", label: "Diamond Chain" },
            { id: "a4", emoji: "🧤", label: "Tactical Gloves" }
        ]
    };

    const hairColors = [
        "#000000", "#4A2C2A", "#6F4E37", "#A52A2A", "#D2B48C", 
        "#FFFFFF", "#FFD700", "#C0C0C0", "#FF4500", "#9b5de5"
    ];

    // --- Library Rendering ---
    renderLibrary();

    function renderLibrary() {
        // Hair Colors
        const colorPalette = document.getElementById("hair-color-palette");
        if (colorPalette) {
            colorPalette.innerHTML = hairColors.map(c => `
                <div class="color-swatch" style="background: ${c}" data-color="${c}"></div>
            `).join("");
            
            colorPalette.querySelectorAll(".color-swatch").forEach(sw => {
                sw.addEventListener("click", () => {
                    colorPalette.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
                    sw.classList.add("selected");
                    if (selectedOverlayIndex !== -1 && overlays[selectedOverlayIndex].type === "hair") {
                        overlays[selectedOverlayIndex].color = sw.dataset.color;
                        drawOverlays();
                    }
                });
            });
        }

        // Hair Styles
        populateGrid("hair-style-grid", assets.hair, "hair");
        populateGrid("clothing-grid", assets.clothing, "clothing");
        populateGrid("accessories-grid", assets.accessories, "acc");
    }

    function populateGrid(id, items, type) {
        const grid = document.getElementById(id);
        if (!grid) return;
        grid.innerHTML = items.map(item => `
            <div class="item-thumb" data-id="${item.id}" data-emoji="${item.emoji}" data-type="${type}">
                ${item.emoji}
                <span class="item-thumb-label">${item.label}</span>
            </div>
        `).join("");

        grid.querySelectorAll(".item-thumb").forEach(btn => {
            btn.addEventListener("click", () => addOverlay(btn.dataset.emoji, btn.dataset.type));
        });
    }

    // --- Image Handling ---
    if (uploadZone) {
        uploadZone.addEventListener("click", () => uploadInput.click());
        uploadInput.addEventListener("change", (e) => handleImage(e.target.files[0]));

        const sampleBtn = document.getElementById("use-sample-btn");
        if (sampleBtn) {
            sampleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                handleImage("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000");
            });
        }
    }

    function handleImage(source) {
        if (!source) return;
        StyleScroll.showToast("Optimizing image...", "info");
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            baseImage = img;
            uploadZone.style.display = "none";
            canvasContainer.classList.add("active");
            toolbar.style.display = "flex";
            resizeCanvas();
            drawBase();
        };

        if (typeof source === "string") {
            img.src = source;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.readAsDataURL(source);
        }
    }

    function resizeCanvas() {
        const container = canvasContainer.getBoundingClientRect();
        canvas.width = overlayCanvas.width = container.width;
        canvas.height = overlayCanvas.height = container.height;
    }

    function drawBase() {
        if (!baseImage) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const ratio = Math.max(canvas.width / baseImage.width, canvas.height / baseImage.height);
        const nw = baseImage.width * ratio;
        const nh = baseImage.height * ratio;
        const nx = (canvas.width - nw) / 2;
        const ny = (canvas.height - nh) / 2;
        
        ctx.drawImage(baseImage, nx, ny, nw, nh);
    }

    // --- Overlay Logic ---
    function addOverlay(emoji, type) {
        if (!baseImage) {
            StyleScroll.showToast("Please upload a photo first!", "error");
            return;
        }

        const id = "ov-" + Date.now();
        const obj = {
            id, emoji, type,
            x: canvas.width / 2 - 50,
            y: canvas.height / 2 - 50,
            w: 100,
            h: 100,
            rotation: 0,
            color: type === "hair" ? hairColors[0] : null
        };

        overlays.push(obj);
        selectedOverlayIndex = overlays.length - 1;
        updateLayersList();
        drawOverlays();
        StyleScroll.showToast("Added " + type + " overlay", "success");
    }

    function updateLayersList() {
        if (!layersList) return;
        const baseLayerHTML = `
            <div class="layer-item" data-id="base">
                <span class="layer-emoji">🖼️</span>
                <span class="layer-name">Base Photo</span>
                <div class="layer-actions"><div class="layer-action-btn"><i class="fas fa-lock"></i></div></div>
            </div>
        `;
        
        const overlaysHTML = [...overlays].reverse().map((ov, idx) => `
            <div class="layer-item ${overlays.indexOf(ov) === selectedOverlayIndex ? 'active' : ''}" data-id="${ov.id}">
                <span class="layer-emoji">${ov.emoji}</span>
                <span class="layer-name">${ov.type.charAt(0).toUpperCase() + ov.type.slice(1)}</span>
                <div class="layer-actions">
                    <div class="layer-action-btn remove-layer" data-id="${ov.id}"><i class="fas fa-trash"></i></div>
                </div>
            </div>
        `).join("");

        layersList.innerHTML = overlaysHTML + baseLayerHTML;

        layersList.querySelectorAll(".layer-item").forEach(item => {
            item.addEventListener("click", () => {
                const id = item.dataset.id;
                if (id === "base") return;
                selectedOverlayIndex = overlays.findIndex(ov => ov.id === id);
                drawOverlays();
                updateLayersList();
            });
        });

        layersList.querySelectorAll(".remove-layer").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                overlays = overlays.filter(ov => ov.id !== id);
                selectedOverlayIndex = -1;
                drawOverlays();
                updateLayersList();
            });
        });
    }

    function drawOverlays() {
        octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        overlays.forEach((ov, idx) => {
            octx.save();
            octx.translate(ov.x + ov.w / 2, ov.y + ov.h / 2);
            octx.rotate(ov.rotation || 0);

            // Draw Selection Highlight
            if (idx === selectedOverlayIndex) {
                octx.strokeStyle = "#9b5de5";
                octx.lineWidth = 2;
                octx.setLineDash([5, 5]);
                octx.strokeRect(-ov.w / 2 - 5, -ov.h / 2 - 5, ov.w + 10, ov.h + 10);
                octx.setLineDash([]);
            }

            // Draw Content (Emoji for demo, in production these would be SVG/PNG assets)
            octx.font = `${ov.w}px serif`;
            octx.textAlign = "center";
            octx.textBaseline = "middle";
            
            if (ov.type === "hair" && ov.color) {
                // Simplified "colorization" for demo
                octx.shadowColor = ov.color;
                octx.shadowBlur = 10;
            }
            
            octx.fillText(ov.emoji, 0, 0);
            octx.restore();
        });
    }

    // --- Interaction Logic ---
    overlayCanvas.addEventListener("mousedown", (e) => {
        const rect = overlayCanvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;

        // Hit Detection
        let hitFound = false;
        for (let i = overlays.length - 1; i >= 0; i--) {
            const ov = overlays[i];
            if (startX >= ov.x && startX <= ov.x + ov.w && startY >= ov.y && startY <= ov.y + ov.h) {
                selectedOverlayIndex = i;
                isDragging = true;
                hitFound = true;
                break;
            }
        }

        if (!hitFound) selectedOverlayIndex = -1;
        drawOverlays();
        updateLayersList();
    });

    overlayCanvas.addEventListener("mousemove", (e) => {
        if (!isDragging || selectedOverlayIndex === -1) return;
        const rect = overlayCanvas.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;
        const dx = curX - startX;
        const dy = curY - startY;

        const ov = overlays[selectedOverlayIndex];

        if (currentTool === "move") {
            ov.x += dx;
            ov.y += dy;
        } else if (currentTool === "resize") {
            ov.w += dx;
            ov.h += dy;
        } else if (currentTool === "rotate") {
            ov.rotation += dx * 0.01;
        }

        startX = curX;
        startY = curY;
        drawOverlays();
    });

    window.addEventListener("mouseup", () => isDragging = false);

    // --- Toolbar Actions ---
    const toolBtns = document.querySelectorAll(".canvas-tool-btn[data-tool]");
    toolBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            toolBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentTool = btn.dataset.tool;
        });
    });

    const resetBtn = document.getElementById("studio-reset-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            overlays = [];
            selectedOverlayIndex = -1;
            drawOverlays();
            updateLayersList();
            StyleScroll.showToast("Studio reset", "info");
        });
    }

    const saveBtn = document.getElementById("studio-save-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (!baseImage) return;
            StyleScroll.showToast("Saving your look...", "success");
            setTimeout(() => window.location.href = "creator.html", 1000);
        });
    }

    // AI suggestion
    const aiSuggestBtn = document.getElementById("ai-smart-suggest");
    if (aiSuggestBtn) {
        aiSuggestBtn.addEventListener("click", async () => {
            aiSuggestBtn.classList.add("anim-spin");
            const suggestion = await StyleScroll.getAISuggestion("Suggest a high-fashion accessory or hair style for a futuristic photo.");
            StyleScroll.showToast("AI: " + suggestion, "info");
            aiSuggestBtn.classList.remove("anim-spin");
        });
    }
}
