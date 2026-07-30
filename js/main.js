// ============================================
// MAIN.JS - Complete Dhairithi Website JavaScript
// ============================================

import { 
    db, 
    storage,
    collection, 
    addDoc, 
    getDocs,
    doc,
    deleteDoc,
    getDoc,
    query,
    orderBy,
    where,
    updateDoc,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from './firebase-config.js';

// ============================================
// NAVBAR TOGGLE
// ============================================
function toggleNav() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('show');
}

// ============================================
// CLOSE NAV ON LINK CLICK (mobile)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('navLinks');
            if (nav && window.innerWidth <= 768) nav.classList.remove('show');
        });
    });
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ============================================
// APPLICATION FORM SUBMISSION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Disable button and show loading
            submitBtn.textContent = '⏳ Submitting...';
            submitBtn.disabled = true;
            
            try {
                // ============================
                // 1. COLLECT FORM DATA
                // ============================
                const formData = {
                    name: document.getElementById('name')?.value || '',
                    mobile: document.getElementById('mobile')?.value || '',
                    email: document.getElementById('email')?.value || '',
                    aadhar: document.getElementById('aadhar')?.value || '',
                    gender: document.getElementById('gender')?.value || '',
                    dob: document.getElementById('dob')?.value || '',
                    address: document.getElementById('address')?.value || '',
                    state: document.getElementById('state')?.value || '',
                    father_name: document.getElementById('father_name')?.value || '',
                    mother_name: document.getElementById('mother_name')?.value || '',
                    siblings: document.getElementById('siblings')?.value || '',
                    religion: document.getElementById('religion')?.value || '',
                    caste: document.getElementById('caste')?.value || '',
                    annual_income: document.getElementById('annual_income')?.value || '',
                    pg_course: document.getElementById('pg_course')?.value || '',
                    graduation_course: document.getElementById('graduation_course')?.value || '',
                    academic_year: document.getElementById('academic_year')?.value || '',
                    program: document.getElementById('program')?.value || '',
                    career_goal: document.getElementById('career_goal')?.value || '',
                    how_did_you_know: document.getElementById('how_did_you_know')?.value || '',
                    applied_on: new Date().toISOString()
                };
                
                // ============================
                // 2. HANDLE RESUME UPLOAD
                // ============================
                const resumeFile = document.getElementById('resume')?.files[0];
                
                if (resumeFile) {
                    // Validate file type
                    const allowedTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ];
                    
                    if (!allowedTypes.includes(resumeFile.type)) {
                        alert('❌ Please upload PDF, DOC, or DOCX file only.');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        return;
                    }
                    
                    // Validate file size (max 2MB)
                    if (resumeFile.size > 2 * 1024 * 1024) {
                        alert('❌ File size should be less than 2MB.');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        return;
                    }
                    
                    // Upload to Firebase Storage
                    const fileName = `${Date.now()}_${resumeFile.name}`;
                    const storageRef = ref(storage, `resumes/${fileName}`);
                    
                    const snapshot = await uploadBytes(storageRef, resumeFile);
                    const downloadURL = await getDownloadURL(snapshot.ref);
                    
                    formData.resume = fileName;
                    formData.resume_url = downloadURL;
                }
                
                // ============================
                // 3. SAVE TO FIRESTORE
                // ============================
                const docRef = await addDoc(collection(db, 'applications'), formData);
                
                // ============================
                // 4. SUCCESS
                // ============================
                alert('✅ Application submitted successfully!');
                form.reset();
                
                // Optional: Redirect to thank you page
                // window.location.href = 'thank-you.html';
                
            } catch (error) {
                console.error('Error submitting application:', error);
                alert('❌ Error submitting application. Please try again.\n\nError: ' + error.message);
            } finally {
                // Re-enable button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// ============================================
// CONTACT FORM SUBMISSION (if exists)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '⏳ Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = {
                    name: document.getElementById('contact_name')?.value || '',
                    email: document.getElementById('contact_email')?.value || '',
                    phone: document.getElementById('contact_phone')?.value || '',
                    message: document.getElementById('contact_message')?.value || '',
                    submitted_on: new Date().toISOString()
                };
                
                await addDoc(collection(db, 'contacts'), formData);
                
                alert('✅ Message sent successfully! We will get back to you soon.');
                contactForm.reset();
                
            } catch (error) {
                console.error('Error sending message:', error);
                alert('❌ Error sending message. Please try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// ============================================
// LOAD COURSES FROM FIRESTORE (optional)
// ============================================
async function loadCourses() {
    try {
        const coursesContainer = document.getElementById('coursesContainer');
        if (!coursesContainer) return;
        
        const q = query(collection(db, 'courses'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            coursesContainer.innerHTML = '<p>No courses available at the moment.</p>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach((doc) => {
            const course = doc.data();
            html += `
                <div class="course-card">
                    <h4>${course.title || 'Untitled Course'}</h4>
                    <p>${course.description || ''}</p>
                    <ul>
                        <li>Duration: ${course.duration || 'N/A'}</li>
                        <li>Fee: ${course.fee || 'N/A'}</li>
                    </ul>
                    <a href="course-detail.html?id=${doc.id}" class="btn btn-gold">Learn More</a>
                </div>
            `;
        });
        
        coursesContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading courses:', error);
        const container = document.getElementById('coursesContainer');
        if (container) {
            container.innerHTML = '<p>Error loading courses. Please refresh the page.</p>';
        }
    }
}

// ============================================
// LOAD OPPORTUNITIES FROM FIRESTORE (optional)
// ============================================
async function loadOpportunities() {
    try {
        const opportunitiesContainer = document.getElementById('opportunitiesContainer');
        if (!opportunitiesContainer) return;
        
        const q = query(collection(db, 'opportunities'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            opportunitiesContainer.innerHTML = '<p>No opportunities available at the moment.</p>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach((doc) => {
            const opp = doc.data();
            html += `
                <div class="opportunity-card">
                    <div class="icon-wrapper">
                        <i class="${opp.icon || 'fas fa-briefcase'}"></i>
                    </div>
                    <h3>${opp.title || 'Untitled'}</h3>
                    <p>${opp.description || ''}</p>
                    <a href="${opp.link || '#'}" class="btn btn-gold" style="margin-top: 12px;">Apply Now</a>
                </div>
            `;
        });
        
        opportunitiesContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading opportunities:', error);
        const container = document.getElementById('opportunitiesContainer');
        if (container) {
            container.innerHTML = '<p>Error loading opportunities. Please refresh the page.</p>';
        }
    }
}

// ============================================
// TESTIMONIALS SLIDER (if exists)
// ============================================
let testimonialIndex = 0;

function showTestimonial(index) {
    const slides = document.querySelectorAll('.testimonial-slide');
    if (!slides.length) return;
    
    if (index >= slides.length) testimonialIndex = 0;
    if (index < 0) testimonialIndex = slides.length - 1;
    
    slides.forEach((slide, i) => {
        slide.style.display = i === testimonialIndex ? 'block' : 'none';
    });
}

function nextTestimonial() {
    testimonialIndex++;
    showTestimonial(testimonialIndex);
}

function prevTestimonial() {
    testimonialIndex--;
    showTestimonial(testimonialIndex);
}

// Auto-play testimonials
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.testimonial-slide');
    if (slides.length) {
        showTestimonial(0);
        setInterval(nextTestimonial, 5000);
    }
});

