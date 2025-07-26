document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const productContainer = document.getElementById('product-container');
    const errorContainer = document.getElementById('error-container');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Show loading state
    productContainer.innerHTML = `
        <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p class="text-gray-600">Loading product details...</p>
        </div>
    `;

    // Validate product ID
    if (!productId) {
        showError(`
            <div class="text-center">
                <i class="fas fa-exclamation-circle text-4xl text-yellow-500 mb-4"></i>
                <h3 class="text-xl font-bold mb-2">No Product Selected</h3>
                <p class="mb-4">Please choose a product from our <a href="products.html" class="text-green-600 hover:underline">products page</a>.</p>
            </div>
        `, 'error-container');
        productContainer.innerHTML = '';
        return;
    }

    try {
        // Fetch products
        const products = await fetchProducts();
        
        // Find the requested product
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }

        // Display product details
        productContainer.innerHTML = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="md:flex">
                    <!-- Product Image -->
                    <div class="md:w-1/2 p-6 flex items-center justify-center bg-gray-50">
                        <img src="${product.imageUrl}" 
                             alt="${product.title}"
                             class="max-h-96 w-auto object-contain"
                             onerror="this.src='https://via.placeholder.com/500?text=Product+Image'">
                    </div>
                    
                    <!-- Product Info -->
                    <div class="md:w-1/2 p-6">
                        <!-- Category Badge -->
                        ${product.category ? `
                        <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide mb-2">
                            ${product.category}
                        </span>
                        ` : ''}
                        
                        <!-- Product Title -->
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                            ${product.title}
                        </h1>
                        
                        <!-- Price -->
                        <div class="flex items-center mb-4">
                            <span class="text-2xl font-bold text-green-600">
                                $${product.price.toFixed(2)}
                            </span>
                        </div>
                        
                        <!-- Description -->
                        <div class="prose max-w-none mb-6 text-gray-600">
                            ${product.detail.replace(/\n/g, '<br>') || 
                             '<p class="text-gray-400">No description available</p>'}
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex flex-wrap gap-3 mt-8">
                            <a href="checkout.html?product=${encodeURIComponent(product.title)}&price=${product.price}" 
                               class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 text-center">
                                <i class="fas fa-shopping-cart mr-2"></i> Order Now
                            </a>
                            
                            <a href="products.html" 
                               class="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-300 text-center">
                                <i class="fas fa-arrow-left mr-2"></i> Back to Products
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Product loading error:', error);
        
        // Show error state
        productContainer.innerHTML = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden text-center p-8">
                <i class="fas fa-exclamation-triangle text-5xl text-yellow-500 mb-4"></i>
                <h2 class="text-xl font-bold mb-2">Product Loading Failed</h2>
                
                <p class="text-gray-600 mb-6">
                    ${error.message.includes('not found') 
                        ? 'The requested product was not found in our catalog.' 
                        : 'We encountered an error loading this product.'}
                </p>
                
                <div class="flex flex-wrap justify-center gap-3">
                    <button onclick="window.location.reload()" 
                            class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300">
                        <i class="fas fa-sync-alt mr-2"></i> Try Again
                    </button>
                    
                    <a href="products.html" 
                       class="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-lg transition duration-300">
                        <i class="fas fa-boxes mr-2"></i> Browse Products
                    </a>
                    
                    <a href="contact.html" 
                       class="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-lg transition duration-300">
                        <i class="fas fa-envelope mr-2"></i> Contact Support
                    </a>
                </div>
            </div>
        `;
        
        // Also show error in error container if exists
        if (errorContainer) {
            showError(`
                Technical Details: ${error.message || 'Unknown error occurred'}
            `, 'error-container');
        }
    }
});

// Helper function to show error messages
function showError(message, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700">
                        ${message}
                    </p>
                </div>
            </div>
        </div>
    `;
    container.classList.remove('hidden');
}
