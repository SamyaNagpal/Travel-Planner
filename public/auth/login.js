// login.js

import { API_BASE_URL, handleAuthResponse, storeToken, redirectIfAuthenticated } from '../scripts/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Redirect to home if already logged in
    redirectIfAuthenticated();

    // Form submit handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await handleAuthResponse(response);

            storeToken(data.token);
            window.location.href = '../home.html'; // Redirect to home page
        } catch (error) {
            console.error('Login error:', error.message);
            document.getElementById('authError').textContent = error.message;
        }
    });
});
