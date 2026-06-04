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
async function fetchMembers() {
    try {
        const res = await fetch("members.json?cache=" + Date.now());
        members = await res.json();
        localStorage.setItem("members", JSON.stringify(members));
        renderList();
    } catch (e) {
        console.error("Error loading members:", e);
        const saved = localStorage.getItem("members");
        if (saved) {
            members = JSON.parse(saved);
            renderList();
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

// Refresh button
refreshBtn.addEventListener("click", fetchMembers);

// Load on startup
fetchMembers();


