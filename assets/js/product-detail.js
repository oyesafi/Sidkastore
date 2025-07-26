document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productContainer = document.getElementById('product-container');
    const errorContainer = document.getElementById('error-container');
    
    if (!productId) {
        showError('Product ID is missing from URL.', 'error-container');
        return;
    }
    
    const products = await fetchProducts();
    if (!products || products.length === 0) {
        showError('Failed to load product data.', 'error-container');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        showError('Product not found.', 'error-container');
        productContainer.innerHTML = '';
        return;
    }
    
    productContainer.innerHTML = `
        <div class="md:flex">
            <div class="md:w-1/2 p-6">
                <img src="${product.imageUrl || 'https://via.placeholder.com/500'}" alt="${product.title}" class="w-full rounded-lg">
            </div>
            <div class="md:w-1/2 p-6">
                <h1 class="text-3xl font-bold mb-4">${product.title}</h1>
                <p class="text-gray-500 mb-2">${product.category}</p>
                <p class="text-2xl font-bold text-green-600 mb-4">$${product.price.toFixed(2)}</p>
                <div class="prose mb-6">
                    ${product.detail.replace(/\n/g, '<br>')}
                </div>
                <a href="checkout.html?product=${encodeURIComponent(product.title)}&price=${product.price}" class="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300 inline-block">
                    <i class="fas fa-shopping-cart mr-2"></i> Order Now
                </a>
            </div>
        </div>
    `;
});
