// for different users check

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
// Initialize on load
initTheme();
checkAuth();

/* ========== STORIES SYSTEM ========== */
const dummyStories = [
    {
        userId: 'user_alex',
        username: 'Alex',
        avatar: 'https://ui-avatars.com/api/?name=Alex&background=000000&color=fff',
        items: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800&q=80', duration: 5000 },
            { type: 'image', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', duration: 5000 }
        ]
    },
    {
        userId: 'user_sarah',
        username: 'Sarah',
        avatar: 'https://ui-avatars.com/api/?name=Sarah&background=000000&color=fff',
        items: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', duration: 5000 },
            { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4', duration: 15000 }
        ]
    },
    {
        userId: 'user_mike',
        username: 'Mike',
        avatar: 'https://ui-avatars.com/api/?name=Mike&background=000000&color=fff',
        items: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&q=80', duration: 5000 }
        ]
    },
    {
        userId: 'user_emma',
        username: 'Emma',
        avatar: 'https://ui-avatars.com/api/?name=Emma&background=000000&color=fff',
        items: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', duration: 5000 }
        ]
    }
];

let currentStoryUserIndex = 0;
let currentStoryItemIndex = 0;
let storyTimer = null;
let isStoryOpen = false;

document.addEventListener('DOMContentLoaded', () => {
    // Existing init calls are inside the first DOMContentLoaded in app.js? 
    // Wait, the file has a DOMContentLoaded listener at line 214 of index.html calling initializeDummyPosts etc. 
    // app.js has its own init calls at the bottom.
    // We should call initializeStories() here.
    initializeStories();
});

function initializeStories() {
    const container = document.getElementById('storiesRow');
    if (!container) return; // storiesRow might not be in DOM if page differs

    // Keep the "Add" button
    const addButton = container.querySelector('.add-story');
    container.innerHTML = '';
    if (addButton) container.appendChild(addButton);

    dummyStories.forEach((userStory, index) => {
        const storyEl = document.createElement('div');
        storyEl.className = 'story';
        storyEl.onclick = () => openStory(index);

        storyEl.innerHTML = `
            <div class="story-ring ${userStory.seen ? '' : 'story-active'}">
                <img src="${userStory.avatar}" alt="${userStory.username}">
            </div>
            <span class="story-name">${userStory.username}</span>
        `;
        container.appendChild(storyEl);
    });
}

function openStory(userIndex) {
    currentStoryUserIndex = userIndex;
    currentStoryItemIndex = 0;
    isStoryOpen = true;

    const modal = document.getElementById('storyViewer');
    modal.classList.remove('hidden');

    showStory();
}

function closeStoryViewer() {
    isStoryOpen = false;
    clearTimeout(storyTimer);

    // Stop video if playing
    const video = document.querySelector('.story-media-container video');
    if (video) video.pause();

    document.getElementById('storyViewer').classList.add('hidden');
}

function showStory() {
    if (!isStoryOpen) return;

    const user = dummyStories[currentStoryUserIndex];
    if (!user) {
        closeStoryViewer();
        return;
    }

    const item = user.items[currentStoryItemIndex];

    // Update Header
    document.getElementById('storyViewerAvatar').src = user.avatar;
    document.getElementById('storyViewerName').textContent = user.username;
    document.getElementById('storyViewerTime').textContent = '2h'; // Random time for now

    // Render Progress Bars
    const progressContainer = document.getElementById('storyProgressBars');
    progressContainer.innerHTML = '';
    user.items.forEach((_, idx) => {
        const bar = document.createElement('div');
        bar.className = 'story-progress-bar';
        const fill = document.createElement('div');
        fill.className = 'story-progress-fill';

        if (idx < currentStoryItemIndex) {
            fill.style.width = '100%';
        } else if (idx === currentStoryItemIndex) {
            // Animating current bar
            fill.style.width = '0%';
            // We'll set animation via JS for precision or transition
        } else {
            fill.style.width = '0%';
        }

        bar.appendChild(fill);
        progressContainer.appendChild(bar);
    });

    // Render Media
    const mediaContainer = document.querySelector('.story-media-container');
    mediaContainer.innerHTML = ''; // Clear previous

    if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.url;
        img.onload = () => startProgress(item.duration);
        mediaContainer.appendChild(img);
    } else if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.url;
        video.autoplay = true;
        video.playsInline = true; // Important for mobile
        video.onloadedmetadata = () => {
            startProgress(video.duration * 1000);
        };
        video.onended = nextStory;
        mediaContainer.appendChild(video);
    }
}

function startProgress(duration) {
    clearTimeout(storyTimer);

    const bars = document.querySelectorAll('.story-progress-fill');
    const currentBar = bars[currentStoryItemIndex];

    // Reset transition
    currentBar.style.transition = 'none';
    currentBar.style.width = '0%';

    // Force reflow
    void currentBar.offsetWidth;

    // Start animation
    currentBar.style.transition = `width ${duration}ms linear`;
    currentBar.style.width = '100%';

    storyTimer = setTimeout(nextStory, duration);
}

function nextStory() {
    const user = dummyStories[currentStoryUserIndex];

    if (currentStoryItemIndex < user.items.length - 1) {
        currentStoryItemIndex++;
        showStory();
    } else {
        // Next user
        if (currentStoryUserIndex < dummyStories.length - 1) {
            currentStoryUserIndex++;
            currentStoryItemIndex = 0;
            showStory();
        } else {
            closeStoryViewer();
        }
    }
}

function prevStory() {
    if (currentStoryItemIndex > 0) {
        currentStoryItemIndex--;
        showStory();
    } else {
        // Previous user
        if (currentStoryUserIndex > 0) {
            currentStoryUserIndex--;
            currentStoryItemIndex = 0; // Or last item of prev user? simpler to start from 0
            showStory();
        } else {
            // First story of first user, restart or do nothing
            currentStoryItemIndex = 0;
            showStory();
        }
    }
}
