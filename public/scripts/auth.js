// Shared auth functions
const API_BASE_URL = 'http://localhost:3001/api';

export function handleAuthResponse(response) {
    if (!response.ok) {
        throw new Error(response.statusText || 'Authentication failed');
    }
    return response.json();
}

export function storeToken(token) {
    localStorage.setItem('jwtToken', token);
}

export function redirectIfAuthenticated() {
    if (localStorage.getItem('jwtToken')) {
        window.location.href = '../home.html';
    }
}

export function redirectIfNotAuthenticated() {
    if (!localStorage.getItem('jwtToken')) {
        window.location.href = 'auth/login.html';
    }
}

export function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = 'auth/login.html';
}