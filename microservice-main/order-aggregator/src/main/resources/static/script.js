document.getElementById('fetchBtn').addEventListener('click', async () => {
    const btn = document.getElementById('fetchBtn');
    const results = document.getElementById('results');
    const statusBadge = document.getElementById('statusBadge');
    
    // UI state: loading
    btn.classList.add('loading');
    btn.disabled = true;
    results.classList.add('hidden');
    statusBadge.classList.add('hidden');

    try {
        // Fetch from the microservices API
        const response = await fetch('/orders/create/1/101');
        const data = await response.json();

        // 1. Fill User Service Card
        document.getElementById('userContent').innerHTML = `
            <div class="data-row">
                <span class="data-label">Name</span>
                <span class="data-value highlight">${data.user.name}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Email</span>
                <span class="data-value">${data.user.email}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Balance</span>
                <span class="data-value">$${data.user.balance.toFixed(2)}</span>
            </div>
        `;

        // 2. Fill Inventory Service Card
        document.getElementById('productContent').innerHTML = `
            <div class="data-row">
                <span class="data-label">Product Name</span>
                <span class="data-value highlight">${data.product.name}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Price</span>
                <span class="data-value">$${data.product.price.toFixed(2)}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Stock Remaining</span>
                <span class="data-value">${data.product.stock} units</span>
            </div>
        `;

        // 3. Fill External Post Card
        document.getElementById('postContent').innerHTML = `
            <div class="data-row">
                <span class="data-label">Post Title (Mocked)</span>
                <span class="data-value highlight" style="font-size: 0.95rem; line-height: 1.4;">${data.externalPost.title}</span>
            </div>
            <div class="data-row" style="margin-top: 0.5rem">
                <span class="data-label">Body Snippet</span>
                <span class="data-value" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${data.externalPost.body.substring(0, 80)}...</span>
            </div>
        `;

        // Show status
        statusBadge.textContent = "Status: " + data.status.replace(/_/g, ' ');

        // Update UI state: show results
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
            results.classList.remove('hidden');
            statusBadge.classList.remove('hidden');
        }, 500); // Artificial delay to show the nice loading animation

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to connect to the backend API.");
        btn.classList.remove('loading');
        btn.disabled = false;
    }
});
