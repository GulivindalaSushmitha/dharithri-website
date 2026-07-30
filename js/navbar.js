// =============================================
// NAVBAR.JS - Single Navbar for ALL Pages
// =============================================

// ===== NAVBAR HTML - UPDATED with correct tagline =====
const navbarHTML = `
<nav class="navbar">
    <div class="container nav-flex">
        <!-- LOGO - CLICKABLE TO HOME -->
        <a href="index.html" style="text-decoration:none; display:flex; align-items:center; gap:12px;">
            <div class="logo-area" style="display:flex; align-items:center; gap:12px;">
                <img src="assets/images/logo.png" alt="Dharithri Logo" style="height:55px; width:auto;" onerror="this.style.display='none'" />
                <div style="display:flex; flex-direction:column; line-height:1.1;">
                    <span style="font-weight:800; font-size:1.1rem; color:#0b2b4a; letter-spacing:0.5px;">DHARITHRI</span>
                    <span style="font-size:0.55rem; color:#4a5d74; font-weight:600; letter-spacing:0.3px;">MANPOWER TRAINING & SUPPLY PVT. LTD.</span>
                    <span style="font-size:0.5rem; color:#c49a2b; font-weight:700; letter-spacing:0.5px;">WE IMPROVE THE WORTH. WE SUPPLY THE WORTH.</span>
                </div>
            </div>
        </a>
        
        <div class="nav-links" id="navLinks">
            <a href="index.html" id="navHome">Home</a>
            <a href="about.html" id="navAbout">About</a>
            <a href="courses.html" id="navCourses">Courses</a>
            <a href="training.html" id="navTraining">Training</a>
            <a href="opportunities.html" id="navOpportunities">Opportunities</a>
            <a href="questionnaire.html" id="navQuestionnaire">Questionnaire</a>
            <a href="contact.html" id="navContact">Contact</a>
            <a href="apply.html" class="btn btn-gold" style="padding: 8px 22px;" id="navApply">Apply Now</a>
        </div>
        <div class="hamburger" onclick="toggleNav()"><i class="fas fa-bars"></i></div>
    </div>
</nav>

<!-- TAGLINE BANNER - UPDATED with correct tagline -->
<div style="background:#0b2b4a; color:white; text-align:center; padding:8px 0; font-weight:600; letter-spacing:1px; font-size:0.85rem;">
    <i class="fas fa-quote-left" style="color:#c49a2b; margin-right:8px;"></i>
    WE IMPROVE THE WORTH. WE SUPPLY THE WORTH.
    <i class="fas fa-quote-right" style="color:#c49a2b; margin-left:8px;"></i>
</div>
`;

// ===== FOOTER HTML - UPDATED with correct tagline =====
const footerHTML = `
<footer style="background:#061c2f; color:white; padding:40px 0; margin-top:40px;">
    <div class="container" style="text-align:center;">
        <div style="max-width:800px; margin:0 auto;">
            <h4 style="color:white; font-size:1.2rem; margin-bottom:8px;">Dharithri Manpower Training & Supply Pvt. Ltd.</h4>
            <p style="color:#c49a2b; font-weight:600; font-size:1.1rem; margin:8px 0;">
                <i class="fas fa-quote-left" style="color:#c49a2b; margin-right:8px;"></i>
                WE IMPROVE THE WORTH. WE SUPPLY THE WORTH.
                <i class="fas fa-quote-right" style="color:#c49a2b; margin-left:8px;"></i>
            </p>
            <p style="color:#7a94ae; margin-top:4px; font-size:0.95rem;">
                Building Worth. Inspiring Generations.
            </p>
            <div style="margin-top:16px; display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                <a href="#" style="color:#7a94ae; font-size:1.4rem; transition:0.3s; display:inline-block;" 
                   onmouseover="this.style.color='#1877f2'" onmouseout="this.style.color='#7a94ae'">
                    <i class="fab fa-facebook"></i>
                </a>
                <a href="#" style="color:#7a94ae; font-size:1.4rem; transition:0.3s; display:inline-block;" 
                   onmouseover="this.style.color='#E4405F'" onmouseout="this.style.color='#7a94ae'">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="#" style="color:#7a94ae; font-size:1.4rem; transition:0.3s; display:inline-block;" 
                   onmouseover="this.style.color='#0A66C2'" onmouseout="this.style.color='#7a94ae'">
                    <i class="fab fa-linkedin"></i>
                </a>
                <a href="#" style="color:#7a94ae; font-size:1.4rem; transition:0.3s; display:inline-block;" 
                   onmouseover="this.style.color='#FF0000'" onmouseout="this.style.color='#7a94ae'">
                    <i class="fab fa-youtube"></i>
                </a>
                <a href="#" style="color:#7a94ae; font-size:1.4rem; transition:0.3s; display:inline-block;" 
                   onmouseover="this.style.color='#25D366'" onmouseout="this.style.color='#7a94ae'">
                    <i class="fab fa-whatsapp"></i>
                </a>
            </div>
            <p style="color:#5a6d84; margin-top:16px; font-size:0.8rem;">
                © 2026 Dharithri. All rights reserved.
            </p>
        </div>
    </div>
</footer>
`;

// ===== FUNCTION TO INJECT NAVBAR =====
function loadNavbar() {
    // Remove existing navbar if any (to prevent duplicates)
    const existingNavbar = document.querySelector('.navbar');
    if (existingNavbar) {
        existingNavbar.remove();
    }
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
}

// ===== FUNCTION TO INJECT FOOTER =====
function loadFooter() {
    // Remove existing footer if any (to prevent duplicates)
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
        existingFooter.remove();
    }
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// ===== FUNCTION TO HIGHLIGHT ACTIVE PAGE =====
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const pageMap = {
        'index.html': 'navHome',
        'about.html': 'navAbout',
        'courses.html': 'navCourses',
        'training.html': 'navTraining',
        'opportunities.html': 'navOpportunities',
        'questionnaire.html': 'navQuestionnaire',
        'contact.html': 'navContact',
        'apply.html': 'navApply'
    };
    
    const navId = pageMap[currentPage];
    if (navId) {
        const link = document.getElementById(navId);
        if (link) {
            // Remove active class from all links
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            // Add active class to current page
            link.classList.add('active');
        }
    }
}

// ===== FUNCTION TO TOGGLE NAV (Mobile) =====
function toggleNav() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('show');
}

// ===== CLOSE NAV ON LINK CLICK (Mobile) =====
document.addEventListener('click', function(e) {
    if (e.target.closest('.nav-links a')) {
        const nav = document.getElementById('navLinks');
        if (nav && window.innerWidth <= 768) {
            nav.classList.remove('show');
        }
    }
});

// ===== LOAD EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    loadNavbar();
    loadFooter();
    highlightActivePage();
});
