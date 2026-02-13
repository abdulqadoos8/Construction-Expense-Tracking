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

// Load dashboard summary
async function loadDashboardSummary() {
    try {
        console.log('📊 Loading dashboard summary...');
        
        const response = await fetch(`${API_BASE}/summary`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            const summary = result.data.summary || {};
            
            document.getElementById('totalCost').textContent = formatPKR(summary.total_cost || 0);
            document.getElementById('totalPaid').textContent = formatPKR(summary.total_paid || 0);
            document.getElementById('remainingBalance').textContent = formatPKR(summary.remaining_balance || 0);
            document.getElementById('totalEntries').textContent = summary.total_entries || 0;
            
            console.log('✅ Dashboard summary updated');
        }
    } catch (error) {
        console.error('❌ Error loading dashboard summary:', error);
    }
}

// Load recent expenses
async function loadRecentExpenses() {
    try {
        console.log('📋 Loading recent expenses...');
        
        const response = await fetch(`${API_BASE}/expenses`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            const recentExpenses = result.data ? result.data.slice(0, 5) : [];
            const tableBody = document.getElementById('recentExpensesTable');
            
            if (!tableBody) {
                console.error('❌ Recent expenses table body not found');
                return;
            }
            
            if (recentExpenses.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No expenses found</td></tr>';
                return;
            }
            
            let html = '';
            recentExpenses.forEach(expense => {
                const balanceClass = expense.remaining_balance < 0 ? 'text-success fw-bold' : 
                                   (expense.remaining_balance > 0 ? 'text-danger' : 'text-success');
                
                let statusBadge = '';
                if (expense.remaining_balance === 0) {
                    statusBadge = '<span class="badge bg-success">Paid</span>';
                } else if (expense.remaining_balance < 0) {
                    statusBadge = '<span class="badge bg-info">Advance</span>';
                } else {
                    statusBadge = '<span class="badge bg-warning">Pending</span>';
                }
                
                html += `
                    <tr>
                        <td>${new Date(expense.date).toLocaleDateString()}</td>
                        <td><span class="badge bg-primary">${expense.category}</span></td>
                        <td>${expense.description || '-'}</td>
                        <td class="currency">${formatPKR(expense.total_cost)}</td>
                        <td class="currency">${formatPKR(expense.amount_paid)}</td>
                        <td class="currency ${balanceClass}">${formatPKR(expense.remaining_balance)}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
            console.log('✅ Recent expenses loaded');
        }
    } catch (error) {
        console.error('❌ Error loading recent expenses:', error);
    }
}

// Load material summary for dashboard
async function loadMaterialSummary() {
    try {
        const response = await fetch(`${API_BASE}/expenses/materials/totals`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            const materials = result.data;
            const container = document.getElementById('materialSummaryCards');
            
            if (!container) return;
            
            if (!materials || materials.length === 0) {
                container.innerHTML = '<div class="col-12 text-center">No materials found</div>';
                return;
            }
            
            let html = '';
            materials.slice(0, 4).forEach(mat => {
                html += `
                    <div class="col-md-3 col-sm-6 mb-3">
                        <div class="card bg-light border-0">
                            <div class="card-body text-center">
                                <h6 class="text-primary">${mat.category}</h6>
                                <h4 class="fw-bold">${formatNumber(mat.total_quantity || 0)}</h4>
                                <small class="text-muted">${mat.unit_type || 'units'}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
            document.getElementById('materialCount').innerHTML = `${materials.length} materials`;
        }
    } catch (error) {
        console.error('Error loading material summary:', error);
    }
}

// Refresh dashboard
async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');
    await Promise.all([
        loadDashboardSummary(), 
        loadRecentExpenses(),
        loadMaterialSummary()
    ]);
    console.log('✅ Dashboard refreshed');
}

// Logout function
async function logout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;
    
    try {
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Dashboard page initialized');
    
    const isAuth = await checkAuth();
    if (isAuth) {
        await refreshDashboard();
        
        // Auto refresh every 30 seconds
        setInterval(refreshDashboard, 30000);
    }
});