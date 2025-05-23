const container = document.getElementById('viewItineraryContainer');

function renderSavedItinerary() {
  container.innerHTML = '';  // Clear previous content

  const savedData = localStorage.getItem('savedItinerary');
  if (!savedData) {
    container.innerHTML = '<p class="no-itinerary-msg">No itinerary found. Please build and save an itinerary first.</p>';
    return;
  }

  const itinerary = JSON.parse(savedData);

  // Create header section with improved spacing
  const header = document.createElement('div');
  header.className = 'itinerary-header';
  header.innerHTML = `
    <div class="trip-info">
      <p><strong>Destination:</strong> ${itinerary.destination}</p>
      <p class="trip-dates">
        <strong>From:</strong> ${new Date(itinerary.startDate).toLocaleDateString()} 
        <strong>To:</strong> ${new Date(itinerary.endDate).toLocaleDateString()}
      </p>
    </div>
  `;
  container.appendChild(header);

  // Create days container
  const daysContainer = document.createElement('div');
  daysContainer.className = 'days-container';

  // For each day, create a day column with activities
  Object.entries(itinerary.dayWiseActivities).forEach(([day, activities]) => {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-column';

    const dayHeader = document.createElement('h2');
    dayHeader.className = 'day-header';
    dayHeader.textContent = `Day ${day}`;

    dayDiv.appendChild(dayHeader);

    if (activities.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-day-msg';
      emptyMsg.textContent = 'No activities added for this day.';
      dayDiv.appendChild(emptyMsg);
    } else {
      activities.forEach(act => {
        const actDiv = document.createElement('div');
        actDiv.className = 'activity-item';
        actDiv.innerHTML = `
          <h3>${act.name}</h3>
          <div class="activity-meta">
            <span class="activity-cost">Cost: ₹${act.cost}</span>
            <span class="activity-duration">${act.duration}</span>
          </div>
          <p class="activity-location">📍 ${act.location}</p>
        `;
        dayDiv.appendChild(actDiv);
      });
    }

    daysContainer.appendChild(dayDiv);
  });

  container.appendChild(daysContainer);
}

document.addEventListener('DOMContentLoaded', () => {
  renderSavedItinerary();
});