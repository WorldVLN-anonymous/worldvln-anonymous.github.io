const mediaSettings = {
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(navigator.connection && navigator.connection.saveData)
};

const ambientVideos = new Set();
let ambientObserver = null;

const videoGroups = {
    outdoorVideos: [
        createVideoItem("Outdoor Scenario 1", "outdoor1.mp4"),
        createVideoItem("Outdoor Scenario 2", "outdoor2.mp4"),
        createVideoItem("Outdoor Scenario 3", "outdoor5.mp4"),
        createVideoItem("Outdoor Scenario 4", "outdoor4.mp4")
    ],
    testVideos: [
        createVideoItem("Test Scene 1", "test1.mp4"),
        createVideoItem("Test Scene 2", "test2.mp4"),
        createVideoItem("Test Scene 3", "test3.mp4"),
        createVideoItem("Test Scene 4", "test4.mp4"),
        createVideoItem("Test Scene 5", "test5.mp4"),
        createVideoItem("Test Scene 6", "test6.mp4")
    ],
    uavFlowVideos: [
        createVideoItem("UAV-Flow 1", "uav-flow-1.mp4"),
        createVideoItem("UAV-Flow 2", "uav-flow-2.mp4")
    ],
    indoorUavVideos: [
        createVideoItem("Indoor UAV 1", "indoor-uav.mp4")
    ],
    inferProcessVideos: [
        createVideoItem("Infer Process 1", "infer-process.mp4")
    ]
};

const previewQueue = createIdleQueue(getPreviewConcurrency());

function createVideoItem(title, file) {
    const stem = file.replace(/\.[^.]+$/, "");
    return {
        title,
        poster: `static/video-posters/${stem}.webp`,
        full: `static/videos/${file}`
    };
}

function createIdleQueue(maxConcurrent) {
    const tasks = [];
    let active = 0;
    let started = false;

    function runWhenIdle(callback) {
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(callback, { timeout: 3000 });
            return;
        }

        window.setTimeout(() => {
            callback({
                didTimeout: true,
                timeRemaining: () => 0
            });
        }, 650);
    }

    function pump() {
        if (!started || document.hidden) {
            return;
        }

        while (active < maxConcurrent && tasks.length) {
            const task = tasks.shift();
            active += 1;

            runWhenIdle(() => {
                Promise.resolve(task())
                    .catch(() => {})
                    .finally(() => {
                        active -= 1;
                        window.setTimeout(pump, 180);
                    });
            });
        }
    }

    return {
        add(task) {
            tasks.push(task);
            pump();
        },
        start() {
            started = true;
            pump();
        },
        resume() {
            pump();
        }
    };
}

function getPreviewConcurrency() {
    if (window.matchMedia("(max-width: 900px)").matches || mediaSettings.saveData) {
        return 1;
    }

    return 2;
}

function createVideoCard(item, index) {
    const card = document.createElement("article");
    card.className = "video-card";
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
    card.innerHTML = `
        <div class="video-shell is-loading" aria-label="${item.title}">
            <img class="video-poster" src="${item.poster}" alt="" decoding="async">
            <span class="video-loading-mark" aria-hidden="true"></span>
        </div>
        <div class="video-kicker">Video ${String(index + 1).padStart(2, "0")}</div>
    `;

    previewQueue.add(() => loadInlineVideo(card, item));

    return card;
}

function loadInlineVideo(card, item) {
    if (card.dataset.videoLoaded === "true") {
        return Promise.resolve();
    }

    card.dataset.videoLoaded = "true";
    const shell = card.querySelector(".video-shell");

    if (!shell) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.className = "video-inline-player";
        video.autoplay = true;
        video.controls = true;
        video.defaultMuted = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");

        video.addEventListener(
            "loadeddata",
            () => {
                card.classList.add("video-ready");
                shell.classList.remove("is-loading");
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(() => {});
                }
                resolve();
            },
            { once: true }
        );

        video.addEventListener(
            "error",
            () => {
                card.classList.add("video-error");
                shell.classList.remove("is-loading");
                video.remove();
                resolve();
            },
            { once: true }
        );

        shell.appendChild(video);
        video.src = item.full;
        video.load();
    });
}

function populateVideos(targetId, items) {
    const container = document.getElementById(targetId);
    if (!container) {
        return;
    }

    items.forEach((item, index) => {
        container.appendChild(createVideoCard(item, index));
    });
}

