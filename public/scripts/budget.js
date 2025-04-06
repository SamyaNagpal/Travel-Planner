// DOM Elements
const calculateBtn = document.querySelector('.calculate-btn');
const destinationInput = document.getElementById('destinationInput');
const startDateEl = document.getElementById('startDate');
const endDateEl = document.getElementById('endDate');

// Date Validation
startDateEl.addEventListener('change', () => {
  endDateEl.min = startDateEl.value;
});

// Calculate Days Between Dates
function getNumberOfDays(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate - startDate;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Include both days
}

// Fetch Data and Calculate
async function calculateBudget() {
  const loader = document.getElementById('loader');
  
  try {
    // Show loader
    loader.style.display = 'block';
    
    const destination = destinationInput.value.trim();
    if (!destination) {
      alert('Please enter a destination');
      return;
    }

    // Fetch data from backend
    const response = await fetch(`http://localhost:3000/api/destination/${encodeURIComponent(destination)}`);
    if (!response.ok) throw new Error('Destination not found');
    
    const data = await response.json();

    // Calculate days
    const days = getNumberOfDays(startDateEl.value, endDateEl.value);
    
    // Calculate costs
    const hotelCost = data.hotelAvg * days;
    const foodCost = data.foodAvg * days;
    const transportCost = data.transportAvg * days;
    const total = hotelCost + foodCost + transportCost;

    // Update UI
    document.getElementById('hotelCost').textContent = `$${hotelCost}`;
    document.getElementById('foodCost').textContent = `$${foodCost}`;
    document.getElementById('transportCost').textContent = `$${transportCost}`;
    document.getElementById('totalCost').textContent = `$${total}`;

  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    // Always hide loader
    loader.style.display = 'none';
  }
}

// Event Listeners
calculateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  calculateBudget();
});

// Initialize default dates
const today = new Date().toISOString().split('T')[0];
startDateEl.value = today;
endDateEl.min = today;