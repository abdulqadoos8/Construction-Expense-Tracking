const API_BASE = 'http://localhost:3000/api';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const alertMessage = document.getElementById('alertMessage');
    
    // Show loading state
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    alertMessage.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            alertMessage.className = 'alert alert-success';
            alertMessage.innerHTML = '<i class="bi bi-check-circle"></i> Login successful! Redirecting...';
            alertMessage.style.display = 'block';
            
            // Store user data in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(result.user));
            sessionStorage.setItem('token', result.token);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            // Show error message
            alertMessage.className = 'alert alert-danger';
            alertMessage.innerHTML = '<i class="bi bi-exclamation-triangle"></i> ' + result.message;
            alertMessage.style.display = 'block';
            
            // Reset button
            loginBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnSpinner.style.display = 'none';
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Show error message
        alertMessage.className = 'alert alert-danger';
        alertMessage.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Connection error. Please try again.';
        alertMessage.style.display = 'block';
        
        // Reset button
        loginBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnSpinner.style.display = 'none';
    }
});

// Check if already logged in
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            // Already logged in, redirect to dashboard
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.log('Not authenticated');
    }
}

// Run check on page load
checkAuth();