const API = ''; // same origin as the admin panel

let token = localStorage.getItem('admin_token') || null;

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const eventForm = document.getElementById('event-form');
const formError = document.getElementById('form-error');
const eventsTbody = document.getElementById('events-tbody');
const cancelEditBtn = document.getElementById('cancel-edit');
const currentBrochureEl = document.getElementById('current-brochure');

function showDashboard() {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  loadEvents();
  loadAds();
}

function showLogin() {
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
}

if (token) showDashboard(); else showLogin();

// ---- LOGIN ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    token = data.token;
    localStorage.setItem('admin_token', token);
    showDashboard();
  } catch (err) {
    loginError.textContent = err.message;
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  token = null;
  localStorage.removeItem('admin_token');
  showLogin();
});

// ---- LOAD EVENTS TABLE ----
async function loadEvents() {
  const res = await fetch(`${API}/api/admin/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) return showLogin();

  const events = await res.json();
  eventsTbody.innerHTML = '';

  events.forEach((ev) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ev.date}</td>
      <td>${escapeHtml(ev.title)}</td>
      <td>${escapeHtml(ev.venue || '')}</td>
      <td>${ev.fees ? escapeHtml(ev.fees) : '—'}</td>
      <td>${ev.brochure_url ? `<a href="${ev.brochure_url}" target="_blank">View</a>` : '—'}</td>
      <td class="actions">
        <button data-edit="${ev.id}">Edit</button>
        <button data-delete="${ev.id}" class="danger">Delete</button>
      </td>
    `;
    eventsTbody.appendChild(tr);
  });

  eventsTbody.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', () => startEdit(events.find((e) => e.id === btn.dataset.edit)))
  );
  eventsTbody.querySelectorAll('[data-delete]').forEach((btn) =>
    btn.addEventListener('click', () => deleteEvent(btn.dataset.delete))
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- ADD / EDIT FORM ----
function startEdit(ev) {
  document.getElementById('form-title').textContent = 'Edit Event';
  document.getElementById('event-id').value = ev.id;
  document.getElementById('title').value = ev.title;
  document.getElementById('date').value = ev.date;
  document.getElementById('time').value = ev.time || '';
  document.getElementById('venue').value = ev.venue || '';
  document.getElementById('location').value = ev.location || '';
  document.getElementById('fees').value = ev.fees || '';
  document.getElementById('description').value = ev.description || '';
  document.getElementById('organizer_name').value = ev.organizer_name || '';
  document.getElementById('organizer_contact').value = ev.organizer_contact || '';
  currentBrochureEl.textContent = ev.brochure_url ? `Current brochure: ${ev.brochure_url} (upload a new file to replace it)` : '';
  cancelEditBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  eventForm.reset();
  document.getElementById('event-id').value = '';
  document.getElementById('form-title').textContent = 'Add New Event';
  currentBrochureEl.textContent = '';
  cancelEditBtn.classList.add('hidden');
  formError.textContent = '';
}

eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';

  const id = document.getElementById('event-id').value;
  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('date', document.getElementById('date').value);
  formData.append('time', document.getElementById('time').value);
  formData.append('venue', document.getElementById('venue').value);
  formData.append('location', document.getElementById('location').value);
  formData.append('fees', document.getElementById('fees').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('organizer_name', document.getElementById('organizer_name').value);
  formData.append('organizer_contact', document.getElementById('organizer_contact').value);

  const fileInput = document.getElementById('brochure');
  if (fileInput.files[0]) formData.append('brochure', fileInput.files[0]);

  try {
    const res = await fetch(`${API}/api/admin/events${id ? '/' + id : ''}`, {
      method: id ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    resetForm();
    loadEvents();
  } catch (err) {
    formError.textContent = err.message;
  }
});

async function deleteEvent(id) {
  if (!confirm('Delete this event? This cannot be undone.')) return;
  const res = await fetch(`${API}/api/admin/events/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) loadEvents();
}

// ---- ADS ----
const adForm = document.getElementById('ad-form');
const adFormError = document.getElementById('ad-form-error');
const adsTbody = document.getElementById('ads-tbody');

const PLACEMENT_LABELS = {
  calendar_banner: 'Calendar — Bottom Banner',
  event_detail_banner: 'Event Details — Banner',
  contact_banner: 'List Your Event — Banner',
  event_detail_interstitial: 'Event Details — Full-Page Ad',
};

async function loadAds() {
  const res = await fetch(`${API}/api/admin/ads`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) return showLogin();

  const ads = await res.json();
  adsTbody.innerHTML = '';

  ads.forEach((ad) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(PLACEMENT_LABELS[ad.placement] || ad.placement)}</td>
      <td>${escapeHtml(ad.media_type)}</td>
      <td><a href="${ad.media_url}" target="_blank">View</a></td>
      <td>${ad.start_date}</td>
      <td>${ad.end_date}</td>
      <td class="actions"><button data-delete-ad="${ad.id}" class="danger">Delete</button></td>
    `;
    adsTbody.appendChild(tr);
  });

  adsTbody.querySelectorAll('[data-delete-ad]').forEach((btn) =>
    btn.addEventListener('click', () => deleteAd(btn.dataset.deleteAd))
  );
}

adForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  adFormError.textContent = '';

  const formData = new FormData();
  formData.append('placement', document.getElementById('ad-placement').value);
  formData.append('start_date', document.getElementById('ad-start-date').value);
  formData.append('end_date', document.getElementById('ad-end-date').value);

  const fileInput = document.getElementById('ad-media');
  if (fileInput.files[0]) formData.append('media', fileInput.files[0]);

  try {
    const res = await fetch(`${API}/api/admin/ads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    adForm.reset();
    loadAds();
  } catch (err) {
    adFormError.textContent = err.message;
  }
});

async function deleteAd(id) {
  if (!confirm('Delete this ad? This cannot be undone.')) return;
  const res = await fetch(`${API}/api/admin/ads/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) loadAds();
}
