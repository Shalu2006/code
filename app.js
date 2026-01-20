// BloomNet - Food Sharing Network (LocalStorage Version - No API Required!)
// Perfect for Hackathon Demos - Works Offline!

let map;
let markers = {};
let currentUser = null;
let userRole = null;
let userLocation = null;
let allDonations = [];
let filteredDonations = [];
let userDonations = [];

// Storage keys
const STORAGE_KEY_DONATIONS = 'bloomnet_donations';
const STORAGE_KEY_USERS = 'bloomnet_users';
const STORAGE_KEY_CURRENT_USER = 'bloomnet_current_user';
const STORAGE_KEY_DARK_MODE = 'bloomnet_dark_mode';
const STORAGE_KEY_REALTIME_FEED = 'bloomnet_realtime_feed';

// Impact calculation constants
const MEALS_PER_KG = 4; // Average meals per kg of food
const CO2_PER_KG = 2.5; // kg CO2 prevented per kg of food saved
const WATER_PER_KG = 1800; // Liters of water per kg of food saved

// Initialize app
function initApp() {
    initializeDarkMode();
    initializeMap();
    setupEventListeners();
    initializeAuth();
    loadDonations();
    startAutoExpiryCheck();
    startRealtimeFeed();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialize Leaflet Map
function initializeMap() {
    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        
        map = L.map('map').setView([28.7041, 77.1025], 13); // Default to Delhi, India
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setView([userLocation.lat, userLocation.lng], 13);
                    
                    const mapControls = document.getElementById('map-controls');
                    if (mapControls) {
                        mapControls.style.display = 'flex';
                    }
                },
                () => {
                    console.log('Could not get location, using default');
                }
            );
        }
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Initialize Auth (LocalStorage based)
function initializeAuth() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            userRole = currentUser.role;
            document.getElementById('user-name').textContent = currentUser.displayName || currentUser.name;
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('user-info').style.display = 'flex';
            showRolePanel();
            // Load donations and apply filters
            loadDonations();
    applyFilters();
        } catch (error) {
            console.error('Error loading saved user:', error);
            showWelcomeScreen();
            // Still load donations to show on map
            loadDonations();
        }
    } else {
        showWelcomeScreen();
        // Load donations to show on map even when not logged in
        loadDonations();
        // Show leaderboard on welcome screen
        setTimeout(() => {
            showLeaderboardOnWelcome();
        }, 500);
    }
}

// Show welcome screen
function showWelcomeScreen() {
    currentUser = null;
    userRole = null;
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('donor-panel').style.display = 'none';
    document.getElementById('shelter-panel').style.display = 'none';
    document.getElementById('welcome-panel').style.display = 'block';
    
    const mapOverlay = document.getElementById('map-overlay');
    if (mapOverlay) {
        mapOverlay.style.display = 'flex';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Welcome login button
    const welcomeLoginBtn = document.getElementById('welcome-login-btn');
    if (welcomeLoginBtn) {
        welcomeLoginBtn.addEventListener('click', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Share impact button
    const shareImpactBtn = document.getElementById('share-impact-btn');
    if (shareImpactBtn) {
        shareImpactBtn.addEventListener('click', shareImpact);
    }
    
    // Role selection
    const donorBtn = document.getElementById('donor-btn');
    if (donorBtn) {
        donorBtn.addEventListener('click', () => {
            setUserRole('donor');
        });
    }
    
    const shelterBtn = document.getElementById('shelter-btn');
    if (shelterBtn) {
        shelterBtn.addEventListener('click', () => {
            setUserRole('shelter');
        });
    }
    
    // Donation form
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmit);
    }
    
    // Dismiss overlay button
    const dismissOverlayBtn = document.getElementById('dismiss-overlay-btn');
    if (dismissOverlayBtn) {
        dismissOverlayBtn.addEventListener('click', () => {
            const mapOverlay = document.getElementById('map-overlay');
            if (mapOverlay) {
                mapOverlay.style.display = 'none';
            }
        });
    }
    
    // Search and filter
    const searchInput = document.getElementById('search-donations');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    const filterCategory = document.getElementById('filter-category');
    if (filterCategory) {
        filterCategory.addEventListener('change', handleFilter);
    }
    
    const sortSelect = document.getElementById('sort-donations');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // Hide locate button
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
        locateBtn.style.display = 'none';
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-map-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.textContent = '⏳';
            refreshBtn.disabled = true;
            loadDonations();
            updateDashboardWidgets();
                showNotification('🔄 Refreshing donations...', 'info');
                setTimeout(() => {
                    refreshBtn.textContent = '🔄';
                    refreshBtn.disabled = false;
                    showNotification('✅ Donations refreshed!', 'success');
            }, 500);
        });
    }
    
    // Toggle widgets button
    const toggleWidgetsBtn = document.getElementById('toggle-widgets-btn');
    if (toggleWidgetsBtn) {
        toggleWidgetsBtn.addEventListener('click', () => {
            const widgets = document.getElementById('dashboard-widgets');
            if (widgets) {
                const isVisible = widgets.style.display !== 'none';
                widgets.style.display = isVisible ? 'none' : 'grid';
                toggleWidgetsBtn.textContent = isVisible ? '📊' : '👁️';
                toggleWidgetsBtn.title = isVisible ? 'Show Dashboard' : 'Hide Dashboard';
            }
        });
    }
}

