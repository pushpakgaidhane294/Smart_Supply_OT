/* =========================================================
   SmartSupply - Main JavaScript
   Transportation Cost Optimization
   Methods:
   1. Northwest Corner
   2. Least Cost
   3. Vogel's Approximation Method (VAM)

   No Stepping Stone
   ========================================================= */

let currentProblem = null;
let optimizationResult = null;
let charts = {};
let optimizationRunning = false;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}

function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0";
    }

    return number.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function formatCurrency(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "₹0";
    }

    return "₹" + number.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateStats() {
    if (!currentProblem) {
        return;
    }

    const sourceCount = document.getElementById("sourceCount");
    const destinationCount = document.getElementById("destinationCount");
    const supplyCount = document.getElementById("supplyCount");
    const demandCount = document.getElementById("demandCount");

    if (sourceCount) {
        sourceCount.textContent = currentProblem.sources.length;
    }

    if (destinationCount) {
        destinationCount.textContent = currentProblem.destinations.length;
    }

    const totalSupply = currentProblem.supply.reduce(
        (sum, value) => sum + Number(value || 0),
        0
    );

    const totalDemand = currentProblem.demand.reduce(
        (sum, value) => sum + Number(value || 0),
        0
    );

    if (supplyCount) {
        supplyCount.textContent = formatNumber(totalSupply);
    }

    if (demandCount) {
        demandCount.textContent = formatNumber(totalDemand);
    }
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function scrollToElement(id) {
    const element = $(id);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================================================
   STATUS / VALIDATION
   ========================================================= */

function setSystemStatus(message, type = "info") {

    const statusMessage = $("statusMessage");
    const statusIndicator = $("statusIndicator");

    if (statusMessage) {
        statusMessage.textContent = message;
    }

    if (statusIndicator) {

        statusIndicator.className = "status-indicator";

        if (type === "success") {
            statusIndicator.classList.add("success");
        }

        if (type === "error") {
            statusIndicator.classList.add("error");
        }

        if (type === "warning") {
            statusIndicator.classList.add("warning");
        }
    }
}


function showValidation(title, message, type = "success") {

    const panel = $("validationPanel");
    const titleElement = $("validationTitle");
    const messageElement = $("validationMessage");

    if (!panel) {
        return;
    }

    panel.style.display = "block";

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (messageElement) {
        messageElement.textContent = message;
    }

    panel.classList.remove(
        "success",
        "warning",
        "error",
        "valid"
    );

    panel.classList.add(type);
}


function hideValidation() {

    const panel = $("validationPanel");

    if (panel) {
        panel.style.display = "none";
    }
}


/* =========================================================
   RESET BUTTON
   ========================================================= */

function createResetButton() {

    const toolbar = document.querySelector(
        "#problem .matrix-toolbar"
    );

    if (!toolbar) {
        return;
    }

    if ($("resetProblemButton")) {
        return;
    }

    const button = document.createElement("button");

    button.id = "resetProblemButton";
    button.type = "button";
    button.className = "btn btn-outline";
    button.textContent = "Reset Problem";

    button.addEventListener(
        "click",
        resetProblem
    );

    toolbar.appendChild(button);
}


/* =========================================================
   MATRIX SIZE CONTROLS
   ========================================================= */

function createMatrixSizeControls() {

    const toolbar = document.querySelector(
        "#problem .matrix-toolbar"
    );

    if (!toolbar) {
        return;
    }

    if ($("matrixSizeControls")) {
        return;
    }

    const controls = document.createElement("div");

    controls.id = "matrixSizeControls";

    controls.style.display = "flex";
    controls.style.alignItems = "center";
    controls.style.gap = "8px";
    controls.style.flexWrap = "wrap";
    controls.style.marginTop = "10px";

    controls.innerHTML = `
        <label style="font-size:13px;font-weight:600;">
            Sources
        </label>

        <input
            id="sourceCountInput"
            type="number"
            min="1"
            max="10"
            value="3"
            style="width:70px;"
        >

        <label style="font-size:13px;font-weight:600;">
            Destinations
        </label>

        <input
            id="destinationCountInput"
            type="number"
            min="1"
            max="10"
            value="4"
            style="width:70px;"
        >

        <button
            id="applyMatrixSize"
            type="button"
            class="btn btn-outline"
        >
            Apply Size
        </button>
    `;

    toolbar.appendChild(controls);

    $("applyMatrixSize").addEventListener(
        "click",
        applyMatrixSize
    );
}


/* =========================================================
   INITIAL PAGE SETUP
   ========================================================= */

function initializePage() {

    createResetButton();

    createMatrixSizeControls();

    setSystemStatus(
        "System ready. Load a dataset or create a new problem.",
        "success"
    );

    updateQuickStats(
        0,
        0,
        0,
        0
    );

    hideValidation();

    hideOptimizationResults();

    hideScenarioResults();
}


/* =========================================================
   QUICK STATISTICS
   ========================================================= */

function updateQuickStats(
    sourceCount,
    destinationCount,
    supplyTotal,
    demandTotal
) {

    if ($("sourceCount")) {
        $("sourceCount").textContent =
            formatNumber(sourceCount);
    }

    if ($("destinationCount")) {
        $("destinationCount").textContent =
            formatNumber(destinationCount);
    }

    if ($("supplyCount")) {
        $("supplyCount").textContent =
            formatNumber(supplyTotal);
    }

    if ($("demandCount")) {
        $("demandCount").textContent =
            formatNumber(demandTotal);
    }
}


/* =========================================================
   LOAD SAMPLE DATASET
   ========================================================= */

async function loadSampleDataset() {

    try {

        setSystemStatus(
            "Loading sample transportation dataset...",
            "info"
        );

        const response = await fetch(
            "/api/sample-data",
            {
                method: "GET",
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.error ||
                "Unable to load sample dataset."
            );
        }

        renderProblem(data);

        setSystemStatus(
            "Sample transportation problem loaded successfully.",
            "success"
        );

        showValidation(
            "Sample Problem Loaded",
            getBalanceMessage(data),
            "success"
        );

        scrollToElement("problem");

    } catch (error) {

        console.error(error);

        setSystemStatus(
            "Unable to load sample dataset.",
            "error"
        );

        showValidation(
            "Dataset Error",
            error.message,
            "error"
        );
    }
}


/* =========================================================
   CREATE NEW PROBLEM
   ========================================================= */

function createNewProblem() {

    const rows = 3;
    const columns = 4;

    const sources = [
        "Source 1",
        "Source 2",
        "Source 3"
    ];

    const destinations = [
        "Destination 1",
        "Destination 2",
        "Destination 3",
        "Destination 4"
    ];

    const costs = [];

    for (let i = 0; i < rows; i++) {

        const row = [];

        for (let j = 0; j < columns; j++) {
            row.push(0);
        }

        costs.push(row);
    }

    const supply = [
        0,
        0,
        0
    ];

    const demand = [
        0,
        0,
        0,
        0
    ];

    const data = {

        success: true,

        sources: sources,

        destinations: destinations,

        costs: costs,

        supply: supply,

        demand: demand
    };

    currentProblem = deepClone(data);

    optimizationResult = null;

    optimizationRunning = false;

    hideOptimizationResults();

    hideScenarioResults();

    destroyCharts();

    renderProblem(data);

    setSystemStatus(
        "New transportation problem created. Enter your costs, supply and demand.",
        "info"
    );

    showValidation(
        "New Problem Ready",
        "All transportation costs, supply and demand values are set to zero. Enter your own values before running optimization.",
        "warning"
    );

    scrollToElement("problem");
}


/* =========================================================
   CREATE BALANCED DEMAND
   ========================================================= */

function createBalancedDemand(
    totalSupply,
    destinationCount
) {

    if (destinationCount <= 0) {
        return [];
    }

    const base =
        Math.floor(
            totalSupply / destinationCount
        );

    const demand =
        new Array(destinationCount)
            .fill(base);

    const currentTotal =
        base * destinationCount;

    demand[destinationCount - 1] +=
        totalSupply - currentTotal;

    return demand;
}


/* =========================================================
   APPLY MATRIX SIZE
   ========================================================= */

function applyMatrixSize() {

    const sourceInput =
        $("sourceCountInput");

    const destinationInput =
        $("destinationCountInput");

    if (!sourceInput || !destinationInput) {
        return;
    }

    let rows =
        parseInt(
            sourceInput.value,
            10
        );

    let columns =
        parseInt(
            destinationInput.value,
            10
        );

    if (
        !Number.isInteger(rows) ||
        rows < 1 ||
        rows > 10
    ) {

        alert(
            "Sources must be between 1 and 10."
        );

        return;
    }

    if (
        !Number.isInteger(columns) ||
        columns < 1 ||
        columns > 10
    ) {

        alert(
            "Destinations must be between 1 and 10."
        );

        return;
    }

    const supply =
        new Array(rows)
            .fill(100);

    const totalSupply =
        rows * 100;

    const demand =
        createBalancedDemand(
            totalSupply,
            columns
        );

    const sources =
        Array.from(
            { length: rows },
            (_, index) =>
                `Factory ${index + 1}`
        );

    const destinations =
        Array.from(
            { length: columns },
            (_, index) =>
                `Warehouse ${index + 1}`
        );

    const costs =
        Array.from(
            { length: rows },
            () =>
                new Array(columns)
                    .fill(10)
        );

    renderProblem({

        success: true,

        sources,

        destinations,

        costs,

        supply,

        demand
    });

    setSystemStatus(
        `Created a ${rows} × ${columns} transportation matrix.`,
        "success"
    );

    showValidation(
        "Matrix Created",
        "Edit the values as required. Supply and demand can be unequal; the backend will automatically balance an unbalanced transportation problem.",
        "success"
    );
}


/* =========================================================
   RENDER TRANSPORTATION MATRIX
   ========================================================= */

function renderProblem(data) {

    if (
        !data ||
        !Array.isArray(data.sources) ||
        !Array.isArray(data.destinations) ||
        !Array.isArray(data.costs) ||
        !Array.isArray(data.supply) ||
        !Array.isArray(data.demand)
    ) {

        throw new Error(
            "Invalid transportation problem data."
        );
    }

    currentProblem = deepClone(data);

    optimizationResult = null;

    hideOptimizationResults();

    const matrixContainer = document.getElementById("matrixContainer");
    const matrixWrapper = document.getElementById("matrixWrapper");
    const emptyState = document.getElementById("matrixEmptyState");

    if (emptyState) {
        emptyState.style.display = "none";
    }

    if (!matrixWrapper) {
        console.error("Matrix elements not found.");
        return;
    }

    matrixContainer.classList.remove("hidden");
    matrixContainer.style.display = "block";

    matrixWrapper.classList.remove("hidden");
    matrixWrapper.style.display = "block";

    const rows = currentProblem.sources.length;
    const columns = currentProblem.destinations.length;

    let html = `
        <div style="overflow-x:auto;">
            <table class="transportation-table">
                <thead>
                    <tr>
                        <th>Source</th>
    `;

    for (
        let j = 0;
        j < columns;
        j++
    ) {

        html += `
            <th>
                <input
                    type="text"
                    class="header-input destination-name"
                    data-index="${j}"
                    value="${escapeHtml(
                        currentProblem.destinations[j]
                    )}"
                >
            </th>
        `;
    }

    html += `
        <th>Supply</th>

        </tr>
        </thead>

        <tbody>
    `;

    for (
        let i = 0;
        i < rows;
        i++
    ) {

        html += `
            <tr>

                <th>

                    <input
                        type="text"
                        class="header-input source-name"
                        data-index="${i}"
                        value="${escapeHtml(
                            currentProblem.sources[i]
                        )}"
                    >

                </th>
        `;

        for (
            let j = 0;
            j < columns;
            j++
        ) {

            const cost =
                currentProblem.costs[i] &&
                currentProblem.costs[i][j] !== undefined
                    ? currentProblem.costs[i][j]
                    : 0;

            html += `
                <td>

                    <input
                        type="number"
                        class="cost-input"
                        data-row="${i}"
                        data-col="${j}"
                        value="${cost}"
                        min="0"
                        step="0.01"
                    >

                </td>
            `;
        }

        html += `
                <td>

                    <input
                        type="number"
                        class="supply-input"
                        data-row="${i}"
                        value="${
                            currentProblem.supply[i] ?? 0
                        }"
                        min="0"
                        step="1"
                    >

                </td>

            </tr>
        `;
    }

    html += `
        <tr class="demand-row">
            <th>Demand</th>
    `;

    for (
        let j = 0;
        j < columns;
        j++
    ) {

        html += `
            <td>

                <input
                    type="number"
                    class="demand-input"
                    data-col="${j}"
                    value="${
                        currentProblem.demand[j] ?? 0
                    }"
                    min="0"
                    step="1"
                >

            </td>
        `;
    }

    html += `
            <td class="total-cell">
                ${formatNumber(
                    currentProblem.supply.reduce(
                        (a, b) => a + Number(b),
                        0
                    )
                )}
            </td>
        </tr>

        </tbody>

        </table>

        </div>
    `;

    matrixWrapper.innerHTML = html;

    attachMatrixListeners();

    updateQuickStatsFromMatrix();

    populateScenarioSelectors();

    showResetButton();

    showOptimizationButton();

    validateCurrentProblem();
}


/* =========================================================
   MATRIX EVENT LISTENERS
   ========================================================= */

function attachMatrixListeners() {
    document.querySelectorAll(".cost-input").forEach(input => {
        input.addEventListener("input", function () {
            const row = Number(this.dataset.row);
            const col = Number(this.dataset.col);

            currentProblem.costs[row][col] = Number(this.value || 0);

            validateCurrentProblem();
        });
    });

    document.querySelectorAll(".supply-input").forEach(input => {
        input.addEventListener("input", function () {
            const row = Number(this.dataset.row);

            currentProblem.supply[row] = Number(this.value || 0);

            updateStats();
            validateCurrentProblem();
        });
    });

    document.querySelectorAll(".demand-input").forEach(input => {
        input.addEventListener("input", function () {
            const col = Number(this.dataset.col);

            currentProblem.demand[col] = Number(this.value || 0);

            updateStats();
            validateCurrentProblem();
        });
    });

    document.querySelectorAll(".source-name").forEach(input => {
        input.addEventListener("input", function () {
            const row = Number(this.dataset.index);

            currentProblem.sources[row] =
                this.value || `Source ${row + 1}`;

            populateScenarioSelectors();
        });
    });

    document.querySelectorAll(".destination-name").forEach(input => {
        input.addEventListener("input", function () {
            const col = Number(this.dataset.index);

            currentProblem.destinations[col] =
                this.value || `Destination ${col + 1}`;

            populateScenarioSelectors();
        });
    });
}


/* =========================================================
   READ MATRIX FROM HTML
   ========================================================= */

function readMatrixData() {

    const wrapper =
        $("matrixWrapper");

    if (!wrapper) {
        throw new Error(
            "Transportation matrix is not available."
        );
    }

    const sourceInputs =
        wrapper.querySelectorAll(
            ".source-name"
        );

    const destinationInputs =
        wrapper.querySelectorAll(
            ".destination-name"
        );

    const costInputs =
        wrapper.querySelectorAll(
            ".cost-input"
        );

    const supplyInputs =
        wrapper.querySelectorAll(
            ".supply-input"
        );

    const demandInputs =
        wrapper.querySelectorAll(
            ".demand-input"
        );

    const sources =
        Array.from(
            sourceInputs
        ).map(
            input =>
                input.value.trim()
        );

    const destinations =
        Array.from(
            destinationInputs
        ).map(
            input =>
                input.value.trim()
        );

    const supply =
        Array.from(
            supplyInputs
        ).map(
            input =>
                Number(input.value)
        );

    const demand =
        Array.from(
            demandInputs
        ).map(
            input =>
                Number(input.value)
        );

    const costs =
        Array.from(
            { length: sources.length },
            () =>
                new Array(
                    destinations.length
                ).fill(0)
        );

    costInputs.forEach(
        input => {

            const row =
                Number(
                    input.dataset.row
                );

            const column =
                Number(
                    input.dataset.col
                );

            costs[row][column] =
                Number(input.value);
        }
    );

    return {

        success: true,

        sources,

        destinations,

        costs,

        supply,

        demand
    };
}


/* =========================================================
   VALIDATE CURRENT PROBLEM
   ========================================================= */

function validateCurrentProblem(
    showMessage = true
) {

    try {

        const data =
            readMatrixData();

        const rows =
            data.sources.length;

        const columns =
            data.destinations.length;

        if (
            rows === 0 ||
            columns === 0
        ) {

            throw new Error(
                "At least one source and one destination are required."
            );
        }

        if (
            data.supply.length !== rows
        ) {

            throw new Error(
                "Supply values do not match the number of sources."
            );
        }

        if (
            data.demand.length !== columns
        ) {

            throw new Error(
                "Demand values do not match the number of destinations."
            );
        }

        for (
            let i = 0;
            i < rows;
            i++
        ) {

            if (
                !data.sources[i]
            ) {

                throw new Error(
                    `Source ${i + 1} name is required.`
                );
            }

            if (
                !Number.isFinite(
                    data.supply[i]
                ) ||
                data.supply[i] < 0
            ) {

                throw new Error(
                    `Supply for ${data.sources[i]} must be a non-negative number.`
                );
            }
        }

        for (
            let j = 0;
            j < columns;
            j++
        ) {

            if (
                !data.destinations[j]
            ) {

                throw new Error(
                    `Destination ${j + 1} name is required.`
                );
            }

            if (
                !Number.isFinite(
                    data.demand[j]
                ) ||
                data.demand[j] < 0
            ) {

                throw new Error(
                    `Demand for ${data.destinations[j]} must be a non-negative number.`
                );
            }
        }

        for (
            let i = 0;
            i < rows;
            i++
        ) {

            if (
                !Array.isArray(
                    data.costs[i]
                ) ||
                data.costs[i].length !== columns
            ) {

                throw new Error(
                    "Transportation cost matrix is invalid."
                );
            }

            for (
                let j = 0;
                j < columns;
                j++
            ) {

                if (
                    !Number.isFinite(
                        data.costs[i][j]
                    ) ||
                    data.costs[i][j] < 0
                ) {

                    throw new Error(
                        `Cost from ${data.sources[i]} to ${data.destinations[j]} must be a non-negative number.`
                    );
                }
            }
        }

        const totalSupply =
            data.supply.reduce(
                (sum, value) =>
                    sum + value,
                0
            );

        const totalDemand =
            data.demand.reduce(
                (sum, value) =>
                    sum + value,
                0
            );

        if (
            totalSupply <= 0 ||
            totalDemand <= 0
        ) {

            throw new Error(
                "Total supply and total demand must both be greater than zero."
            );
        }

        const difference =
            Math.abs(
                totalSupply -
                totalDemand
            );

        let message;

        let type;

        if (difference < 0.000001) {

            message =
                `Problem is balanced. Total supply = ${formatNumber(totalSupply)} and total demand = ${formatNumber(totalDemand)}.`;

            type = "success";

        } else {

            message =
                `Problem is unbalanced. Total supply = ${formatNumber(totalSupply)}, total demand = ${formatNumber(totalDemand)}. The backend will automatically add a dummy source or destination.`;

            type = "warning";
        }

        currentProblem =
            deepClone(data);

        if (showMessage) {

            showValidation(
                "Problem Valid",
                message,
                type
            );
        }

        return {
            valid: true,
            data,
            totalSupply,
            totalDemand,
            balanced:
                difference < 0.000001
        };

    } catch (error) {

        if (showMessage) {

            showValidation(
                "Input Validation Error",
                error.message,
                "error"
            );
        }

        return {
            valid: false,
            error: error.message
        };
    }
}


/* =========================================================
   BALANCE MESSAGE
   ========================================================= */

function getBalanceMessage(data) {

    const supply =
        Array.isArray(data.supply)
            ? data.supply.reduce(
                (sum, value) =>
                    sum + Number(value || 0),
                0
            )
            : 0;

    const demand =
        Array.isArray(data.demand)
            ? data.demand.reduce(
                (sum, value) =>
                    sum + Number(value || 0),
                0
            )
            : 0;

    if (
        Math.abs(
            supply - demand
        ) < 0.000001
    ) {

        return `
            Transportation problem is balanced.
            Total supply = ${formatNumber(supply)}
            and total demand = ${formatNumber(demand)}.
        `;

    }

    return `
        Transportation problem is unbalanced.
        The backend will automatically add a dummy source
        or dummy destination.
    `;
}


/* =========================================================
   QUICK STATS FROM MATRIX
   ========================================================= */

function updateQuickStatsFromMatrix() {

    try {

        const data =
            readMatrixData();

        const totalSupply =
            data.supply.reduce(
                (sum, value) =>
                    sum +
                    (
                        Number.isFinite(value)
                            ? value
                            : 0
                    ),
                0
            );

        const totalDemand =
            data.demand.reduce(
                (sum, value) =>
                    sum +
                    (
                        Number.isFinite(value)
                            ? value
                            : 0
                    ),
                0
            );

        updateQuickStats(
            data.sources.length,
            data.destinations.length,
            totalSupply,
            totalDemand
        );

    } catch (error) {

        console.debug(
            "Quick stats unavailable:",
            error
        );
    }
}


/* =========================================================
   SHOW / HIDE RESET
   ========================================================= */

function showResetButton() {

    const button =
        $("resetProblemButton");

    if (button) {
        button.style.display = "inline-flex";
    }
}


/* =========================================================
   SHOW / HIDE OPTIMIZATION BUTTON
   ========================================================= */

function showOptimizationButton() {

    const action =
        $("optimizeButton");

    if (action) {
        action.style.display = "inline-flex";
    }
}


/* =========================================================
   RESET PROBLEM
   ========================================================= */

function resetProblem() {

    currentProblem = null;

    optimizationResult = null;

    optimizationRunning = false;

    const matrixContainer =
        $("matrixContainer");

    const matrixWrapper =
        $("matrixWrapper");

    const emptyState =
        $("matrixEmptyState");

    if (matrixContainer) {
        matrixContainer.style.display = "none";
    }

    if (matrixWrapper) {
        matrixWrapper.innerHTML = "";
    }

    if (emptyState) {
        emptyState.style.display = "block";
    }

    hideValidation();

    hideOptimizationResults();

    hideScenarioResults();

    updateQuickStats(
        0,
        0,
        0,
        0
    );

    destroyCharts();

    setSystemStatus(
        "Problem reset. Create a new problem or load the sample dataset.",
        "info"
    );

    scrollToElement("problem");
}


/* =========================================================
   OPTIMIZATION
   ========================================================= */

async function runOptimization(
    options = {}
) {

    if (optimizationRunning) {
        return;
    }

    const validation =
        validateCurrentProblem(
            true
        );

    if (!validation.valid) {

        setSystemStatus(
            "Please correct the problem inputs before optimization.",
            "error"
        );

        return;
    }

    optimizationRunning = true;

    const button =
        document.querySelector(
            "#optimizeButton"
        );

    const originalButtonText =
        button
            ? button.innerHTML
            : "";

    if (button) {

        button.disabled = true;

        button.innerHTML =
            "Optimizing...";
    }

    try {

        setSystemStatus(
            "Running Northwest Corner, Least Cost and Vogel's Approximation methods...",
            "info"
        );

        const response =
            await fetch(
                "/api/optimize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        validation.data
                    )
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            result.success === false
        ) {

            throw new Error(
                result.error ||
                "Optimization failed."
            );
        }

        optimizationResult =
            result;

        renderOptimizationResults(
            result
        );

        populateScenarioSelectors();

        setSystemStatus(
            "Optimization completed successfully.",
            "success"
        );

        if (
            options.scroll !== false
        ) {

            scrollToElement(
                "results"
            );
        }

    } catch (error) {

        console.error(error);

        setSystemStatus(
            "Optimization failed.",
            "error"
        );

        showValidation(
            "Optimization Error",
            error.message,
            "error"
        );

    } finally {

        optimizationRunning = false;

        if (button) {

            button.disabled = false;

            button.innerHTML =
                originalButtonText ||
                `
                    Run Optimization
                    <span class="arrow">→</span>
                `;
        }
    }
}


/* =========================================================
   RENDER OPTIMIZATION RESULTS
   ========================================================= */

function renderOptimizationResults(
    result
) {

    const results =
        result.results || {};

    const nw =
        results.northwest_corner;

    const lc =
        results.least_cost;

    const vam =
        results.vogel;

    if (
        !nw ||
        !lc ||
        !vam
    ) {

        throw new Error(
            "Optimization response is missing one or more method results."
        );
    }

    const finalCost =
        Number(vam.cost);

    /*
       VAM is used as the selected/reference
       solution for the dashboard.

       We do NOT call it mathematically proven
       optimal.
    */

    const initialCost =
        Math.min(
            Number(nw.cost),
            Number(lc.cost)
        );

    const savings =
        initialCost -
        finalCost;

    const savingsPercentage =
        initialCost !== 0
            ? (
                savings /
                initialCost
            ) * 100
            : 0;

    const totalUnits =
        Array.isArray(result.supply)
            ? result.supply.reduce(
                (sum, value) =>
                    sum + Number(value || 0),
                0
            )
            : 0;

    setResultText(
        "optimizedCost",
        formatCurrency(finalCost)
    );

    setResultText(
        "initialCost",
        formatCurrency(initialCost)
    );

    setResultText(
        "costSavings",
        formatCurrency(savings)
    );

    setResultText(
        "savingsPercentage",
        `${savingsPercentage.toFixed(2)}%`
    );

    setResultText(
        "totalUnits",
        formatNumber(totalUnits)
    );

    setResultText(
        "optimizationStatus",
        "Vogel's Approximation solution generated"
    );

    const badge =
        $("optimizationStatusBadge");

    if (badge) {

        badge.textContent =
            "VAM Solution";

        badge.className =
            "status-badge success";
    }

    renderComparisonTable(
        result.comparison || []
    );

    renderAllocationTable(
        result.sources || [],
        result.destinations || [],
        result.costs || [],
        vam.allocation || []
    );

    renderCharts(
        result
    );

    showOptimizationSection();

    renderBalanceInformation(
        result.balance
    );
}


/* =========================================================
   SET RESULT TEXT
   ========================================================= */

function setResultText(
    id,
    value
) {

    const element =
        $(id);

    if (element) {
        element.textContent =
            value;
    }
}


/* =========================================================
   SHOW RESULTS
   ========================================================= */

function showOptimizationSection() {

    const resultsSection =
        $("results");

    if (resultsSection) {
        resultsSection.style.display = "block";
    }

    const comparison =
        $("comparisonContainer");

    const allocation =
        $("allocationContainer");

    if (comparison) {
        comparison.style.display = "block";
    }

    if (allocation) {
        allocation.style.display = "block";
    }
}


/* =========================================================
   HIDE RESULTS
   ========================================================= */

function hideOptimizationResults() {

    const resultsSection =
        $("results");

    if (resultsSection) {
        resultsSection.style.display = "none";
    }

    const comparison =
        $("comparisonContainer");

    const allocation =
        $("allocationContainer");

    if (comparison) {
        comparison.innerHTML = "";
    }

    if (allocation) {
        allocation.innerHTML = "";
    }

    setResultText(
        "optimizedCost",
        "—"
    );

    setResultText(
        "initialCost",
        "—"
    );

    setResultText(
        "costSavings",
        "—"
    );

    setResultText(
        "savingsPercentage",
        "—"
    );

    setResultText(
        "totalUnits",
        "—"
    );
}


/* =========================================================
   BALANCE INFORMATION
   ========================================================= */

function renderBalanceInformation(
    balance
) {

    if (!balance) {
        return;
    }

    let message =
        "Transportation problem processed.";

    if (
        balance.dummy_added ===
        "source"
    ) {

        message =
            "The problem was unbalanced. A Dummy Source was added automatically.";

    } else if (
        balance.dummy_added ===
        "destination"
    ) {

        message =
            "The problem was unbalanced. A Dummy Destination was added automatically.";

    } else {

        message =
            "The transportation problem was already balanced.";
    }

    showValidation(
        "Transportation Problem Balanced",
        message,
        "success"
    );
}


/* =========================================================
   COMPARISON TABLE
   ========================================================= */

function renderComparisonTable(
    comparison
) {

    const container =
        $("comparisonContainer");

    if (!container) {
        return;
    }

    if (
        !Array.isArray(comparison) ||
        comparison.length === 0
    ) {

        container.innerHTML =
            "<p>No comparison data available.</p>";

        return;
    }

    let html = `
        <div style="overflow-x:auto;">
            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                "
            >

                <thead>
                    <tr>

                        <th
                            style="
                                padding:12px;
                                border:1px solid #ddd;
                                text-align:left;
                            "
                        >
                            Method
                        </th>

                        <th
                            style="
                                padding:12px;
                                border:1px solid #ddd;
                                text-align:right;
                            "
                        >
                            Transportation Cost
                        </th>

                    </tr>
                </thead>

                <tbody>
    `;

    comparison.forEach(
        item => {

            html += `
                <tr>

                    <td
                        style="
                            padding:12px;
                            border:1px solid #ddd;
                        "
                    >
                        ${escapeHtml(
                            item.method
                        )}
                    </td>

                    <td
                        style="
                            padding:12px;
                            border:1px solid #ddd;
                            text-align:right;
                            font-weight:600;
                        "
                    >
                        ${formatCurrency(
                            item.cost
                        )}
                    </td>

                </tr>
            `;
        }
    );

    html += `
                </tbody>

            </table>
        </div>
    `;

    container.innerHTML =
        html;
}


/* =========================================================
   ALLOCATION TABLE
   ========================================================= */

function renderAllocationTable(
    sources,
    destinations,
    costs,
    allocation
) {

    const container =
        $("allocationContainer");

    if (!container) {
        return;
    }

    if (
        !Array.isArray(sources) ||
        !Array.isArray(destinations) ||
        !Array.isArray(allocation)
    ) {

        container.innerHTML =
            "<p>Allocation data unavailable.</p>";

        return;
    }

    let html = `
        <div style="overflow-x:auto;">

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                "
            >

                <thead>

                    <tr>

                        <th
                            style="
                                padding:10px;
                                border:1px solid #ddd;
                            "
                        >
                            Source
                        </th>
    `;

    destinations.forEach(
        destination => {

            html += `
                <th
                    style="
                        padding:10px;
                        border:1px solid #ddd;
                    "
                >
                    ${escapeHtml(
                        destination
                    )}
                </th>
            `;
        }
    );

    html += `
                    </tr>

                </thead>

                <tbody>
    `;

    for (
        let i = 0;
        i < sources.length;
        i++
    ) {

        html += `
            <tr>

                <td
                    style="
                        padding:10px;
                        border:1px solid #ddd;
                        font-weight:600;
                    "
                >
                    ${escapeHtml(
                        sources[i]
                    )}
                </td>
        `;

        for (
            let j = 0;
            j < destinations.length;
            j++
        ) {

            const value =
                allocation[i] &&
                allocation[i][j] !== undefined
                    ? allocation[i][j]
                    : 0;

            html += `
                <td
                    style="
                        padding:10px;
                        border:1px solid #ddd;
                        text-align:right;
                    "
                >
                    ${formatNumber(value)}
                </td>
            `;
        }

        html += `
            </tr>
        `;
    }

    html += `
                </tbody>

            </table>

        </div>
    `;

    container.innerHTML =
        html;
}


/* =========================================================
   CHARTS
   ========================================================= */

function destroyCharts() {

    Object.keys(charts).forEach(
        key => {

            if (
                charts[key] &&
                typeof charts[key].destroy ===
                    "function"
            ) {

                charts[key].destroy();
            }
        }
    );

    charts = {};
}


function renderCharts(result) {

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js is not available."
        );

        return;
    }

    destroyCharts();

    renderCostComparisonChart(
        result
    );

    renderSavingsChart(
        result
    );

    renderAllocationChart(
        result
    );
}


