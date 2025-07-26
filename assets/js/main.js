// Shared configuration
const config = {
    sheetId: '1bLwxVzaBspSCsc173yHfwhDgcL1wbcCeIkAqJYdzt9Y',
    gid: '2128414158',
    get apiUrl() {
        return `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:json&gid=${this.gid}`;
    }
};

// Initialize mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.innerHTML = mobileMenu.classList.contains('hidden') 
                ? '<i class="fas fa-bars text-gray-500"></i>'
                : '<i class="fas fa-times text-gray-500"></i>';
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars text-gray-500"></i>';
        }
    });
});

// Enhanced fetch with retry and cache
async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) return response;
            throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay * (i + 1)));
        }
    }
}

// Fetch products from Google Sheets with error handling
async function fetchProducts() {
    const cacheKey = `products_${config.sheetId}_${config.gid}`;
    const now = new Date().getTime();
    
    // Try to use cache first if available
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (now - timestamp < 3600000) { // 1 hour cache
            return data;
        }
    }

    try {
        if (!navigator.onLine) throw new Error('Offline');
        
        const response = await fetchWithRetry(config.apiUrl);
        const textData = await response.text();
        
        if (!textData || textData.length < 50) {
            throw new Error('Empty response from server');
        }
        
        // Parse the special Google Sheets JSON format
        const jsonData = JSON.parse(textData.substring(47).slice(0, -2));
        
        if (!jsonData?.table?.rows) {
            throw new Error('Invalid data structure');
        }
        
        // Process rows into products
        const products = jsonData.table.rows.slice(1).map((row, index) => {
            const cells = row.c || [];
            return {
                id: cells[7]?.v || `temp-${index}`,
                title: cells[1]?.v || 'Untitled Product',
                detail: cells[2]?.v || 'No description available',
                price: parseFloat(cells[3]?.v) || 0,
                category: cells[4]?.v || 'Uncategorized',
                imageUrl: cells[5]?.v || 'https://via.placeholder.com/300?text=Product+Image',
                linkUrl: cells[6]?.v || '#',
                timestamp: cells[0]?.v || ''
            };
        });
        
        // Cache the products
        localStorage.setItem(cacheKey, JSON.stringify({
            data: products,
            timestamp: now
        }));
        
        return products;
        
    } catch (error) {
        console.error('Fetch products error:', error);
        
        // Return cached data if available (even if stale)
        if (cached) {
            const { data } = JSON.parse(cached);
            showError('Using cached product data. Some items may be outdated.', 'error-container', true);
            return data;
        }
        
        // Final fallback
        return [{
            id: 'fallback',
            title: 'Demo Product',
            detail: 'We\'re having trouble loading products. Please check your connection and try again.',
            price: 0,
            category: 'Demo',
            imageUrl: 'https://via.placeholder.com/300?text=Product+Unavailable',
            linkUrl: '#',
            timestamp: new Date().toISOString()
        }];
    }
}

// Display error message with optional retry button
function showError(message, containerId, showRetry = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-circle text-red-400"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700">
                        ${message}
                        ${showRetry ? `
                        <button onclick="window.location.reload()" class="mt-2 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                            <i class="fas fa-sync-alt mr-1"></i> Try Again
                        </button>
                        ` : ''}
                    </p>
                </div>
            </div>
        </div>
    `;
    container.classList.remove('hidden');
}

// Display success message
function showSuccess(message, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-green-700">${message}</p>
                </div>
            </div>
        </div>
    `;
    container.classList.remove('hidden');
}

// Load featured products (3 random products)
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
            <p class="text-gray-500">Loading featured products...</p>
        </div>
    `;
    
    try {
        const products = await fetchProducts();
        
        if (!products || products.length === 0) {
            throw new Error('No products available');
        }
        
        // Get 3 random featured products (or all if less than 3)
        const featured = products.length <= 3 
            ? products 
            : products.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        container.innerHTML = featured.map(product => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <img src="${product.imageUrl}" alt="${product.title}" 
                     class="w-full h-48 object-cover" 
                     onerror="this.src='https://via.placeholder.com/300?text=Product+Image'">
                <div class="p-4">
                    <h3 class="font-bold text-xl mb-2">${product.title}</h3>
                    <p class="text-gray-700 mb-4">$${product.price.toFixed(2)}</p>
                    <a href="product-detail.html?id=${product.id}" 
                       class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300">
                        View Details
                    </a>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load featured products:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-2xl text-yellow-500 mb-2"></i>
                <p class="text-gray-500">Couldn't load featured products</p>
                <button onclick="loadFeaturedProducts()" 
                        class="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                    Retry
                </button>
            </div>
        `;
    }
}
