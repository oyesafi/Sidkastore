document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productContainer = document.getElementById('product-container');
    const errorContainer = document.getElementById('error-container');
    
    // Show loading state
    productContainer.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
            <p>Loading product details...</p>
        </div>
    `;
    
    if (!productId) {
        showError('Product ID is missing from URL. Please go back to the products page and try again.', 'error-container');
        productContainer.innerHTML = '';
        return;
    }
    
    try {
        const products = await fetchProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showError('The requested product was not found. It may have been removed or the link might be incorrect.', 'error-container', true);
            productContainer.innerHTML = '';
            return;
        }
        
        // Display the product
        productContainer.innerHTML = `
            <div class="md:flex">
                <div class="md:w-1/2 p-6">
                    <img src="${product.imageUrl}" alt="${product.title}" class="w-full rounded-lg">
                </div>
                <div class="md:w-1/2 p-6">
                    <h1 class="text-3xl font-bold mb-4">${product.title}</h1>
                    ${product.category ? `<p class="text-gray-500 mb-2">${product.category}</p>` : ''}
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
        
    } catch (error) {
        showError('Failed to load product details. Please try again later.', 'error-container', true);
        productContainer.innerHTML = '';
    }
});