function setupNavbar() {
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });

    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        navToggle.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            navToggle.classList.remove("active");
        });
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const target = document.querySelector(anchor.getAttribute("href"));
            if (!target) {
                return;
            }

            event.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });
}

function playAmbientVideo(video, playbackRate = 1) {
    if (!shouldPlayAmbientVideo(video)) {
        return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("loop", "");
    video.playbackRate = playbackRate;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
    }
}

function shouldPlayAmbientVideo(video) {
    if (document.hidden) {
        return false;
    }

    if (!("IntersectionObserver" in window)) {
        return true;
    }

    return video.dataset.inView === "true";
}

function registerAmbientVideo(video, playbackRate = 1) {
    video.dataset.playbackRate = String(playbackRate);
    ambientVideos.add(video);

    if (!("IntersectionObserver" in window)) {
        video.dataset.inView = "true";
        return;
    }

    if (!ambientObserver) {
        ambientObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target;
                    video.dataset.inView = entry.isIntersecting ? "true" : "false";

                    if (entry.isIntersecting) {
                        playAmbientVideo(video, Number(video.dataset.playbackRate) || 1);
                    } else {
                        video.pause();
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "80px 0px"
            }
        );
    }

    ambientObserver.observe(video);
}

function unregisterAmbientVideo(video) {
    ambientVideos.delete(video);

    if (ambientObserver) {
        ambientObserver.unobserve(video);
    }
}

function setupHeroShowcase() {
    const wallPanels = Array.from(document.querySelectorAll(".hero-wall-panel[data-preview]"));
    const panelLimit = getBackgroundPanelLimit();

    if (!wallPanels.length || panelLimit === 0) {
        return;
    }

    wallPanels.slice(0, panelLimit).forEach((panel, index) => {
        previewQueue.add(() => loadBackgroundPreview(panel, index));
    });
}

function getBackgroundPanelLimit() {
    if (mediaSettings.reduceMotion || mediaSettings.saveData) {
        return 0;
    }

    if (window.matchMedia("(max-width: 540px)").matches) {
        return 0;
    }

    if (window.matchMedia("(max-width: 768px)").matches) {
        return 2;
    }

    return 8;
}

function loadBackgroundPreview(panel, index) {
    if (panel.dataset.previewLoaded === "true") {
        return Promise.resolve();
    }

    panel.dataset.previewLoaded = "true";

    return new Promise((resolve) => {
        const video = document.createElement("video");
        const playbackRate = index % 2 === 0 ? 0.92 : 0.88;

        video.className = "hero-wall-video";
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "none";
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("loop", "");

        video.addEventListener(
            "loadeddata",
            () => {
                panel.classList.add("preview-ready");
                playAmbientVideo(video, playbackRate);
                resolve();
            },
            { once: true }
        );

        video.addEventListener(
            "error",
            () => {
                panel.classList.remove("preview-ready");
                unregisterAmbientVideo(video);
                video.remove();
                resolve();
            },
            { once: true }
        );

        panel.appendChild(video);
        registerAmbientVideo(video, playbackRate);
        video.src = panel.dataset.preview;
        video.load();
    });
}

function setupRevealAnimations() {
    const revealTargets = document.querySelectorAll("[data-reveal]");
    if (!revealTargets.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        revealTargets.forEach((item) => item.classList.add("revealed"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const delay = entry.target.dataset.delay;
                if (delay) {
                    entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
                }

                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -6% 0px"
        }
    );

    revealTargets.forEach((item) => observer.observe(item));
}

function setupVisibilityHandling() {
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            ambientVideos.forEach((video) => video.pause());
            return;
        }

        ambientVideos.forEach((video) => playAmbientVideo(video, Number(video.dataset.playbackRate) || 1));
        previewQueue.resume();
    });
}

setupNavbar();
setupSmoothScroll();
[
    "inferProcessVideos",
    "uavFlowVideos",
    "indoorUavVideos",
    "outdoorVideos",
    "testVideos"
].forEach((targetId) => populateVideos(targetId, videoGroups[targetId]));
setupHeroShowcase();
setupRevealAnimations();
setupVisibilityHandling();

window.addEventListener("load", () => {
    previewQueue.start();
});
