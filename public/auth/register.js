console.log("register.js loaded");

import { handleAuthResponse, storeToken, redirectIfAuthenticated } from '../scripts/auth.js';

const API_BASE_URL = 'http://localhost:3000/api';

redirectIfAuthenticated();

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const errorElement = document.getElementById('authError');
    errorElement.textContent = '';

    try {
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        console.log('Sending request to:', `${API_BASE_URL}/register`);
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        console.log('Registration success:', data);
        storeToken(data.token);
        window.location.href = '../home.html';

    } catch (error) {
        console.error('Registration error:', error);
        errorElement.textContent = error.message === 'Failed to fetch'
            ? 'Cannot reach server. Is it running?'
            : error.message;
    }
});
