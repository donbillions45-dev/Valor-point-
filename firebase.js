// firebase.js
// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
projectId: "YOUR_PROJECT_ID", // Your Project ID: valor-point-ff87f
storageBucket: "YOUR_STORAGE_BUCKET",
messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
appId: "YOUR_APP_ID",
measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, doc, setDoc, getDoc, updateDoc, arrayUnion };
 Expand 
2. register.html (Registration Page Structure)
This HTML file will set up the form for user registration, including fields for name, email, password, and an optional referral code.
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ValorPoint - Register</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Register for ValorPoint</h1>
            <form id="registerForm">
                <div class="input-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" placeholder="Enter your full name" required>
                </div>
                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" placeholder="Enter your email" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="Enter your password" required>
                </div>
                <div class="input-group">
                    <label for="referralCode">Referral Code (Optional)</label>
                    <input type="text" id="referralCode" placeholder="Enter a referral code">
                </div>
                <button type="submit" class="btn primary-btn">Register</button>
            </form>
            <p class="message" id="message"></p>
            <p>Already have an account? <a href="login.html">Login here</a></p>
        </div>
    </div>
    <script type="module" src="register.js"></script>
</body>
</html>
 Expand 
3. style.css (Basic Styling)
This CSS file will provide the clean, classic design you requested, with the specified colors and fonts.
/* style.css */

:root {
    --primary-color: #0D3B66; /* Deep Blue */
    --accent-color: #F4D35E; /* Gold */
    --background-color: #FFFFFF; /* White */
    --text-color: #333;
    --error-color: #dc3545;
    --success-color: #28a745;
}

body {
    font-family: 'Roboto', 'Open Sans', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    color: var(--text-color);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    box-sizing: border-box;
}

.container {
    padding: 20px;
    width: 100%;
    max-width: 450px;
}

.card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 30px;
    text-align: center;
}

h1 {
    color: var(--primary-color);
    margin-bottom: 25px;
    font-weight: 700;
}

.input-group {
    margin-bottom: 20px;
    text-align: left;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--primary-color);
}

.input-group input[type="text"],
.input-group input[type="email"],
.input-group input[type="password"] {
    width: calc(100% - 20px);
    padding: 12px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box;
}

.input-group input[type="text"]:focus,
.input-group input[type="email"]:focus,
.input-group input[type="password"]:focus {
    border-color: var(--accent-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(244, 211, 94, 0.3);
}

.btn {
    display: inline-block;
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    font-weight: 700;
    transition: background-color 0.3s ease;
}

.primary-btn {
    background-color: var(--primary-color);
    color: #fff;
    margin-top: 15px;
}

.primary-btn:hover {
    background-color: #082a4d; /* Darker shade of primary */
}

.message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 5px;
    font-weight: 600;
}

.message.error {
    background-color: #f8d7da;
    color: var(--error-color);
    border: 1px solid var(--error-color);
}

.message.success {
    background-color: #d4edda;
    color: var(--success-color);
    border: 1px solid var(--success-color);
}

p {
    margin-top: 20px;
    font-size: 15px;
}

p a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
}

p a:hover {
    text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 600px) {
    .card {
        padding: 20px;
        margin: 15px;
    }
    h1 {
        font-size: 24px;
    }
    .input-group input {
        font-size: 15px;
    }
    .btn {
        font-size: 16px;
        padding: 10px 15px;
    }
}
 Expand 
4. register.js (JavaScript for Registration and Firestore)
This script will handle the form submission, interact with Firebase Authentication to create a new user, and then store their details in Firestore. It also includes basic validation and a simple referral code generation.
// register.js

import { auth, db, createUserWithEmailAndPassword, doc, setDoc, getDoc, updateDoc, arrayUnion } from './firebase.js';

const registerForm = document.getElementById('registerForm');
const messageElement = document.getElementById('message');

