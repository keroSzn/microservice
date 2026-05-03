// Tab Switching Logic
function switchTab(tabId) {
    // Update Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update Content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Load data based on tab
    if (tabId === 'users') loadUsers();
    if (tabId === 'products') loadProducts();
    if (tabId === 'orders') {
        loadOrders();
        populateSelectOptions();
    }
}

// ================= USERS LOGIC =================
async function loadUsers() {
    try {
        const res = await fetch('/orders/proxy/users');
        const users = await res.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        users.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>$${u.balance.toFixed(2)}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Failed to load users", e);
    }
}

document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Saving...';
    
    const user = {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        balance: document.getElementById('newUserBalance').value
    };

    try {
        await fetch('/orders/proxy/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        e.target.reset();
        loadUsers();
    } catch (err) {
        alert("Error saving user");
    } finally {
        btn.textContent = 'Save User';
    }
});

// ================= PRODUCTS LOGIC =================
async function loadProducts() {
    try {
        const res = await fetch('/orders/proxy/products');
        const products = await res.json();
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';
        products.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>$${p.price.toFixed(2)}</td>
                    <td>${p.stock}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Failed to load products", e);
    }
}

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Saving...';
    
    const product = {
        name: document.getElementById('newProductName').value,
        price: document.getElementById('newProductPrice').value,
        stock: document.getElementById('newProductStock').value
    };

    try {
        await fetch('/orders/proxy/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        e.target.reset();
        loadProducts();
    } catch (err) {
        alert("Error saving product");
    } finally {
        btn.textContent = 'Save Product';
    }
});

// ================= ORDERS LOGIC =================
async function loadOrders() {
    try {
        const res = await fetch('/orders/history');
        const orders = await res.json();
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';
        orders.forEach(o => {
            const date = new Date(o.orderDate).toLocaleString();
            tbody.innerHTML += `
                <tr>
                    <td>#${o.id}</td>
                    <td>User ${o.userId}</td>
                    <td>Product ${o.productId}</td>
                    <td><span class="badge" style="background: rgba(16,185,129,0.2); color: #10b981;">${o.status.replace(/_/g, ' ')}</span></td>
                    <td>${date}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Failed to load orders", e);
    }
}

async function populateSelectOptions() {
    try {
        const usersRes = await fetch('/orders/proxy/users');
        const users = await usersRes.json();
        const uSelect = document.getElementById('orderUserSelect');
        uSelect.innerHTML = '<option value="">-- Select User --</option>';
        users.forEach(u => {
            uSelect.innerHTML += `<option value="${u.id}">${u.name} (ID: ${u.id})</option>`;
        });

        const prodRes = await fetch('/orders/proxy/products');
        const products = await prodRes.json();
        const pSelect = document.getElementById('orderProductSelect');
        pSelect.innerHTML = '<option value="">-- Select Product --</option>';
        products.forEach(p => {
            pSelect.innerHTML += `<option value="${p.id}">${p.name} (ID: ${p.id})</option>`;
        });
    } catch (e) {
        console.error("Failed to load selects", e);
    }
}

document.getElementById('createOrderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Processing...';

    const uId = document.getElementById('orderUserSelect').value;
    const pId = document.getElementById('orderProductSelect').value;

    try {
        await fetch(`/orders/create/${uId}/${pId}`);
        loadOrders();
        alert("Order processed and saved to database!");
    } catch (err) {
        alert("Error processing order");
    } finally {
        btn.textContent = 'Process Order';
    }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
