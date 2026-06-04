const MEMBERS_URL = 'members.json';
const CACHE_KEY = 'mklookup_members_v1';

const statusEl = document.getElementById('status');
const searchInput = document.getElementById('searchInput');
const memberListEl = document.getElementById('memberList');
const memberCountEl = document.getElementById('memberCount');
const refreshBtn = document.getElementById('refreshBtn');

let members = [];

function setStatus(msg) {
  statusEl.textContent = msg || '';
}

function renderList(filter = '') {
  const q = filter.trim().toLowerCase();
  memberListEl.innerHTML = '';

  let filtered = members;
  if (q) {
    filtered = members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.pin.toLowerCase().includes(q)
    );
  }

  memberCountEl.textContent = filtered.length
    ? `${filtered.length} member(s)`
    : 'No members found';

  if (!filtered.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No matching members.';
    memberListEl.appendChild(li);
    return;
  }

  filtered.forEach(m => {
    const li = document.createElement('li');
    li.className = 'member-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'member-name';
    nameSpan.textContent = m.name;

    const pinSpan = document.createElement('span');
    pinSpan.className = 'pin';
    pinSpan.textContent = m.pin;

    li.appendChild(nameSpan);
    li.appendChild(pinSpan);
    memberListEl.appendChild(li);
  });
}

function saveToCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save members to cache', e);
  }
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read members from cache', e);
    return null;
  }
}

function sortMembers(list) {
  return list
    .filter(m => m.name && m.pin)
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

async function fetchMembers(showStatus = true) {
  if (showStatus) setStatus('Refreshing from server…');

  try {
    const res = await fetch(MEMBERS_URL + '?v=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const sorted = sortMembers(data);
    members = sorted;
    saveToCache(sorted);

    searchInput.disabled = false;
    renderList(searchInput.value);
    setStatus('List updated from server.');
  } catch (err) {
    console.error(err);
    setStatus('Could not refresh from server. Using last saved list if available.');
    const cached = loadFromCache();
    if (cached && cached.length) {
      members = sortMembers(cached);
      searchInput.disabled = false;
      renderList(searchInput.value);
    } else {
      members = [];
      searchInput.disabled = true;
      renderList('');
    }
  }
}

function initSearch() {
  searchInput.addEventListener('input', () => {
    renderList(searchInput.value);
  });
}

function initRefresh() {
  refreshBtn.addEventListener('click', () => {
    fetchMembers(true);
  });
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('SW registration failed', err);
    });
  }
}

function init() {
  initSearch();
  initRefresh();
  initServiceWorker();

  const cached = loadFromCache();
  if (cached && cached.length) {
    members = sortMembers(cached);
    searchInput.disabled = false;
    renderList('');
    setStatus('Loaded from local cache. Tap Refresh to get latest list.');
  } else {
    fetchMembers(false);
  }
}

document.addEventListener('DOMContentLoaded', init);