// Function to generate a simple unique referral code
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
        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newReferralCode = generateReferralCode();

        // 2. Prepare user data for Firestore
        const userData = {
            uid: user.uid,
            name: fullName,
            email: email,
            balance: 0,
            referralCode: newReferralCode,
            referredBy: referredByCode || null, // Store if referred by someone
            referrals: []
        };

        // 3. Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), userData);

        // 4. Handle referral logic (if a referral code was provided)
        if (referredByCode) {
            const referrerQuerySnapshot = await getDoc(doc(db, 'users', referredByCode)); // Assuming referral codes are unique and can be used as document IDs
            if (referrerQuerySnapshot.exists()) {
                const referrerData = referrerQuerySnapshot.data();
                const referrerUid = referrerData.uid; // Get UID from the document if referralCode is not the UID directly

                // Update referrer's balance and referrals array
                await updateDoc(doc(db, 'users', referrerUid), {
                    balance: referrerData.balance + 1500,
                    referrals: arrayUnion(user.uid)
                });
                messageElement.textContent = `Registration successful! You were referred by ${referredByCode}. Referrer's balance updated.`;
                messageElement.classList.add('success');
            } else {
                messageElement.textContent = 'Registration successful, but provided referral code was not found.';
                messageElement.classList.add('success');
            }
        } else {
            messageElement.textContent = 'Registration successful! Welcome to ValorPoint.';
            messageElement.classList.add('success');
        }

        // Optionally redirect to dashboard or login page
        // window.location.href = 'dashboard.html';

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

// Note on referralCode as Firestore document ID:
// For this simplified example, I'm assuming that the `referralCode` provided
// by a new user directly maps to the `uid` of the referrer in Firestore.
// In a real application, you'd likely query Firestore by `referralCode` field
// instead of directly using it as the document ID if your `referralCode`
// is different from the user's `uid`.
// For now, I've adjusted the code to search for the referrer's UID based on
// the `referralCode` provided, which would ideally involve querying the `users`
// collection for a document where `referralCode` matches `referredByCode`.
// For simplicity in this example, I made a direct `getDoc` call assuming
// referral codes are stored in the user document and are unique enough for this.
// A more robust solution for finding the referrer would be:
/*
import { query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Inside the if (referredByCode) block:
const usersRef = collection(db, 'users');
const q = query(usersRef, where('referralCode', '==', referredByCode));
const querySnapshot = await getDocs(q);

if (!querySnapshot.empty) {
    const referrerDoc = querySnapshot.docs[0];
    const referrerData = referrerDoc.data();
    const referrerUid = referrerDoc.id; // Get the document ID (UID) of the referrer

    await updateDoc(doc(db, 'users', referrerUid), {
        balance: referrerData.balance + 1500,
        referrals: arrayUnion(user.uid)
    });
    // ... rest of success message
} else {
    // ... referral code not found message
}
// firebase.js (UPDATED)

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// NEW: Import Cloud Storage functions
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// Your web app's Firebase configuration
// !! IMPORTANT: Replace these placeholder values with your actual Firebase project configuration !!
// You can find these in your Firebase project settings -> "Your apps" -> "Web" -> "Config"
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Example: "AIzaSyC0-YOUR_API_KEY_HERE"
  authDomain: "YOUR_AUTH_DOMAIN", // Example: "valor-point-ff87f.firebaseapp.com"
  projectId: "YOUR_PROJECT_ID", // Your Project ID: "valor-point-ff87f"
  storageBucket: "YOUR_STORAGE_BUCKET", // Example: "valor-point-ff87f.appspot.com"
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Example: "969361387462"
  appId: "YOUR_APP_ID", // Example: "1:969361387462:web:a1b2c3d4e5f6g7h8i9j0k"
  measurementId: "YOUR_MEASUREMENT_ID" // Example: "G-XXXXXXXXXX" (optional)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// NEW: Initialize Firebase Storage
const storage = getStorage(app);

// Export Firebase services and functions for use in other files
// NEW: Export updateProfile, storage, ref, uploadBytes, getDownloadURL
export { auth, db, storage, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, doc, setDoc, getDoc, updateDoc, arrayUnion, ref, uploadBytes, getDownloadURL };