/* =========================================================
   COST COMPARISON CHART
   ========================================================= */

function renderCostComparisonChart(
    result
) {

    const canvas =
        $("costComparisonChart");

    if (!canvas) {
        return;
    }

    const comparison =
        result.comparison || [];

    charts.cost =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        comparison.map(
                            item =>
                                item.method
                        ),

                    datasets: [
                        {
                            label:
                                "Transportation Cost",

                            data:
                                comparison.map(
                                    item =>
                                        Number(
                                            item.cost
                                        )
                                )
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: true
                        }
                    },

                    scales: {

                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


/* =========================================================
   SAVINGS CHART
   ========================================================= */

function renderSavingsChart(
    result
) {

    const canvas =
        $("savingsChart");

    if (!canvas) {
        return;
    }

    const comparison =
        result.comparison || [];

    if (
        comparison.length === 0
    ) {
        return;
    }

    const costs =
        comparison.map(
            item =>
                Number(item.cost)
        );

    const highestCost =
        Math.max(
            ...costs
        );

    const vam =
        result.results &&
        result.results.vogel
            ? Number(
                result.results.vogel.cost
            )
            : 0;

    const savings =
        highestCost - vam;

    charts.savings =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "VAM Cost",
                        "Difference"
                    ],

                    datasets: [
                        {
                            data: [
                                vam,
                                Math.max(
                                    0,
                                    savings
                                )
                            ]
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: true
                        }
                    }
                }
            }
        );
}


