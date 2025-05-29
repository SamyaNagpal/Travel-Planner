const DEBUG_MODE = true;

// DOM Elements
const dom = {
  destination: document.getElementById('destination'),
  startDate: document.getElementById('startDate'),
  endDate: document.getElementById('endDate'),
  fetchBtn: document.getElementById('fetchActivities'),
  suggestions: document.getElementById('suggestions'),
  daysContainer: document.getElementById('daysContainer'),
  saveBtn: document.getElementById('saveItinerary')
};

// State
let tripData = {
  destination: null,
  startDate: null,
  endDate: null,
  days: null,
  dayWiseActivities: {}
};

function init() {
  const today = new Date().toISOString().split('T')[0];
  dom.startDate.value = today;
  dom.endDate.min = today;
  if (DEBUG_MODE) console.log('Initialized date inputs');
}

function calculateTripDuration() {
  const start = new Date(tripData.startDate);
  const end = new Date(tripData.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
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

function createActivityElement(activity, id, showRemoveBtn = true) {
  const template = document.createElement('template');
  template.innerHTML = `
    <div class="activity-item" 
         draggable="true" 
         data-activity-id="${id}"
         data-cost="${activity.cost}"
         data-duration="${activity.duration}">
      <div class="activity-header">
        <h4>${activity.name}</h4>
        <span class="activity-price">₹${activity.cost}</span>
        ${showRemoveBtn ? `<button class="remove-btn" title="Remove">×</button>` : ''}
      </div>
      <div class="activity-meta">
        <span class="duration">${activity.duration}</span>
        <span class="location">${activity.location}</span>
      </div>
    </div>
  `.trim();
  const el = template.content.firstElementChild;
  setupDragEvents(el);

  if (showRemoveBtn) {
    setupRemoveEvent(el);
  }

  return el;
}


function setupRemoveEvent(element) {
  const removeBtn = element.querySelector('.remove-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      const parent = element.closest('.activities-list');
      const day = parent.dataset.day;
      const id = element.dataset.activityId;

      element.remove();
      tripData.dayWiseActivities[day] = tripData.dayWiseActivities[day].filter(a => a.id !== id);

      saveItinerary();

      if (DEBUG_MODE) console.log(`Removed activity ${id} from day ${day}`);
    });
  }
}

function createDayColumn(dayNumber) {
  const dayDiv = document.createElement('div');
  dayDiv.className = 'day-column';
  const dateStr = calculateDate(dayNumber);

  dayDiv.innerHTML = `
    <div class="day-header" style="cursor: pointer;">
      <h3>Day ${dayNumber}</h3>
      <span class="date">${dateStr}</span>
    </div>
    <div class="activities-list" data-day="${dayNumber}" style="min-height: 50px; border: 1px dashed #ccc; margin-top: 5px; padding: 16px;"></div>
  `.trim();

  const activitiesList = dayDiv.querySelector('.activities-list');
  const header = dayDiv.querySelector('.day-header');

  activitiesList.addEventListener('dragover', (e) => e.preventDefault());
  activitiesList.addEventListener('drop', handleDrop);

  header.addEventListener('click', () => {
    activitiesList.classList.toggle('expanded');
    activitiesList.style.display = activitiesList.classList.contains('expanded') ? 'block' : 'none';
  });

  header.addEventListener('mouseenter', () => {
    if (activitiesList.children.length > 0 && !activitiesList.classList.contains('expanded')) {
      activitiesList.classList.add('hover-visible');
    }
  });

  header.addEventListener('mouseleave', () => {
    activitiesList.classList.remove('hover-visible');
  });

  return dayDiv;
}

function renderActivities(activities) {
  if (!activities || !activities.length) {
    throw new Error('No activities found for this destination');
  }

  dom.suggestions.innerHTML = '';
  activities.forEach((activity, index) => {
    const id = activity.id || (activity.name + '-' + index);
    // hide remove button for suggested activities
    const activityEl = createActivityElement(activity, id, false);
    dom.suggestions.appendChild(activityEl);
  });
}


function renderDayColumns() {
  tripData.days = calculateTripDuration();
  dom.daysContainer.innerHTML = '';

  if (!tripData.dayWiseActivities || Object.keys(tripData.dayWiseActivities).length === 0) {
    tripData.dayWiseActivities = {};
    for (let i = 1; i <= tripData.days; i++) {
      tripData.dayWiseActivities[i.toString()] = [];
    }
  }

  for (let i = 1; i <= tripData.days; i++) {
    dom.daysContainer.appendChild(createDayColumn(i));
  }
}

