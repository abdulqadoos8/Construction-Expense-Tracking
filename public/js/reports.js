const API_BASE = 'http://localhost:3000/api';

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (!result.success) {
            console.log('❌ Not authenticated, redirecting to login...');
            window.location.href = '/login';
            return false;
        }
        return true;
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        window.location.href = '/login';
        return false;
    }
}

// Format currency in PKR
function formatPKR(amount) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format number with commas
function formatNumber(number) {
    return new Intl.NumberFormat('en-PK').format(number);
}

// Format month display
function formatMonth(monthStr) {
    if (!monthStr) return 'N/A';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'long' });
}

// Load reports data
async function loadReports() {
    try {
        const isAuth = await checkAuth();
        if (!isAuth) return;
        
        console.log('📊 Loading reports...');
        
        const response = await fetch(`${API_BASE}/summary`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Update metrics
            updateMetrics(data.summary);
            
            // Load tables
            loadMonthlySummary(data.monthly);
            loadCategorySummary(data.category);
            
            // Load material totals
            loadMaterialTotals();
            
            console.log('✅ Reports loaded successfully');
        }
    } catch (error) {
        console.error('❌ Error loading reports:', error);
        showError();
    }
}

// Update metrics cards
function updateMetrics(summary) {
    document.getElementById('totalExpenseMetric').textContent = formatPKR(summary.total_cost || 0);
    document.getElementById('totalPaidMetric').textContent = formatPKR(summary.total_paid || 0);
    document.getElementById('remainingBalanceMetric').textContent = formatPKR(summary.remaining_balance || 0);
    document.getElementById('advanceMetric').textContent = formatPKR(summary.total_advance || 0);
    
    // Calculate payment ratio
    if (summary.total_cost > 0) {
        const ratio = (summary.total_paid / summary.total_cost * 100).toFixed(1);
        document.getElementById('paymentRatio').textContent = `${ratio}%`;
        document.getElementById('paidProgressMetric').style.width = `${ratio}%`;
    }
    
    document.getElementById('pendingCount').textContent = `${summary.advance_entries || 0} pending`;
    document.getElementById('advanceCount').textContent = `${summary.advance_entries || 0} entries`;
}

