/* ============================================================
   StyleLife — Author (3D Showcase) Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initAuthorScene();
});

function initAuthorScene() {
    const container = document.getElementById("author-canvas-container");
    const loading = document.getElementById("author-loading");
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x9b5de5, 1.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const pointLight = new THREE.PointLight(0xf72585, 2, 10);
    pointLight.position.set(-2, 1, 2);
    scene.add(pointLight);

    // --- Controls ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;

    // --- Object Placeholder (if GLTF fails/not provided) ---
    function createPlaceholder() {
        const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x9b5de5,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.5,
            thickness: 1.0,
            clearcoat: 1.0
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        camera.position.z = 5;
        if (loading) loading.classList.add("hidden");
    }

    // --- GLTF Loader ---
    const loader = new THREE.GLTFLoader();
    // Path to a free fashion model from a CDN
    const modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF/SheenChair.gltf'; // Simple test model
    
    loader.load(
        modelUrl,
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(3, 3, 3);
            model.position.set(0, -1, 0);
            scene.add(model);
            camera.position.set(0, 0, 5);
            if (loading) loading.classList.add("hidden");
        },
        null,
        (err) => {
            console.error("GLTF Error:", err);
            createPlaceholder();
        }
    );

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // --- Resize Handling ---
    window.addEventListener("resize", () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    if (window.StyleLife) window.StyleLife.showToast("Opening StyleLife 3D Hub...", "info");
}
