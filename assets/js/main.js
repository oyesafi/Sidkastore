// Shared configuration
const config = {
    sheetId: '1bLwxVzaBspSCsc173yHfwhDgcL1wbcCeIkAqJYdzt9Y',
    gid: '2128414158',
    apiUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`
};

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Fetch products from Google Sheets
async function fetchProducts() {
    try {
        const response = await fetch(config.apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.text();
        
        // Handle empty response
        if (!data || data.length < 50) {
            throw new Error('Empty or incomplete data received from server');
        }
        
        // Try to parse the JSON
        let jsonData;
        try {
            jsonData = JSON.parse(data.substring(47).slice(0, -2));
        } catch (parseError) {
            throw new Error('Failed to parse product data');
        }
        
        // Validate the data structure
        if (!jsonData?.table?.rows) {
            throw new Error('Invalid data structure received');
        }
        
        // Process the rows
        const products = jsonData.table.rows.slice(1).map(row => {
            const cells = row.c;
            return {
                id: cells[7]?.v || Math.random().toString(36).substring(2, 9), // Fallback random ID
                title: cells[1]?.v || 'Untitled Product',
                detail: cells[2]?.v || 'No description available',
                price: parseFloat(cells[3]?.v) || 0,
                category: cells[4]?.v || 'Uncategorized',
                imageUrl: cells[5]?.v || 'https://via.placeholder.com/300?text=Product+Image',
                linkUrl: cells[6]?.v || '#',
                timestamp: cells[0]?.v || ''
            };
        });
        
        // Check if we got any products
        if (products.length === 0) {
            throw new Error('No products found in the database');
        }
        
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        
        // Return a fallback product if the API fails
        return [{
            id: 'fallback',
            title: 'Demo Product',
            detail: 'This is a demo product shown because we couldn\'t load real products.',
            price: 19.99,
            category: 'Demo',
            imageUrl: 'https://via.placeholder.com/300?text=Demo+Product',
            linkUrl: '#',
            timestamp: new Date().toISOString()
        }];
    }
}
// Load featured products (3 random products)
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8">Loading products...</div>';
    
    const products = await fetchProducts();
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-red-500">Failed to load products. Please try again later.</div>';
        return;
    }
    
    // Get 3 random featured products
    const featured = products.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    container.innerHTML = featured.map(product => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" alt="${product.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-xl mb-2">${product.title}</h3>
                <p class="text-gray-700 mb-4">$${product.price.toFixed(2)}</p>
                <a href="product-detail.html?id=${product.id}" class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300">View Details</a>
            </div>
        </div>
    `).join('');
}

// Display error message
function showError(message, containerId, showRetry = false) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <strong class="font-bold">Error!</strong>
                </div>
                <div class="mt-2">${message}</div>
                ${showRetry ? `
                <div class="mt-4">
                    <button onclick="window.location.reload()" class="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition">
                        <i class="fas fa-sync-alt mr-2"></i> Try Again
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        container.classList.remove('hidden');
    }
}

// Display success message
function showSuccess(message, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Success!</strong>
                <span class="block sm:inline">${message}</span>
            </div>
        `;
    }
}
