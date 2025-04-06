// itinerary.js
// Configuration
const DEBUG_MODE = true;

// DOM Elements
const dom = {
  destination: document.getElementById('destination'),
  startDate: document.getElementById('startDate'),
  endDate: document.getElementById('endDate'),
  fetchBtn: document.getElementById('fetchActivities'),
  suggestions: document.getElementById('suggestions'),
  daysContainer: document.getElementById('daysContainer')
};

// State
let tripData = {
  destination: null,
  startDate: null,
  endDate: null,
  days: null
};

// Initialize
function init() {
  const today = new Date().toISOString().split('T')[0];
  dom.startDate.value = today;
  dom.endDate.min = today;
  
  if (DEBUG_MODE) console.log('Initialized date inputs');
}

// Date Calculations
function calculateTripDuration() {
  const start = new Date(tripData.startDate);
  const end = new Date(tripData.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

// DOM Manipulation
function createActivityElement(activity, index) {
  const template = document.createElement('template');
  template.innerHTML = `
    <div class="activity-item" 
         draggable="true" 
         data-activity-id="activity-${index}"
         data-cost="${activity.cost}"
         data-duration="${activity.duration}">
      <div class="activity-header">
        <h4>${activity.name}</h4>
        <span class="activity-price">$${activity.cost}</span>
      </div>
      <div class="activity-meta">
        <span class="duration">${activity.duration}</span>
        <span class="location">${activity.location}</span>
      </div>
    </div>
  `;
  return template.content.firstElementChild;
}

function createDayColumn(dayNumber) {
  const dayDiv = document.createElement('div');
  dayDiv.className = 'day-column';
  dayDiv.innerHTML = `
    <div class="day-header">
      <h3>Day ${dayNumber}</h3>
      <span class="date">${calculateDate(dayNumber)}</span>
    </div>
    <div class="activities-list" data-day="${dayNumber}"></div>
  `;
  return dayDiv;
}

// Data Handling
async function fetchDestinationData() {
  try {
    clearUI();
    validateInputs();

    const response = await fetch(
      `http://localhost:3000/api/destination/${encodeURIComponent(tripData.destination)}`
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    if (DEBUG_MODE) console.log('API Response:', data);

    renderActivities(data.activities);
    renderDayColumns();

  } catch (error) {
    handleError(error);
  }
}

// Event Handlers
function handleDragStart(e) {
  if (e.target.classList.contains('activity-item')) {
    e.dataTransfer.setData('text/plain', e.target.dataset.activityId);
    e.target.classList.add('dragging');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const activityId = e.dataTransfer.getData('text/plain');
  const dropZone = e.target.closest('.activities-list');

  if (dropZone) {
    const original = document.querySelector(`[data-activity-id="${activityId}"]`);
    if (!original) return;

    const clone = original.cloneNode(true);
    clone.classList.remove('dragging');
    clone.draggable = true;
    setupDragEvents(clone);
    
    dropZone.appendChild(clone);
    if (DEBUG_MODE) console.log(`Activity ${activityId} added to Day ${dropZone.dataset.day}`);
  }
}

// Helpers
function clearUI() {
  dom.suggestions.innerHTML = '';
  dom.daysContainer.innerHTML = '';
}

function validateInputs() {
  tripData = {
    destination: dom.destination.value.trim(),
    startDate: dom.startDate.value,
    endDate: dom.endDate.value
  };

  if (!tripData.destination || !tripData.startDate || !tripData.endDate) {
    throw new Error('Please fill all required fields');
  }

  if (new Date(tripData.startDate) > new Date(tripData.endDate)) {
    throw new Error('End date cannot be before start date');
  }
}

function renderActivities(activities) {
  if (!activities || !activities.length) {
    throw new Error('No activities found for this destination');
  }

  activities.forEach((activity, index) => {
    dom.suggestions.appendChild(createActivityElement(activity, index));
  });
}

function renderDayColumns() {
  tripData.days = calculateTripDuration();
  
  for (let i = 1; i <= tripData.days; i++) {
    dom.daysContainer.appendChild(createDayColumn(i));
  }
}

function setupDragEvents(element) {
  element.addEventListener('dragstart', handleDragStart);
  element.addEventListener('dragend', (e) => 
    e.target.classList.remove('dragging'));
}

function handleError(error) {
  console.error('Error:', error);
  alert(`Error: ${error.message}`);
}

function calculateDate(dayNumber) {
    const date = new Date(tripData.startDate);
    date.setDate(date.getDate() + (dayNumber - 1));
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

// Event Listeners
document.addEventListener('DOMContentLoaded', init);
dom.fetchBtn.addEventListener('click', fetchDestinationData);
dom.startDate.addEventListener('change', () => {
  dom.endDate.min = dom.startDate.value;
});

document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', handleDrop);