function handleDragStart(e) {
  if (e.target.classList.contains('activity-item')) {
    if (!dom.suggestions.contains(e.target)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', e.target.dataset.activityId);
    e.target.classList.add('dragging');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const activityId = e.dataTransfer.getData('text/plain');
  const dropZone = e.currentTarget;
  if (!dropZone) return;

  const original = dom.suggestions.querySelector(`[data-activity-id="${activityId}"]`);
  if (!original) {
    if (DEBUG_MODE) console.log("Original activity not found in suggestions:", activityId);
    return;
  }

  const dayNumber = dropZone.dataset.day;
  const dayKey = dayNumber.toString();

  const alreadyAdded = tripData.dayWiseActivities[dayKey]?.some(act => act.id === activityId);
  if (alreadyAdded) {
    alert("This activity is already added to Day " + dayNumber);
    return;
  }

  const clone = original.cloneNode(true);
  clone.classList.remove('dragging');
  clone.draggable = true;

  setupDragEvents(clone);
  setupRemoveEvent(clone);

  dropZone.appendChild(clone);

  if (dropZone.style.display === 'none') {
    dropZone.style.display = 'block';
  }

  const activityData = {
    id: activityId,
    name: original.querySelector('h4')?.textContent ?? '',
    cost: original.dataset.cost,
    duration: original.dataset.duration,
    location: original.querySelector('.location')?.textContent ?? ''
  };

  if (!tripData.dayWiseActivities[dayKey]) tripData.dayWiseActivities[dayKey] = [];
  tripData.dayWiseActivities[dayKey].push(activityData);

  if (DEBUG_MODE) {
    console.log(`Activity ${activityId} added to Day ${dayKey}`);
    console.log('Current tripData.dayWiseActivities:', tripData.dayWiseActivities);
  }
}

function setupDragEvents(element) {
  element.addEventListener('dragstart', handleDragStart);
  element.addEventListener('dragend', (e) => e.target.classList.remove('dragging'));
}

async function fetchDestinationData() {
  try {
    clearUI();
    validateInputs();

    // Try loading saved itinerary from localStorage
    const saved = localStorage.getItem('savedItinerary');
    let itineraryLoaded = false;

    if (saved) {
      const savedData = JSON.parse(saved);
      if (
        savedData.destination?.toLowerCase() === tripData.destination.toLowerCase() &&
        savedData.startDate === tripData.startDate &&
        savedData.endDate === tripData.endDate
      ) {
        // Load saved itinerary into tripData
        tripData = savedData;

        renderDayColumns();

        // Render saved day-wise activities
        Object.entries(tripData.dayWiseActivities).forEach(([day, activities]) => {
          const container = document.querySelector(`.activities-list[data-day="${day}"]`);
          if (container) {
            container.innerHTML = '';
            activities.forEach((act, index) => {
              const el = createActivityElement(act, `${day}-${index}`);
              container.appendChild(el);
            });
            container.classList.add('expanded');
            container.style.display = 'block';
          }
        });

        // Render suggested activities if any
        if (tripData.suggestedActivities) {
          renderActivities(tripData.suggestedActivities);
        }

        itineraryLoaded = true;
        if (DEBUG_MODE) console.log('Loaded saved itinerary.');
      }
    }

    // If no saved itinerary found, fetch fresh data
    if (!itineraryLoaded) {
      const response = await fetch(
        `http://localhost:3001/api/destination/${encodeURIComponent(tripData.destination)}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (DEBUG_MODE) console.log('API Response:', data);

      renderDayColumns();
      renderActivities(data.activities);
      tripData.suggestedActivities = data.activities;

      // Initialize empty dayWiseActivities for new itinerary
      tripData.dayWiseActivities = {};
      for (let i = 1; i <= tripData.days; i++) {
        tripData.dayWiseActivities[i.toString()] = [];
      }
    }

    // Note: DO NOT call saveItinerary() here to avoid overwriting saved data

  } catch (error) {
    handleError(error);
  }
}


function handleError(error) {
  console.error('Error:', error);
  alert(`Error: ${error.message}`);
}

function saveItinerary() {
  if (!tripData.dayWiseActivities || Object.keys(tripData.dayWiseActivities).length === 0) {
    alert("Please build your itinerary before saving.");
    return;
  }

  const savedItinerary = {
    destination: tripData.destination,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    days: tripData.days,
    dayWiseActivities: tripData.dayWiseActivities,
    suggestedActivities: tripData.suggestedActivities || []
  };

  try {
    localStorage.setItem('savedItinerary', JSON.stringify(savedItinerary));
    alert('Itinerary saved successfully!');
    if (DEBUG_MODE) console.log('Saved Itinerary:', savedItinerary);
  } catch (err) {
    console.error('Save failed:', err);
    alert('Failed to save itinerary.');
  }
}

function loadSavedItinerary() {
  const saved = localStorage.getItem('savedItinerary');
  if (!saved) return;

  try {
    const itinerary = JSON.parse(saved);
    tripData = itinerary;

    if (dom.destination) dom.destination.value = tripData.destination;
    if (dom.startDate) dom.startDate.value = tripData.startDate;
    if (dom.endDate) dom.endDate.value = tripData.endDate;

    renderDayColumns();

    Object.entries(itinerary.dayWiseActivities).forEach(([day, activities]) => {
      const container = document.querySelector(`.activities-list[data-day="${day}"]`);
      if (container) {
        container.innerHTML = '';
        activities.forEach((act, i) => {
          const id = act.id || `${day}-${i}`;
          act.id = id; // ensure id is consistent
          const el = createActivityElement(act, id);
          container.appendChild(el);
        });

        container.classList.add('expanded');
        container.style.display = 'block';
      }
    });

    if (itinerary.suggestedActivities) {
      tripData.suggestedActivities = itinerary.suggestedActivities;
      renderActivities(itinerary.suggestedActivities);
    }

    if (DEBUG_MODE) console.log("Loaded saved itinerary:", tripData.dayWiseActivities);
  } catch (err) {
    console.error("Failed to load saved itinerary:", err);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  init();
  loadSavedItinerary();
});

dom.fetchBtn.addEventListener('click', fetchDestinationData);
dom.startDate.addEventListener('change', () => {
  dom.endDate.min = dom.startDate.value;
});
document.addEventListener('dragover', e => e.preventDefault());
dom.saveBtn.addEventListener('click', saveItinerary);

const viewBtn = document.getElementById('viewItinerary');
viewBtn.addEventListener('click', () => {
  if (localStorage.getItem('savedItinerary')) {
    window.location.href = 'view-itinerary.html';
  } else {
    alert('Please save an itinerary first!');
  }
});