// ============================================
// ADMIN LOGIN (if using Firebase Auth)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            
            if (!email || !password) {
                alert('Please enter both email and password.');
                return;
            }
            
            // For simple login without Firebase Auth
            // Check against environment variables or hardcoded credentials
            const adminEmail = 'admin@dhairithi.com';
            const adminPassword = 'admin123';
            
            if (email === adminEmail && password === adminPassword) {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin-dashboard.html';
            } else {
                alert('❌ Invalid email or password.');
            }
        });
    }
});

// ============================================
// CHECK ADMIN AUTH STATUS
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

// ============================================
// ADMIN LOGOUT
// ============================================
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

// Make functions globally accessible
window.toggleNav = toggleNav;
window.nextTestimonial = nextTestimonial;
window.prevTestimonial = prevTestimonial;
window.adminLogout = adminLogout;
window.isAdminLoggedIn = isAdminLoggedIn;
window.requireAdmin = requireAdmin;

// ============================================
// LOAD DATA ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Load courses if container exists
    if (document.getElementById('coursesContainer')) {
        loadCourses();
    }
    
    // Load opportunities if container exists
    if (document.getElementById('opportunitiesContainer')) {
        loadOpportunities();
    }
    
    // Check admin auth on dashboard page
    if (document.getElementById('applicationsBody')) {
        requireAdmin();
    }
});

// ============================================
// EXPORT FUNCTIONS FOR USE IN OTHER FILES
// ============================================
export {
    loadCourses,
    loadOpportunities,
    isAdminLoggedIn,
    requireAdmin,
    adminLogout
};
