let members = [];
const memberListEl = document.getElementById("member-list");
const searchEl = document.getElementById("search");
const refreshBtn = document.getElementById("refresh-btn");
const themeToggle = document.getElementById("theme-toggle");

// Load theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

// Toggle theme
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

// Fetch members.json
async function fetchMembers(isManualRefresh = false) {
    try {
        // If user explicitly clicked refresh, clear localStorage first
        if (isManualRefresh) {
            localStorage.removeItem("members");
        }

        // Fetch with a unique timestamp to completely bypass browser server caching
        const res = await fetch("members.json?cache=" + Date.now());
        if (!res.ok) throw new Error("Network response was not OK");
        
        members = await res.json();
        localStorage.setItem("members", JSON.stringify(members));
        renderList();
    } catch (e) {
        console.error("Error loading members:", e);
        const saved = localStorage.getItem("members");
        if (saved) {
            members = JSON.parse(saved);
            renderList();
        } else {
            memberListEl.innerHTML = "<li class='member-item'>Failed to load member data.</li>";
        }
    }
}

// Render list
function renderList() {
    const term = searchEl.value.toLowerCase();
    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(term)
    );

    memberListEl.innerHTML = "";

    if (filtered.length === 0) {
        memberListEl.innerHTML = "<li class='member-item'>No matching members found.</li>";
        return;
    }

    filtered.forEach(m => {
        const li = document.createElement("li");
        li.className = "member-item";

        const nameDiv = document.createElement("div");
        nameDiv.className = "member-name";
        nameDiv.textContent = m.name;

        const pinDiv = document.createElement("div");
        pinDiv.className = "member-pin";
        pinDiv.textContent = "PIN: " + m.pin;

        li.appendChild(nameDiv);
        li.appendChild(pinDiv);
        memberListEl.appendChild(li);
    });
}

// Search listener
searchEl.addEventListener("input", renderList);

// Refresh button - Pass true to indicate an intentional manual update
refreshBtn.addEventListener("click", () => {
    fetchMembers(true);
});

// Load on startup
fetchMembers(false);