/* =========================================================
   ALLOCATION CHART
   ========================================================= */

function renderAllocationChart(
    result
) {

    const canvas =
        $("allocationChart");

    if (!canvas) {
        return;
    }

    const sources =
        result.sources || [];

    const destinations =
        result.destinations || [];

    const allocation =
        result.results &&
        result.results.vogel
            ? result.results.vogel.allocation
            : [];

    const datasets =
        destinations.map(
            (
                destination,
                destinationIndex
            ) => {

                return {

                    label:
                        destination,

                    data:
                        sources.map(
                            (
                                source,
                                sourceIndex
                            ) => {

                                return Number(
                                    allocation[
                                        sourceIndex
                                    ] &&
                                    allocation[
                                        sourceIndex
                                    ][
                                        destinationIndex
                                    ] || 0
                                );
                            }
                        ),

                    stack: "allocation"
                };
            }
        );

    charts.allocation =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        sources,

                    datasets:
                        datasets
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    indexAxis: "y",

                    scales: {

                        x: {
                            beginAtZero: true,

                            stacked: true
                        },

                        y: {
                            stacked: true
                        }
                    },

                    plugins: {

                        legend: {
                            display: true
                        }
                    }
                }
            }
        );
}


/* =========================================================
   EXPORT ALLOCATION CSV
   ========================================================= */

