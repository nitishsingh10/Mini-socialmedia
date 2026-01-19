/* VibeUp - Simple JavaScript */

const KEYS = {
    POSTS: 'vibeup-posts',
    USER: 'vibeup-user',
    THEME: 'vibeup-theme',
    REGISTERED_USERS: 'vibeup-registered-users',
    LOGGED_IN: 'vibeup-logged-in'
};

// --- Theme ---
function initTheme() {
    const theme = localStorage.getItem(KEYS.THEME) || 'dark';
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// --- User Management ---
function getUser() {
    let user = JSON.parse(localStorage.getItem(KEYS.USER));
    if (!user) {
        user = {
            id: 'user_' + Date.now(),
            name: 'New User',
            username: 'newuser',
            bio: 'Hello! I use VibeUp.',
            avatar: null,
            createdAt: new Date().toISOString()
        };
        saveUser(user);
    }
    return user;
}

function saveUser(user) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

// --- Posts Management ---
function getPosts() {
    return JSON.parse(localStorage.getItem(KEYS.POSTS)) || [];
}

function savePosts(posts) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
}

// --- Helpers ---
function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${msg}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Like System ---
function toggleLike(postId) {
    const posts = getPosts();
    const user = getUser();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) return;

    const post = posts[postIndex];

    // Initialize likedBy if not exists
    if (!post.likedBy) {
        post.likedBy = [];
    }

    const userIndex = post.likedBy.indexOf(user.id);

    if (userIndex === -1) {
        // User hasn't liked - add like
        post.likedBy.push(user.id);
        post.likes = (post.likes || 0) + 1;
    } else {
        // User already liked - remove like
        post.likedBy.splice(userIndex, 1);
        post.likes = Math.max(0, (post.likes || 1) - 1);
    }

    posts[postIndex] = post;
    savePosts(posts);

    // Refresh the feed if loadFeed function exists
    if (typeof loadFeed === 'function') {
        loadFeed();
    }

    // Refresh profile posts if on profile page
    if (typeof loadUserPosts === 'function') {
        loadUserPosts();
        loadProfile();
    }
}

// --- Authentication System ---
function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem(KEYS.REGISTERED_USERS)) || [];
}

function saveRegisteredUsers(users) {
    localStorage.setItem(KEYS.REGISTERED_USERS, JSON.stringify(users));
}

function isLoggedIn() {
    return localStorage.getItem(KEYS.LOGGED_IN) === 'true';
}

function loginUser(user) {
    // Save as current user
    const userCopy = { ...user };
    delete userCopy.password; // Don't store password in current user
    saveUser(userCopy);
    localStorage.setItem(KEYS.LOGGED_IN, 'true');
}

function logoutUser() {
    localStorage.removeItem(KEYS.LOGGED_IN);
    localStorage.removeItem(KEYS.USER);
    window.location.href = 'login.html';
}

function checkAuth() {
    // Skip check on login and signup pages
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html' || currentPage === 'signup.html' || currentPage === '') {
        return;
    }

    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Initialize on load
initTheme();
checkAuth();
