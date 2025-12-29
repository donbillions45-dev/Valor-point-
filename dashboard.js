// dashboard.js

// Import necessary Firebase modules from your firebase.js file
import { auth, db, doc, getDoc } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const welcomeMessage = document.getElementById('welcomeMessage');
const balanceDisplay = document.getElementById('balance');
const referralLinkInput = document.getElementById('referralLink');
const totalReferralsSpan = document.getElementById('totalReferrals');
const referredUsersList = document.getElementById('referredUsersList');
const logoutBtn = document.getElementById('logoutBtn');
const copyReferralLinkBtn = document.getElementById('copyReferralLinkBtn');

// Base URL for your application (replace with your Firebase Hosting URL once deployed)
// For local testing, you might use 'http://localhost:5000' or similar if you have a local server.
// For Android direct file opening, this will be tricky, but we'll include it for deployment.
const APP_BASE_URL = "http://valorpoint.web.app/"; // Placeholder, update with your actual deployed URL


// --- Authentication State Listener ---
// This is critical for protecting pages. It checks if a user is logged in.
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in, fetch and display their data
        console.log("User logged in:", user.uid);
        await loadUserData(user.uid);
    } else {
        // User is signed out. Redirect to login page.
        console.log("No user signed in. Redirecting to login.");
        window.location.href = 'login.html';
    }
});

// --- Function to Load User Data ---
async function loadUserData(uid) {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log("User data loaded:", userData);

            welcomeMessage.textContent = `Welcome, ${userData.name}!`;
            balanceDisplay.textContent = userData.balance.toLocaleString(); // Format balance for display

            const referralCode = userData.referralCode;
            if (referralCode) {
                referralLinkInput.value = `${APP_BASE_URL}?ref=${referralCode}`;
            } else {
                referralLinkInput.value = "Referral code not available.";
            }
            const referrals = userData.referrals || [];
            totalReferralsSpan.textContent = referrals.length;

            if (referrals.length > 0) {
                referredUsersList.innerHTML = ''; // Clear "No referrals yet"
                // For simplicity, we'll just display their UIDs.
                // In a real app, you might fetch their names from Firestore too.
                referrals.forEach(referredUid => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `User UID: ${referredUid}`;
                    referredUsersList.appendChild(listItem);
                });
            } else {
                referredUsersList.innerHTML = '<li>No referrals yet. Share your link!</li>';
            }

        } else {
            console.error("No user document found in Firestore for UID:", uid);
            // This could happen if auth user exists but firestore doc wasn't created properly
            // Log out user for data inconsistency
            await signOut(auth);
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        // Handle errors gracefully, maybe redirect to an error page or show a message
        alert("Failed to load user data. Please try logging in again.");
        await signOut(auth);
        window.location.href = 'login.html';
    }
}

// --- Logout Functionality ---
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out.");
        window.location.href = 'login.html'; // Redirect to login page after logout
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to log out. Please try again.");
    }
});

// --- Copy Referral Link ---
copyReferralLinkBtn.addEventListener('click', () => {
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy"); // Deprecated but widely supported
    // Modern way:
    // navigator.clipboard.writeText(referralLinkInput.value).then(() => {
    //     alert("Referral link copied!");
    // }).catch(err => {
    //     console.error('Failed to copy text: ', err);
    // });

    const originalText = copyReferralLinkBtn.textContent;
    copyReferralLinkBtn.textContent = "Copied!";
    setTimeout(() => {
        copyReferralLinkBtn.textContent = originalText;
    }, 1500);
});
document.addEventListener('DOMContentLoaded', () => {
    // Mock User Data (replace with actual data fetching in a real app)
    const userData = {
        fullName: "Jane Doe", // Example user
        email: "jane.doe@example.com",
        profilePic: "avatar2.png", // Path relative to /img/
        accountBalance: "1,234.56",
        accountCreationDate: "2023-01-15"
    };

    /**
     * Loads user data into the dashboard UI.
     */
    function loadUserData() {
        // Navbar elements
        document.getElementById('navbar-profile-pic').src = `/img/${userData.profilePic}`;
        document.getElementById('navbar-user-name').textContent = userData.fullName;

        // Main dashboard card elements
        document.getElementById('dashboard-profile-pic').src = `/img/${userData.profilePic}`;
        document.getElementById('user-full-name').textContent = userData.fullName;
        document.getElementById('user-email').textContent = userData.email;
        document.getElementById('account-balance').textContent = userData.accountBalance;
        document.getElementById('account-creation-date').textContent = userData.accountCreationDate;
    }

    /**
     * Applies the saved theme preference from local storage.
     */
    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    /**
     * Handles logout functionality.
     */
    function logout() {
        // Clear any session-related data (e.g., tokens, user data)
        localStorage.removeItem('theme'); // Clear dark mode preference if desired, or keep it
        // In a real app, you would clear authentication tokens and redirect to login
        alert("Logged out successfully!");
        window.location.href = "login.html"; // Redirect to a hypothetical login page
    }

    // Initialize functions
    applyTheme();
    loadUserData();

    // Event listener for logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});