function exportAllocationCSV() {

    if (!optimizationResult) {

        alert(
            "Please run optimization first."
        );

        return;
    }

    const result =
        optimizationResult;

    const sources =
        result.sources || [];

    const destinations =
        result.destinations || [];

    const costs =
        result.costs || [];

    const allocation =
        result.results &&
        result.results.vogel
            ? result.results.vogel.allocation
            : [];

    const rows = [];

    rows.push([
        "Source",
        "Destination",
        "Units",
        "Unit Cost",
        "Route Cost"
    ]);

    for (
        let i = 0;
        i < sources.length;
        i++
    ) {

        for (
            let j = 0;
            j < destinations.length;
            j++
        ) {

            const units =
                Number(
                    allocation[i] &&
                    allocation[i][j] || 0
                );

            const unitCost =
                Number(
                    costs[i] &&
                    costs[i][j] || 0
                );

            const routeCost =
                units * unitCost;

            rows.push([
                sources[i],
                destinations[j],
                units,
                unitCost,
                routeCost
            ]);
        }
    }

    downloadCSV(
        rows,
        "smartsupply_vam_allocation.csv"
    );
}


/* =========================================================
   EXPORT COMPARISON CSV
   ========================================================= */

function exportComparisonCSV() {

    if (!optimizationResult) {

        alert(
            "Please run optimization first."
        );

        return;
    }

    const comparison =
        optimizationResult.comparison ||
        [];

    const rows = [];

    rows.push([
        "Method",
        "Transportation Cost"
    ]);

    comparison.forEach(
        item => {

            rows.push([
                item.method,
                item.cost
            ]);
        }
    );

    downloadCSV(
        rows,
        "smartsupply_cost_comparison.csv"
    );
}


