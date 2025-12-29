// settings.js

import { auth, db, storage, updateProfile, doc, getDoc, updateDoc, ref, uploadBytes, getDownloadURL } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const settingsMessage = document.getElementById('settingsMessage');
const profilePic = document.getElementById('profilePic');
const profilePicUpload = document.getElementById('profilePicUpload');
const uploadPicBtn = document.getElementById('uploadPicBtn');
const userNameInput = document.getElementById('userName');
const saveNameBtn = document.getElementById('saveNameBtn');
const backToDashboardBtn = document.getElementById('backToDashboardBtn');

let currentUser = null; // To store the authenticated user object

// --- Authentication State Listener ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user; // Store the current user
        console.log("User logged in:", currentUser.uid);
        await loadUserSettings(currentUser.uid);
    } else {
        console.log("No user signed in. Redirecting to login.");
        window.location.href = 'login.html';
    }
});

// --- Load User Settings ---
async function loadUserSettings(uid) {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            // Display current name (from Firestore for consistency, or Auth.displayName)
            userNameInput.value = userData.name || currentUser.displayName || '';

            // Display current profile picture
            profilePic.src = currentUser.photoURL || 'https://via.placeholder.com/150'; // Default placeholder image

        } else {
            console.warn("User document not found in Firestore for UID:", uid);
            userNameInput.value = currentUser.displayName || '';
            profilePic.src = currentUser.photoURL || 'https://via.placeholder.com/150';
        }
    } catch (error) {
        console.error("Error loading user settings:", error);
        settingsMessage.textContent = 'Failed to load settings.';
        settingsMessage.classList.add('error');
    }
}

// --- Profile Picture Upload ---
profilePicUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        // Display selected image preview
        const reader = new FileReader();
        reader.onload = (event) => {
            profilePic.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

uploadPicBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    settingsMessage.textContent = '';
    settingsMessage.className = 'message';

    const file = profilePicUpload.files[0];
    if (!file) {
        settingsMessage.textContent = 'Please select an image to upload.';
        settingsMessage.classList.add('error');
        return;
    }

    try {
        // Create a storage reference (e.g., users/<uid>/profile_picture.jpg)
        const storageRef = ref(storage, `users/${currentUser.uid}/profile_picture`);

        // Upload the file
        settingsMessage.textContent = 'Uploading picture...';
        settingsMessage.classList.remove('error', 'success');

        const uploadResult = await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(uploadResult.ref);

        // Update Firebase Authentication profile
        await updateProfile(currentUser, { photoURL: photoURL });

        // Update Firestore user document with new photoURL
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            profilePictureUrl: photoURL
        });

        profilePic.src = photoURL; // Update image instantly
        settingsMessage.textContent = 'Profile picture updated successfully!';
        settingsMessage.classList.add('success');
        console.log('Profile picture updated:', photoURL);

    } catch (error) {
        console.error("Error uploading profile picture:", error);
        settingsMessage.textContent = 'Failed to upload profile picture.';
        settingsMessage.classList.add('error');
    }
});

// --- Save Name ---
saveNameBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    settingsMessage.textContent = '';
    settingsMessage.className = 'message';

    const newName = userNameInput.value.trim();
    if (!newName) {
        settingsMessage.textContent = 'Name cannot be empty.';
        settingsMessage.classList.add('error');
        return;
    }

    try {
        // Update Firebase Authentication profile display name
        await updateProfile(currentUser, { displayName: newName });

        // Update Firestore user document name
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            name: newName
        });

        settingsMessage.textContent = 'Name updated successfully!';
        settingsMessage.classList.add('success');
        console.log('Name updated to:', newName);

    } catch (error) {
        console.error("Error updating name:", error);
        settingsMessage.textContent = 'Failed to update name.';
        settingsMessage.classList.add('error');
    }
});

// --- Back to Dashboard Button ---
backToDashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

