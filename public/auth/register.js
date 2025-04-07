import { handleAuthResponse, storeToken, redirectIfAuthenticated } from '../scripts/auth.js';

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Redirect if already logged in
redirectIfAuthenticated();

// Form submission handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const errorElement = document.getElementById('authError');

    // Clear previous errors
    errorElement.textContent = '';

    try {
        // Basic client-side validation
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        storeToken(data.token);
        window.location.href = '../itinerary.html';

    } catch (error) {
        console.error('Registration error:', error);
        errorElement.textContent = error.message;
    }
});