/* =========================================================
   CSV DOWNLOAD
   ========================================================= */

function csvEscape(value) {

    const string =
        String(
            value ?? ""
        );

    if (
        string.includes(",") ||
        string.includes('"') ||
        string.includes("\n")
    ) {

        return `"${string.replace(
            /"/g,
            '""'
        )}"`;
    }

    return string;
}


function downloadCSV(
    rows,
    filename
) {

    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            csvEscape
                        )
                        .join(",")
            )
            .join("\n");

    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        filename;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );
}


/* =========================================================
   PRINT REPORT
   ========================================================= */

function printOptimizationReport() {

    if (!optimizationResult) {

        alert(
            "Please run optimization first."
        );

        return;
    }

    const result =
        optimizationResult;

    const results =
        result.results;

    const printWindow =
        window.open(
            "",
            "_blank"
        );

    if (!printWindow) {

        alert(
            "Please allow pop-ups to print the report."
        );

        return;
    }

    const comparison =
        result.comparison || [];

    const sources =
        result.sources || [];

    const destinations =
        result.destinations || [];

    const allocation =
        results.vogel.allocation || [];

    let comparisonRows = "";

    comparison.forEach(
        item => {

            comparisonRows += `
                <tr>
                    <td>
                        ${escapeHtml(
                            item.method
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            item.cost
                        )}
                    </td>
                </tr>
            `;
        }
    );

    let allocationRows = "";

    for (
        let i = 0;
        i < sources.length;
        i++
    ) {

        allocationRows += `
            <tr>

                <td>
                    ${escapeHtml(
                        sources[i]
                    )}
                </td>
        `;

        for (
            let j = 0;
            j < destinations.length;
            j++
        ) {

            allocationRows += `
                <td>
                    ${formatNumber(
                        allocation[i] &&
                        allocation[i][j] || 0
                    )}
                </td>
            `;
        }

        allocationRows += `
            </tr>
        `;
    }

    printWindow.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <title>
                SmartSupply Optimization Report
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #222;
                }

                h1 {
                    margin-bottom: 5px;
                }

                h2 {
                    margin-top: 30px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }

                th,
                td {
                    border: 1px solid #ccc;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background: #f2f2f2;
                }

                .summary {
                    display: grid;
                    grid-template-columns:
                        repeat(3, 1fr);
                    gap: 12px;
                    margin-top: 20px;
                }

                .card {
                    border: 1px solid #ddd;
                    padding: 15px;
                }

                .label {
                    font-size: 12px;
                    color: #666;
                }

                .value {
                    font-size: 20px;
                    font-weight: bold;
                    margin-top: 5px;
                }

                @media print {

                    body {
                        padding: 10px;
                    }

                }

            </style>

        </head>

        <body>

            <h1>
                SmartSupply
            </h1>

            <p>
                Transportation Cost Optimization Report
            </p>

            <div class="summary">

                <div class="card">

                    <div class="label">
                        VAM Transportation Cost
                    </div>

                    <div class="value">
                        ${formatCurrency(
                            results.vogel.cost
                        )}
                    </div>

                </div>

                <div class="card">

                    <div class="label">
                        Total Units
                    </div>

                    <div class="value">
                        ${formatNumber(
                            result.supply.reduce(
                                (
                                    sum,
                                    value
                                ) =>
                                    sum +
                                    Number(
                                        value || 0
                                    ),
                                0
                            )
                        )}
                    </div>

                </div>

                <div class="card">

                    <div class="label">
                        Method
                    </div>

                    <div class="value">
                        Vogel's Approximation
                    </div>

                </div>

            </div>

            <h2>
                Method Cost Comparison
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>
                            Method
                        </th>

                        <th>
                            Transportation Cost
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${comparisonRows}

                </tbody>

            </table>

            <h2>
                VAM Allocation
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>
                            Source
                        </th>

                        ${destinations
                            .map(
                                destination =>
                                    `
                                    <th>
                                        ${escapeHtml(
                                            destination
                                        )}
                                    </th>
                                    `
                            )
                            .join("")
                        }

                    </tr>

                </thead>

                <tbody>

                    ${allocationRows}

                </tbody>

            </table>

            <p style="margin-top:30px;">
                Generated by SmartSupply.
            </p>

        </body>

        </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(
        () => {

            printWindow.print();

        },
        500
    );
}