// Load material totals
async function loadMaterialTotals() {
    try {
        const response = await fetch(`${API_BASE}/expenses/materials/totals`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            const materials = result.data;
            const tableBody = document.getElementById('materialSummaryTableBody');
            
            if (!tableBody) return;
            
            document.getElementById('totalMaterials').textContent = `${materials.length} items`;
            
            let totalQuantity = 0;
            let totalCost = 0;
            
            let html = '';
            materials.forEach((item, index) => {
                totalQuantity += parseFloat(item.total_quantity || 0);
                totalCost += parseFloat(item.total_cost || 0);
                
                const percentage = totalCost > 0 ? ((item.total_cost || 0) / totalCost * 100).toFixed(1) : 0;
                
                html += `
                    <tr>
                        <td>
                            <span class="badge bg-primary bg-opacity-10 text-primary p-2">
                                <i class="bi bi-box"></i> ${item.category}
                            </span>
                        </td>
                        <td class="fw-bold">${formatNumber(item.total_quantity || 0)}</td>
                        <td><span class="badge bg-light text-dark">${item.unit_type || '-'}</span></td>
                        <td><span class="badge bg-info">${item.entry_count || 0}</span></td>
                        <td class="currency">${formatPKR(item.total_cost || 0)}</td>
                        <td class="currency">${formatPKR(item.total_paid || 0)}</td>
                        <td class="currency ${item.total_advance > 0 ? 'text-success fw-bold' : ''}">
                            ${formatPKR(item.total_advance || 0)}
                        </td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1 me-2" style="width: 80px;">
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar bg-primary" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                                <small class="text-muted">${percentage}%</small>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            // Add total row
            html += `
                <tr class="table-light fw-bold">
                    <td>TOTAL</td>
                    <td>${formatNumber(totalQuantity)}</td>
                    <td>-</td>
                    <td>${materials.reduce((sum, item) => sum + (item.entry_count || 0), 0)}</td>
                    <td>${formatPKR(totalCost)}</td>
                    <td>${formatPKR(materials.reduce((sum, item) => sum + (item.total_paid || 0), 0))}</td>
                    <td>${formatPKR(materials.reduce((sum, item) => sum + (item.total_advance || 0), 0))}</td>
                    <td>100%</td>
                </tr>
            `;
            
            tableBody.innerHTML = html;
            document.getElementById('totalQuantity').textContent = `${formatNumber(totalQuantity)} units`;
        }
    } catch (error) {
        console.error('Error loading material totals:', error);
        const tableBody = document.getElementById('materialSummaryTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading material data</td></tr>';
        }
    }
}

// Load monthly summary
function loadMonthlySummary(monthlyData) {
    const tableBody = document.getElementById('monthlySummaryTableBody');
    
    if (!tableBody) return;
    
    if (!monthlyData || monthlyData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No data available</td></tr>';
        return;
    }
    
    let html = '';
    let previousMonthTotal = 0;
    
    monthlyData.forEach((item, index) => {
        const total = parseFloat(item.total_expense || 0);
        const trend = index < monthlyData.length - 1 && previousMonthTotal > 0 ? 
            ((total - previousMonthTotal) / previousMonthTotal * 100).toFixed(1) : 0;
        
        html += `
            <tr>
                <td><strong>${formatMonth(item.month)}</strong></td>
                <td class="currency fw-bold">${formatPKR(item.total_expense || 0)}</td>
                <td class="currency">${formatPKR(item.total_paid || 0)}</td>
                <td class="currency ${item.total_advance > 0 ? 'text-success' : ''}">${formatPKR(item.total_advance || 0)}</td>
                <td><span class="badge bg-secondary">${item.entry_count || 0}</span></td>
                <td>
                    ${index < monthlyData.length - 1 && previousMonthTotal > 0 ? `
                        <span class="${trend >= 0 ? 'text-success' : 'text-danger'}">
                            <i class="bi bi-arrow-${trend >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(trend)}%
                        </span>
                    ` : '-'}
                </td>
            </tr>
        `;
        
        previousMonthTotal = total;
    });
    
    tableBody.innerHTML = html;
}

// Load category summary
function loadCategorySummary(categoryData) {
    const tableBody = document.getElementById('categorySummaryTableBody');
    
    if (!tableBody) return;
    
    if (!categoryData || categoryData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No data available</td></tr>';
        return;
    }
    
    let totalExpense = categoryData.reduce((sum, item) => sum + parseFloat(item.total_expense || 0), 0);
    document.getElementById('categoryEntries').innerHTML = `${categoryData.length} categories`;
    
    let html = '';
    categoryData.forEach(item => {
        const percentage = totalExpense > 0 ? ((item.total_expense || 0) / totalExpense * 100).toFixed(1) : 0;
        
        html += `
            <tr>
                <td>
                    <span class="badge bg-primary p-2">
                        <i class="bi bi-tag"></i> ${item.category}
                    </span>
                </td>
                <td class="currency fw-bold">${formatPKR(item.total_expense || 0)}</td>
                <td class="currency">${formatPKR(item.total_paid || 0)}</td>
                <td class="currency ${item.remaining_balance > 0 ? 'text-danger' : 'text-success'}">
                    ${formatPKR(item.remaining_balance || 0)}
                </td>
                <td class="currency ${item.total_advance > 0 ? 'text-success fw-bold' : ''}">
                    ${formatPKR(item.total_advance || 0)}
                </td>
                <td><span class="badge bg-info">${item.entry_count || 0}</span></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1 me-2" style="width: 60px;">
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar bg-primary" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                        <small class="text-muted">${percentage}%</small>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Download functions
async function downloadFullReport() {
    try {
        window.location.href = `${API_BASE}/reports/expenses/excel`;
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading report');
    }
}

async function downloadMaterialReport() {
    try {
        window.location.href = `${API_BASE}/reports/materials/excel`;
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading material report');
    }
}

// Show error message
function showError() {
    const tables = ['monthlySummaryTableBody', 'categorySummaryTableBody', 'materialSummaryTableBody'];
    tables.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (table) {
            table.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Error loading data. Please refresh.</td></tr>';
        }
    });
}

// Refresh reports
async function refreshReports() {
    await loadReports();
}

// Initialize reports
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Reports page initialized');
    
    const isAuth = await checkAuth();
    if (isAuth) {
        await loadReports();
        
        // Auto refresh every 60 seconds
        setInterval(refreshReports, 60000);
    }
});