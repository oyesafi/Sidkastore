document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryFilter = document.getElementById('category-filter');
    const errorContainer = document.createElement('div'); // Create error container dynamically
    
    // Insert error container at the top of the products section
    productsGrid.parentNode.insertBefore(errorContainer, productsGrid);

    // Show loading state (already in your HTML, but we'll keep this for reference)
    productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
            <p>Loading products...</p>
        </div>
    `;

    try {
        const products = await fetchProducts();
        
        // Check if we only have the fallback product
        if (products.length === 1 && products[0].id === 'fallback') {
            showError('We\'re having trouble loading our products. Showing demo content instead.', errorContainer, true);
        }
        
        // Populate categories
        const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
        categoryFilter.innerHTML = `
            <option value="all">All Categories</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        `;
        
        // Add event listener for category filter
        categoryFilter.addEventListener('change', (e) => {
            const selectedCategory = e.target.value;
            const filteredProducts = selectedCategory === 'all' 
                ? products 
                : products.filter(p => p.category === selectedCategory);
            displayProducts(filteredProducts);
        });
        
        displayProducts(products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again later.', errorContainer, true);
        displayProducts(getFallbackProducts()); // Show fallback products
    }
});

// Fetch products from API or return fallback data
async function fetchProducts() {
    try {
        // Replace with your actual API endpoint
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Transform the data to match our expected format
        return data.map(product => ({
            id: product.id,
            title: product.title,
            category: product.category,
            price: product.price,
            imageUrl: product.image,
            description: product.description
        }));
        
    } catch (error) {
        console.error('Error fetching products:', error);
        return getFallbackProducts();
    }
}

// Display products in the grid
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<div class="col-span-full text-center py-8">No products found.</div>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" alt="${product.title}" 
                 class="w-full h-48 object-contain p-4 bg-white">
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2 line-clamp-2">${product.title}</h3>
                <p class="text-gray-500 text-sm mb-2 capitalize">${product.category}</p>
                <p class="text-gray-700 mb-4">$${product.price.toFixed(2)}</p>
                <a href="product-detail.html?id=${product.id}" 
                   class="block text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
                    View Details
                </a>
            </div>
        </div>
    `).join('');
}

// Show error message
function showError(message, containerElement, showFallback = false) {
    containerElement.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline">${message}</span>
        </div>
    `;
}

// Fallback products data
function getFallbackProducts() {
    return [
        {
            id: 1,
            title: 'Fallback Smartphone',
            category: 'electronics',
            price: 599.99,
            imageUrl: 'https://via.placeholder.com/300?text=Smartphone',
            description: 'High-end smartphone with advanced features'
        },
        {
            id: 2,
            title: 'Demo Laptop',
            category: 'electronics',
            price: 999.99,
            imageUrl: 'https://via.placeholder.com/300?text=Laptop',
            description: 'Powerful laptop for work and entertainment'
        },
        {
            id: 3,
            title: 'Sample Headphones',
            category: 'electronics',
            price: 199.99,
            imageUrl: 'https://via.placeholder.com/300?text=Headphones',
            description: 'Noise-cancelling wireless headphones'
        }
    ];
            }