/* =========================================================
   WHAT-IF SCENARIO
   ========================================================= */

function populateScenarioSelectors() {

    if (!currentProblem) {
        return;
    }

    const sources =
        currentProblem.sources || [];

    const destinations =
        currentProblem.destinations || [];

    const sourceSelectors = [
        $("scenarioCostSource"),
        $("scenarioSupplySource")
    ];

    sourceSelectors.forEach(
        select => {

            if (!select) {
                return;
            }

            const current =
                select.value;

            select.innerHTML = `
                <option value="">
                    Select source
                </option>
            `;

            sources.forEach(
                (
                    source,
                    index
                ) => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(index);

                    option.textContent =
                        source;

                    select.appendChild(
                        option
                    );
                }
            );

            if (
                current !== ""
            ) {

                select.value =
                    current;
            }
        }
    );

    const destinationSelectors = [
        $("scenarioCostDestination"),
        $("scenarioDemandDestination")
    ];

    destinationSelectors.forEach(
        select => {

            if (!select) {
                return;
            }

            const current =
                select.value;

            select.innerHTML = `
                <option value="">
                    Select destination
                </option>
            `;

            destinations.forEach(
                (
                    destination,
                    index
                ) => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(index);

                    option.textContent =
                        destination;

                    select.appendChild(
                        option
                    );
                }
            );

            if (
                current !== ""
            ) {

                select.value =
                    current;
            }
        }
    );
}


