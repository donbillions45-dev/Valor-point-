// admin.js

import { auth, db, doc, getDoc, updateDoc } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// NEW: Import functions for callable Cloud Functions
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";


const adminWelcome = document.getElementById('adminWelcome');
const adminMessage = document.getElementById('adminMessage');
const adminContent = document.getElementById('adminContent');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

const userSearch = document.getElementById('userSearch');
const searchUserBtn = document.getElementById('searchUserBtn');
const loadAllUsersBtn = document.getElementById('loadAllUsersBtn');
const usersTableBody = document.getElementById('usersTableBody');

const userDetailPanel = document.querySelector('.user-detail-panel');
const userDetailName = document.getElementById('userDetailName');
const userDetailUid = document.getElementById('userDetailUid');
const userDetailEmail = document.getElementById('userDetailEmail');
const userDetailActivated = document.getElementById('userDetailActivated');
const userDetailBalance = document.getElementById('userDetailBalance');
const userDetailReferralCode = document.getElementById('userDetailReferralCode');
const userDetailReferredBy = document.getElementById('userDetailReferredBy');
const userDetailReferralCount = document.getElementById('userDetailReferralCount');
const userDetailReferralsList = document.getElementById('userDetailReferralsList');

const balanceChangeAmount = document.getElementById('balanceChangeAmount');
const updateBalanceBtn = document.getElementById('updateBalanceBtn');
const toggleActivationBtn = document.getElementById('toggleActivationBtn');
const deleteUserBtn = document.getElementById('deleteUserBtn');
const closeUserDetailBtn = document.getElementById('closeUserDetailBtn');

let currentSelectedUser = null; // Stores data of the user currently viewed in detail

// Initialize Firebase Functions
const functions = getFunctions();
// These are hypothetical Cloud Functions you'd deploy:
const adminUpdateUserBalance = httpsCallable(functions, 'adminUpdateUserBalance');
const adminToggleUserActivation = httpsCallable(functions, 'adminToggleUserActivation');
const adminDeleteUser = httpsCallable(functions, 'adminDeleteUser');


// --- Authentication State Listener & Admin Check ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Fetch user's ID token to check custom claims
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin) {
            adminWelcome.textContent = `Welcome, Admin ${user.email}!`;
            adminContent.style.display = 'block';
            await loadAllUsers(); // Load all users initially
        } else {
            adminMessage.textContent = 'Access Denied: You are not an administrator.';
            adminMessage.classList.add('error');
            adminContent.style.display = 'none';
            // Redirect non-admins
            setTimeout(() => window.location.href = 'dashboard.html', 3000);
        }
    } else {
        console.log("No user signed in. Redirecting to login.");
        window.location.href = 'login.html';
    }
});

