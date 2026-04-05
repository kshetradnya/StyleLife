/* ============================================================
   StyleLife — High-Fidelity 3D AR Engine (UMD Version)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    init3DAR();
});

async function init3DAR() {
    const video = document.getElementById("ar-video");
    const container = document.querySelector(".ar-canvas-wrap");
    const calibration = document.getElementById("ar-calibration");
    const itemList = document.getElementById("ar-item-list");

    if (!video || !container) return;

    // --- 1. Three.js Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, video.clientWidth / video.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(video.clientWidth, video.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.pointerEvents = "none";

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(0, 1, 1);
    scene.add(dirLight);

    // 3D Anchor Group
    const faceGroup = new THREE.Group();
    scene.add(faceGroup);

    // --- 2. MediaPipe AI Setup (UMD Global Approach) ---
    let faceLandmarker;
    let runningMode = "VIDEO";
    let lastVideoTime = -1;

    async function setupAI() {
        try {
            // Using global from vision_bundle.js (UMD)
            const vision = await createFilesetResolver("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
            faceLandmarker = await FaceLandmarker.createFromModelPath(
                vision,
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
            );
            await faceLandmarker.setOptions({
                runningMode: "VIDEO",
                numFaces: 1,
                outputFacialTransformationMatrixes: true
            });
            console.log("🚀 StyleLife 3D Engine Calibrated");
            if (calibration) calibration.classList.add("hidden");
        } catch (err) {
            console.error("AI Error:", err);
            if (calibration) {
                calibration.innerHTML = `
                    <div style="color:var(--red); padding:30px; text-align:center;">
                        <h3>AI Engine Error</h3>
                        <p style="font-size:0.9rem; margin-top:10px;">If running from local files, some browsers block AR features.</p>
                        <p style="font-size:0.8rem; opacity:0.7;">Try adding matching accessories until you start a server!</p>
                    </div>
                `;
            }
        }
    }

    // --- 3. 3D Content (20 Filters) ---
    const filters3D = {
        hair: [
            { id: "h1", name: "Cyber Bob", color: 0x9b5de5, type: "hair" },
            { id: "h2", name: "Golden Flow", color: 0xFFD700, type: "hair" },
            { id: "h3", name: "Buzz Cut", color: 0x222222, type: "hair" },
            { id: "h4", name: "Neon Spikes", color: 0x00ffff, type: "hair" },
            { id: "h5", name: "Modern Pomp", color: 0x4a2c2a, type: "hair" },
            { id: "h6", name: "Silver Wave", color: 0xc0c0c0, type: "hair" },
            { id: "h7", name: "Punk Pink", color: 0xf72585, type: "hair" }
        ],
        bling: [
            { id: "b1", name: "Gold Cuban", color: 0xFFD700, type: "chain" },
            { id: "b2", name: "Diamond Stud", color: 0xffffff, type: "earring" },
            { id: "b3", name: "Tech Eyepiece", color: 0x00ffff, type: "eye" },
            { id: "b4", name: "Royal Crown", color: 0xFFD700, type: "crown" },
            { id: "b5", name: "Silver Chain", color: 0xc0c0c0, type: "chain" }
        ],
        emotive: [
            { id: "e1", name: "3D Tears", type: "effect_sad" },
            { id: "e2", name: "Googly Eyes", type: "effect_funny" },
            { id: "e3", name: "Angry Brows", type: "effect_angry" },
            { id: "e4", name: "Sparkle Aura", type: "effect_hype" }
        ],
        art: [
            { id: "a1", name: "Digital Glitch", type: "shader_glitch" },
            { id: "a2", name: "Matrix Code", type: "shader_matrix" },
            { id: "a3", name: "VHS Static", type: "shader_vhs" },
            { id: "a4", name: "Solar Burn", type: "shader_solar" }
        ]
    };

    function create3DObject(filter) {
        const group = new THREE.Group();
        
        if (filter.type === "hair") {
            const mat = new THREE.MeshPhysicalMaterial({ color: filter.color, roughness: 0.1, metalness: 0.2, clearcoat: 1 });
            
            if (filter.id === "h3") { // Buzz Cut
                const geo = new THREE.SphereGeometry(0.082, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.scale.set(1.1, 1.15, 1.1);
                mesh.position.y = 0.04;
                group.add(mesh);
            } else if (filter.id === "h4") { // Neon Spikes
                const base = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
                base.position.y = 0.04;
                group.add(base);
                for(let i=0; i<15; i++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.05, 4), mat);
                    spike.position.set(Math.random()*0.1-0.05, 0.1, Math.random()*0.1-0.05);
                    spike.rotation.set(Math.random(), Math.random(), Math.random());
                    group.add(spike);
                }
            } else { // Default Bob/Flow
                const geo = new THREE.SphereGeometry(0.086, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.6);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.scale.set(1.15, 1.4, 1.25);
                mesh.position.y = 0.04;
                group.add(mesh);
            }
        } else if (filter.type === "chain") {
            const mat = new THREE.MeshStandardMaterial({ color: filter.color, metalness: 1, roughness: 0.1 });
            const geo = new THREE.TorusGeometry(0.12, 0.016, 12, 48);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = Math.PI / 2.1;
            mesh.position.y = -0.16;
            group.add(mesh);
            // Add a second thicker loop for "Cuban" look
            if (filter.id === "b1") {
                const mesh2 = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.02, 12, 48), mat);
                mesh2.rotation.x = Math.PI / 2.2;
                mesh2.position.y = -0.17;
                group.add(mesh2);
            }
        } else if (filter.type === "effect_sad") {
            const tearGeo = new THREE.SphereGeometry(0.006);
            const tearMat = new THREE.MeshBasicMaterial({ color: 0x4facfe });
            const tearL = new THREE.Mesh(tearGeo, tearMat); tearL.position.set(-0.04, 0, 0.05); group.add(tearL);
            const tearR = new THREE.Mesh(tearGeo, tearMat); tearR.position.set(0.04, 0, 0.05); group.add(tearR);
            // Animation logic will move these in the loop
            group.userData.isSad = true;
        } else if (filter.type === "crown") {
            const mat = new THREE.MeshStandardMaterial({ color: filter.color, metalness: 1, roughness: 0.1 });
            const base = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 8, 30), mat);
            base.rotation.x = Math.PI/2; base.position.y = 0.15; group.add(base);
            for(let i=0; i<8; i++) {
                const p = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 4), mat);
                const ang = (i/8)*Math.PI*2;
                p.position.set(Math.cos(ang)*0.07, 0.17, Math.sin(ang)*0.07);
                group.add(p);
            }
        }
        
        return group;
    }

    // --- 4. Main Loop ---
    function renderLoop() {
        if (video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;
            if (faceLandmarker) {
                const results = faceLandmarker.detectForVideo(video, performance.now());
                if (results.facialTransformationMatrixes && results.facialTransformationMatrixes[0]) {
                    const matrix = results.facialTransformationMatrixes[0].data;
                    const m = new THREE.Matrix4().fromArray(matrix);
                    faceGroup.setRotationFromMatrix(m);
                    faceGroup.position.setFromMatrixPosition(m);

                    // Animate Tears if active
                    faceGroup.children.forEach(child => {
                        if (child.userData.isSad) {
                            child.children.forEach(tear => {
                                tear.position.y -= 0.002;
                                if (tear.position.y < -0.1) tear.position.y = 0;
                            });
                        }
                    });
                }
            }
        }
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    // --- UI ---
    function applyFilter(id) {
        faceGroup.clear();
        let filter;
        Object.values(filters3D).forEach(cat => {
            const f = cat.find(x => x.id === id);
            if (f) filter = f;
        });

        if (filter) {
            const obj = create3DObject(filter);
            faceGroup.add(obj);
            if (window.StyleLife) window.StyleLife.showToast(`Active 3D Filter: ${filter.name}`, "info");
        }
    }

    function renderSidebar(cat = "hair") {
        if (!itemList) return;
        const items = filters3D[cat] || [];
        itemList.innerHTML = items.map(item => `
            <div class="ar-item-btn" data-id="${item.id}">
                <span class="ar-item-emoji">${cat === 'hair' ? '💇' : '🔗'}</span>
                <span>${item.name}</span>
            </div>
        `).join("");

        itemList.querySelectorAll(".ar-item-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                applyFilter(btn.dataset.id);
            });
        });
    }

    const catPills = document.querySelectorAll(".ar-cat-pill");
    catPills.forEach(pill => {
        pill.addEventListener("click", () => {
            catPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            renderSidebar(pill.dataset.cat);
        });
    });

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            video.srcObject = stream;
            video.onloadeddata = () => {
                camera.aspect = video.clientWidth / video.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(video.clientWidth, video.clientHeight);
                renderSidebar();
                requestAnimationFrame(renderLoop);
            };
        } catch (err) {
            console.error("Camera error:", err);
            if (noCamOverlay) noCamOverlay.style.display = "flex";
        }
    }

    await setupAI();
    await startCamera();

    window.addEventListener("resize", () => {
        renderer.setSize(video.clientWidth, video.clientHeight);
        camera.aspect = video.clientWidth / video.clientHeight;
        camera.updateProjectionMatrix();
    });
}
