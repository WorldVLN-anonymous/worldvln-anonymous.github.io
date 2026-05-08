const outdoorVideos = [
    {
        title: "Outdoor Scenario 1",
        file: "outdoor1.mp4",
        description: "Qualitative example from the first outdoor scene."
    },
    {
        title: "Outdoor Scenario 2",
        file: "outdoor2.mp4",
        description: "Another outdoor example with a distinct scene layout."
    },
    {
        title: "Outdoor Scenario 3",
        file: "outdoor3.mp4",
        description: "Supplementary outdoor result highlighting environmental diversity."
    },
    {
        title: "Outdoor Scenario 4",
        file: "outdoor4.mp4",
        description: "Additional outdoor qualitative video for anonymous review."
    }
];

const testVideos = [
    {
        title: "Test Scene 1",
        file: "test1.mp4",
        description: "Test case used to broaden coverage across example conditions."
    },
    {
        title: "Test Scene 2",
        file: "test2.mp4",
        description: "Supplementary test video showing another representative behavior."
    },
    {
        title: "Test Scene 3",
        file: "test3.mp4",
        description: "Additional sample included for qualitative inspection."
    },
    {
        title: "Test Scene 4",
        file: "test4.mp4",
        description: "Review-time example from the test split."
    },
    {
        title: "Test Scene 5",
        file: "test5.mp4",
        description: "Short-form qualitative result from another test setup."
    },
    {
        title: "Test Scene 6",
        file: "test6.mp4",
        description: "Final embedded example included in the anonymous supplementary page."
    }
];

const heroClips = [
    {
        src: "static/background-videos/portrait-source-01.mp4",
        shape: "portrait",
        caption: "Portrait source clip 01 selected from the first anonymous video route and shown with a blurred extension background."
    },
    {
        src: "static/background-videos/square-source-01.mp4",
        shape: "square",
        caption: "Square source clip 01 selected from the second anonymous video route and shown with a blurred extension background."
    },
    {
        src: "static/background-videos/portrait-source-02.mp4",
        shape: "portrait",
        caption: "Portrait source clip 02 selected from the first anonymous video route and shown with a blurred extension background."
    },
    {
        src: "static/background-videos/square-source-02.mp4",
        shape: "square",
        caption: "Square source clip 02 selected from the second anonymous video route and shown with a blurred extension background."
    },
    {
        src: "static/background-videos/portrait-source-03.mp4",
        shape: "portrait",
        caption: "Portrait source clip 03 selected from the first anonymous video route and shown with a blurred extension background."
    },
    {
        src: "static/background-videos/square-source-03.mp4",
        shape: "square",
        caption: "Square source clip 03 selected from the second anonymous video route and shown with a blurred extension background."
    }
];

function createVideoCard(item, index) {
    const card = document.createElement("article");
    card.className = "video-card";
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
    card.innerHTML = `
        <div class="video-shell">
            <video controls preload="metadata" playsinline>
                <source src="static/videos/${item.file}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        <div class="video-meta">
            <div class="video-kicker">Video ${String(index + 1).padStart(2, "0")}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="video-file">${item.file}</div>
        </div>
    `;
    return card;
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

function playMutedVideo(video, playbackRate) {
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.playbackRate = playbackRate;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
    }
}

function setupHeroShowcase() {
    const wallVideos = Array.from(document.querySelectorAll(".hero-wall-video"));

    if (!wallVideos.length || !heroClips.length) {
        return;
    }

    const assignClipToVideo = (video, clip) => {
        video.pause();
        video.src = clip.src;
        video.load();
        playMutedVideo(video, 0.92);
    };

    wallVideos.forEach((video, index) => {
        let clipIndex = index % heroClips.length;

        const playCurrentClip = () => {
            const clip = heroClips[clipIndex];
            assignClipToVideo(video, clip);
        };

        video.loop = false;
        video.addEventListener("ended", () => {
            clipIndex = (clipIndex + wallVideos.length) % heroClips.length;
            playCurrentClip();
        });

        playCurrentClip();
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

populateVideos("outdoorVideos", outdoorVideos);
populateVideos("testVideos", testVideos);
setupNavbar();
setupSmoothScroll();
setupHeroShowcase();
setupRevealAnimations();
