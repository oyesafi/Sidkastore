document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryFilter = document.getElementById('category-filter');
    const errorContainer = document.getElementById('error-container');
    
    // Load products
    const products = await fetchProducts();
    if (!products || products.length === 0) {
        showError('Failed to load products. Please try again later.', 'error-container');
        productsGrid.innerHTML = '';
        return;
    }
    
    // Populate categories
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Display all products initially
    displayProducts(products);
    
    // Filter products by category
    categoryFilter.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        if (selectedCategory === 'all') {
            displayProducts(products);
        } else {
            const filtered = products.filter(p => p.category === selectedCategory);
            displayProducts(filtered);
        }
    });
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