// Handle Login (Simple Demo Login)
function handleLogin() {
    const name = prompt('Enter your name to get started:');
    if (!name || name.trim() === '') {
            return;
        }
        
    // Create user object
    currentUser = {
        uid: 'user_' + Date.now(),
        displayName: name.trim(),
        name: name.trim(),
        email: name.trim().toLowerCase().replace(/\s+/g, '') + '@bloomnet.demo'
    };
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    
    // Update UI
    document.getElementById('user-name').textContent = currentUser.displayName;
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    
    // Show role selection modal
    document.getElementById('role-modal').style.display = 'flex';
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    currentUser = null;
    userRole = null;
    
        // Clear all markers
        Object.values(markers).forEach(marker => map.removeLayer(marker));
        markers = {};
    
    showWelcomeScreen();
}

// Set User Role
function setUserRole(role) {
    if (!currentUser) {
        alert('Please sign in first.');
        return;
    }
    
        userRole = role;
    currentUser.role = role;
        
    // Save updated user
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    
    // Hide modal
        const modal = document.getElementById('role-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Show panel
        showRolePanel();
    
    // Load donations and apply filters
    loadDonations();
    applyFilters();
        
        showNotification(`✅ Welcome as ${role === 'donor' ? 'Donor' : 'Shelter'}!`, 'success');
}

// Show appropriate panel based on role
function showRolePanel() {
    const welcomePanel = document.getElementById('welcome-panel');
    if (welcomePanel) {
        welcomePanel.style.display = 'none';
    }
    
    const mapOverlay = document.getElementById('map-overlay');
    if (mapOverlay) {
        mapOverlay.style.display = 'none';
    }
    
    const mapControls = document.getElementById('map-controls');
    if (mapControls) {
        mapControls.style.display = 'flex';
        console.log('Map controls shown');
    }
    
    // Show dashboard widgets
    const dashboardWidgets = document.getElementById('dashboard-widgets');
    if (dashboardWidgets) {
        dashboardWidgets.style.display = 'grid';
        updateDashboardWidgets();
    }
    
    const impactBanner = document.getElementById('impact-banner');
    if (impactBanner) {
        impactBanner.style.display = 'flex';
    }
    
    const donorPanel = document.getElementById('donor-panel');
    const shelterPanel = document.getElementById('shelter-panel');
    
    if (userRole === 'donor') {
        if (donorPanel) {
            donorPanel.style.display = 'block';
        }
        if (shelterPanel) {
            shelterPanel.style.display = 'none';
        }
    } else if (userRole === 'shelter') {
        if (donorPanel) {
            donorPanel.style.display = 'none';
        }
        if (shelterPanel) {
            shelterPanel.style.display = 'block';
        }
    } else {
        if (welcomePanel) {
            welcomePanel.style.display = 'block';
        }
    }
}

// Load Donations from LocalStorage
function loadDonations() {
    try {
        const savedDonations = localStorage.getItem(STORAGE_KEY_DONATIONS);
        if (savedDonations) {
            allDonations = JSON.parse(savedDonations);
        } else {
            allDonations = [];
        }
        
        // Add demo donations if empty (first time user)
        if (allDonations.length === 0) {
            addDemoDonations();
            // Reload after adding demos
            const savedDonationsAfter = localStorage.getItem(STORAGE_KEY_DONATIONS);
            if (savedDonationsAfter) {
                allDonations = JSON.parse(savedDonationsAfter);
            }
        }
        
        // Filter user donations
        if (currentUser) {
            userDonations = allDonations.filter(d => d.donorId === currentUser.uid);
        } else {
            userDonations = [];
        }
        
        applyFilters();
        updateDonorStats();
        loadMyDonations();
    } catch (error) {
        console.error('Error loading donations:', error);
        allDonations = [];
        userDonations = [];
        // Try to add demos even on error
        addDemoDonations();
    }
}

// Save Donations to LocalStorage
function saveDonations() {
    try {
        localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(allDonations));
    } catch (error) {
        console.error('Error saving donations:', error);
        showNotification('⚠️ Error saving donation. Storage might be full.', 'error');
    }
}

