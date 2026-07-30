// ============================================
// ADMIN.JS - Complete Admin Dashboard Functionality
// ============================================

import { 
    db, 
    storage,
    collection, 
    getDocs, 
    doc, 
    deleteDoc, 
    getDoc,
    query,
    orderBy,
    ref,
    deleteObject,
    getDownloadURL
} from './firebase-config.js';

// ============================================
// LOAD APPLICATIONS
// ============================================
async function loadApplications() {
    try {
        const applicationsBody = document.getElementById('applicationsBody');
        if (!applicationsBody) return;
        
        // Show loading state
        applicationsBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding: 40px;">
                    <div class="admin-loading">
                        <div class="spinner">⏳</div>
                        <p>Loading applications...</p>
                    </div>
                </td>
            </tr>
        `;
        
        // Get all applications from Firestore
        const q = query(collection(db, 'applications'), orderBy('applied_on', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            applicationsBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 40px;">
                        <div class="admin-empty">
                            <div class="icon">📋</div>
                            <h3>No Applications Found</h3>
                            <p>There are no applications submitted yet.</p>
                        </div>
                    </td>
                </tr>
            `;
            updateStats([]);
            return;
        }
        
        // Convert to array
        const applications = [];
        querySnapshot.forEach((doc) => {
            applications.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Display applications
        displayApplications(applications);
        updateStats(applications);
        
    } catch (error) {
        console.error('Error loading applications:', error);
        const applicationsBody = document.getElementById('applicationsBody');
        if (applicationsBody) {
            applicationsBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 40px; color: #c62828;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
                        <h3>Error Loading Applications</h3>
                        <p>${error.message || 'Please refresh the page and try again.'}</p>
                    </td>
                </tr>
            `;
        }
    }
}

// ============================================
// DISPLAY APPLICATIONS IN TABLE
// ============================================
function displayApplications(applications) {
    const tbody = document.getElementById('applicationsBody');
    if (!tbody) return;
    
    if (!applications || applications.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding: 40px;">
                    <div class="admin-empty">
                        <div class="icon">📋</div>
                        <h3>No Applications Found</h3>
                        <p>There are no applications submitted yet.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    applications.forEach((app, index) => {
        // Format date
        let formattedDate = 'N/A';
        if (app.applied_on) {
            try {
                const date = new Date(app.applied_on);
                formattedDate = date.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) + ', ' + date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                formattedDate = app.applied_on || 'N/A';
            }
        }
        
        // Check if resume exists
        const hasResume = app.resume_url || app.resume;
        
        html += `
            <tr id="row_${app.id}">
                <td>${index + 1}</td>
                <td><strong>${app.name || 'N/A'}</strong></td>
                <td>${app.mobile || 'N/A'}</td>
                <td>${app.email || 'N/A'}</td>
                <td><span class="program-badge">${app.program || 'N/A'}</span></td>
                <td>${app.career_goal || 'N/A'}</td>
                <td style="font-size: 0.85rem;">${formattedDate}</td>
                <td>
                    <div class="action-cell">
                        <!-- View Button -->
                        <button onclick="window.viewApplication('${app.id}')" class="btn-action btn-view" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        <!-- Resume Button -->
                        ${hasResume ? `
                            <button onclick="window.viewResume('${app.id}', '${app.resume_url || app.resume}')" class="btn-action btn-resume" title="View Resume">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                        ` : `
                            <span class="no-resume">No Resume</span>
                        `}
                        
                        <!-- Delete Button -->
                        <button onclick="window.deleteApplication('${app.id}', '${app.name || 'Unknown'}')" class="btn-action btn-delete" title="Delete Application">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ============================================
// UPDATE STATISTICS
// ============================================
function updateStats(applications) {
    if (!applications) applications = [];
    
    // Total Applications
    const totalCount = document.getElementById('totalCount');
    if (totalCount) totalCount.textContent = applications.length;
    
    // Today's Applications
    const today = new Date().toDateString();
    const todayApps = applications.filter(app => {
        if (!app.applied_on) return false;
        try {
            const appDate = new Date(app.applied_on).toDateString();
            return appDate === today;
        } catch (e) {
            return false;
        }
    });
    const todayCount = document.getElementById('todayCount');
    if (todayCount) todayCount.textContent = todayApps.length;
    
    // This Week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekApps = applications.filter(app => {
        if (!app.applied_on) return false;
        try {
            const appDate = new Date(app.applied_on);
            return appDate >= weekStart;
        } catch (e) {
            return false;
        }
    });
    const weekCount = document.getElementById('weekCount');
    if (weekCount) weekCount.textContent = weekApps.length;
    
    // Programs Selected (unique)
    const programs = new Set();
    applications.forEach(app => {
        if (app.program) programs.add(app.program);
    });
    const programCount = document.getElementById('programCount');
    if (programCount) programCount.textContent = programs.size;
}

// ============================================
// VIEW APPLICATION DETAILS
// ============================================
window.viewApplication = async function(id) {
    try {
        const docRef = doc(db, 'applications', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const app = docSnap.data();
            
            // Format details for display
            const details = `
                📋 APPLICATION DETAILS
                ════════════════════════════════
                
                👤 Name: ${app.name || 'N/A'}
                📱 Mobile: ${app.mobile || 'N/A'}
                ✉️ Email: ${app.email || 'N/A'}
                🆔 Aadhar: ${app.aadhar || 'N/A'}
                
                📚 Program: ${app.program || 'N/A'}
                🎯 Career Goal: ${app.career_goal || 'N/A'}
                
                🏫 Graduation: ${app.graduation_course || 'N/A'}
                📅 Academic Year: ${app.academic_year || 'N/A'}
                🎓 PG Course: ${app.pg_course || 'N/A'}
                
                📍 State: ${app.state || 'N/A'}
                🏠 Address: ${app.address || 'N/A'}
                
                👨 Father: ${app.father_name || 'N/A'}
                👩 Mother: ${app.mother_name || 'N/A'}
                👨‍👩‍👧 Siblings: ${app.siblings || 'N/A'}
                
                🕉️ Religion: ${app.religion || 'N/A'}
                🏛️ Caste: ${app.caste || 'N/A'}
                💰 Annual Income: ${app.annual_income || 'N/A'}
                
                📅 Applied On: ${app.applied_on ? new Date(app.applied_on).toLocaleString() : 'N/A'}
                📌 How did you know: ${app.how_did_you_know || 'N/A'}
                
                📎 Resume: ${app.resume_url ? '✅ Uploaded' : '❌ Not uploaded'}
            `;
            
            alert(details);
        } else {
            alert('❌ Application not found');
        }
    } catch (error) {
        console.error('Error viewing application:', error);
        alert('❌ Error loading application details. Please try again.');
    }
};

// ============================================
// VIEW RESUME
// ============================================
window.viewResume = function(id, url) {
    if (url) {
        // Open in new tab
        window.open(url, '_blank');
    } else {
        alert('❌ Resume not available for this application.');
    }
};

// ============================================
// DELETE APPLICATION
// ============================================
window.deleteApplication = function(id, name) {
    if (confirm(`⚠️ Are you sure you want to delete the application for "${name}"?\n\nThis action cannot be undone!`)) {
        // First, get the application data to delete the resume file
        const docRef = doc(db, 'applications', id);
        
        getDoc(docRef)
            .then(async (docSnap) => {
                if (docSnap.exists()) {
                    const app = docSnap.data();
                    
                    // Delete resume from Storage if it exists
                    if (app.resume) {
                        try {
                            const resumeRef = ref(storage, `resumes/${app.resume}`);
                            await deleteObject(resumeRef);
                            console.log('Resume deleted from storage');
                        } catch (error) {
                            console.log('Resume not found in storage, continuing...');
                        }
                    }
                    
                    // Delete from Firestore
                    await deleteDoc(docRef);
                    
                    // Remove row from table
                    const row = document.getElementById(`row_${id}`);
                    if (row) row.remove();
                    
                    // Update counts
                    const remainingRows = document.querySelectorAll('#applicationsBody tr').length;
                    const totalCount = document.getElementById('totalCount');
                    if (totalCount) totalCount.textContent = remainingRows;
                    
                    alert('✅ Application deleted successfully!');
                    
                    // If no rows left, show empty state
                    if (remainingRows === 0) {
                        const tbody = document.getElementById('applicationsBody');
                        if (tbody) {
                            tbody.innerHTML = `
                                <tr>
                                    <td colspan="8" style="text-align:center; padding: 40px;">
                                        <div class="admin-empty">
                                            <div class="icon">📋</div>
                                            <h3>No Applications Found</h3>
                                            <p>There are no applications submitted yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }
                        updateStats([]);
                    }
                } else {
                    alert('❌ Application not found');
                }
            })
            .catch((error) => {
                console.error('Error deleting:', error);
                alert('❌ Error deleting application. Please try again.\n\nError: ' + error.message);
            });
    }
};

// ============================================
// EXPORT TO CSV
// ============================================
window.exportCSV = async function() {
    try {
        const applicationsBody = document.getElementById('applicationsBody');
        if (!applicationsBody) return;
        
        // Get all applications
        const q = query(collection(db, 'applications'), orderBy('applied_on', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            alert('No data to export');
            return;
        }
        
        const applications = [];
        querySnapshot.forEach((doc) => {
            applications.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Define headers
        const headers = [
            'Name', 
            'Aadhar', 
            'Mobile', 
            'Email', 
            'Program', 
            'Career Goal',
            'Graduation',
            'Academic Year',
            'State',
            'Annual Income',
            'How Did You Know',
            'Application Date'
        ];
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        applications.forEach(app => {
            const row = [
                `"${(app.name || '').replace(/"/g, '""')}"`,
                `="${app.aadhar || ''}"`, // Forces Excel to show full number
                `"${(app.mobile || '').replace(/"/g, '""')}"`,
                `"${(app.email || '').replace(/"/g, '""')}"`,
                `"${(app.program || '').replace(/"/g, '""')}"`,
                `"${(app.career_goal || '').replace(/"/g, '""')}"`,
                `"${(app.graduation_course || '').replace(/"/g, '""')}"`,
                `"${(app.academic_year || '').replace(/"/g, '""')}"`,
                `"${(app.state || '').replace(/"/g, '""')}"`,
                `"${(app.annual_income || '').replace(/"/g, '""')}"`,
                `"${(app.how_did_you_know || '').replace(/"/g, '""')}"`,
                `"${app.applied_on ? new Date(app.applied_on).toLocaleString() : ''}"`
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Add BOM for UTF-8 to support special characters
        const blob = new Blob(['\uFEFF' + csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        // Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().slice(0, 10);
        link.download = `applications_${dateStr}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        alert('✅ CSV exported successfully!');
        
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('❌ Error exporting data. Please try again.\n\nError: ' + error.message);
    }
};

// ============================================
// SEARCH TABLE
// ============================================
window.searchTable = function() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const filter = input.value.toUpperCase().trim();
    const rows = document.querySelectorAll('#applicationsBody tr');
    
    // Skip empty state rows
    const dataRows = Array.from(rows).filter(row => {
        return row.querySelector('td') && !row.querySelector('.admin-empty');
    });
    
    if (dataRows.length === 0) return;
    
    dataRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let found = false;
        
        // Search in first 6 columns (skip action column)
        for (let i = 0; i < Math.min(6, cells.length); i++) {
            const text = cells[i]?.textContent || '';
            if (text.toUpperCase().includes(filter)) {
                found = true;
                break;
            }
        }
        row.style.display = found ? '' : 'none';
    });
    
    // Show message if no results
    const visibleRows = dataRows.filter(row => row.style.display !== 'none');
    if (visibleRows.length === 0 && filter !== '') {
        // Check if message already exists
        let noResultMsg = document.getElementById('noResultMsg');
        if (!noResultMsg) {
            const tbody = document.getElementById('applicationsBody');
            noResultMsg = document.createElement('tr');
            noResultMsg.id = 'noResultMsg';
            noResultMsg.innerHTML = `
                <td colspan="8" style="text-align:center; padding: 30px; color: #666;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🔍</div>
                    <h4>No results found</h4>
                    <p style="color: #999;">Try adjusting your search terms</p>
                </td>
            `;
            tbody.appendChild(noResultMsg);
        }
        noResultMsg.style.display = '';
    } else {
        const noResultMsg = document.getElementById('noResultMsg');
        if (noResultMsg) noResultMsg.style.display = 'none';
    }
};

// ============================================
// REFRESH DATA
// ============================================
window.refreshData = function() {
    const btn = document.querySelector('.btn-refresh');
    if (btn) {
        btn.innerHTML = '⏳ Loading...';
        btn.disabled = true;
    }
    
    loadApplications()
        .then(() => {
            if (btn) {
                btn.innerHTML = '🔄 Refresh';
                btn.disabled = false;
            }
            alert('✅ Data refreshed successfully!');
        })
        .catch((error) => {
            if (btn) {
                btn.innerHTML = '🔄 Refresh';
                btn.disabled = false;
            }
            console.error('Error refreshing:', error);
        });
};

// ============================================
// CHECK ADMIN AUTH
// ============================================
function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

function requireAdmin() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (document.getElementById('applicationsBody')) {
        if (!requireAdmin()) return;
        loadApplications();
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', adminLogout);
    }
    
    // Setup refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', window.refreshData);
    }
    
    // Setup search with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(window.searchTable, 300);
        });
    }
});

// ============================================
// EXPORT FUNCTIONS
// ============================================
export {
    loadApplications,
    displayApplications,
    updateStats,
    isAdminLoggedIn,
    requireAdmin,
    adminLogout
};
