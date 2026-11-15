/**
 * SwiftBus - Bus Ticket Booking Management System
 * Integrated with CrudCrud REST API & Axios
 */

// ============================================================
// State & Configuration
// ============================================================
// Direct Backend Endpoint for Bus Booking Project
const API_URL = 'https://crudcrud.com/api/c36d9c6adcd74dd89dfbc350eb593943/busbooking';

let allBookings = [];
let isEditing = false;
let currentEditId = null;

// DOM Elements
const bookingForm = document.getElementById('bookingForm');
const bookingIdInput = document.getElementById('bookingId');
const passengerNameInput = document.getElementById('passengerName');
const passengerEmailInput = document.getElementById('passengerEmail');
const passengerPhoneInput = document.getElementById('passengerPhone');
const busSelect = document.getElementById('busSelect');

const formTitle = document.getElementById('formTitle');
const editBadge = document.getElementById('editBadge');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const busFilter = document.getElementById('busFilter');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');

const passengerTableBody = document.getElementById('passengerTableBody');
const tableLoader = document.getElementById('tableLoader');
const emptyState = document.getElementById('emptyState');
const recordsSummary = document.getElementById('recordsSummary');

const statTotal = document.getElementById('statTotal');
const statBus1 = document.getElementById('statBus1');
const statBus2 = document.getElementById('statBus2');
const statBus3 = document.getElementById('statBus3');

// Toast Notification
const liveToast = document.getElementById('liveToast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const bsToast = new bootstrap.Toast(liveToast, { delay: 3500 });

// ============================================================
// Helper Functions
// ============================================================

/**
 * Returns endpoint URL for bus bookings
 */
function getApiUrl() {
  return API_URL;
}
function showToast(message, type = 'success') {
  liveToast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-primary');
  
  if (type === 'success') {
    liveToast.classList.add('bg-success');
    toastIcon.className = 'bi bi-check-circle-fill fs-5';
  } else if (type === 'error') {
    liveToast.classList.add('bg-danger');
    toastIcon.className = 'bi bi-exclamation-triangle-fill fs-5';
  } else if (type === 'warning') {
    liveToast.classList.add('bg-warning');
    toastIcon.className = 'bi bi-exclamation-circle-fill fs-5';
  } else {
    liveToast.classList.add('bg-primary');
    toastIcon.className = 'bi bi-info-circle-fill fs-5';
  }

  toastMessage.textContent = message;
  bsToast.show();
}

// ============================================================
// Initialization
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  fetchBookings();
});

// ============================================================
// API Operations (CRUD)
// ============================================================

/**
 * GET - Fetch all bookings from CrudCrud API
 */
async function fetchBookings() {
  tableLoader.classList.remove('d-none');
  emptyState.classList.add('d-none');

  try {
    const response = await axios.get(getApiUrl());
    allBookings = Array.isArray(response.data) ? response.data : [];
    renderBookings();
    updateStatistics();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    showToast('Failed to connect to CrudCrud. Check your API key or network.', 'error');
    allBookings = [];
    renderBookings();
  } finally {
    tableLoader.classList.add('d-none');
  }
}

/**
 * POST - Create a new booking
 */