// Add Demo Donations (for hackathon demo)
function addDemoDonations() {
    const demos = [
        {
            id: 'demo_1',
            foodName: 'Fresh Vegetables',
            category: 'produce',
            quantity: '5 kg',
            pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            pickupTimeDisplay: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString(),
            notes: 'Mixed vegetables - carrots, tomatoes, onions',
            latitude: 28.7041 + (Math.random() - 0.5) * 0.1,
            longitude: 77.1025 + (Math.random() - 0.5) * 0.1,
            donorId: 'demo_donor_1',
            donorName: 'Community Kitchen',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            claimed: false
        },
        {
            id: 'demo_2',
            foodName: 'Bread & Pastries',
            category: 'bakery',
            quantity: '20 pieces',
            pickupTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            pickupTimeDisplay: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleString(),
            notes: 'Fresh from bakery, still warm',
            latitude: 28.7041 + (Math.random() - 0.5) * 0.1,
            longitude: 77.1025 + (Math.random() - 0.5) * 0.1,
            donorId: 'demo_donor_2',
            donorName: 'Local Bakery',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            claimed: false
        },
        {
            id: 'demo_3',
            foodName: 'Canned Goods',
            category: 'canned',
            quantity: '15 cans',
            pickupTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            pickupTimeDisplay: new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString(),
            notes: 'Various canned foods - beans, soup, vegetables',
            latitude: 28.7041 + (Math.random() - 0.5) * 0.1,
            longitude: 77.1025 + (Math.random() - 0.5) * 0.1,
            donorId: 'demo_donor_3',
            donorName: 'Food Bank',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            claimed: false
        }
    ];
    
    // Only add demos if no donations exist
    if (allDonations.length === 0) {
        allDonations = demos;
        saveDonations();
        console.log('✅ Demo donations added!');
    }
}

// Handle Donation Form Submit
async function handleDonationSubmit(e) {
    e.preventDefault();
    
    if (!currentUser || userRole !== 'donor') {
        alert('Please sign in as a donor first.');
        return;
    }

    const foodName = document.getElementById('food-name').value;
    const foodCategory = document.getElementById('food-category').value;
    const foodQuantity = document.getElementById('food-quantity').value;
    const pickupTime = document.getElementById('pickup-time').value;
    const foodNotes = document.getElementById('food-notes').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';
    submitBtn.disabled = true;

    // Get user's current location
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
        submitBtn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const donationData = {
                    foodName: foodName,
                    category: foodCategory,
                    quantity: foodQuantity,
                    pickupTime: new Date(pickupTime).toISOString(),
                    pickupTimeDisplay: new Date(pickupTime).toLocaleString(),
                    notes: foodNotes,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    donorId: currentUser.uid,
                    donorName: currentUser.displayName || currentUser.name,
                    timestamp: new Date().toISOString(),
                    claimed: false
                };

                donationData.id = 'donation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                // Add to donations array
                allDonations.push(donationData);
                saveDonations();

                // Reset form
                document.getElementById('donation-form').reset();
                showNotification('✅ Donation posted successfully!', 'success');
                
                // Restore button
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
                submitBtn.disabled = false;
                
                // Update UI
                loadDonations();
                applyFilters();
                updateDonorStats();
                loadMyDonations();
                updateDashboardWidgets();

            } catch (error) {
                console.error('Error posting donation:', error);
                alert('Failed to post donation. Please try again.');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
                submitBtn.disabled = false;
            }
        },
        () => {
            alert('Could not get your location. Please enable location services.');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    );
}

// Handle search
function handleSearch() {
    applyFilters();
}

// Handle filter
function handleFilter() {
    applyFilters();
}

// Handle sort
function handleSort() {
    applyFilters();
}

