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

// ✅ FIXED: Calculate total cost and show advance section
function calculateTotals() {
    const quantity = parseFloat(document.getElementById('quantity')?.value) || 0;
    const unitPrice = parseFloat(document.getElementById('unit_price')?.value) || 0;
    const amountPaid = parseFloat(document.getElementById('amount_paid')?.value) || 0;
    
    const totalCost = quantity * unitPrice;
    const remainingBalance = totalCost - amountPaid;
    
    document.getElementById('total_cost').value = totalCost.toFixed(2);
    document.getElementById('remaining_balance').value = remainingBalance.toFixed(2);
    
    // ✅ SHOW ADVANCE SECTION WHEN AMOUNT PAID > TOTAL COST
    const advanceSection = document.getElementById('advanceSection');
    if (amountPaid > totalCost && totalCost > 0) {
        advanceSection.style.display = 'block';
        document.getElementById('remaining_balance').style.color = 'green';
        document.getElementById('remaining_balance').style.fontWeight = 'bold';
        
        // Show advance amount
        const advanceAmount = amountPaid - totalCost;
        document.getElementById('advance_amount_display')?.remove();
        const advanceDisplay = document.createElement('div');
        advanceDisplay.id = 'advance_amount_display';
        advanceDisplay.className = 'alert alert-success mt-2';
        advanceDisplay.innerHTML = `
            <i class="bi bi-cash-stack"></i> 
            <strong>Advance Amount:</strong> ${formatPKR(advanceAmount)}
            <br><small class="text-muted">This amount will be recorded as advance payment</small>
        `;
        advanceSection.appendChild(advanceDisplay);
    } else {
        advanceSection.style.display = 'none';
        document.getElementById('remaining_balance').style.color = '';
        document.getElementById('remaining_balance').style.fontWeight = '';
    }
}

// Calculate totals for edit form
function calculateEditTotals() {
    const quantity = parseFloat(document.getElementById('edit_quantity')?.value) || 0;
    const unitPrice = parseFloat(document.getElementById('edit_unit_price')?.value) || 0;
    const amountPaid = parseFloat(document.getElementById('edit_amount_paid')?.value) || 0;
    
    const totalCost = quantity * unitPrice;
    const remainingBalance = totalCost - amountPaid;
    
    document.getElementById('edit_total_cost').value = totalCost.toFixed(2);
    document.getElementById('edit_remaining_balance').value = remainingBalance.toFixed(2);
    
    // Show edit advance section
    const editAdvanceSection = document.getElementById('editAdvanceSection');
    if (amountPaid > totalCost && totalCost > 0) {
        editAdvanceSection.style.display = 'block';
        document.getElementById('edit_remaining_balance').style.color = 'green';
        document.getElementById('edit_remaining_balance').style.fontWeight = 'bold';
    } else {
        editAdvanceSection.style.display = 'none';
        document.getElementById('edit_remaining_balance').style.color = '';
        document.getElementById('edit_remaining_balance').style.fontWeight = '';
    }
}

