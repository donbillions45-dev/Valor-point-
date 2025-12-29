// login.js

// Import necessary Firebase modules from your firebase.js file
import { auth, signInWithEmailAndPassword } from './firebase.js';

const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Get values from the form fields
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;

    // Clear previous messages
    messageElement.textContent = '';
    messageElement.className = 'message'; // Reset classes

    try {
        // Sign in user with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        messageElement.textContent = 'Login successful! Redirecting to dashboard...';
        messageElement.classList.add('success');
        console.log("User logged in:", user.uid);

        // Redirect to the dashboard page after successful login
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error("Error during login:", error);
        let errorMessage = "An unknown error occurred. Please try again.";
        // Handle specific Firebase Authentication errors for better user feedback
        if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This user account has been disabled.';
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password.'; // Combine these for security reasons
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed login attempts. Please try again later.';
        }
        messageElement.textContent = errorMessage;
        messageElement.classList.add('error');
    }
});