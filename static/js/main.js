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
        src: "static/hero/balanced-portrait-01.mp4",
        shape: "portrait",
        caption: "Balanced source pool clip 01 using the original portrait MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-square-01.mp4",
        shape: "square",
        caption: "Balanced source pool clip 02 using the original square MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-portrait-02.mp4",
        shape: "portrait",
        caption: "Balanced source pool clip 03 using the original portrait MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-square-02.mp4",
        shape: "square",
        caption: "Balanced source pool clip 04 using the original square MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-portrait-03.mp4",
        shape: "portrait",
        caption: "Balanced source pool clip 05 using the original portrait MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-square-03.mp4",
        shape: "square",
        caption: "Balanced source pool clip 06 using the original square MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-portrait-04.mp4",
        shape: "portrait",
        caption: "Balanced source pool clip 07 using the original portrait MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-square-04.mp4",
        shape: "square",
        caption: "Balanced source pool clip 08 using the original square MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-portrait-05.mp4",
        shape: "portrait",
        caption: "Balanced source pool clip 09 using the original portrait MP4 with a blurred extension background."
    },
    {
        src: "static/hero/balanced-square-05.mp4",
        shape: "square",
        caption: "Balanced source pool clip 10 using the original square MP4 with a blurred extension background."
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
    video.playbackRate = playbackRate;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
    }
}

function setupHeroShowcase() {
    const backdropVideo = document.getElementById("heroBackdropVideo");
    const featureVideo = document.getElementById("heroFeatureVideo");
    const previewFrame = document.getElementById("heroPreviewFrame");
    const clipCounter = document.getElementById("heroClipCounter");
    const clipCaption = document.getElementById("heroClipCaption");

    if (!backdropVideo || !featureVideo || !previewFrame || !heroClips.length) {
        return;
    }

    let currentIndex = 0;
    let isSwitching = false;

    const formatCounter = (value) => String(value).padStart(2, "0");

    const applyClipShape = (shape) => {
        previewFrame.classList.toggle("is-square", shape === "square");
        previewFrame.classList.toggle("is-portrait", shape !== "square");
    };

    const loadClip = (index) => {
        const clip = heroClips[index];
        const total = heroClips.length;
        let readyCount = 0;

        isSwitching = true;
        applyClipShape(clip.shape);
        backdropVideo.style.opacity = "0";
        featureVideo.style.opacity = "0";
        clipCounter.textContent = `${formatCounter(index + 1)} / ${formatCounter(total)}`;
        if (clipCaption) {
            clipCaption.textContent = clip.caption;
        }

        const handleReady = () => {
            readyCount += 1;
            if (readyCount < 2) {
                return;
            }

            backdropVideo.currentTime = 0;
            featureVideo.currentTime = 0;
            playMutedVideo(backdropVideo, 0.9);
            playMutedVideo(featureVideo, 1);
            backdropVideo.style.opacity = "0.86";
            featureVideo.style.opacity = "1";
            isSwitching = false;
        };

        backdropVideo.addEventListener("loadeddata", handleReady, { once: true });
        featureVideo.addEventListener("loadeddata", handleReady, { once: true });

        backdropVideo.pause();
        featureVideo.pause();
        backdropVideo.src = clip.src;
        featureVideo.src = clip.src;
        backdropVideo.load();
        featureVideo.load();
    };

    const nextClip = () => {
        if (isSwitching) {
            return;
        }

        currentIndex = (currentIndex + 1) % heroClips.length;
        loadClip(currentIndex);
    };

    featureVideo.addEventListener("ended", nextClip);
    loadClip(currentIndex);
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
