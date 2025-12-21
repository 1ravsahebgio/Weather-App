// canvasAnimation.js
export function initSkyAnimation(containerId, isDay) {
    console.log(`🌙 Sky Animation Started - isDay: ${isDay}`);
    console.log("☀️ DAY ANIMATION STARTED"); // 👈 DEBUG LINE
    // Wait for page to fully load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createSkyCanvas(containerId, isDay);
        });
    } else {
        createSkyCanvas(containerId, isDay);
    }
}

function createSkyCanvas(containerId, isDay) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container #${containerId} not found`);
        return;
    }

    // Remove existing canvas if any
    const existingCanvas = document.getElementById('skyCanvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }

    // Create new canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'skyCanvas';

    // CSS styling
    Object.assign(canvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '1',
        pointerEvents: 'none',
        borderRadius: 'inherit' // Container ki border-radius follow karega
    });

    // Container ko relative banao
    container.style.position = 'relative';
    container.appendChild(canvas);

    // Resize observer for perfect sizing
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas(canvas);
    });
    resizeObserver.observe(container);

    // Start animation based on day/night
    if (isDay === 1) {
        startDayAnimation(canvas);
    } else {
        startNightAnimation(canvas);
    }
}

function resizeCanvas(canvas) {
    // ✅ Safety check add karo
    if (!canvas || !canvas.parentElement) {
        console.warn("❌ Canvas or parent not found for resize");
        return;
    }

    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // ✅ Additional safety
    if (!rect || rect.width === 0 || rect.height === 0) {
        console.warn("❌ Container has zero size");
        return;
    }

    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// 🌙 NIGHT ANIMATION (Your original star animation)
function startNightAnimation(canvas) {
    const ctx = canvas.getContext('2d');
 
    // Parameters
    const STAR_COUNT = 80;
    const LAYERS = 3;
    const SHOOT_PROB = 0.002;
    const TWINKLE_SPEED = 0.02;

    const stars = [];
    let shooting = null;

    function initStars() {
        stars.length = 0;
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        for (let i = 0; i < STAR_COUNT; i++) {
            const layer = 1 + Math.floor(Math.random() * LAYERS);
            const size = (Math.random() * 1.1 + 0.1) * (layer === 1 ? 0.4 : layer === 2 ? 0.7 : 1.1);
            const x = Math.random() * w;
            const y = Math.random() * h * 0.8;
            const baseAlpha = 0.25 + Math.random() * 0.75;
            const twinkleOffset = Math.random() * Math.PI * 2;
            const vx = (layer - 2) * 0.02 * (Math.random() * 0.6 + 0.6);
            const vy = 0;

            stars.push({ x, y, size, layer, baseAlpha, twinkleOffset, vx, vy });
        }
    }

    function spawnShootingStar() {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const x = Math.random() * w * 0.8;
        const y = Math.random() * h * 0.35;
        const angle = Math.PI / 6 + Math.random() * (Math.PI / 3);
        const speed = 6 + Math.random() * 8;

        shooting = {
            x, y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            len: 80 + Math.random() * 120,
            life: 0,
            maxLife: 30 + Math.random() * 30
        };
    }

    function drawHorizon(ctx, w, h) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        const g = ctx.createLinearGradient(0, h * 0.6, 0, h);
        g.addColorStop(0, "rgba(6, 15, 28, 0.45)");
        g.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = g;

        ctx.beginPath();
        const baseY = h * 0.82;
        ctx.moveTo(0, h);
        ctx.lineTo(0, baseY);
        ctx.bezierCurveTo(w * 0.15, baseY - 18, w * 0.28, baseY + 8, w * 0.45, baseY - 22);
        ctx.bezierCurveTo(w * 0.62, baseY - 48, w * 0.78, baseY + 6, w, baseY - 20);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(2,8,18,0.7)";
        ctx.fillRect(0, h * 0.9, w, h * 0.12);
        ctx.restore();
    }

    // Main render loop
    let lastTime = 0;
    function frame(t) {
        const dt = Math.min(40, t - lastTime);
        lastTime = t;
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        // Night sky background
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, "#071227");
        bg.addColorStop(0.6, "#071a33");
        bg.addColorStop(1, "#061325");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Moon glow
        ctx.save();
        const glow = ctx.createRadialGradient(w * 0.72, h * 0.18, 10, w * 0.72, h * 0.18, 120);
        glow.addColorStop(0, "rgba(140,170,255,0.14)");
        glow.addColorStop(1, "rgba(10,18,30,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Draw stars
        for (let layer = 1; layer <= LAYERS; layer++) {
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                if (s.layer !== layer) continue;

                const tw = 0.5 + ((Math.sin((t * TWINKLE_SPEED) / 1000 + s.twinkleOffset) + 1) / 2) * 0.9;
                const alpha = Math.max(0.12, Math.min(1, s.baseAlpha * tw));

                ctx.beginPath();
                ctx.fillStyle = `rgba(255,255,255,${alpha * (0.6 + layer * 0.15)})`;

                if (s.size > 1.6) {
                    const rg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
                    rg.addColorStop(0, `rgba(255,255,255,${alpha})`);
                    rg.addColorStop(0.6, `rgba(140,170,255,${alpha * 0.12})`);
                    rg.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = rg;
                    ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Move stars for parallax
                s.x += s.vx * layer;
                if (s.x < -10) s.x = w + 10;
                if (s.x > w + 10) s.x = -10;
            }
        }

        // Shooting stars
        if (shooting) {
            shooting.life++;
            const progress = shooting.life / shooting.maxLife;
            const tailLen = shooting.len * (1 - progress);

            ctx.save();
            ctx.lineWidth = 2.2;
            const headAlpha = 0.95 * (1 - progress);
            ctx.strokeStyle = `rgba(255,255,255,${headAlpha})`;
            ctx.beginPath();
            ctx.moveTo(shooting.x, shooting.y);
            ctx.lineTo(shooting.x - shooting.dx * 0.8, shooting.y - shooting.dy * 0.8);
            ctx.stroke();

            const tx = shooting.x - shooting.dx * 0.5;
            const ty = shooting.y - shooting.dy * 0.5;
            const grd = ctx.createLinearGradient(shooting.x, shooting.y, tx, ty);
            grd.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - progress)})`);
            grd.addColorStop(1, `rgba(120,160,255,${0.02 * (1 - progress)})`);
            ctx.strokeStyle = grd;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(shooting.x, shooting.y);
            ctx.lineTo(shooting.x - shooting.dx * (tailLen / 20), shooting.y - shooting.dy * (tailLen / 20));
            ctx.stroke();
            ctx.restore();

            shooting.x += shooting.dx;
            shooting.y += shooting.dy;

            if (shooting.life > shooting.maxLife) {
                shooting = null;
            }
        } else {
            if (Math.random() < SHOOT_PROB) spawnShootingStar();
        }

        // Draw horizon
        drawHorizon(ctx, w, h);

        requestAnimationFrame(frame);
    }

    // Initialize and start
    resizeCanvas(canvas);
    initStars();
    lastTime = performance.now();
    requestAnimationFrame(frame);
}

/////////////////////////////////////////////////////////////////////////////////////////

// ☀️ DAY ANIMATION (SMART SPEED - FAST LEFT, SLOW RIGHT)
function startDayAnimation(canvas) {
    console.log("☀️ SMART SPEED CLOUDS - FAST LEFT, SLOW RIGHT");

    const ctx = canvas.getContext('2d');
    let animationId;

    // ONLY 4 CLOUDS - MEDIUM & SMALL-MEDIUM SIZES
    const clouds = [
        { x: -80, y: 0.25, size: 45, speed: 0.05, opacity: 0.6 },   // Medium cloud
        { x: -200, y: 0.3, size: 50, speed: 0.04, opacity: 0.7 },   // Medium cloud  
        { x: -350, y: 0.35, size: 40, speed: 0.10, opacity: 0.65 }, // Small-medium cloud - FAST
        { x: -500, y: 0.28, size: 48, speed: 0.045, opacity: 0.75 } // Medium cloud
    ];

    function render(timestamp) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // BEAUTIFUL SKY GRADIENT
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, "#3B82F6");    // 👈 Top color - koi aur blue try karo
        bg.addColorStop(0.6, "#7EB6FF");  // 👈 Middle color  
        bg.addColorStop(0.85, "#A6D0FF"); // 👈 Horizon color
        bg.addColorStop(1, "#C8E6FF");    // 👈 Bottom color

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // GREEN LAND AT BOTTOM
        const landHeight = h * 0.25;
        const landGradient = ctx.createLinearGradient(0, h - landHeight, 0, h);
        landGradient.addColorStop(0, "#2f935b");
        landGradient.addColorStop(0.3, "#3CB371");
        landGradient.addColorStop(0.7, "#66CDAA");
        landGradient.addColorStop(1, "#98FB98");

        ctx.fillStyle = landGradient;
        ctx.fillRect(0, h - landHeight, w, landHeight);

        // ANIMATE 4 CLOUDS - SMART SPEED CONTROL
        clouds.forEach((cloud, index) => {
            // SMART SPEED: FAST IN LEFT 30%, SLOW IN RIGHT 70%
            if (cloud.x < w * 0.3) {
                // Left side (0% to 30%) - FAST SPEED (city name area)
                cloud.x += cloud.speed * 1.8; // 80% faster
            } else {
                // Right side (30% to 100%) - NORMAL SLOW SPEED
                cloud.x += cloud.speed;
            }

            // Reset cloud when off screen
            if (cloud.x > w + 200) {
                cloud.x = -200;

                // NO OVERLAP - Ensure proper spacing
                let newY;
                let attempts = 0;
                do {
                    newY = 0.2 + Math.random() * 0.25; // TOP AREA ONLY
                    attempts++;
                } while (isOverlapping(newY, index) && attempts < 10);

                cloud.y = newY;
                cloud.speed = 0.04 + Math.random() * 0.06; // 0.04 to 0.10
                cloud.opacity = 0.5 + Math.random() * 0.3; // 0.5 to 0.8 opacity

                // MEDIUM & SMALL-MEDIUM SIZES ONLY (40 to 50)
                cloud.size = 40 + Math.random() * 10; // 40 to 50 size only
            }

            // Draw cloud at current position
            drawMovingCloud(ctx, cloud.x, h * cloud.y, cloud.size, cloud.opacity);
        });
    }

    // CHECK FOR CLOUD OVERLAP
    function isOverlapping(newY, currentIndex) {
        for (let i = 0; i < clouds.length; i++) {
            if (i !== currentIndex) {
                const otherCloud = clouds[i];
                // Check if clouds are too close vertically
                if (Math.abs(newY - otherCloud.y) < 0.08) {
                    return true; // Overlap detected
                }
            }
        }
        return false; // No overlap
    }

    // MOVING CLOUD FUNCTION
    function drawMovingCloud(ctx, x, y, size, opacity) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        ctx.beginPath();
        // Fluffy cloud shape
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.45, 0, Math.PI * 2);
        ctx.arc(x + size * 0.2, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
        ctx.arc(x + size * 0.5, y + size * 0.08, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function animate(timestamp) {
        render(timestamp);
        animationId = requestAnimationFrame(animate);
    }

    resizeCanvas(canvas);
    animate(0);

    console.log("✅ Smart Speed Clouds RUNNING");
}