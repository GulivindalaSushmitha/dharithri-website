// ===== NAVBAR TOGGLE =====
function toggleNav() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('show');
}

// ===== CLOSE NAV ON LINK CLICK (mobile) =====
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('navLinks');
            if (nav && window.innerWidth <= 768) nav.classList.remove('show');
        });
    });
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        }
    });
});