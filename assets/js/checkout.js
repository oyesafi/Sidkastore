document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('product');
    const productPrice = urlParams.get('price');
    const orderSummary = document.getElementById('order-summary');
    const formMessage = document.getElementById('form-message');
    const checkoutForm = document.getElementById('checkout-form');
    
    // Set product info
    document.getElementById('product-name').value = productName || '';
    document.getElementById('product-price').value = productPrice || '';
    
    // Display order summary
    if (productName && productPrice) {
        orderSummary.innerHTML = `
            <h3 class="font-bold mb-2">Order Summary</h3>
            <p><strong>Product:</strong> ${decodeURIComponent(productName)}</p>
            <p><strong>Price:</strong> $${parseFloat(productPrice).toFixed(2)}</p>
        `;
    } else {
        orderSummary.innerHTML = '<p>No product selected</p>';
    }
    
    // Handle form submission
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(checkoutForm);
            const formObject = Object.fromEntries(formData.entries());
            
            // Send to Google Apps Script
            const response = await fetch('https://script.google.com/macros/s/AKfycbz05uvsqZ2OKvzI1oDgFUcYeoXbmbmV2j5A6pHjggvsdsyXAaHkWVyflBjx2Dl6YNlj/exec', {
                method: 'POST',
                body: JSON.stringify(formObject),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                window.location.href = 'thank-you.html';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            formMessage.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline">Failed to submit order. Please try again.</span>
                </div>
            `;
            formMessage.classList.remove('hidden');
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
});
