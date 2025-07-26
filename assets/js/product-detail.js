document.addEventListener('DOMContentLoaded', function() {
    fetchAllProducts();
});

async function fetchAllProducts() {
    const sheetId = '1bLwxVzaBspSCsc173yHfwhDgcL1wbcCeIkAqJYdzt9Y';
    const gid = '2128414158';
    const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx:out:json&gid=${gid}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.text();
        const jsonData = JSON.parse(data.substring(47).slice(0, -2));
        
        const products = jsonData.table.rows.slice(1).map(row => {
            const cells = row.c;
            return {
                id: cells[7]?.v || '',
                title: cells[1]?.v || '',
                detail: cells[2]?.v || '',
                price: cells[3]?.v || 0,
                category: cells[4]?.v || '',
                imageUrl: cells[5]?.v || '',
                linkUrl: cells[6]?.v || ''
            };
        });
        
        displayAllProducts(products);
        populateCategoryFilter(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-grid').innerHTML = `
            <div class="col-span-full text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

function displayAllProducts(products) {
    const container = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-box-open text-4xl text-gray-400 mb-2"></i>
                <p>No products found.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg" data-category="${product.category}">
            <a href="product-detail.html?id=${product.id}">
                <div class="product-image-container p-4 bg-gray-50">
                    <img src="${product.imageUrl || 'images/placeholder-product.png'}" alt="${product.title}" class="mx-auto">
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-2 truncate">${product.title}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.detail}</p>
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-blue-600">$${product.price.toFixed(2)}</span>
                        <button class="add-to-cart bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

function populateCategoryFilter(products) {
    const categoryFilter = document.getElementById('category-filter');
    const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    categoryFilter.addEventListener('change', function() {
        const selectedCategory = this.value;
        const allProducts = document.querySelectorAll('.product-card');
        
        allProducts.forEach(product => {
            const productCategory = product.dataset.category;
            
            if (selectedCategory === 'all' || productCategory === selectedCategory) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    });
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[productId] = (cart[productId] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center';
    notification.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        <span>Item added to cart!</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = count;
    });
}

updateCartCount();