// Apply all filters and sorting
function applyFilters() {
    const searchInput = document.getElementById('search-donations');
    const categoryFilter = document.getElementById('filter-category');
    const sortSelect = document.getElementById('sort-donations');
    
    // Always show unclaimed, non-expired donations on map
    if (!searchInput || !categoryFilter || !sortSelect) {
        filteredDonations = allDonations.filter(d => !d.claimed && !d.expired);
        updateMapMarkers();
        if (userRole === 'shelter') {
            updateDonationsList();
            updateRealtimeFeed();
        }
        if (userRole === 'donor') {
            updateDonorStats();
            loadMyDonations();
        }
        updateStats();
        updateImpactBanner();
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase() || '';
    const categoryValue = categoryFilter.value || '';
    const sortBy = sortSelect.value || 'time';
    
    filteredDonations = allDonations.filter(donation => {
        const matchesSearch = !searchTerm || 
            donation.foodName.toLowerCase().includes(searchTerm) ||
            (donation.notes && donation.notes.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryValue || donation.category === categoryValue;
        return matchesSearch && matchesCategory && !donation.claimed && !donation.expired;
    });
    
    // Sort donations
    if (sortBy === 'distance' && userLocation) {
        filteredDonations.forEach(donation => {
            donation.distance = calculateDistance(
                userLocation.lat, userLocation.lng,
                donation.latitude, donation.longitude
            );
        });
        filteredDonations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'time') {
        filteredDonations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'quantity') {
        // Simple quantity sort (extract numbers if possible)
        filteredDonations.sort((a, b) => {
            const numA = parseInt(a.quantity) || 0;
            const numB = parseInt(b.quantity) || 0;
            return numB - numA;
        });
    }
    
    // Update UI
    updateDonationsList();
    updateMapMarkers();
            if (userRole === 'donor') {
                updateDonorStats();
                loadMyDonations();
            }
    updateStats();
            updateImpactBanner();
    updateLeaderboard();
    updateDashboardWidgets();
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// Update donations list
function updateDonationsList() {
    const donationsList = document.getElementById('donations-list');
    if (!donationsList || userRole !== 'shelter') return;
    
    donationsList.innerHTML = '';
    
    if (filteredDonations.length === 0) {
        donationsList.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon">📭</div>
                <p class="empty-state">No donations match your filters</p>
                <p class="empty-state-subtitle">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    filteredDonations.forEach(donation => {
        addDonationToList(donation, donationsList);
    });
}

// Update map markers
function updateMapMarkers() {
    // Remove all existing markers
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};
    
    // Add markers for filtered donations
    filteredDonations.forEach(donation => {
        addDonationMarker(donation);
    });
}

// Update stats
function updateStats() {
    if (userRole === 'shelter') {
        const availableCount = filteredDonations.length;
        const claimedCount = allDonations.filter(d => d.claimed && d.claimedBy === currentUser?.uid).length;
        
        const availableEl = document.getElementById('shelter-stats-available');
        const claimedEl = document.getElementById('shelter-stats-claimed');
        if (availableEl) availableEl.textContent = availableCount;
        if (claimedEl) claimedEl.textContent = claimedCount;
    }
}

// Update donor stats
function updateDonorStats() {
    if (userRole === 'donor') {
    const totalDonations = userDonations.length;
    const claimedDonations = userDonations.filter(d => d.claimed).length;
    
        const countEl = document.getElementById('donor-stats-count');
        const claimedEl = document.getElementById('donor-stats-claimed');
        if (countEl) countEl.textContent = totalDonations;
        if (claimedEl) claimedEl.textContent = claimedDonations;
    }
}

// Load my donations (for donor)
function loadMyDonations() {
    const myDonationsSection = document.getElementById('my-donations-section');
    const myDonationsList = document.getElementById('my-donations-list');
    
    if (!myDonationsSection || !myDonationsList) return;
    
    const recentDonations = userDonations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    if (recentDonations.length === 0) {
        myDonationsSection.style.display = 'none';
        return;
    }
    
    myDonationsSection.style.display = 'block';
    myDonationsList.innerHTML = '';
    
    recentDonations.forEach(donation => {
        const item = document.createElement('div');
        item.className = 'my-donation-item';
        const status = donation.claimed ? '✅ Claimed' : '⏳ Available';
        const statusClass = donation.claimed ? 'claimed' : 'available';
        item.innerHTML = `
            <div class="my-donation-content">
                <strong>${donation.foodName}</strong>
                <span class="donation-status ${statusClass}">${status}</span>
            </div>
            <small>${donation.quantity} • ${new Date(donation.timestamp).toLocaleDateString()}</small>
        `;
        myDonationsList.appendChild(item);
    });
}

// Update impact banner
function updateImpactBanner() {
    const impactBanner = document.getElementById('impact-banner');
    const impactCount = document.getElementById('impact-count');
    
    if (!impactBanner || !impactCount) return;
    
    const totalClaimed = allDonations.filter(d => d.claimed).length;
    impactCount.textContent = totalClaimed;
    
    if (totalClaimed > 0 || allDonations.length > 0) {
        impactBanner.style.display = 'flex';
    }
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'produce': '🥬',
        'bakery': '🍞',
        'canned': '🥫',
        'dairy': '🥛',
        'meals': '🍱',
        'snacks': '🍪',
        'other': '📦'
    };
    return icons[category] || '📦';
}

// Add donation marker to map
function addDonationMarker(donation) {
    const categoryIcon = getCategoryIcon(donation.category);
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-icon">${categoryIcon}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });
    
    const marker = L.marker([donation.latitude, donation.longitude], { icon: customIcon }).addTo(map);
    
    // Calculate distance if user location available
    let distanceText = '';
    if (userLocation) {
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            donation.latitude, donation.longitude
        );
        distanceText = `<p><strong>📍 Distance:</strong> ${distance.toFixed(1)} km away</p>`;
    }
    
    const urgencyBadge = getUrgencyBadge(donation);
    const popupContent = `
        <div class="popup-content">
            <h3>${categoryIcon} ${donation.foodName} ${urgencyBadge}</h3>
            <p><strong>Category:</strong> ${donation.category || 'Other'}</p>
            <p><strong>Quantity:</strong> ${donation.quantity}</p>
            <p><strong>Pickup By:</strong> ${donation.pickupTimeDisplay || new Date(donation.pickupTime).toLocaleString()}</p>
            ${distanceText}
            ${donation.notes ? `<p><strong>Notes:</strong> ${donation.notes}</p>` : ''}
            <p><strong>Donor:</strong> ${donation.donorName}</p>
            ${userRole === 'shelter' ? `<button class="btn btn-success claim-btn" data-id="${donation.id}">⚡ Quick Claim</button>` : ''}
        </div>
    `;
    
    marker.bindPopup(popupContent);
    markers[donation.id] = marker;

    // Add claim button listener
    if (userRole === 'shelter') {
        marker.on('popupopen', () => {
            const claimBtn = document.querySelector(`.claim-btn[data-id="${donation.id}"]`);
            if (claimBtn) {
                claimBtn.addEventListener('click', () => claimDonation(donation.id));
            }
        });
    }
}

// Check if donation is expiring soon
function isExpiringSoon(donation) {
    if (!donation.pickupTime) return false;
    const now = new Date();
    const pickupTime = new Date(donation.pickupTime);
    const hoursUntilExpiry = (pickupTime - now) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 2; // Less than 2 hours
}

// Get urgency badge HTML
function getUrgencyBadge(donation) {
    if (!donation.pickupTime) return '';
    const now = new Date();
    const pickupTime = new Date(donation.pickupTime);
    const hoursUntilExpiry = (pickupTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry <= 0) {
        return '<span class="urgency-badge urgent-expired">⚠️ Expired</span>';
    } else if (hoursUntilExpiry <= 2) {
        return '<span class="urgency-badge urgent-soon">🔥 Expiring Soon!</span>';
    } else if (hoursUntilExpiry <= 6) {
        return '<span class="urgency-badge urgent-warning">⏰ Limited Time</span>';
    }
    return '';
}

// Add donation to list (for shelters)
function addDonationToList(donation, container) {
    const donationItem = document.createElement('div');
    donationItem.className = 'donation-item';
    
    const categoryIcon = getCategoryIcon(donation.category);
    let distanceText = '';
    if (donation.distance !== undefined) {
        distanceText = `<span class="distance-badge">📍 ${donation.distance.toFixed(1)} km</span>`;
    }
    
    const timeAgo = getTimeAgo(new Date(donation.timestamp));
    const urgencyBadge = getUrgencyBadge(donation);
    
    // Add urgency class if expiring soon
    if (isExpiringSoon(donation)) {
        donationItem.classList.add('donation-urgent');
    }
    
    donationItem.innerHTML = `
        <div class="donation-item-header">
            <span class="category-icon">${categoryIcon}</span>
            <h4>${donation.foodName}</h4>
            ${urgencyBadge}
            ${distanceText}
        </div>
        <div class="donation-item-body">
            <p><strong>Quantity:</strong> ${donation.quantity}</p>
            <p><strong>Pickup By:</strong> ${donation.pickupTimeDisplay || new Date(donation.pickupTime).toLocaleString()}</p>
            <p><strong>Donor:</strong> ${donation.donorName}</p>
            ${donation.notes ? `<p class="donation-notes"><em>${donation.notes}</em></p>` : ''}
            <small class="time-ago">Posted ${timeAgo}</small>
        </div>
        <button class="btn btn-success claim-btn" data-id="${donation.id}">
            <span>⚡ Quick Claim</span>
        </button>
    `;
    
    const claimBtn = donationItem.querySelector('.claim-btn');
    claimBtn.addEventListener('click', () => claimDonation(donation.id));
    
    container.appendChild(donationItem);
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Claim a donation
async function claimDonation(donationId) {
    if (!currentUser || userRole !== 'shelter') {
        alert('Please sign in as a shelter to claim donations.');
        return;
    }

    if (!confirm('Are you sure you want to claim this donation?')) {
        return;
    }

    try {
        // Find donation and mark as claimed
        const donationIndex = allDonations.findIndex(d => d.id === donationId);
        if (donationIndex !== -1) {
            allDonations[donationIndex].claimed = true;
            allDonations[donationIndex].claimedBy = currentUser.uid;
            allDonations[donationIndex].claimedByName = currentUser.displayName || currentUser.name;
            allDonations[donationIndex].claimedAt = new Date().toISOString();
            
            saveDonations();
            loadDonations();
            applyFilters();
            updateStats();
            updateImpactBanner();
            updateLeaderboard();
            updateDashboardWidgets();
        
        showNotification('✅ Donation claimed successfully!', 'success');
        } else {
            throw new Error('Donation not found');
        }
    } catch (error) {
        console.error('Error claiming donation:', error);
        alert('Failed to claim donation. Please try again.');
    }
}

// Show notification toast
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds (or 5 for errors)
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Initialize Dark Mode
function initializeDarkMode() {
    const savedMode = localStorage.getItem(STORAGE_KEY_DARK_MODE);
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        const toggleBtn = document.getElementById('dark-mode-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = '☀️';
        }
    }
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem(STORAGE_KEY_DARK_MODE, isDark.toString());
    
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = isDark ? '☀️' : '🌙';
    }
}

