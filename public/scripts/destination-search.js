document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('destinationSearchForm');
    const destinationInput = document.getElementById('destinationInput');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    // Supported destinations
    const destinations = {
        'shimla': 'destinations/shimla.html',
        'goa': 'destinations/goa.html'
    };
    
    // Show suggestions
    destinationInput.addEventListener('input', function() {
        const input = this.value.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';
        
        if (input.length > 0) {
            const matches = Object.keys(destinations).filter(dest => 
                dest.includes(input)
            );
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'search-suggestion-item';
                    suggestion.textContent = match.charAt(0).toUpperCase() + match.slice(1);
                    suggestion.addEventListener('click', function() {
                        destinationInput.value = this.textContent;
                        searchForm.dispatchEvent(new Event('submit'));
                    });
                    suggestionsContainer.appendChild(suggestion);
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const destination = destinationInput.value.trim().toLowerCase();
        
        if (destinations[destination]) {
            window.location.href = destinations[destination];
        } else {
            // Show error message
            const error = document.createElement('div');
            error.className = 'search-error';
            error.textContent = 'Destination not found. Currently we support: ' + 
                Object.keys(destinations).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.appendChild(error);
            suggestionsContainer.style.display = 'block';
            
            // Hide after 3 seconds
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 3000);
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Keyboard navigation for suggestions
    destinationInput.addEventListener('keydown', function(e) {
        const suggestions = document.querySelectorAll('.search-suggestion-item');
        let highlighted = document.querySelector('.search-suggestion-item.highlighted');
        
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!highlighted) {
                    suggestions[0].classList.add('highlighted');
                } else {
                    highlighted.classList.remove('highlighted');
                    const next = highlighted.nextElementSibling || suggestions[0];
                    next.classList.add('highlighted');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (highlighted) {
                    highlighted.classList.remove('highlighted');
                    const prev = highlighted.previousElementSibling || suggestions[suggestions.length - 1];
                    prev.classList.add('highlighted');
                }
            } else if (e.key === 'Enter' && highlighted) {
                e.preventDefault();
                destinationInput.value = highlighted.textContent;
                searchForm.dispatchEvent(new Event('submit'));
            }
        }
    });
});