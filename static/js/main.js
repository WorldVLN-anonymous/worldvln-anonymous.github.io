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

function createVideoCard(item, index) {
    const card = document.createElement("article");
    card.className = "video-card";
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

populateVideos("outdoorVideos", outdoorVideos);
populateVideos("testVideos", testVideos);
setupNavbar();
setupSmoothScroll();