// Calculate Impact Metrics
function calculateImpact(donations) {
    let totalKg = 0;
    let mealsSaved = 0;
    let co2Prevented = 0;
    let waterSaved = 0;
    
    donations.forEach(donation => {
        if (donation.claimed) {
            // Extract quantity number (e.g., "5 kg" -> 5, "20 pieces" -> 20/4 = 5kg estimate)
            const quantityText = donation.quantity.toLowerCase();
            let kg = 0;
            
            if (quantityText.includes('kg')) {
                kg = parseFloat(quantityText) || 0;
            } else if (quantityText.includes('pieces') || quantityText.includes('items')) {
                // Estimate: 4 pieces = 1 kg
                const pieces = parseFloat(quantityText) || 0;
                kg = pieces / 4;
            } else if (quantityText.includes('meals')) {
                // Estimate: 1 meal = 0.25 kg
                const meals = parseFloat(quantityText) || 0;
                kg = meals * 0.25;
            } else if (quantityText.includes('boxes') || quantityText.includes('cans')) {
                // Estimate: 2 boxes/cans = 1 kg
                const items = parseFloat(quantityText) || 0;
                kg = items / 2;
            } else {
                // Default: try to extract number and assume kg
                kg = parseFloat(quantityText) || 1;
            }
            
            totalKg += kg;
            mealsSaved += Math.round(kg * MEALS_PER_KG);
            co2Prevented += kg * CO2_PER_KG;
            waterSaved += kg * WATER_PER_KG;
        }
    });
    
    return {
        meals: mealsSaved,
        co2: co2Prevented,
        water: waterSaved,
        kg: totalKg
    };
}

