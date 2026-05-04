const runForm = document.getElementById("runForm");
const runButton = document.getElementById("runButton");
const prevStepBtn = document.getElementById("prevStepBtn");
const nextStepBtn = document.getElementById("nextStepBtn");
const autoPlayBtn = document.getElementById("autoPlayBtn");
const userSelect = document.getElementById("userSelect");
const productSelect = document.getElementById("productSelect");
const qtyInput = document.getElementById("qtyInput");
const qtyMinusBtn = document.getElementById("qtyMinusBtn");
const qtyPlusBtn = document.getElementById("qtyPlusBtn");
const terminal = document.getElementById("terminal");

const stepItems = [...document.querySelectorAll(".step-item")];

const nodes = {
    ui: document.getElementById("node-ui"),
    agg: document.getElementById("node-agg"),
    user: document.getElementById("node-user"),
    inventory: document.getElementById("node-inventory"),
    post: document.getElementById("node-post"),
    db: document.getElementById("node-db")
};

const lines = {
    uiAgg: document.getElementById("line-ui-agg"),
    aggFanout: document.getElementById("line-agg-fanout"),
    aggUser: document.getElementById("line-agg-user"),
    aggPost: document.getElementById("line-agg-post"),
    aggDb: document.getElementById("line-agg-db")
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STEP_COUNT = 6;
let runContext = null;
let currentStep = 0;
let autoPlayTimer = null;
let isExecutingStep = false;

function nowTime() {
    return new Date().toLocaleTimeString("tr-TR", { hour12: false });
}

function appendLog(level, message) {
    const line = document.createElement("div");
    line.className = `terminal-line ${level}`;
    line.textContent = `[${nowTime()}] ${message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function showToast(message, type = "warn") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3300);
}

function appendDelimiter(title = "") {
    const suffix = title ? ` ${title} ` : "";
    appendLog("info", `============${suffix}============`);
}

function setActiveStep(stepNumber) {
    stepItems.forEach((item) => item.classList.toggle("active", item.dataset.step === String(stepNumber)));
}

function clearStepHighlight() {
    stepItems.forEach((item) => item.classList.remove("active"));
}

function pulseLine(lineElement) {
    lineElement.classList.remove("flow");
    void lineElement.offsetWidth;
    lineElement.classList.add("flow");
}

function clearVisuals() {
    Object.values(nodes).forEach((node) => node.classList.remove("active"));
    Object.values(lines).forEach((line) => line.classList.remove("flow"));
}

function clearAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }
    autoPlayBtn.textContent = "Auto Play";
}

function updateStepButtonsState() {
    const hasContext = !!runContext;
    prevStepBtn.disabled = !hasContext || currentStep <= 1 || isExecutingStep;
    nextStepBtn.disabled = !hasContext || currentStep >= STEP_COUNT || isExecutingStep;
    autoPlayBtn.disabled = !hasContext || isExecutingStep;
}

function buildRunContext() {
    const userId = userSelect.value;
    const productId = productSelect.value;
    const quantity = Math.max(1, parseInt(qtyInput.value || "1", 10));
    return { userId, productId, quantity, users: null, products: null, orderData: null };
}

function startNewRun() {
    const userId = userSelect.value;
    const productId = productSelect.value;
    if (!userId || !productId) {
        appendLog("warn", "Lutfen once kullanici ve urun secin.");
        showToast("Lutfen once kullanici ve urun secin.", "warn");
        return false;
    }

    clearAutoPlay();
    clearVisuals();
    clearStepHighlight();
    currentStep = 0;
    runContext = buildRunContext();
    appendDelimiter("RUN START");
    appendLog(
        "info",
        `Yeni simulasyon basladi (userId=${runContext.userId}, productId=${runContext.productId}, quantity=${runContext.quantity})`
    );
    updateStepButtonsState();
    return true;
}

async function loadOptions() {
    appendLog("info", "Sistem: kullanici ve urun listeleri aliniyor...");
    try {
        const [usersRes, productsRes] = await Promise.all([
            fetch("/orders/proxy/users"),
            fetch("/orders/proxy/products")
        ]);

        const users = await usersRes.json();
        const products = await productsRes.json();

        userSelect.innerHTML = '<option value="">-- Kullanici sec --</option>';
        users.forEach((u) => {
            const option = document.createElement("option");
            option.value = u.id;
            option.textContent = `${u.name} (ID: ${u.id})`;
            userSelect.appendChild(option);
        });

        productSelect.innerHTML = '<option value="">-- Urun sec --</option>';
        products.forEach((p) => {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = `${p.name} (ID: ${p.id})`;
            productSelect.appendChild(option);
        });

        appendLog("ok", `Hazir: ${users.length} kullanici ve ${products.length} urun yuklendi.`);
    } catch (error) {
        appendLog("error", `Opsiyonlar yuklenemedi: ${error.message}`);
        showToast("Opsiyonlar yuklenemedi.", "error");
    }
}

async function executeStep(stepNo) {
    if (!runContext) {
        return;
    }

    isExecutingStep = true;
    updateStepButtonsState();

    try {
        const { userId, productId, quantity } = runContext;
        setActiveStep(stepNo);

        if (stepNo === 1) {
            nodes.ui.classList.add("active");
            pulseLine(lines.uiAgg);
            appendDelimiter("STEP 1");
            appendLog("info", `UI -> Order Aggregator: /orders/create/${userId}/${productId}/${quantity} cagrisi hazirlaniyor.`);
        } else if (stepNo === 2) {
            nodes.agg.classList.add("active");
            nodes.user.classList.add("active");
            pulseLine(lines.aggFanout);
            pulseLine(lines.aggUser);
            appendDelimiter("STEP 2");
            appendLog("info", "OpenFeign: kullanici servisine GET user istegi atiliyor.");
            runContext.users = await fetch("/orders/proxy/users").then((r) => r.json());
            const selectedUser = runContext.users.find((u) => String(u.id) === String(userId));
            appendLog("ok", `User Service yaniti: ${selectedUser ? selectedUser.name : "kullanici bulunamadi"}.`);
        } else if (stepNo === 3) {
            nodes.agg.classList.add("active");
            nodes.inventory.classList.add("active");
            pulseLine(lines.aggFanout);
            pulseLine(lines.aggUser);
            appendDelimiter("STEP 3");
            appendLog("info", "WebClient: inventory servisine GET product istegi atiliyor.");
            runContext.products = await fetch("/orders/proxy/products").then((r) => r.json());
            const selectedProduct = runContext.products.find((p) => String(p.id) === String(productId));
            appendLog("ok", `Inventory yaniti: ${selectedProduct ? selectedProduct.name : "urun bulunamadi"}.`);
        } else if (stepNo === 4) {
            nodes.agg.classList.add("active");
            nodes.post.classList.add("active");
            pulseLine(lines.aggPost);
            appendDelimiter("STEP 4");
            appendLog("info", "Netflix Feign: dis API'den post verisi aliniyor.");
        } else if (stepNo === 5) {
            nodes.agg.classList.add("active");
            nodes.db.classList.add("active");
            pulseLine(lines.aggDb);
            appendDelimiter("STEP 5");
            appendLog("warn", "Order Aggregator: siparis kaydi veritabanina yaziliyor.");
            const response = await fetch(`/orders/create/${userId}/${productId}/${quantity}`);
            if (!response.ok) {
                throw new Error(`Order endpoint failed with status ${response.status}`);
            }
            runContext.orderData = await response.json();
            appendLog("ok", `DB kaydi sonucu: ${runContext.orderData.status} (quantity=${quantity})`);
        } else if (stepNo === 6) {
            pulseLine(lines.uiAgg);
            appendDelimiter("STEP 6");
            appendLog("ok", "Response UI'ya dondu. Akis basariyla tamamlandi.");
            appendLog(
                "info",
                `Ozet => User: ${runContext.orderData?.user?.name || "-"}, Product: ${runContext.orderData?.product?.name || "-"}`
            );
            appendDelimiter("RUN END");
            clearAutoPlay();
        }
    } finally {
        isExecutingStep = false;
        updateStepButtonsState();
    }
}

async function nextStep() {
    if (!runContext) {
        return;
    }
    if (currentStep >= STEP_COUNT) {
        return;
    }
    currentStep += 1;
    await executeStep(currentStep);
}

function rewindToStep(stepNo) {
    clearVisuals();
    clearStepHighlight();
    currentStep = stepNo;
    if (currentStep >= 1) {
        nodes.ui.classList.add("active");
        setActiveStep(currentStep);
    }
    if (currentStep >= 2) {
        nodes.agg.classList.add("active");
        nodes.user.classList.add("active");
    }
    if (currentStep >= 3) {
        nodes.inventory.classList.add("active");
    }
    if (currentStep >= 4) {
        nodes.post.classList.add("active");
    }
    if (currentStep >= 5) {
        nodes.db.classList.add("active");
    }
    appendDelimiter("STEP BACK");
    appendLog("warn", `Akis step ${currentStep} noktasina geri alindi.`);
    updateStepButtonsState();
}

runForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!startNewRun()) {
        return;
    }
    try {
        await nextStep();
    } catch (error) {
        appendLog("error", `Simulasyon hata verdi: ${error.message}`);
        showToast(`Simulasyon hata verdi: ${error.message}`, "error");
    }
});

nextStepBtn.addEventListener("click", async () => {
    if (!runContext && !startNewRun()) {
        return;
    }
    try {
        await nextStep();
    } catch (error) {
        appendLog("error", `Step hata verdi: ${error.message}`);
        showToast(`Step hata verdi: ${error.message}`, "error");
    }
});

prevStepBtn.addEventListener("click", () => {
    if (!runContext || currentStep <= 1 || isExecutingStep) {
        return;
    }
    clearAutoPlay();
    rewindToStep(currentStep - 1);
});

autoPlayBtn.addEventListener("click", async () => {
    if (!runContext && !startNewRun()) {
        return;
    }
    if (autoPlayTimer) {
        clearAutoPlay();
        return;
    }
    autoPlayBtn.textContent = "Stop Auto";
    autoPlayTimer = setInterval(async () => {
        if (isExecutingStep) {
            return;
        }
        if (currentStep >= STEP_COUNT) {
            clearAutoPlay();
            return;
        }
        try {
            await nextStep();
        } catch (error) {
            appendLog("error", `Auto step hata verdi: ${error.message}`);
            showToast(`Auto step hata verdi: ${error.message}`, "error");
            clearAutoPlay();
        }
    }, 1200);
    updateStepButtonsState();
});

document.addEventListener("DOMContentLoaded", async () => {
    const normalizeQty = () => {
        const val = parseInt(qtyInput.value, 10);
        qtyInput.value = Number.isNaN(val) || val < 1 ? 1 : val;
    };
    qtyMinusBtn.addEventListener("click", () => {
        normalizeQty();
        qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
    });
    qtyPlusBtn.addEventListener("click", () => {
        normalizeQty();
        qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });
    qtyInput.addEventListener("input", normalizeQty);

    appendLog("info", "Process Visualizer baslatiliyor...");
    await loadOptions();
    updateStepButtonsState();
});