/* =========================================================
   RUN WHAT-IF SCENARIO
   ========================================================= */

async function runScenario() {

    const validation =
        validateCurrentProblem(
            false
        );

    if (!validation.valid) {

        showScenarioMessage(
            "Please correct the transportation matrix first.",
            "error"
        );

        return;
    }

    if (!optimizationResult) {

        await runOptimization({
            scroll: false
        });

        if (!optimizationResult) {
            return;
        }
    }

    const scenario =
        deepClone(
            validation.data
        );

    let changed = false;

    /* -----------------------------------------
       Change Cost
       ----------------------------------------- */

    const costSource =
        $("scenarioCostSource");

    const costDestination =
        $("scenarioCostDestination");

    const costInput =
        $("scenarioCost");

    if (
        costSource &&
        costDestination &&
        costInput &&
        costSource.value !== "" &&
        costDestination.value !== "" &&
        costInput.value !== ""
    ) {

        const row =
            Number(
                costSource.value
            );

        const column =
            Number(
                costDestination.value
            );

        const value =
            Number(
                costInput.value
            );

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            showScenarioMessage(
                "Transportation cost must be a non-negative number.",
                "error"
            );

            return;
        }

        scenario.costs[row][column] =
            value;

        changed = true;
    }

    /* -----------------------------------------
       Change Supply
       ----------------------------------------- */

    const supplySource =
        $("scenarioSupplySource");

    const supplyInput =
        $("scenarioSupply");

    if (
        supplySource &&
        supplyInput &&
        supplySource.value !== "" &&
        supplyInput.value !== ""
    ) {

        const row =
            Number(
                supplySource.value
            );

        const value =
            Number(
                supplyInput.value
            );

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            showScenarioMessage(
                "Supply must be a non-negative number.",
                "error"
            );

            return;
        }

        scenario.supply[row] =
            value;

        changed = true;
    }

    /* -----------------------------------------
       Change Demand
       ----------------------------------------- */

    const demandDestination =
        $("scenarioDemandDestination");

    const demandInput =
        $("scenarioDemand");

    if (
        demandDestination &&
        demandInput &&
        demandDestination.value !== "" &&
        demandInput.value !== ""
    ) {

        const column =
            Number(
                demandDestination.value
            );

        const value =
            Number(
                demandInput.value
            );

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            showScenarioMessage(
                "Demand must be a non-negative number.",
                "error"
            );

            return;
        }

        scenario.demand[column] =
            value;

        changed = true;
    }

    if (!changed) {

        showScenarioMessage(
            "Change at least one cost, supply or demand value before running the scenario.",
            "warning"
        );

        return;
    }

    try {

        showScenarioMessage(
            "Running scenario...",
            "info"
        );

        const response =
            await fetch(
                "/api/optimize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            scenario
                        )
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            result.success === false
        ) {

            throw new Error(
                result.error ||
                "Scenario optimization failed."
            );
        }

        const originalCost =
            Number(
                optimizationResult
                    .results
                    .vogel
                    .cost
            );

        const newCost =
            Number(
                result
                    .results
                    .vogel
                    .cost
            );

        const difference =
            newCost -
            originalCost;

        const percentage =
            originalCost !== 0
                ? (
                    difference /
                    originalCost
                ) * 100
                : 0;

        setResultText(
            "scenarioOriginalCost",
            formatCurrency(
                originalCost
            )
        );

        setResultText(
            "scenarioNewCost",
            formatCurrency(
                newCost
            )
        );

        setResultText(
            "scenarioDifference",
            formatCurrency(
                difference
            )
        );

        setResultText(
            "scenarioPercentage",
            `${percentage.toFixed(2)}%`
        );

        let status =
            "No cost change";

        let message =
            "The scenario produced the same VAM transportation cost.";

        if (
            difference > 0.000001
        ) {

            status =
                "Cost Increased";

            message =
                "The modified scenario increased the VAM transportation cost.";

        } else if (
            difference < -0.000001
        ) {

            status =
                "Cost Decreased";

            message =
                "The modified scenario decreased the VAM transportation cost.";
        }

        setResultText(
            "scenarioStatus",
            status
        );

        setResultText(
            "scenarioMessage",
            message
        );

        renderScenarioAllocation(
            result
        );

        showScenarioResults();

        setSystemStatus(
            "What-If scenario completed successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showScenarioMessage(
            error.message,
            "error"
        );

        setSystemStatus(
            "What-If scenario failed.",
            "error"
        );
    }
}


