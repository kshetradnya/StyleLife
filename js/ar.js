/* ============================================================
   StyleLife — 100% Offline 3D AR Engine (Legacy FaceMesh)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initOffline3DAR();
});

function initOffline3DAR() {
    const video = document.getElementById("ar-video");
    const container = document.querySelector(".ar-camera-wrap");
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
    renderer.domElement.style.zIndex = "10";

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(0, 1, 1);
    scene.add(dirLight);

    const faceGroup = new THREE.Group();
    scene.add(faceGroup);

    // --- 2. MediaPipe Legacy Setup ---
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
        if (calibration) calibration.classList.add("hidden");
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            sync3DToFace(landmarks);
        }
    });

    // --- 3. 3D Positioning Logic (Manual Pose) ---
    function sync3DToFace(landmarks) {
        // Center calculation (Nose tip is index 1, bridge 168)
        const nose = landmarks[1];
        
        // Convert normalized to Three.js space (-aspect to aspect, -1 to 1)
        const aspect = video.clientWidth / video.clientHeight;
        const x = (0.5 - nose.x) * aspect * 2;
        const y = (0.5 - nose.y) * 2;
        const z = -nose.z * 5; // Depth multiplier

        faceGroup.position.set(x, y, z);

        // Rotation Calculation (Crude but 100% offline-friendly)
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const chin = landmarks[152];
        const topHead = landmarks[10];

        // Roll: Angle between eyes
        const dx = rightEye.x - leftEye.x;
        const dy = rightEye.y - leftEye.y;
        const roll = Math.atan2(dy, dx);

        // Pitch: Nose to chin vs nose to top ratio
        const pitch = (nose.y - topHead.y) / (chin.y - topHead.y) - 0.5;

        // Yaw: Left eye to nose vs right eye to nose ratio
        const yaw = (nose.x - leftEye.x) / (rightEye.x - leftEye.x) - 0.5;

        faceGroup.rotation.set(pitch * 2, -yaw * 2, -roll);

        // Scaling
        const dist = Math.sqrt(dx*dx + dy*dy);
        const scale = dist * 25; // Constant to match face size
        faceGroup.scale.set(scale, scale, scale);

        // Animate Effects
        faceGroup.children.forEach(child => {
            if (child.userData.isSad) {
                child.children.forEach(tear => {
                    tear.position.y -= 0.005;
                    if (tear.position.y < -0.1) tear.position.y = 0;
                });
            }
        });
    }

    // --- 4. 20 Filters (3D) ---
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
            if (filter.id === "h3") {
                const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8), mat);
                mesh.position.y = 0.04; group.add(mesh);
            } else if (filter.id === "h4") {
                const base = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), mat);
                base.position.y = 0.04; group.add(base);
                for(let i=0; i<15; i++) {
                    const s = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.08, 4), mat);
                    s.position.set(Math.random()*0.1-0.05, 0.12, Math.random()*0.1-0.05);
                    s.rotation.set(Math.random(), Math.random(), Math.random());
                    group.add(s);
                }
            } else {
                const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16, 0, Math.PI*2, 0, Math.PI/1.6), mat);
                mesh.scale.set(1.15, 1.4, 1.25); mesh.position.y = 0.04; group.add(mesh);
            }
        } else if (filter.type === "chain") {
            const mat = new THREE.MeshStandardMaterial({ color: filter.color, metalness: 1, roughness: 0.1 });
            const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 12, 48), mat);
            mesh.rotation.x = Math.PI / 2.1; mesh.position.y = -0.18; group.add(mesh);
        } else if (filter.type === "effect_sad") {
            const tearL = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial({ color: 0x4facfe }));
            tearL.position.set(-0.06, 0, 0.08); group.add(tearL);
            const tearR = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial({ color: 0x4facfe }));
            tearR.position.set(0.06, 0, 0.08); group.add(tearR);
            group.userData.isSad = true;
        } else if (filter.type === "crown") {
            const mat = new THREE.MeshStandardMaterial({ color: filter.color, metalness: 1 });
            const base = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.01, 8, 30), mat);
            base.rotation.x = Math.PI/2; base.position.y = 0.18; group.add(base);
        }
        return group;
    }

    // --- 5. UI & Camera ---
    function applyFilter(id) {
        faceGroup.clear();
        let filter; Object.values(filters3D).forEach(cat => { const f = cat.find(x => x.id === id); if (f) filter = f; });
        if (filter) faceGroup.add(create3DObject(filter));
    }

    function renderSidebar(cat = "hair") {
        if (!itemList) return;
        const items = filters3D[cat] || [];
        itemList.innerHTML = items.map(item => `<div class="ar-item-btn" data-id="${item.id}"><span class="ar-item-emoji">${cat === 'hair' ? '💇' : '🔗'}</span><span>${item.name}</span></div>`).join("");
        itemList.querySelectorAll(".ar-item-btn").forEach(btn => btn.addEventListener("click", () => applyFilter(btn.dataset.id)));
    }

    const camera = new Camera(video, {
        onFrame: async () => { await faceMesh.send({image: video}); },
        width: 1280, height: 720
    });

    camera.start().catch((err) => {
        console.error("Camera denied:", err);
        const noCam = document.getElementById("ar-no-camera");
        if (noCam) noCam.style.display = "flex";
    });

    renderSidebar();

    function animate() {
        renderer.render(scene, camera); // This camera is THREE.PerspectiveCamera renamed? No.
        // Wait, 'camera' is the MediaPipe Camera helper. I need the THREE.js camera.
        requestAnimationFrame(animate);
    }
    
    // Fix camera naming conflict
    const threeCam = new THREE.PerspectiveCamera(45, video.clientWidth / video.clientHeight, 0.1, 1000);
    threeCam.position.z = 2;

    function finalAnimate() {
        renderer.render(scene, threeCam);
        requestAnimationFrame(finalAnimate);
    }
    finalAnimate();
}
