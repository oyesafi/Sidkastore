document.addEventListener('DOMContentLoaded', function() {
    // Initialize with loading state
    showLoadingState();
    fetchAllProducts();
});

async function fetchAllProducts() {
    const sheetId = '1bLwxVzaBspSCsc173yHfwhDgcL1wbcCeIkAqJYdzt9Y';
    const gid = '2128414158';
    const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx:out:json&gid=${gid}`;
    
    try {
        // Show loading state
        showLoadingState();
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.text();
        
        // Handle potential Google Sheets API response changes
        if (!data.startsWith('/*O_o*/')) {
            throw new Error('Unexpected response format from Google Sheets');
        }
        
        const jsonData = JSON.parse(data.substring(47).slice(0, -2));
        
        // Validate data structure
        if (!jsonData.table || !jsonData.table.rows) {
            throw new Error('Invalid data structure from Google Sheets');
        }
        
        const products = jsonData.table.rows.slice(1).map((row, index) => {
            const cells = row.c;
            return {
                id: cells[7]?.v || `fallback-${index}`,
                title: cells[1]?.v || 'Untitled Product',
                detail: cells[2]?.v || 'No description available',
                price: parseFloat(cells[3]?.v) || 0,
                category: cells[4]?.v || 'Uncategorized',
                imageUrl: cells[5]?.v || 'images/placeholder-product.png',
                linkUrl: cells[6]?.v || '#'
            };
        }).filter(product => product.title !== 'Untitled Product'); // Filter out empty rows
        
        if (products.length === 0) {
            throw new Error('No valid products found in the sheet');
        }
        
        displayAllProducts(products);
        populateCategoryFilter(products);
        
    } catch (error) {
        console.error('Error fetching products:', error);
        showErrorState();
        
        // Try to load from cache if available
        const cachedProducts = localStorage.getItem('cachedProducts');
        if (cachedProducts) {
            try {
                const parsedProducts = JSON.parse(cachedProducts);
                if (parsedProducts.length > 0) {
                    displayAllProducts(parsedProducts);
                    populateCategoryFilter(parsedProducts);
                    showWarning('Showing cached products. Some data may be outdated.');
                    return;
                }
            } catch (e) {
                console.error('Error parsing cached products:', e);
            }
        }
        
        // Final fallback
        displayFallbackProducts();
    }
}

function showLoadingState() {
    const container = document.getElementById('products-grid');
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p class="text-lg">Loading products...</p>
        </div>
    `;
}

function showErrorState() {
    const container = document.getElementById('products-grid');
    container.innerHTML = `
        <div class="col-span-full text-center py-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Failed to load products</h3>
            <p class="text-gray-600 mb-4">We're having trouble loading our products. Please check your connection and try again.</p>
            <button onclick="fetchAllProducts()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                <i class="fas fa-sync-alt mr-2"></i> Retry
            </button>
        </div>
    `;
}

function showWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6';
    warning.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-yellow-400"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm text-yellow-700">${message}</p>
            </div>
        </div>
    `;
    document.getElementById('products-grid').parentNode.insertBefore(warning, document.getElementById('products-grid'));
}

function displayAllProducts(products) {
    // Cache the products for offline use
    localStorage.setItem('cachedProducts', JSON.stringify(products));
    
    const container = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <i class="fas fa-box-open text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p class="text-gray-600">We couldn't find any products matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300" data-category="${product.category}">
            <a href="${product.linkUrl || 'product-detail.html?id=' + product.id}" class="block h-full">
                <div class="product-image-container h-48 bg-gray-50 flex items-center justify-center p-4">
                    <img src="${product.imageUrl}" alt="${product.title}" 
                         class="max-h-full max-w-full object-contain" 
                         onerror="this.onerror=null;this.src='images/placeholder-product.png'">
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-2 truncate">${product.title}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.detail}</p>
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-blue-600">$${product.price.toFixed(2)}</span>
                        <button class="add-to-cart bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition" 
                                data-id="${product.id}" 
                                aria-label="Add to cart">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
    
    // Add event listeners to all add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

function displayFallbackProducts() {
    const fallbackProducts = [
        {
            id: 'fallback-1',
            title: 'Sample Product 1',
            detail: 'This is a sample product description',
            price: 29.99,
            category: 'Electronics',
            imageUrl: 'images/placeholder-product.png',
            linkUrl: '#'
        },
        {
            id: 'fallback-2',
            title: 'Sample Product 2',
            detail: 'Another sample product description',
            price: 49.99,
            category: 'Home',
            imageUrl: 'images/placeholder-product.png',
            linkUrl: '#'
        }
    ];
    
    displayAllProducts(fallbackProducts);
    showWarning('Showing sample products. Our product catalog is currently unavailable.');
}

// Rest of your existing functions (populateCategoryFilter, addToCart, updateCartCount) remain the same
// ...
