// Travel Journal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const createJournalBtn = document.getElementById('create-journal-btn');
    const journalModal = document.getElementById('create-journal-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelJournalBtn = document.getElementById('cancel-journal');
    const journalForm = document.getElementById('journal-form');
    const journalCover = document.getElementById('journal-cover');
    const coverPreview = document.getElementById('cover-preview');
    const newJournalCard = document.querySelector('.new-journal');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const editButtons = document.querySelectorAll('.edit-btn');
    const shareButtons = document.querySelectorAll('.share-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const sortJournals = document.getElementById('sort-journals');
    const filterJournals = document.getElementById('filter-journals');
    const searchJournals = document.getElementById('search-journals');
    
    // Testimonial elements
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let currentSlide = 0;
    
    // Initialize
    init();
    
    function init() {
        // Set default dates for the form
        if (document.getElementById('travel-start')) {
            const today = new Date();
            document.getElementById('travel-start').valueAsDate = today;
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('travel-end').valueAsDate = tomorrow;
        }
        
        // Add event listeners
        addEventListeners();
        
        // Add animation to journal cards
        animateJournalCards();
    }
    
    function addEventListeners() {
        // Create journal button
        if (createJournalBtn) {
            createJournalBtn.addEventListener('click', function() {
                openModal(journalModal);
            });
        }
        
        // New journal card click
        if (newJournalCard) {
            newJournalCard.addEventListener('click', function() {
                openModal(journalModal);
            });
        }
        
        // Close modal button
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                closeModal(journalModal);
            });
        }
        
        // Cancel button in form
        if (cancelJournalBtn) {
            cancelJournalBtn.addEventListener('click', function() {
                closeModal(journalModal);
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === journalModal) {
                closeModal(journalModal);
            }
        });
        
        // Journal form submission
        if (journalForm) {
            journalForm.addEventListener('submit', handleJournalFormSubmit);
        }
        
        // File upload preview
        if (journalCover) {
            journalCover.addEventListener('change', function() {
                handleFilePreview(this, coverPreview);
            });
        }
        
        // Mobile menu toggle
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
            });
        }
        
        // Sort, filter, and search
        if (sortJournals) {
            sortJournals.addEventListener('change', function() {
                sortJournalCards(this.value);
            });
        }
        
        if (filterJournals) {
            filterJournals.addEventListener('change', function() {
                filterJournalCards(this.value);
            });
        }
        
        if (searchJournals) {
            searchJournals.addEventListener('input', function() {
                searchJournalCards(this.value);
            });
        }
        
        // Journal card action buttons
        editButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const journalCard = this.closest('.journal-card');
                editJournal(journalCard);
            });
        });
        
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const journalCard = this.closest('.journal-card');
                shareJournal(journalCard);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const journalCard = this.closest('.journal-card');
                deleteJournal(journalCard);
            });
        });
    }
    
    // Animation Functions
    function animateJournalCards() {
        const journalCards = document.querySelectorAll('.journal-card');
        journalCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }
    
    // Modal Functions
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Form Handling
    function handleJournalFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const title = document.getElementById('journal-title').value;
        const startDate = document.getElementById('travel-start').value;
        const endDate = document.getElementById('travel-end').value;
        const destination = document.getElementById('journal-destination').value;
        const description = document.getElementById('journal-description').value;
        const privacy = document.querySelector('input[name="privacy"]:checked').value;
        const coverFile = journalCover.files[0];
        
        // Validate form
        if (!title || !startDate || !endDate || !destination || !description) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Create new journal
        createNewJournal({
            title,
            startDate,
            endDate,
            destination,
            description,
            privacy,
            coverFile
        });
        
        // Close modal and reset form
        closeModal(journalModal);
        journalForm.reset();
        coverPreview.style.display = 'none';
        coverPreview.innerHTML = '';
        
        showNotification('Memory created successfully!', 'success');
    }
    
    // File Preview
    function handleFilePreview(input, previewElement) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                previewElement.style.display = 'block';
            };
            
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    // Journal CRUD Operations
    function createNewJournal(data) {
        // In a real app, this would send data to a server
        console.log('Creating new memory:', data);
        
        // For demo purposes, create a new journal card and add it to the grid
        const journalsGrid = document.querySelector('.journals-grid');
        const newJournalCardElement = document.querySelector('.new-journal');
        
        // Create cover image URL (either from file or placeholder)
        let coverUrl = '/placeholder.svg?height=200&width=350';
        if (data.coverFile) {
            coverUrl = URL.createObjectURL(data.coverFile);
        }
        
        // Format date range
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const dateRange = formatDateRange(startDate, endDate);
        
        // Create new journal card
        const newCard = document.createElement('div');
        newCard.className = 'journal-card';
        newCard.style.opacity = '0';
        newCard.style.transform = 'translateY(20px)';
        
        newCard.innerHTML = `
            <div class="journal-cover">
                <img src="${coverUrl}" alt="${data.title}">
                <div class="journal-status ${data.privacy}">
                    <i class="fas fa-${data.privacy === 'private' ? 'lock' : 'users'}"></i>
                </div>
                <div class="journal-date">
                    <span>${dateRange}</span>
                </div>
            </div>
            <div class="journal-info">
                <h3>${data.title}</h3>
                <div class="journal-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${data.destination}</span>
                    <span><i class="fas fa-image"></i> 0 Photos</span>
                </div>
                <p>${data.description}</p>
                <div class="journal-actions">
                    <button class="action-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-btn share-btn"><i class="fas fa-share-alt"></i> Share</button>
                    <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        // Add event listeners to the new card's buttons
        const editBtn = newCard.querySelector('.edit-btn');
        const shareBtn = newCard.querySelector('.share-btn');
        const deleteBtn = newCard.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            editJournal(newCard);
        });
        
        shareBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            shareJournal(newCard);
        });
        
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteJournal(newCard);
        });
        
        // Insert the new card before the "Create New Journal" card
        journalsGrid.insertBefore(newCard, newJournalCardElement);
        
        // Animate the new card
        setTimeout(() => {
            newCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            newCard.style.opacity = '1';
            newCard.style.transform = 'translateY(0)';
        }, 10);
    }
    
    function editJournal(journalCard) {
        const title = journalCard.querySelector('h3').textContent;
        showNotification(`Editing memory: ${title}`, 'info');
        // In a real app, this would open an edit form with the journal data
    }
    
    function shareJournal(journalCard) {
        const title = journalCard.querySelector('h3').textContent;
        
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: title,
                text: 'Check out my travel memory!',
                url: window.location.href
            })
            .then(() => showNotification('Memory shared successfully!', 'success'))
            .catch(() => showNotification('Error sharing memory', 'error'));
        } else {
            // Fallback for browsers that don't support Web Share API
            showNotification(`Sharing memory: ${title}`, 'info');
            // In a real app, this would show sharing options
        }
    }
    
    function deleteJournal(journalCard) {
        const title = journalCard.querySelector('h3').textContent;
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            // Remove the card with animation
            journalCard.style.opacity = '0';
            journalCard.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                journalCard.remove();
                showNotification('Memory deleted successfully', 'success');
            }, 300);
        }
    }
    
    // Filter, Sort, and Search Functions
    function sortJournalCards(sortBy) {
        const journalsGrid = document.querySelector('.journals-grid');
        const journalCards = Array.from(journalsGrid.querySelectorAll('.journal-card:not(.new-journal)'));
        
        // Sort the cards based on the selected option
        journalCards.sort((a, b) => {
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;
            
            if (sortBy === 'name-asc') {
                return titleA.localeCompare(titleB);
            } else if (sortBy === 'name-desc') {
                return titleB.localeCompare(titleA);
            } else if (sortBy === 'recent') {
                // In a real app, this would sort by date
                return -1; // Default to newest first
            } else if (sortBy === 'oldest') {
                // In a real app, this would sort by date
                return 1; // Default to oldest first
            }
            
            return 0;
        });
        
        // Remove all cards from the grid
        journalCards.forEach(card => card.remove());
        
        // Get the "Create New Journal" card
        const newJournalCardElement = journalsGrid.querySelector('.new-journal');
        
        // Add the sorted cards back to the grid
        journalCards.forEach(card => {
            journalsGrid.insertBefore(card, newJournalCardElement);
        });
    }
    
    function filterJournalCards(filterBy) {
        const journalCards = document.querySelectorAll('.journal-card:not(.new-journal)');
        
        journalCards.forEach(card => {
            const statusElement = card.querySelector('.journal-status');
            const isPrivate = statusElement.classList.contains('private');
            
            if (filterBy === 'all') {
                card.style.display = 'flex';
            } else if (filterBy === 'private' && isPrivate) {
                card.style.display = 'flex';
            } else if (filterBy === 'shared' && !isPrivate) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    function searchJournalCards(searchTerm) {
        const journalCards = document.querySelectorAll('.journal-card:not(.new-journal)');
        const term = searchTerm.toLowerCase();
        
        journalCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const location = card.querySelector('.journal-meta span:first-child').textContent.toLowerCase();
            
            if (title.includes(term) || description.includes(term) || location.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Utility Functions
    function formatDateRange(startDate, endDate) {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        
        if (startDate.getFullYear() === endDate.getFullYear()) {
            if (startDate.getMonth() === endDate.getMonth()) {
                return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
            } else {
                return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${startDate.getFullYear()}`;
            }
        } else {
            return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
        }
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Create icon based on notification type
        let icon = '';
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle"></i>';
        } else if (type === 'error') {
            icon = '<i class="fas fa-exclamation-circle"></i>';
        } else if (type === 'info') {
            icon = '<i class="fas fa-info-circle"></i>';
        }
        
        notification.innerHTML = `${icon} <span>${message}</span>`;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '8px';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.3s ease';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        
        // Set background color based on notification type
        if (type === 'success') {
            notification.style.backgroundColor = '#4caf50';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#f44336';
        } else if (type === 'info') {
            notification.style.backgroundColor = '#2196f3';
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});