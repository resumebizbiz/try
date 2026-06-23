// ================================================
// RM35 ADVANCED PORTFOLIO — INTERACTIVITY
// Tab-style navigation: only one panel is visible at a
// time, switched by clicking a sidebar nav link.
// ================================================

// ---- THEME TOGGLE ----
const themeBtn = document.getElementById('themeBtn');
const htmlEl = document.documentElement;

themeBtn.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  htmlEl.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
});

// ---- MOBILE SIDEBAR TOGGLE ----
const sidebar = document.getElementById('sidebar');
const mobileNavToggle = document.getElementById('mobileNavToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

function openMobileSidebar() {
  sidebar.classList.add('open');
  sidebarBackdrop.classList.add('is-visible');
}

function closeMobileSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('is-visible');
}

mobileNavToggle.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) {
    closeMobileSidebar();
  } else {
    openMobileSidebar();
  }
});

// Clicking the dimmed backdrop closes the sidebar, same as tapping outside it.
sidebarBackdrop.addEventListener('click', closeMobileSidebar);

// ---- SECTION POSITION RAIL ----
// Maps each tab to a position 0-9 so the rail can light up
// "current and everything before it" as a sense of progress.
const tabOrder = [
  'hero', 'objective', 'education', 'skills', 'projects',
  'certifications', 'experience', 'achievements', 'leadership', 'references'
];
const railSegments = document.querySelectorAll('.rail-segment');

function updateRail(targetId) {
  const currentIndex = tabOrder.indexOf(targetId);
  railSegments.forEach((seg, i) => {
    seg.classList.remove('is-current', 'is-passed');
    if (currentIndex === -1) return; // resume-view isn't part of the rail sequence
    if (i < currentIndex) seg.classList.add('is-passed');
    if (i === currentIndex) seg.classList.add('is-current');
  });
}

// ---- TAB SWITCHING ----
// Every link with a data-section attribute (sidebar nav links + the
// "View Resume" button) switches which .panel has .is-active.
const allTabLinks = document.querySelectorAll('[data-section]');
const allPanels = document.querySelectorAll('.panel');
const navLinks = document.querySelectorAll('.nav-link');

function showPanel(targetId, updateUrl = true) {
  allPanels.forEach(panel => {
    panel.classList.toggle('is-active', panel.id === targetId);
  });

  updateRail(targetId);

  // Highlight the matching sidebar nav link, if there is one
  // (the "View Resume" button itself isn't part of .nav-link,
  // so resume-view won't highlight any sidebar item, which is fine).
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === targetId);
  });

  // Re-trigger the reveal animation for the newly active panel's
  // .reveal element, so switching tabs feels alive each time.
  const activePanel = document.getElementById(targetId);
  if (activePanel) {
    const revealEl = activePanel.querySelector('.reveal');
    if (revealEl) {
      revealEl.classList.remove('is-visible');
      // Re-add on next frame so the browser registers the removal first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => revealEl.classList.add('is-visible'));
      });
    }
    // Scroll the content area back to top on tab switch
    activePanel.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  // Close the mobile sidebar (and its backdrop) after a selection
  closeMobileSidebar();

  // Reflect the current tab in the URL (e.g. yoursite.com/#projects),
  // so the link is shareable/bookmarkable and works with browser back/forward.
  if (updateUrl) {
    history.pushState(null, '', '#' + targetId);
  }
}

allTabLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showPanel(link.dataset.section);
  });
});

// ---- DEEP LINKING ----
// All valid panel IDs, used to validate a URL hash before trusting it.
const validPanelIds = ['hero', 'resume-view', ...tabOrder.filter(id => id !== 'hero')];

function getPanelIdFromHash() {
  const hash = window.location.hash.replace('#', '');
  return validPanelIds.includes(hash) ? hash : 'hero';
}

// Support browser back/forward buttons moving between tabs.
window.addEventListener('popstate', () => {
  showPanel(getPanelIdFromHash(), false);
});

// ---- SCROLL REVEAL (progressive enhancement) ----
// Content is visible by default (see CSS). Adding 'js-ready' to <body>
// switches panels to fade-in mode once JS is confirmed running.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.body.classList.add('js-ready');
}

// On first load: open whichever tab the URL points to (e.g. #projects),
// or default to the hero/intro tab if the URL has no valid hash.
const initialPanelId = getPanelIdFromHash();
showPanel(initialPanelId, false);

requestAnimationFrame(() => {
  document.querySelectorAll('.panel.is-active .reveal').forEach(el => {
    el.classList.add('is-visible');
  });
});