/* =========================================================
   SCENARIO MESSAGE
   ========================================================= */

function showScenarioMessage(
    message,
    type
) {

    const status =
        $("scenarioStatus");

    const messageElement =
        $("scenarioMessage");

    if (status) {
        status.textContent =
            type === "error"
                ? "Error"
                : type === "warning"
                    ? "Attention"
                    : "Processing";
    }

    if (messageElement) {
        messageElement.textContent =
            message;
    }

    showScenarioResults();
}


/* =========================================================
   SCENARIO ALLOCATION
   ========================================================= */

function renderScenarioAllocation(
    result
) {

    const container =
        $("scenarioAllocationContainer");

    if (!container) {
        return;
    }

    const sources =
        result.sources || [];

    const destinations =
        result.destinations || [];

    const allocation =
        result.results &&
        result.results.vogel
            ? result.results.vogel.allocation
            : [];

    let html = `
        <div style="overflow-x:auto;">

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                "
            >

                <thead>

                    <tr>

                        <th
                            style="
                                padding:10px;
                                border:1px solid #ddd;
                            "
                        >
                            Source
                        </th>
    `;

    destinations.forEach(
        destination => {

            html += `
                <th
                    style="
                        padding:10px;
                        border:1px solid #ddd;
                    "
                >
                    ${escapeHtml(
                        destination
                    )}
                </th>
            `;
        }
    );

    html += `
                    </tr>

                </thead>

                <tbody>
    `;

    for (
        let i = 0;
        i < sources.length;
        i++
    ) {

        html += `
            <tr>

                <td
                    style="
                        padding:10px;
                        border:1px solid #ddd;
                    "
                >
                    ${escapeHtml(
                        sources[i]
                    )}
                </td>
        `;

        for (
            let j = 0;
            j < destinations.length;
            j++
        ) {

            html += `
                <td
                    style="
                        padding:10px;
                        border:1px solid #ddd;
                        text-align:right;
                    "
                >
                    ${formatNumber(
                        allocation[i] &&
                        allocation[i][j] || 0
                    )}
                </td>
            `;
        }

        html += `
            </tr>
        `;
    }

    html += `
                </tbody>

            </table>

        </div>
    `;

    container.innerHTML =
        html;
}


/* =========================================================
   SHOW / HIDE SCENARIO RESULTS
   ========================================================= */

function showScenarioResults() {

    const element =
        $("scenarioResults");

    if (element) {
        element.style.display = "block";
    }
}


function hideScenarioResults() {

    const element =
        $("scenarioResults");

    if (element) {
        element.style.display = "none";
    }

    const allocation =
        $("scenarioAllocationContainer");

    if (allocation) {
        allocation.innerHTML = "";
    }

    setResultText(
        "scenarioOriginalCost",
        "—"
    );

    setResultText(
        "scenarioNewCost",
        "—"
    );

    setResultText(
        "scenarioDifference",
        "—"
    );

    setResultText(
        "scenarioPercentage",
        "—"
    );

    setResultText(
        "scenarioStatus",
        "—"
    );

    setResultText(
        "scenarioMessage",
        "—"
    );
}


/* =========================================================
   RESET SCENARIO
   ========================================================= */

function resetScenario() {

    const inputs = [
        "scenarioCostSource",
        "scenarioCostDestination",
        "scenarioCost",
        "scenarioSupplySource",
        "scenarioSupply",
        "scenarioDemandDestination",
        "scenarioDemand"
    ];

    inputs.forEach(
        id => {

            const element =
                $(id);

            if (!element) {
                return;
            }

            if (
                element.tagName ===
                "SELECT"
            ) {

                element.value = "";

            } else {

                element.value = "";
            }
        }
    );

    hideScenarioResults();

    setSystemStatus(
        "What-If scenario reset.",
        "info"
    );
}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loadSampleDataset =
    loadSampleDataset;

window.createNewProblem =
    createNewProblem;

window.resetProblem =
    resetProblem;

window.runOptimization =
    runOptimization;

window.exportAllocationCSV =
    exportAllocationCSV;

window.exportComparisonCSV =
    exportComparisonCSV;

window.printOptimizationReport =
    printOptimizationReport;

window.runScenario =
    runScenario;

window.resetScenario =
    resetScenario;


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePage();

    }
);