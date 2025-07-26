document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryFilter = document.getElementById('category-filter');
    const errorContainer = document.getElementById('error-container');
    
    // Show loading state
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
            showError('We\'re having trouble loading our products. Showing demo content instead.', 'error-container', true);
        }
        
        // Populate categories
        const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
        categoryFilter.innerHTML = `
            <option value="all">All Categories</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        `;
        
        displayProducts(products);
        
    } catch (error) {
        showError('Failed to load products. Please try again later.', 'error-container', true);
        productsGrid.innerHTML = '';
    }
});

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="col-span-full text-center py-8">No products found in this category.</div>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" alt="${product.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-xl mb-2">${product.title}</h3>
                <p class="text-gray-500 text-sm mb-2">${product.category}</p>
                <p class="text-gray-700 mb-4">$${product.price.toFixed(2)}</p>
                <a href="product-detail.html?id=${product.id}" class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300">View Details</a>
            </div>
        </div>
    `).join('');
}