// Load all expenses
async function loadExpenses() {
    try {
        const isAuth = await checkAuth();
        if (!isAuth) return;
        
        console.log('Loading expenses...');
        const response = await fetch(`${API_BASE}/expenses`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            const tableBody = document.getElementById('expensesTableBody');
            document.getElementById('expenseCount').innerHTML = `${result.data.length} entries`;
            
            if (!result.data || result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="10" class="text-center py-5">No expenses found</td></tr>';
                return;
            }
            
            let html = '';
            result.data.forEach(expense => {
                // Determine status and class
                let statusClass = 'bg-secondary';
                let statusText = 'Pending';
                let statusIcon = 'bi-clock-history';
                
                if (expense.remaining_balance === 0) {
                    statusClass = 'bg-success';
                    statusText = 'Paid';
                    statusIcon = 'bi-check-circle';
                } else if (expense.remaining_balance < 0) {
                    statusClass = 'bg-info';
                    statusText = 'Advance';
                    statusIcon = 'bi-cash-stack';
                } else if (expense.remaining_balance > 0) {
                    statusClass = 'bg-warning';
                    statusText = 'Pending';
                    statusIcon = 'bi-exclamation-triangle';
                }
                
                const balanceClass = expense.remaining_balance < 0 ? 'text-success fw-bold' : 
                                   (expense.remaining_balance > 0 ? 'text-danger' : 'text-success');
                
                html += `
                    <tr class="animate__animated animate__fadeIn">
                        <td>${new Date(expense.date).toLocaleDateString()}</td>
                        <td>
                            <span class="badge bg-primary bg-opacity-10 text-primary p-2">
                                <i class="bi bi-tag"></i> ${expense.category}
                            </span>
                        </td>
                        <td>
                            ${expense.description || '-'}
                            ${expense.advance_note ? `
                                <br><small class="text-muted"><i class="bi bi-info-circle"></i> ${expense.advance_note}</small>
                            ` : ''}
                        </td>
                        <td class="fw-bold">${formatNumber(expense.quantity)} ${expense.unit_type}</td>
                        <td class="currency">${formatPKR(expense.unit_price)}</td>
                        <td class="currency fw-bold">${formatPKR(expense.total_cost)}</td>
                        <td class="currency">${formatPKR(expense.amount_paid)}</td>
                        <td class="currency ${balanceClass}">${formatPKR(expense.remaining_balance)}</td>
                        <td>
                            <span class="badge ${statusClass}">
                                <i class="bi ${statusIcon}"></i> ${statusText}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editExpense(${expense.id})" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteExpense(${expense.id})" title="Delete">
                                    <i class="bi bi-trash"></i>
                                </button>
                                <button class="btn btn-outline-info" onclick="viewExpense(${expense.id})" title="View">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
            
            // Update quick stats
            await loadQuickStats();
            await loadSidebarStats();
        }
    } catch (error) {
        console.error('Error loading expenses:', error);
        document.getElementById('expensesTableBody').innerHTML = 
            '<tr><td colspan="10" class="text-center text-danger py-5">Error loading expenses</td></tr>';
    }
}

// Load quick stats
async function loadQuickStats() {
    try {
        const response = await fetch(`${API_BASE}/summary`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            const summary = result.data.summary;
            document.getElementById('quickTotalCost').textContent = formatPKR(summary.total_cost || 0);
            document.getElementById('quickTotalPaid').textContent = formatPKR(summary.total_paid || 0);
            document.getElementById('quickRemaining').textContent = formatPKR(summary.remaining_balance || 0);
            document.getElementById('quickAdvance').textContent = formatPKR(summary.total_advance || 0);
            document.getElementById('advanceCount').innerHTML = `${summary.advance_entries || 0} entries`;
            
            // Calculate progress
            if (summary.total_cost > 0) {
                const paidPercent = (summary.total_paid / summary.total_cost * 100).toFixed(0);
                document.getElementById('paidProgress').style.width = paidPercent + '%';
                document.getElementById('remainingProgress').style.width = (100 - paidPercent) + '%';
            }
        }
    } catch (error) {
        console.error('Error loading quick stats:', error);
    }
}

// Load sidebar material stats
async function loadSidebarStats() {
    try {
        const response = await fetch(`${API_BASE}/expenses/materials/totals`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            const materials = result.data;
            let html = '<ul class="list-unstyled mt-2">';
            
            materials.slice(0, 3).forEach(mat => {
                html += `<li class="mb-2">
                    <i class="bi bi-dot text-primary"></i> 
                    <span class="text-white-50">${mat.category}:</span>
                    <strong class="text-white">${formatNumber(mat.total_quantity || 0)}</strong>
                    <small class="text-white-50">${mat.unit_type || 'units'}</small>
                </li>`;
            });
            
            if (materials.length > 3) {
                html += `<li class="text-white-50 small">+${materials.length - 3} more materials</li>`;
            }
            
            html += '</ul>';
            document.getElementById('sidebarMaterialStats').innerHTML = html;
            document.getElementById('materialCount').innerHTML = `${materials.length} materials`;
        }
    } catch (error) {
        console.error('Error loading sidebar stats:', error);
    }
}

// ✅ FIXED: Save new expense with ADVANCE PAYMENT SUPPORT
async function saveExpense() {
    try {
        const isAuth = await checkAuth();
        if (!isAuth) return;
        
        // Get form values
        const date = document.getElementById('date')?.value;
        const category = document.getElementById('category')?.value;
        const description = document.getElementById('description')?.value || '';
        const quantity = parseFloat(document.getElementById('quantity')?.value) || 0;
        const unit_type = document.getElementById('unit_type')?.value;
        const unit_price = parseFloat(document.getElementById('unit_price')?.value) || 0;
        const amount_paid = parseFloat(document.getElementById('amount_paid')?.value) || 0;
        const advance_note = document.getElementById('advance_note')?.value || '';
        const notes = document.getElementById('notes')?.value || '';

        const total_cost = quantity * unit_price;

        // Validate required fields
        if (!date) { alert('❌ Please select a date'); return; }
        if (!category) { alert('❌ Please select a category'); return; }
        if (!quantity || quantity <= 0) { alert('❌ Please enter a valid quantity'); return; }
        if (!unit_type || unit_type.trim() === '') { alert('❌ Please enter unit type'); return; }
        if (!unit_price || unit_price <= 0) { alert('❌ Please enter a valid unit price'); return; }
        
        // ✅ ADVANCE PAYMENT IS NOW ALLOWED - NO VALIDATION BLOCKING!

        const expenseData = {
            date, 
            category, 
            description, 
            quantity, 
            unit_type,
            unit_price, 
            amount_paid, 
            advance_note,
            notes
        };

        console.log('📤 Sending expense data:', expenseData);

        const response = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(expenseData)
        });

        const result = await response.json();
        
        if (result.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addExpenseModal'));
            if (modal) modal.hide();
            
            // Reset form
            document.getElementById('expenseForm')?.reset();
            document.getElementById('total_cost').value = '';
            document.getElementById('remaining_balance').value = '';
            document.getElementById('advanceSection').style.display = 'none';
            
            // Reload expenses
            await loadExpenses();
            await loadSidebarStats();
            
            // Show success message with advance info
            if (amount_paid > total_cost) {
                const advanceAmount = amount_paid - total_cost;
                alert(`✅ Expense added with ADVANCE PAYMENT of ${formatPKR(advanceAmount)}!`);
            } else {
                alert('✅ Expense added successfully!');
            }
        } else {
            alert('❌ ' + (result.message || 'Error saving expense'));
        }
    } catch (error) {
        console.error('❌ Error saving expense:', error);
        alert('❌ Error saving expense: ' + error.message);
    }
}

// Edit expense
async function editExpense(id) {
    try {
        const isAuth = await checkAuth();
        if (!isAuth) return;
        
        console.log('🔍 Editing expense ID:', id);
        
        if (!id) {
            alert('Invalid expense ID');
            return;
        }
        
        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            const expense = result.data;
            
            document.getElementById('edit_id').value = expense.id;
            document.getElementById('edit_date').value = expense.date.split('T')[0];
            document.getElementById('edit_category').value = expense.category;
            document.getElementById('edit_description').value = expense.description || '';
            document.getElementById('edit_quantity').value = expense.quantity;
            document.getElementById('edit_unit_type').value = expense.unit_type;
            document.getElementById('edit_unit_price').value = expense.unit_price;
            document.getElementById('edit_total_cost').value = expense.total_cost;
            document.getElementById('edit_amount_paid').value = expense.amount_paid;
            document.getElementById('edit_remaining_balance').value = expense.remaining_balance;
            document.getElementById('edit_advance_note').value = expense.advance_note || '';
            document.getElementById('edit_notes').value = expense.notes || '';
            
            // Show advance section if needed
            const editAdvanceSection = document.getElementById('editAdvanceSection');
            if (expense.remaining_balance < 0) {
                editAdvanceSection.style.display = 'block';
            } else {
                editAdvanceSection.style.display = 'none';
            }
            
            const modal = new bootstrap.Modal(document.getElementById('editExpenseModal'));
            modal.show();
        } else {
            alert('Expense not found!');
        }
    } catch (error) {
        console.error('❌ Error in editExpense:', error);
        alert('Error loading expense data: ' + error.message);
    }
}

// Update expense
async function updateExpense() {
    try {
        const isAuth = await checkAuth();
        if (!isAuth) return;
        
        const id = document.getElementById('edit_id').value;
        
        if (!id) {
            alert('Invalid expense ID');
            return;
        }
        
        const quantity = parseFloat(document.getElementById('edit_quantity')?.value) || 0;
        const unit_price = parseFloat(document.getElementById('edit_unit_price')?.value) || 0;
        const amount_paid = parseFloat(document.getElementById('edit_amount_paid')?.value) || 0;
        const total_cost = quantity * unit_price;
        
        // ✅ ADVANCE PAYMENT IS ALLOWED - NO VALIDATION BLOCKING!
        
        const expenseData = {
            date: document.getElementById('edit_date')?.value,
            category: document.getElementById('edit_category')?.value,
            description: document.getElementById('edit_description')?.value || '',
            quantity: quantity,
            unit_type: document.getElementById('edit_unit_type')?.value,
            unit_price: unit_price,
            amount_paid: amount_paid,
            advance_note: document.getElementById('edit_advance_note')?.value || '',
            notes: document.getElementById('edit_notes')?.value || ''
        };

        if (!expenseData.date || !expenseData.category || !expenseData.quantity || 
            !expenseData.unit_type || !expenseData.unit_price) {
            alert('Please fill all required fields');
            return;
        }

        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(expenseData)
        });

        const result = await response.json();
        
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editExpenseModal'));
            modal.hide();
            await loadExpenses();
            await loadSidebarStats();
            alert('✅ Expense updated successfully!');
        } else {
            alert('❌ ' + (result.message || 'Error updating expense'));
        }
    } catch (error) {
        console.error('❌ Error updating expense:', error);
        alert('Error updating expense: ' + error.message);
    }
}

// Delete expense
async function deleteExpense(id) {
    try {
        const isAuth = await checkAuth();
        if (!isAuth) return;
        
        if (!id) {
            alert('Invalid expense ID');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }
        
        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadExpenses();
            await loadSidebarStats();
            alert('✅ Expense deleted successfully!');
        } else {
            alert('❌ ' + (result.message || 'Error deleting expense'));
        }
    } catch (error) {
        console.error('❌ Error deleting expense:', error);
        alert('Error deleting expense: ' + error.message);
    }
}

// View expense details
async function viewExpense(id) {
    try {
        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            const expense = result.data;
            const modalBody = document.getElementById('expenseDetailsBody');
            
            modalBody.innerHTML = `
                <div class="container-fluid">
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Date:</strong><br>
                            ${new Date(expense.date).toLocaleDateString()}
                        </div>
                        <div class="col-6">
                            <strong>Category:</strong><br>
                            <span class="badge bg-primary">${expense.category}</span>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-12">
                            <strong>Description:</strong><br>
                            ${expense.description || '-'}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Quantity:</strong><br>
                            ${formatNumber(expense.quantity)} ${expense.unit_type}
                        </div>
                        <div class="col-6">
                            <strong>Unit Price:</strong><br>
                            ${formatPKR(expense.unit_price)}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Total Cost:</strong><br>
                            <span class="fw-bold">${formatPKR(expense.total_cost)}</span>
                        </div>
                        <div class="col-6">
                            <strong>Amount Paid:</strong><br>
                            ${formatPKR(expense.amount_paid)}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Remaining Balance:</strong><br>
                            <span class="${expense.remaining_balance < 0 ? 'text-success' : expense.remaining_balance > 0 ? 'text-danger' : ''} fw-bold">
                                ${formatPKR(expense.remaining_balance)}
                            </span>
                        </div>
                        <div class="col-6">
                            <strong>Status:</strong><br>
                            ${expense.remaining_balance === 0 ? 'Paid' : expense.remaining_balance < 0 ? 'Advance' : 'Pending'}
                        </div>
                    </div>
                    ${expense.advance_note ? `
                    <div class="row mb-3">
                        <div class="col-12">
                            <strong>Advance Note:</strong><br>
                            <div class="alert alert-info py-2">
                                <i class="bi bi-info-circle"></i> ${expense.advance_note}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    ${expense.notes ? `
                    <div class="row mb-3">
                        <div class="col-12">
                            <strong>Notes:</strong><br>
                            ${expense.notes}
                        </div>
                    </div>
                    ` : ''}
                    <div class="row">
                        <div class="col-12">
                            <small class="text-muted">
                                Created: ${new Date(expense.created_at).toLocaleString()}
                            </small>
                        </div>
                    </div>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewExpenseModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error viewing expense:', error);
        alert('Error loading expense details');
    }
}

// Export expenses
async function exportExpenses() {
    try {
        window.location.href = `${API_BASE}/reports/expenses/excel`;
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting expenses');
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ Expenses page initialized');
    
    const isAuth = await checkAuth();
    if (isAuth) {
        await loadExpenses();
        
        // Add form calculation listeners
        document.getElementById('quantity')?.addEventListener('input', calculateTotals);
        document.getElementById('unit_price')?.addEventListener('input', calculateTotals);
        document.getElementById('amount_paid')?.addEventListener('input', calculateTotals);
        
        // Edit form calculation listeners
        document.getElementById('edit_quantity')?.addEventListener('input', calculateEditTotals);
        document.getElementById('edit_unit_price')?.addEventListener('input', calculateEditTotals);
        document.getElementById('edit_amount_paid')?.addEventListener('input', calculateEditTotals);
        
        // Filter listeners
        document.getElementById('categoryFilter')?.addEventListener('change', filterExpenses);
        document.getElementById('paymentStatusFilter')?.addEventListener('change', filterExpenses);
        document.getElementById('searchFilter')?.addEventListener('keyup', filterExpenses);
    }
});