// Update Donor Impact Metrics
function updateDonorImpactMetrics() {
    if (userRole !== 'donor') return;
    
    const claimedDonations = userDonations.filter(d => d.claimed);
    const impact = calculateImpact(claimedDonations);
    
    const mealsEl = document.getElementById('donor-meals-saved');
    const co2El = document.getElementById('donor-co2-saved');
    
    if (mealsEl) mealsEl.textContent = impact.meals;
    if (co2El) co2El.textContent = impact.co2.toFixed(1) + ' kg';
}

// Update Impact Banner with Enhanced Metrics
function updateImpactBanner() {
    const impactBanner = document.getElementById('impact-banner');
    const impactCount = document.getElementById('impact-count');
    const impactCo2 = document.getElementById('impact-co2');
    const impactWater = document.getElementById('impact-water');
    
    if (!impactBanner || !impactCount) return;
    
    const claimedDonations = allDonations.filter(d => d.claimed);
    const impact = calculateImpact(claimedDonations);
    
    if (impactCount) impactCount.textContent = impact.meals;
    if (impactCo2) impactCo2.textContent = impact.co2.toFixed(1) + ' kg';
    if (impactWater) impactWater.textContent = Math.round(impact.water) + 'L';
    
    if (claimedDonations.length > 0 || allDonations.length > 0) {
        impactBanner.style.display = 'flex';
    }
}

// Share Impact
function shareImpact() {
    const impact = calculateImpact(allDonations.filter(d => d.claimed));
    const text = `🌱 I'm using BloomNet to fight food waste! We've saved ${impact.meals} meals, prevented ${impact.co2.toFixed(1)}kg CO₂, and saved ${Math.round(impact.water)}L of water! Join us at #BloomNet #FoodWaste #Sustainability`;
    
    if (navigator.share) {
        navigator.share({
            title: 'BloomNet Impact',
            text: text,
            url: window.location.href
        }).catch(() => {
            copyToClipboard(text);
            showNotification('✅ Impact copied to clipboard!', 'success');
        });
    } else {
        copyToClipboard(text);
        showNotification('✅ Impact copied to clipboard!', 'success');
    }
}

