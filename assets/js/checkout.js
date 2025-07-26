document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = decodeURIComponent(urlParams.get('product') || 'Unknown Product');
    const productPrice = parseFloat(urlParams.get('price')) || 0;
    const orderSummary = document.getElementById('order-summary');
    const formMessage = document.getElementById('form-message');
    const checkoutForm = document.getElementById('checkout-form');

    // Display order summary
    orderSummary.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Order Summary</h3>
        <div class="flex justify-between mb-1">
            <span>Product:</span>
            <span>${productName}</span>
        </div>
        <div class="flex justify-between font-bold">
            <span>Price:</span>
            <span>$${productPrice.toFixed(2)}</span>
        </div>
    `;

    // Set hidden field values
    document.getElementById('product-name').value = productName;
    document.getElementById('product-price').value = productPrice;

    // Form submission handler
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        submitButton.disabled = true;
        formMessage.classList.add('hidden');

        try {
            // Prepare form data
            const formData = new FormData(checkoutForm);
            const formObject = Object.fromEntries(formData.entries());
            
            // Add timestamp and product info
            formObject.timestamp = new Date().toISOString();
            formObject.product = productName;
            formObject.price = productPrice;

            // Submit to Google Apps Script
            const response = await fetch(
                'https://script.google.com/macros/s/AKfycbz05uvsqZ2OKvzI1oDgFUcYeoXbmbmV2j5A6pHjggvsdsyXAaHkWVyflBjx2Dl6YNlj/exec', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(formObject).toString()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Redirect to thank you page on success
            window.location.href = 'thank-you.html';
            
        } catch (error) {
            console.error('Submission error:', error);
            formMessage.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-400 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                Failed to submit order. Please try again or contact us if the problem persists.
                                <br><br>
                                <button onclick="window.location.reload()" 
                                        class="mt-2 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                                    <i class="fas fa-sync-alt mr-1"></i> Try Again
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            formMessage.classList.remove('hidden');
        } finally {
            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
});
