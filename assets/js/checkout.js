document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkout-form');
    const formMessage = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        submitBtn.disabled = true;
        
        try {
            // Validate form
            const errors = validateForm();
            if (errors.length > 0) {
                showErrors(errors);
                return;
            }

            // Prepare form data
            const formData = new FormData(form);
            const urlParams = new URLSearchParams(window.location.search);
            formData.append('product-name', urlParams.get('product') || 'Unknown Product');
            formData.append('product-price', urlParams.get('price') || 0);
            
            // Submit to Google Apps Script
            const response = await fetch(
                'https://script.google.com/macros/s/AKfycbz05uvsqZ2OKvzI1oDgFUcYeoXbmbmV2j5A6pHjggvsdsyXAaHkWVyflBjx2Dl6YNlj/exec',
                {
                    method: 'POST',
                    body: new URLSearchParams(formData),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            
            const result = await response.json();
            
            if (result.result === 'success') {
                window.location.href = 'thank-you.html';
            } else {
                throw new Error(result.error || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            formMessage.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                Order submission failed: ${error.message}
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
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    function validateForm() {
        const errors = [];
        const fields = [
            { id: 'name', name: 'Full Name' },
            { id: 'email', name: 'Email' },
            { id: 'phone', name: 'Phone Number' },
            { id: 'address', name: 'Shipping Address' }
        ];
        
        fields.forEach(field => {
            const value = document.getElementById(field.id).value.trim();
            if (!value) errors.push(`${field.name} is required`);
        });
        
        // Validate email format
        const email = document.getElementById('email').value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        return errors;
    }
    
    function showErrors(errors) {
        formMessage.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                            Please fix these errors:
                            <ul class="list-disc pl-5 mt-1">
                                ${errors.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </p>
                    </div>
                </div>
            </div>
        `;
        formMessage.classList.remove('hidden');
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});