// Share Donation
function shareDonation(donation) {
    const text = `🍽️ ${donation.foodName} available on BloomNet! ${donation.quantity} - ${donation.category}. Pickup by ${new Date(donation.pickupTime).toLocaleString()}. Help reduce food waste! #BloomNet`;
    
    if (navigator.share) {
        navigator.share({
            title: `Donation: ${donation.foodName}`,
            text: text,
            url: window.location.href
        }).catch(() => {
            copyToClipboard(text);
            showNotification('✅ Donation details copied!', 'success');
        });
    } else {
        copyToClipboard(text);
        showNotification('✅ Donation details copied!', 'success');
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Check for Expired Donations
function checkExpiredDonations() {
    const now = new Date();
    let hasExpired = false;
    
    allDonations.forEach(donation => {
        if (!donation.claimed) {
            const pickupTime = new Date(donation.pickupTime);
            if (pickupTime < now) {
                donation.expired = true;
                hasExpired = true;
            } else {
                donation.expired = false;
            }
        }
    });
    
    if (hasExpired) {
        saveDonations();
        applyFilters();
        showNotification('⏰ Some donations have expired', 'info');
    }
}

// Start Auto-Expiry Check
function startAutoExpiryCheck() {
    // Check every 5 minutes
    setInterval(checkExpiredDonations, 5 * 60 * 1000);
    // Initial check
    setTimeout(checkExpiredDonations, 1000);
}

// Real-time Feed Functions
let realtimeFeedItems = [];

function startRealtimeFeed() {
    // Simulate real-time updates by checking for new donations
    setInterval(() => {
        updateRealtimeFeed();
    }, 3000);
}

function updateRealtimeFeed() {
    if (userRole !== 'shelter') return;
    
    const feedCard = document.getElementById('realtime-feed');
    const feedList = document.getElementById('realtime-feed-list');
    
    if (!feedCard || !feedList) return;
    
    // Get recent unclaimed donations (last 5)
    const recentDonations = allDonations
        .filter(d => !d.claimed && !d.expired)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    if (recentDonations.length === 0) {
        feedCard.style.display = 'none';
        return;
    }
    
    feedCard.style.display = 'block';
    feedList.innerHTML = '';
    
    recentDonations.forEach(donation => {
        const feedItem = document.createElement('div');
        feedItem.className = 'realtime-feed-item';
        const categoryIcon = getCategoryIcon(donation.category);
        const timeAgo = getTimeAgo(new Date(donation.timestamp));
        
        feedItem.innerHTML = `
            <span class="feed-icon">${categoryIcon}</span>
            <div class="feed-content">
                <strong>${donation.foodName}</strong> - ${donation.quantity}
            </div>
            <div class="feed-time">${timeAgo}</div>
        `;
        
        feedList.appendChild(feedItem);
    });
}

// Update donor stats with impact
function updateDonorStats() {
    if (userRole === 'donor') {
        const totalDonations = userDonations.length;
        const claimedDonations = userDonations.filter(d => d.claimed).length;
        
        const countEl = document.getElementById('donor-stats-count');
        const claimedEl = document.getElementById('donor-stats-claimed');
        if (countEl) countEl.textContent = totalDonations;
        if (claimedEl) claimedEl.textContent = claimedDonations;
        
        // Update impact metrics
        updateDonorImpactMetrics();
    }
}

// Calculate Leaderboard
function calculateLeaderboard() {
    const donorStats = {};
    
    allDonations.forEach(donation => {
        if (donation.claimed && donation.donorId) {
            if (!donorStats[donation.donorId]) {
                donorStats[donation.donorId] = {
                    donorId: donation.donorId,
                    donorName: donation.donorName,
                    totalDonations: 0,
                    claimedDonations: 0,
                    impact: { meals: 0, co2: 0 }
                };
            }
            donorStats[donation.donorId].claimedDonations++;
        }
        
        if (donation.donorId) {
            if (!donorStats[donation.donorId]) {
                donorStats[donation.donorId] = {
                    donorId: donation.donorId,
                    donorName: donation.donorName,
                    totalDonations: 0,
                    claimedDonations: 0,
                    impact: { meals: 0, co2: 0 }
                };
            }
            donorStats[donation.donorId].totalDonations++;
        }
    });
    
    // Calculate impact for each donor
    Object.values(donorStats).forEach(donor => {
        const donorDonations = allDonations.filter(d => d.donorId === donor.donorId && d.claimed);
        const impact = calculateImpact(donorDonations);
        donor.impact = impact;
    });
    
    // Sort by claimed donations (impact)
    return Object.values(donorStats)
        .sort((a, b) => b.claimedDonations - a.claimedDonations || b.impact.meals - a.impact.meals)
        .slice(0, 5); // Top 5
}

// Update Leaderboard
function updateLeaderboard() {
    const leaderboardSection = document.getElementById('leaderboard-section');
    const leaderboardList = document.getElementById('leaderboard-list');
    
    if (!leaderboardSection || !leaderboardList) return;
    
    const topDonors = calculateLeaderboard();
    
    if (topDonors.length === 0) {
        leaderboardSection.style.display = 'none';
        return;
    }
    
    leaderboardSection.style.display = 'block';
    leaderboardList.innerHTML = '';
    
    topDonors.forEach((donor, index) => {
        const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐';
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = 'leaderboard-item';
        
        leaderboardItem.innerHTML = `
            <div class="leaderboard-rank">${rankIcon}</div>
            <div class="leaderboard-info">
                <strong>${donor.donorName}</strong>
                <small>${donor.claimedDonations} donations • ${donor.impact.meals} meals saved</small>
            </div>
            <div class="leaderboard-impact">${donor.impact.co2.toFixed(1)}kg CO₂</div>
        `;
        
        leaderboardList.appendChild(leaderboardItem);
    });
}

// Show leaderboard on welcome screen
function showLeaderboardOnWelcome() {
    const welcomePanel = document.getElementById('welcome-panel');
    if (welcomePanel && welcomePanel.style.display !== 'none') {
        updateLeaderboard();
    }
}

// Update Dashboard Widgets
function updateDashboardWidgets() {
    if (!currentUser) return;
    
    // Update Quick Stats
    const availableCount = allDonations.filter(d => !d.claimed && !d.expired).length;
    const claimedToday = allDonations.filter(d => {
        if (!d.claimed || !d.claimedAt) return false;
        const claimedDate = new Date(d.claimedAt);
        const today = new Date();
        return claimedDate.toDateString() === today.toDateString();
    }).length;
    
    // Count unique active donors
    const activeDonors = new Set(allDonations
        .filter(d => !d.expired && new Date(d.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .map(d => d.donorId)
    ).size;
    
    const widgetAvailable = document.getElementById('widget-available');
    const widgetClaimed = document.getElementById('widget-claimed');
    const widgetActive = document.getElementById('widget-active');
    
    if (widgetAvailable) widgetAvailable.textContent = availableCount;
    if (widgetClaimed) widgetClaimed.textContent = claimedToday;
    if (widgetActive) widgetActive.textContent = activeDonors;
    
    // Update Recent Activity
    updateRecentActivity();
    
    // Update Category Distribution
    updateCategoryDistribution();
}

// Update Recent Activity
function updateRecentActivity() {
    const activityList = document.getElementById('recent-activity-list');
    if (!activityList) return;
    
    // Get recent donations and claims
    const recentItems = [];
    
    // Add recent donations
    allDonations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3)
        .forEach(donation => {
            recentItems.push({
                icon: getCategoryIcon(donation.category),
                text: `${donation.foodName} posted by ${donation.donorName}`,
                time: getTimeAgo(new Date(donation.timestamp))
            });
        });
    
    // Add recent claims
    allDonations
        .filter(d => d.claimed && d.claimedAt)
        .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))
        .slice(0, 2)
        .forEach(donation => {
            recentItems.push({
                icon: '✅',
                text: `${donation.foodName} claimed by ${donation.claimedByName}`,
                time: getTimeAgo(new Date(donation.claimedAt))
            });
        });
    
    // Sort by time and take top 5
    recentItems.sort((a, b) => {
        // Simple sort - most recent first
        return 0; // Already sorted
    });
    
    activityList.innerHTML = '';
    
    if (recentItems.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <span class="activity-icon">🌱</span>
                <span class="activity-text">No recent activity yet</span>
            </div>
        `;
        return;
    }
    
    recentItems.slice(0, 5).forEach(item => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-icon">${item.icon}</span>
            <span class="activity-text">${item.text} <small style="color: #999;">• ${item.time}</small></span>
        `;
        activityList.appendChild(activityItem);
    });
}

