// register.js (Revised to alert and redirect to login.html)

import { auth, db, createUserWithEmailAndPassword, doc, setDoc } from './firebase.js';

const registerForm = document.getElementById('registerForm');
const messageElement = document.getElementById('message');

function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = registerForm['fullName'].value;
    const email = registerForm['email'].value;
    const password = registerForm['password'].value;
    const referredByCode = registerForm['referralCode'].value.trim();

    messageElement.textContent = '';
    messageElement.className = 'message';

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newReferralCode = generateReferralCode();

        const userData = {
            uid: user.uid,
            name: fullName,
            email: email,
            balance: 0,
            referralCode: newReferralCode,
            referredBy: referredByCode || null,
            referrals: [],
            isActivated: false // IMPORTANT: Account will NOT be activated initially in this flow
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        // --- NEW BEHAVIOR STARTS HERE ---
        alert("A successful registration was made!"); // Show the alert
        console.log('Registration successful, redirecting to login...');
        window.location.href = 'login.html'; // Redirect to login page
        // --- NEW BEHAVIOR ENDS HERE ---

    } catch (error) {
        console.error("Error during registration:", error);
        let errorMessage = "An unknown error occurred. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'The email address is already in use by another account.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'The email address is not valid.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'The password is too weak. It must be at least 6 characters long.';
        }
        messageElement.textContent = errorMessage;
        messageElement.classList.add('error');
    }
});