// --- Logout Functionality ---
adminLogoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("Admin signed out.");
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Error signing out:", error);
        adminMessage.textContent = 'Failed to log out.';
        adminMessage.classList.add('error');
    }
});
// --- Load All Users ---
async function loadAllUsers() {
    adminMessage.textContent = 'Loading all users...';
    usersTableBody.innerHTML = '<li>Loading...</li>';
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            usersTableBody.innerHTML = '<li>No users found.</li>';
            adminMessage.textContent = 'No users registered.';
            adminMessage.classList.remove('success', 'error');
            return;
        }

        usersTableBody.innerHTML = ''; // Clear previous list
        querySnapshot.forEach(docSnap => {
            const userData = docSnap.data();
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${userData.name || userData.email} (${userData.uid.substring(0, 5)}...)</span>
                <button class="btn secondary-btn view-user-btn" data-uid="${userData.uid}">View Details</button>
            `;
            usersTableBody.appendChild(listItem);
        });
        adminMessage.textContent = 'Users loaded successfully.';
        adminMessage.classList.add('success');

        // Attach event listeners to new buttons
        document.querySelectorAll('.view-user-btn').forEach(button => {
            button.addEventListener('click', (e) => showUserDetail(e.target.dataset.uid));
        });

    } catch (error) {
        console.error("Error loading all users:", error);
        adminMessage.textContent = 'Failed to load users.';
        adminMessage.classList.add('error');
    }
}
loadAllUsersBtn.addEventListener('click', loadAllUsers);

// --- Search User ---
searchUserBtn.addEventListener('click', async () => {
    const searchTerm = userSearch.value.trim().toLowerCase();
    if (!searchTerm) {
        loadAllUsers(); // If search is empty, load all
        return;
    }

    adminMessage.textContent = 'Searching users...';
    usersTableBody.innerHTML = '<li>Searching...</li>';
    try {
        const usersRef = collection(db, 'users');
        const users = [];

        // Search by email
        const emailQuery = query(usersRef, where('email', '==', searchTerm));
        const emailSnapshot = await getDocs(emailQuery);
        emailSnapshot.forEach(doc => users.push(doc.data()));

        // Search by name (if not found by email, or combine) - basic contains check requires more complex queries or client-side filtering after loading all
        // For simplicity, this example will only do exact matches for name or email
        const nameQuery = query(usersRef, where('name', '==', searchTerm));
        const nameSnapshot = await getDocs(nameQuery);
        nameSnapshot.forEach(doc => {
            const userData = doc.data();
            if (!users.some(u => u.uid === userData.uid)) { // Avoid duplicates
                users.push(userData);
            }
        });

        if (users.length === 0) {
            usersTableBody.innerHTML = '<li>No users found matching your search.</li>';
            adminMessage.textContent = 'No matching users.';
            adminMessage.classList.remove('success', 'error');
            return;
        }
usersTableBody.appendChild(listItem);
        });
        adminMessage.textContent = `Found ${users.length} users.`;
        adminMessage.classList.add('success');

        document.querySelectorAll('.view-user-btn').forEach(button => {
            button.addEventListener('click', (e) => showUserDetail(e.target.dataset.uid));
        });

    } catch (error) {
        console.error("Error searching users:", error);
        adminMessage.textContent = 'Failed to search users.';
        adminMessage.classList.add('error');
    }
});


// --- Show User Detail Panel ---
async function showUserDetail(uid) {
    adminMessage.textContent = 'Loading user details...';
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            currentSelectedUser = userDocSnap.data();
            userDetailName.textContent = currentSelectedUser.name || 'N/A';
            userDetailUid.textContent = currentSelectedUser.uid;
            userDetailEmail.textContent = currentSelectedUser.email;
            userDetailActivated.textContent = currentSelectedUser.isActivated ? 'Yes' : 'No';
            userDetailBalance.textContent = currentSelectedUser.balance.toLocaleString();
            userDetailReferralCode.textContent = currentSelectedUser.referralCode || 'N/A';
            userDetailReferredBy.textContent = currentSelectedUser.referredBy || 'N/A';
            userDetailReferralCount.textContent = (currentSelectedUser.referrals || []).length;

            userDetailReferralsList.innerHTML = '';
            if ((currentSelectedUser.referrals || []).length > 0) {
                currentSelectedUser.referrals.forEach(refUid => {
                    const listItem = document.createElement('li');
                    listItem.textContent = refUid;
                    userDetailReferralsList.appendChild(listItem);
                });
            } else {
                userDetailReferralsList.innerHTML = '<li>No referrals for this user.</li>';
            }

            balanceChangeAmount.value = 0; // Reset balance input
            toggleActivationBtn.textContent = currentSelectedUser.isActivated ? 'Deactivate Account' : 'Activate Account';

            userDetailPanel.style.display = 'block'; // Show the detail panel
            adminMessage.textContent = 'User details loaded.';
            adminMessage.classList.remove('error');

        } else {
            adminMessage.textContent = 'User not found.';
            adminMessage.classList.add('error');
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        adminMessage.textContent = 'Failed to load user details.';
        adminMessage.classList.add('error');
    }
}

// --- Close User Detail Panel ---
closeUserDetailBtn.addEventListener('click', () => {
    userDetailPanel.style.display = 'none';
    currentSelectedUser = null;
    adminMessage.textContent = ''; // Clear message
});

// --- Admin Actions (via Cloud Functions) ---
// Update Balance
updateBalanceBtn.addEventListener('click', async () => {
    if (!currentSelectedUser) return;
    const amount = parseFloat(balanceChangeAmount.value);
    if (isNaN(amount) || amount === 0) {
        alert("Please enter a valid amount to adjust balance.");
        return;
    }

    if (!confirm(`Are you sure you want to adjust ${currentSelectedUser.name}'s balance by ₦${amount}?`)) return;

    adminMessage.textContent = 'Updating balance...';
    try {
        // Call Cloud Function to update balance
        const result = await adminUpdateUserBalance({ uid: currentSelectedUser.uid, amount: amount });
        if (result.data.status === 'success') {
            adminMessage.textContent = `Balance updated for ${currentSelectedUser.name}.`;
            adminMessage.classList.add('success');
            await showUserDetail(currentSelectedUser.uid); // Refresh details
            await loadAllUsers(); // Refresh main list
        } else {
            adminMessage.textContent = `Failed to update balance: ${result.data.message}`;
            adminMessage.classList.add('error');
        }
    } catch (error) {
        console.error("Error calling adminUpdateUserBalance:", error);
        adminMessage.textContent = 'Error during balance update via Cloud Function.';
        adminMessage.classList.add('error');
    }
});