// Update Category Distribution
function updateCategoryDistribution() {
    const categoryDistribution = document.getElementById('category-distribution');
    if (!categoryDistribution) return;
    
    // Count donations by category
    const categoryCounts = {};
    const totalDonations = allDonations.filter(d => !d.claimed && !d.expired).length;
    
    allDonations
        .filter(d => !d.claimed && !d.expired)
        .forEach(donation => {
            const cat = donation.category || 'other';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
    
    // Update progress bars
    const categories = ['produce', 'bakery', 'canned', 'dairy', 'meals', 'snacks', 'other'];
    const maxCount = Math.max(...Object.values(categoryCounts), 1);
    
    categories.forEach(category => {
        const fill = categoryDistribution.querySelector(`.category-fill[data-category="${category}"]`);
        if (fill) {
            const count = categoryCounts[category] || 0;
            const percentage = totalDonations > 0 ? (count / totalDonations) * 100 : 0;
            fill.style.width = `${percentage}%`;
        }
    });
    
    // Update labels with counts
    categoryDistribution.querySelectorAll('.category-label').forEach(label => {
        const category = label.textContent.match(/[🥬🍞🥫🥛🍱🍪📦]/)?.[0];
        if (category) {
            const iconToCategory = {
                '🥬': 'produce',
                '🍞': 'bakery',
                '🥫': 'canned',
                '🥛': 'dairy',
                '🍱': 'meals',
                '🍪': 'snacks',
                '📦': 'other'
            };
            const categoryKey = iconToCategory[category];
            if (categoryKey) {
                const count = categoryCounts[categoryKey] || 0;
                if (count > 0) {
                    label.innerHTML = `${category} ${label.textContent.replace(category, '').trim()} <strong style="float: right; color: #667eea;">${count}</strong>`;
                }
            }
        }
    });
}
