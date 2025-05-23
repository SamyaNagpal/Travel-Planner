// Smart Packing Checklist JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const generateBtn = document.getElementById('generate-list');
    const packingList = document.getElementById('packing-list');
    const packingListSection = document.getElementById('packing-list-section');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const printBtn = document.getElementById('print-list');
    const saveBtn = document.getElementById('save-list');
    const shareBtn = document.getElementById('share-list');
    
    // Form elements
    const destinationSelect = document.getElementById('destination');
    const durationSelect = document.getElementById('duration');
    const seasonSelect = document.getElementById('season');
    const activitiesSelect = document.getElementById('activities');
    const considerationCheckboxes = document.querySelectorAll('input[name="considerations"]');
    
    // Generate packing list when button is clicked
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            // Validate form
            if (!validateForm()) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Get form values
            const destination = destinationSelect.value;
            const duration = durationSelect.value;
            const season = seasonSelect.value;
            const activities = activitiesSelect.value;
            const considerations = Array.from(considerationCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
            
            // Generate the packing list
            generatePackingList(destination, duration, season, activities, considerations);
            
            // Scroll to packing list section
            packingListSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Filter buttons functionality
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get filter value
                const filter = this.getAttribute('data-filter');
                
                // Filter items
                filterItems(filter);
            });
        });
    }
    
    // Print button functionality
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Save button functionality
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Check if user is logged in (this would be implemented with your authentication system)
            const isLoggedIn = false; // Replace with actual authentication check
            
            if (isLoggedIn) {
                savePackingList();
                showNotification('Packing list saved successfully!', 'success');
            } else {
                showNotification('Please log in to save your packing list.', 'error');
                // Optionally redirect to login page or show login modal
            }
        });
    }
    
    // Share button functionality
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'My SheTravels Packing List',
                    text: 'Check out my customized packing list for women travelers!',
                    url: window.location.href
                })
                .then(() => showNotification('Shared successfully!', 'success'))
                .catch(() => showNotification('Error sharing.', 'error'));
            } else {
                // Fallback for browsers that don't support the Web Share API
                copyToClipboard(window.location.href);
                showNotification('Link copied to clipboard!', 'success');
            }
        });
    }
    
    // Form validation
    function validateForm() {
        if (
            destinationSelect.value === '' ||
            durationSelect.value === '' ||
            seasonSelect.value === '' ||
            activitiesSelect.value === ''
        ) {
            return false;
        }
        return true;
    }
    
    // Generate packing list based on selections
    function generatePackingList(destination, duration, season, activities, considerations) {
        // Clear current list
        packingList.innerHTML = '';
        
        // Create packing list based on selections
        const packingItems = getPackingItems(destination, duration, season, activities, considerations);
        
        // Group items by category
        const groupedItems = groupItemsByCategory(packingItems);
        
        // Render items by category
        for (const category in groupedItems) {
            // Create category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'category-header';
            
            // Add appropriate icon based on category
            let iconClass = 'fa-suitcase';
            switch(category) {
                case 'Essentials':
                    iconClass = 'fa-star';
                    break;
                case 'Clothing':
                    iconClass = 'fa-tshirt';
                    break;
                case 'Toiletries':
                    iconClass = 'fa-pump-soap';
                    break;
                case 'Safety':
                    iconClass = 'fa-shield-alt';
                    break;
                case 'Tech':
                    iconClass = 'fa-mobile-alt';
                    break;
                case 'Documents':
                    iconClass = 'fa-passport';
                    break;
            }
            
            categoryHeader.innerHTML = `<i class="fas ${iconClass}"></i> ${category}`;
            packingList.appendChild(categoryHeader);
            
            // Create items for this category
            groupedItems[category].forEach(item => {
                const itemElement = createChecklistItem(item);
                packingList.appendChild(itemElement);
            });
        }
    }
    
    // Create a checklist item element
    function createChecklistItem(item) {
        const itemContainer = document.createElement('div');
        itemContainer.className = `checklist-item ${item.category.toLowerCase()}`;
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'item-checkbox';
        checkbox.id = `item-${item.id}`;
        
        // Create label
        const label = document.createElement('label');
        label.className = 'item-label';
        label.htmlFor = `item-${item.id}`;
        label.textContent = item.name;
        
        // Add tag if item is essential
        if (item.essential) {
            const tag = document.createElement('span');
            tag.className = 'item-tag';
            tag.textContent = 'Essential';
            label.appendChild(tag);
        }
        
        // Add elements to container
        itemContainer.appendChild(checkbox);
        itemContainer.appendChild(label);
        
        // Add note if present
        if (item.note) {
            const note = document.createElement('div');
            note.className = 'item-note';
            note.textContent = item.note;
            itemContainer.appendChild(note);
        }
        
        return itemContainer;
    }
    
    // Filter items based on category
    function filterItems(filter) {
        const items = document.querySelectorAll('.checklist-item');
        const headers = document.querySelectorAll('.category-header');
        
        if (filter === 'all') {
            // Show all items and headers
            items.forEach(item => item.style.display = 'flex');
            headers.forEach(header => header.style.display = 'flex');
        } else {
            // Show only items matching the filter
            items.forEach(item => {
                if (item.classList.contains(filter)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide headers based on whether they have visible items
            headers.forEach(header => {
                const categoryName = header.textContent.trim();
                const categoryLower = categoryName.toLowerCase();
                
                // Check if this category matches the filter
                if (categoryLower.includes(filter) || filter.includes(categoryLower)) {
                    header.style.display = 'flex';
                } else {
                    header.style.display = 'none';
                }
            });
        }
    }
    
    // Group items by category
    function groupItemsByCategory(items) {
        const grouped = {};
        
        items.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        
        return grouped;
    }
    
    // Save packing list (placeholder function)
    function savePackingList() {
        // This would connect to your backend to save the list
        console.log('Saving packing list...');
        
        // Example of data to save
        const checkedItems = Array.from(document.querySelectorAll('.item-checkbox:checked'))
            .map(checkbox => checkbox.id.replace('item-', ''));
        
        const listData = {
            destination: destinationSelect.value,
            duration: durationSelect.value,
            season: seasonSelect.value,
            activities: activitiesSelect.value,
            considerations: Array.from(considerationCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value),
            checkedItems: checkedItems,
            date: new Date().toISOString()
        };
        
        console.log('List data to save:', listData);
        
        // This would be an API call in a real application
        // fetch('/api/packing-lists', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(listData),
        // });
    }
    
    // Copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;
        
        // Add styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.fontWeight = '500';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.3s ease';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#4ecdc4';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ff6b6b';
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
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
    
    // Get packing items based on selections
    function getPackingItems(destination, duration, season, activities, considerations) {
        // This would ideally come from a database or API
        // For this example, we'll use a hardcoded list with conditional logic
        
        let items = [
            // Essentials - always included
            {
                id: 'passport',
                name: 'Passport',
                category: 'Documents',
                essential: true,
                note: 'Keep a digital copy in your email and a physical copy separate from the original'
            },
            {
                id: 'visa',
                name: 'Visa Documentation',
                category: 'Documents',
                essential: true
            },
            {
                id: 'insurance',
                name: 'Travel Insurance Documents',
                category: 'Documents',
                essential: true
            },
            {
                id: 'id',
                name: 'ID/Driver\'s License',
                category: 'Documents',
                essential: true
            },
            {
                id: 'money',
                name: 'Cash and Credit Cards',
                category: 'Essentials',
                essential: true,
                note: 'Keep in different locations; have at least two different payment methods'
            },
            {
                id: 'phone',
                name: 'Phone and Charger',
                category: 'Tech',
                essential: true
            },
            {
                id: 'medications',
                name: 'Prescription Medications',
                category: 'Essentials',
                essential: true,
                note: 'Keep in original packaging with prescription information'
            },
            {
                id: 'firstaid',
                name: 'Basic First Aid Kit',
                category: 'Safety',
                essential: true
            },
            {
                id: 'underwear',
                name: 'Underwear',
                category: 'Clothing',
                essential: true,
                note: duration === 'weekend' ? 'Pack 3-4 pairs' : 
                      duration === 'short' ? 'Pack 7-8 pairs' : 
                      'Pack 10+ pairs or plan to do laundry'
            },
            {
                id: 'socks',
                name: 'Socks',
                category: 'Clothing',
                essential: true
            },
            {
                id: 'toothbrush',
                name: 'Toothbrush and Toothpaste',
                category: 'Toiletries',
                essential: true
            },
            {
                id: 'deodorant',
                name: 'Deodorant',
                category: 'Toiletries',
                essential: true
            }
        ];
        
        // Add safety items for women travelers
        items.push(
            {
                id: 'doorstop',
                name: 'Door Stop Alarm',
                category: 'Safety',
                essential: true,
                note: 'Small portable door wedge with alarm for accommodation security'
            },
            {
                id: 'personalalarm',
                name: 'Personal Alarm',
                category: 'Safety',
                essential: true,
                note: 'Small alarm that emits loud sound to deter threats and attract attention'
            },
            {
                id: 'powerbank',
                name: 'Power Bank',
                category: 'Tech',
                essential: true,
                note: 'Keep your phone charged for emergencies'
            },
            {
                id: 'emergencycontacts',
                name: 'Emergency Contact List',
                category: 'Documents',
                essential: true,
                note: 'Include local embassy, hotel, and trusted contacts'
            }
        );
        
        // Add destination-specific items
        if (destination === 'beach') {
            items.push(
                {
                    id: 'swimsuit',
                    name: 'Swimsuit',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'sunscreen',
                    name: 'Sunscreen (SPF 30+)',
                    category: 'Toiletries',
                    essential: true,
                    note: 'Reapply every 2 hours when in the sun'
                },
                {
                    id: 'aftersun',
                    name: 'After-Sun Lotion',
                    category: 'Toiletries',
                    essential: false
                },
                {
                    id: 'beachcover',
                    name: 'Beach Cover-Up',
                    category: 'Clothing',
                    essential: false
                },
                {
                    id: 'flipflops',
                    name: 'Flip Flops/Sandals',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'beachtowel',
                    name: 'Beach Towel',
                    category: 'Essentials',
                    essential: false
                },
                {
                    id: 'sunglasses',
                    name: 'Sunglasses',
                    category: 'Essentials',
                    essential: true
                },
                {
                    id: 'hat',
                    name: 'Sun Hat',
                    category: 'Clothing',
                    essential: true
                }
            );
        }
        
        if (destination === 'mountain' || destination === 'cold') {
            items.push(
                {
                    id: 'warmjacket',
                    name: 'Warm Jacket/Coat',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'thermals',
                    name: 'Thermal Underwear',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'hikingboots',
                    name: 'Hiking Boots/Sturdy Shoes',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'woolsocks',
                    name: 'Wool Socks',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'gloves',
                    name: 'Gloves',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'scarf',
                    name: 'Scarf',
                    category: 'Clothing',
                    essential: false
                },
                {
                    id: 'beanie',
                    name: 'Beanie/Warm Hat',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'lipbalm',
                    name: 'Lip Balm with SPF',
                    category: 'Toiletries',
                    essential: true
                },
                {
                    id: 'sunscreen',
                    name: 'Sunscreen (SPF 30+)',
                    category: 'Toiletries',
                    essential: true,
                    note: 'UV exposure increases at higher altitudes'
                }
            );
        }
        
        // Season-specific items
        if (season === 'summer') {
            items.push(
                {
                    id: 'tshirts',
                    name: 'T-shirts/Tank Tops',
                    category: 'Clothing',
                    essential: true,
                    note: duration === 'weekend' ? 'Pack 2-3' : 
                          duration === 'short' ? 'Pack 4-5' : 
                          'Pack 7+ or plan to do laundry'
                },
                {
                    id: 'shorts',
                    name: 'Shorts',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'summerdresses',
                    name: 'Summer Dresses',
                    category: 'Clothing',
                    essential: false
                },
                {
                    id: 'sunscreen',
                    name: 'Sunscreen (SPF 30+)',
                    category: 'Toiletries',
                    essential: true
                },
                {
                    id: 'bugspray',
                    name: 'Insect Repellent',
                    category: 'Toiletries',
                    essential: true
                }
            );
        }
        
        if (season === 'winter') {
            items.push(
                {
                    id: 'wintercoat',
                    name: 'Winter Coat',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'sweaters',
                    name: 'Sweaters/Jumpers',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'thermals',
                    name: 'Thermal Layers',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'winterboots',
                    name: 'Winter Boots',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'moisturizer',
                    name: 'Heavy Moisturizer',
                    category: 'Toiletries',
                    essential: true,
                    note: 'For dry winter air'
                }
            );
        }
        
        if (season === 'monsoon' || season === 'rainy') {
            items.push(
                {
                    id: 'raincoat',
                    name: 'Raincoat/Poncho',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'umbrella',
                    name: 'Compact Umbrella',
                    category: 'Essentials',
                    essential: true
                },
                {
                    id: 'waterproofbag',
                    name: 'Waterproof Bag Cover',
                    category: 'Essentials',
                    essential: true
                },
                {
                    id: 'waterproofshoes',
                    name: 'Waterproof Shoes',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'quickdry',
                    name: 'Quick-Dry Clothing',
                    category: 'Clothing',
                    essential: true
                }
            );
        }
        
        // Activity-specific items
        if (activities === 'adventure') {
            items.push(
                {
                    id: 'activewear',
                    name: 'Activewear/Workout Clothes',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'sportsbra',
                    name: 'Sports Bras',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'hikingshoes',
                    name: 'Hiking/Athletic Shoes',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'waterbottle',
                    name: 'Reusable Water Bottle',
                    category: 'Essentials',
                    essential: true
                },
                {
                    id: 'firstaidextended',
                    name: 'Extended First Aid Kit',
                    category: 'Safety',
                    essential: true,
                    note: 'Include blister treatment, pain relievers, and bandages'
                }
            );
        }
        
        if (activities === 'business') {
            items.push(
                {
                    id: 'businessattire',
                    name: 'Business Attire',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'formalshoes',
                    name: 'Formal Shoes',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'laptop',
                    name: 'Laptop and Charger',
                    category: 'Tech',
                    essential: true
                },
                {
                    id: 'notebook',
                    name: 'Notebook and Pens',
                    category: 'Essentials',
                    essential: false
                },
                {
                    id: 'businesscards',
                    name: 'Business Cards',
                    category: 'Documents',
                    essential: false
                }
            );
        }
        
        // Special considerations
        if (considerations.includes('conservative')) {
            items.push(
                {
                    id: 'modestclothing',
                    name: 'Modest Clothing (covering shoulders and knees)',
                    category: 'Clothing',
                    essential: true,
                    note: 'Respect local customs and religious sites'
                },
                {
                    id: 'scarf',
                    name: 'Scarf/Shawl for covering head or shoulders',
                    category: 'Clothing',
                    essential: true
                },
                {
                    id: 'longskirt',
                    name: 'Long Skirt/Pants',
                    category: 'Clothing',
                    essential: true
                }
            );
        }
        
        if (considerations.includes('medical')) {
            items.push(
                {
                    id: 'prescriptions',
                    name: 'Prescription Medications (in original packaging)',
                    category: 'Essentials',
                    essential: true,
                    note: 'Bring enough for your entire trip plus extra in case of delays'
                },
                {
                    id: 'medicalinfo',
                    name: 'Medical Information Card',
                    category: 'Documents',
                    essential: true,
                    note: 'Include blood type, allergies, conditions, and emergency contacts'
                },
                {
                    id: 'medicalinsurance',
                    name: 'Medical Insurance Card',
                    category: 'Documents',
                    essential: true
                },
                {
                    id: 'extrameds',
                    name: 'Common Medications',
                    category: 'Toiletries',
                    essential: true,
                    note: 'Pain relievers, anti-diarrhea medication, antihistamines, etc.'
                }
            );
        }
        
        if (considerations.includes('safety')) {
            items.push(
                {
                    id: 'moneybelt',
                    name: 'Money Belt/Hidden Pouch',
                    category: 'Safety',
                    essential: true,
                    note: 'For keeping valuables secure under clothing'
                },
                {
                    id: 'whistle',
                    name: 'Safety Whistle',
                    category: 'Safety',
                    essential: true
                },
                {
                    id: 'flashlight',
                    name: 'Small Flashlight',
                    category: 'Safety',
                    essential: true
                },
                {
                    id: 'padlock',
                    name: 'Padlock for Luggage',
                    category: 'Safety',
                    essential: true
                },
                {
                    id: 'rfidwallet',
                    name: 'RFID-Blocking Wallet',
                    category: 'Safety',
                    essential: false
                },
                {
                    id: 'safetyapp',
                    name: 'Safety App (download before travel)',
                    category: 'Tech',
                    essential: true,
                    note: 'SheTravels app or similar with location sharing features'
                }
            );
        }
        
        if (considerations.includes('tech')) {
            items.push(
                {
                    id: 'camera',
                    name: 'Camera and Charger',
                    category: 'Tech',
                    essential: false
                },
                {
                    id: 'adapter',
                    name: 'Universal Power Adapter',
                    category: 'Tech',
                    essential: true
                },
                {
                    id: 'headphones',
                    name: 'Headphones',
                    category: 'Tech',
                    essential: false
                },
                {
                    id: 'ereader',
                    name: 'E-reader/Tablet',
                    category: 'Tech',
                    essential: false
                },
                {
                    id: 'extrabatteries',
                    name: 'Extra Batteries/Chargers',
                    category: 'Tech',
                    essential: false
                }
            );
        }
        
        // Duration-specific adjustments
        if (duration === 'long') {
            items.push(
                {
                    id: 'laundrykit',
                    name: 'Travel Laundry Kit',
                    category: 'Essentials',
                    essential: false,
                    note: 'Small detergent packets and portable clothesline'
                }
            );
        }
        
        // Remove duplicates (items that might have been added multiple times due to different conditions)
        const uniqueItems = [];
        const ids = new Set();
        
        items.forEach(item => {
            if (!ids.has(item.id)) {
                ids.add(item.id);
                uniqueItems.push(item);
            }
        });
        
        return uniqueItems;
    }
});