// Toggle Activation
toggleActivationBtn.addEventListener('click', async () => {
    if (!currentSelectedUser) return;
    const newState = !currentSelectedUser.isActivated;
    if (!confirm(`Are you sure you want to ${newState ? 'ACTIVATE' : 'DEACTIVATE'} ${currentSelectedUser.name}'s account?`)) return;

    adminMessage.textContent = 'Toggling activation...';
    try {
        // Call Cloud Function to toggle activation
        const result = await adminToggleUserActivation({ uid: currentSelectedUser.uid, activate: newState });
        if (result.data.status === 'success') {
            adminMessage.textContent = `Account activation toggled for ${currentSelectedUser.name}.`;
            adminMessage.classList.add('success');
            await showUserDetail(currentSelectedUser.uid); // Refresh details
            await loadAllUsers(); // Refresh main list
        } else {
            adminMessage.textContent = `Failed to toggle activation: ${result.data.message}`;
            adminMessage.classList.add('error');
        }
    } catch (error) {
        console.error("Error calling adminToggleUserActivation:", error);
        adminMessage.textContent = 'Error during activation toggle via Cloud Function.';
        adminMessage.classList.add('error');
    }
});

// Delete User
deleteUserBtn.addEventListener('click', async () => {
    if (!currentSelectedUser) return;
    if (!confirm(`WARNING: This will permanently delete ${currentSelectedUser.name} and all their data. Are you absolutely sure?`)) return;

    adminMessage.textContent = 'Deleting user...';
    try {
        // Call Cloud Function to delete user
        const result = await adminDeleteUser({ uid: currentSelectedUser.uid });
        if (result.data.status === 'success') {
            adminMessage.textContent = `${currentSelectedUser.name} deleted successfully.`;
            adminMessage.classList.add('success');
            userDetailPanel.style.display = 'none'; // Hide detail panel
            currentSelectedUser = null;
            await loadAllUsers(); // Refresh main list
        } else {
            adminMessage.textContent = `Failed to delete user: ${result.data.message}`;
            adminMessage.classList.add('error');
        }
    } catch (error) {
        console.error("Error calling adminDeleteUser:", error);
        adminMessage.textContent = 'Error during user deletion via Cloud Function.';
        adminMessage.classList.add('error');
    }
});