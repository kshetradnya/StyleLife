/* ============================================================
   StyleScroll — Landing Page Logic
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initHeroParticles();
    initTrendingTrack();
    initScrollReveal();
    animateStats();
});

// --- Hero Particles Animation ---
function initHeroParticles() {
    const canvas = document.getElementById("hero-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener("resize", resize);
    resize();
    
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(155, 93, 229, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 80; i++) particles.push(new Particle());
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- Trending Strip Generation ---
function initTrendingTrack() {
    const track = document.getElementById("trending-track");
    if (!track) return;
    
    const trendingLooks = [
        { user: "@Neon_Aura", emoji: "🧥", likes: "12k" },
        { user: "@Retro_Punk", emoji: "👗", likes: "8.5k" },
        { user: "@Solar_Chic", emoji: "👒", likes: "15k" },
        { user: "@Vibe_Master", emoji: "👟", likes: "9.2k" },
        { user: "@Glow_Up", emoji: "💎", likes: "11k" },
        { user: "@Aero_Form", emoji: "🕶️", likes: "7.8k" }
    ];
    
    // Duplicate for infinite scroll
    const items = [...trendingLooks, ...trendingLooks, ...trendingLooks];
    
    track.innerHTML = items.map(item => `
        <div class="trending-look">
            <div class="trending-look-content">${item.emoji}</div>
            <div class="trending-look-overlay">
                <div class="trending-look-user">${item.user}</div>
                <div class="trending-look-likes">${item.likes} likes</div>
            </div>
        </div>
    `).join("");
}

// --- Scroll Reveal Intersection Observer ---
function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.15 });
    
    reveals.forEach(el => observer.observe(el));
}

// --- Stat Counter Animation ---
function animateStats() {
    const stats = document.querySelectorAll(".stat-num");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute("data-val"));
                countUp(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(s => observer.observe(s));
    
    function countUp(el, target) {
        let current = 0;
        const duration = 2000;
        const startTime = performance.now();
        
        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            current = Math.floor(progress * target);
            el.textContent = (current >= 1000 ? (current/1000).toFixed(1) + "k+" : current + (target === 50 ? "+" : "%"));
            
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
}