async function createBooking(payload) {
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Booking...';

  try {
    const response = await axios.post(getApiUrl(), payload);
    showToast(`Ticket successfully booked for ${payload.name}!`, 'success');
    resetForm();
    await fetchBookings();
  } catch (error) {
    console.error('Error creating booking:', error);
    showToast('Could not save booking. Ensure CrudCrud API key has not expired.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Book Ticket';
  }
}

/**
 * PUT - Update existing booking
 */
async function updateBooking(id, payload) {
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Updating...';

  try {
    // CrudCrud PUT payload MUST NOT contain _id
    const cleanPayload = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      busNo: payload.busNo
    };

    await axios.put(`${getApiUrl()}/${id}`, cleanPayload);
    showToast('Booking details updated successfully!', 'success');
    resetForm();
    await fetchBookings();
  } catch (error) {
    console.error('Error updating booking:', error);
    showToast('Failed to update booking. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    resetEditState();
  }
}

/**
 * DELETE - Remove a booking
 */
async function deleteBooking(id, passengerName) {
  if (!confirm(`Are you sure you want to cancel the ticket for ${passengerName}?`)) {
    return;
  }

  try {
    await axios.delete(`${getApiUrl()}/${id}`);
    showToast(`Booking for ${passengerName} cancelled and deleted.`, 'warning');
    
    // If currently editing this item, cancel edit
    if (isEditing && currentEditId === id) {
      resetForm();
    }

    await fetchBookings();
  } catch (error) {
    console.error('Error deleting booking:', error);
    showToast('Failed to delete booking from server.', 'error');
  }
}

// ============================================================
// Render & Filter Logic
// ============================================================

/**
 * Render filtered bookings into the DOM
 */
function renderBookings() {
  const selectedBus = busFilter.value;
  const searchQuery = searchInput.value.trim().toLowerCase();

  passengerTableBody.innerHTML = '';

  const filtered = allBookings.filter(item => {
    // Check bus filter
    const matchesBus = selectedBus === 'all' || item.busNo === selectedBus;
    
    // Check search query
    const name = (item.name || '').toLowerCase();
    const email = (item.email || '').toLowerCase();
    const phone = (item.phone || '').toLowerCase();
    const matchesSearch = !searchQuery || name.includes(searchQuery) || email.includes(searchQuery) || phone.includes(searchQuery);

    return matchesBus && matchesSearch;
  });

  if (filtered.length === 0) {
    emptyState.classList.remove('d-none');
    recordsSummary.textContent = `Showing 0 bookings`;
    return;
  }

  emptyState.classList.add('d-none');
  recordsSummary.textContent = `Showing ${filtered.length} of ${allBookings.length} booking(s)`;

  filtered.forEach((passenger, index) => {
    const tr = document.createElement('tr');
    tr.className = 'fade-in-row';

    // Badge styling by bus type
    let busBadgeClass = 'bus-badge-1';
    if (passenger.busNo === 'Bus 2') busBadgeClass = 'bus-badge-2';
    if (passenger.busNo === 'Bus 3') busBadgeClass = 'bus-badge-3';

    tr.innerHTML = `
      <td class="ps-4">
        <span class="passenger-serial">${index + 1}</span>
      </td>
      <td>
        <span class="passenger-name">${escapeHtml(passenger.name)}</span>
        <small class="text-muted"><i class="bi bi-clock me-1"></i>Confirmed</small>
      </td>
      <td>
        <div class="passenger-contact">
          <span class="contact-item"><i class="bi bi-envelope"></i> ${escapeHtml(passenger.email)}</span>
          <span class="contact-item"><i class="bi bi-telephone"></i> ${escapeHtml(passenger.phone)}</span>
        </div>
      </td>
      <td>
        <span class="bus-badge ${busBadgeClass}">
          <i class="bi bi-bus-front"></i> ${escapeHtml(passenger.busNo)}
        </span>
      </td>
      <td class="text-end pe-4">
        <div class="d-inline-flex gap-2">
          <button class="btn-action-edit" onclick="handleEditBooking('${passenger._id}')" title="Edit Ticket">
            <i class="bi bi-pencil-square me-1"></i> Edit
          </button>
          <button class="btn-action-delete" onclick="handleDeleteBooking('${passenger._id}', '${escapeHtml(passenger.name)}')" title="Delete Ticket">
            <i class="bi bi-trash3 me-1"></i> Delete
          </button>
        </div>
      </td>
    `;

    passengerTableBody.appendChild(tr);
  });
}

/**
 * Updates quick stats counters
 */
function updateStatistics() {
  const total = allBookings.length;
  const bus1 = allBookings.filter(b => b.busNo === 'Bus 1').length;
  const bus2 = allBookings.filter(b => b.busNo === 'Bus 2').length;
  const bus3 = allBookings.filter(b => b.busNo === 'Bus 3').length;

  statTotal.textContent = total;
  statBus1.textContent = bus1;
  statBus2.textContent = bus2;
  statBus3.textContent = bus3;
}

/**
 * Escape HTML strings for security
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// Form & Edit State Management
// ============================================================

/**
 * Initiate Edit Mode
 */
window.handleEditBooking = function(id) {
  const passenger = allBookings.find(item => item._id === id);
  if (!passenger) return;

  isEditing = true;
  currentEditId = id;

  bookingIdInput.value = passenger._id;
  passengerNameInput.value = passenger.name || '';
  passengerEmailInput.value = passenger.email || '';
  passengerPhoneInput.value = passenger.phone || '';
  busSelect.value = passenger.busNo || '';

  // Update UI to edit mode
  formTitle.innerHTML = '<i class="bi bi-pencil-square text-warning me-2"></i>Update Ticket';
  editBadge.classList.remove('d-none');
  submitBtn.className = 'btn btn-warning py-2 fw-semibold rounded-3 shadow-sm text-dark';
  submitBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Update Ticket';
  cancelEditBtn.classList.remove('d-none');

  // Smooth scroll to form
  bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

/**
 * Delete handler attached to window for inline onclick
 */
window.handleDeleteBooking = function(id, name) {
  deleteBooking(id, name);
};

/**
 * Reset form and restore "Book Ticket" state
 */
function resetForm() {
  bookingForm.reset();
  bookingForm.classList.remove('was-validated');
  resetEditState();
}

/**
 * Reset edit mode UI elements
 */
function resetEditState() {
  isEditing = false;
  currentEditId = null;
  bookingIdInput.value = '';

  formTitle.innerHTML = '<i class="bi bi-person-plus-fill text-primary me-2"></i>Book Bus Ticket';
  editBadge.classList.add('d-none');
  submitBtn.className = 'btn btn-primary py-2 fw-semibold rounded-3 shadow-sm';
  submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Book Ticket';
  cancelEditBtn.classList.add('d-none');
}

// ============================================================
// Event Listeners
// ============================================================

// Form Submit (Create or Update)
bookingForm.addEventListener('submit', function(e) {
  e.preventDefault();

  if (!bookingForm.checkValidity()) {
    e.stopPropagation();
    bookingForm.classList.add('was-validated');
    return;
  }

  const payload = {
    name: passengerNameInput.value.trim(),
    email: passengerEmailInput.value.trim(),
    phone: passengerPhoneInput.value.trim(),
    busNo: busSelect.value
  };

  if (isEditing && currentEditId) {
    updateBooking(currentEditId, payload);
  } else {
    createBooking(payload);
  }
});

// Cancel Edit Button
cancelEditBtn.addEventListener('click', function() {
  resetForm();
  showToast('Edit mode cancelled.', 'info');
});

// Bus Filter Change
busFilter.addEventListener('change', function() {
  renderBookings();
});

// Search Input (Real-time live search)
searchInput.addEventListener('input', function() {
  renderBookings();
});

// Refresh Button
refreshBtn.addEventListener('click', function() {
  fetchBookings();
  showToast('Bookings refreshed from cloud.', 'info');
});


