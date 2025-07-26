// Google Sheets Configuration
const SHEET_ID = '1bLwxVzaBspSCsc173yHfwhDgcL1wbcCeIkAqJYdzt9Y';
const GID = '2128414158';
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

// Order Submission URL (Google Apps Script Web App)
const ORDER_SUBMISSION_URL = 'https://script.google.com/macros/s/AKfycbz05uvsqZ2OKvzI1oDgFUcYeoXbmbmV2j5A6pHjggvsdsyXAaHkWVyflBjx2Dl6YNlj/exec';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu functionality
    initMobileMenu();
    
    // Load featured products if on homepage
    if (document.getElementById('featured-products')) {
        fetchProducts(true);
    }

    // Update cart count
    updateCartCount();
});

function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.querySelector('.mobile-menu-backdrop');
    
    if (!menuButton || !menu || !backdrop) {
        console.error('Mobile menu elements not found');
        return;
    }
    
    // Toggle menu and backdrop
    menuButton.addEventListener('click', function() {
        menu.classList.toggle('active');
        backdrop.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
    });
    
    // Close menu when clicking backdrop
    backdrop.addEventListener('click', function() {
        menu.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
    });
    
    // Close menu when clicking a link (optional)
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menu.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
        });
    });
}

// Rest of your existing code (fetchProducts, displayProducts, cart functions, etc.) remains the same...