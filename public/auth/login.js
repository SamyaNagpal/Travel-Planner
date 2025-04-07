import { handleAuthResponse, storeToken, redirectIfAuthenticated } from '../scripts/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    redirectIfAuthenticated();
    
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
            window.location.href = '../itinerary.html';
        } catch (error) {
            document.getElementById('authError').textContent = error.message;
        }
    });
});