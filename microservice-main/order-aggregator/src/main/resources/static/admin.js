// Tab Switching Logic
function showToast(message, type = 'warn') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3300);
}

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
        showToast("Users listesi yuklenemedi.", "error");
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
        showToast("Kullanici kaydedilemedi.", "error");
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
        showToast("Product listesi yuklenemedi.", "error");
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
        showToast("Urun kaydedilemedi.", "error");
    } finally {
        btn.textContent = 'Save Product';
    }
});

// ================= ORDERS LOGIC =================
function setupQuantityControls() {
    const qtyInput = document.getElementById('orderQuantityInput');
    const minusBtn = document.getElementById('qtyMinusBtn');
    const plusBtn = document.getElementById('qtyPlusBtn');

    const normalize = () => {
        const val = parseInt(qtyInput.value, 10);
        qtyInput.value = Number.isNaN(val) || val < 1 ? 1 : val;
    };

    minusBtn.addEventListener('click', () => {
        normalize();
        qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
    });

    plusBtn.addEventListener('click', () => {
        normalize();
        qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });

    qtyInput.addEventListener('input', normalize);
}

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
                    <td>${o.quantity ?? 1}</td>
                    <td><span class="badge" style="background: rgba(16,185,129,0.2); color: #10b981;">${o.status.replace(/_/g, ' ')}</span></td>
                    <td>${date}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Failed to load orders", e);
        showToast("Order history yuklenemedi.", "error");
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
        showToast("Siparis secenekleri yuklenemedi.", "error");
    }
}

document.getElementById('createOrderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Processing...';

    const uId = document.getElementById('orderUserSelect').value;
    const pId = document.getElementById('orderProductSelect').value;
    const qty = Math.max(1, parseInt(document.getElementById('orderQuantityInput').value || '1', 10));

    try {
        const response = await fetch(`/orders/create/${uId}/${pId}/${qty}`);
        const result = await response.json();
        if (!response.ok || !result.status || result.status.startsWith('ORDER_FAILED')) {
            showToast(`Order failed: ${result.status || response.statusText}`, "error");
            return;
        }
        document.getElementById('orderQuantityInput').value = 1;
        loadProducts();
        loadOrders();
        showToast("Order basariyla olusturuldu.", "success");
    } catch (err) {
        showToast("Order islenirken hata olustu.", "error");
    } finally {
        btn.textContent = 'Process Order';
    }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    setupQuantityControls();
    loadUsers();
});
