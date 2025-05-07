let body = document.querySelector('body')
let footer = document.getElementById('footer-container');
let footerHeight = getComputedStyle(body).getPropertyValue('--footer-height');
let footerMenuIcon = document.getElementById('footer-menu-icon');
let footerMenu = document.getElementById('footer-menu');
let footerMenuIsVisible = false;
let footerHidingTimeoutId;
let footerHideTimeout = 500;
let footerHasRevealed = true;


function hideFooter() {
    if (footerHasRevealed) {
      footerHasRevealed = false;
      footer.style.transition = 'bottom 250ms ease-in-out, background-color 250ms ease-in-out';
      footer.style.bottom = "-" + footerHeight;
      hideFooterMenu();
      setFooterFeather();
    }
}

function showFooter() {
  if (!footerHasRevealed) {
    footerHasRevealed = true;
    footer.style.transition = 'bottom 250ms ease-in-out, background-color 250ms ease-in-out';
    footer.style.bottom = '0px';
    footer.style.position = 'fixed';

    clearTimeout(footerHidingTimeoutId);
    footerHidingTimeoutId = setTimeout(() => {
      hideFooter();
    }, headerHideTimeout);
  }
}

footer.addEventListener('mouseover', () => {
  clearTimeout(footerHidingTimeoutId);
});
footer.addEventListener('mouseleave', () => {
  clearTimeout(footerHidingTimeoutId);
  footerHidingTimeoutId = setTimeout(() => {
    hideFooter();
  }, footerHideTimeout);
});

/* Footer Menu show/hide functions */
function hideFooterMenu() {
  footerMenuIcon.setAttribute('data-feather', 'menu');
  footerMenu.style.display = 'none';
  footerMenuIsVisible = false;
}

function showFooterMenu() {
  footerMenuIcon.setAttribute('data-feather', 'x');
  footerMenu.style.display = 'flex';
  footerMenuIsVisible = true;
}

function setupFooterMenuIcon() {
  footerMenuIcon.addEventListener('click', (e) => {
    if (footerMenuIsVisible) {
      hideFooterMenu();
    } else {
      showFooterMenu();
    }
    setFooterFeather();
  });
  footerMenu.addEventListener('mouseover', (e) => {
    clearTimeout(footerHidingTimeoutId);
  });
  footerMenu.addEventListener('mouseleave', (e) => {
    clearTimeout(footerHidingTimeoutId);
    footerHidingTimeoutId = setTimeout(() => {
      footer.style.transition = 'bottom 250ms ease-in-out, background-color 250ms ease-in-out';
      footer.style.bottom = "-" + footerHeight;
    }, footerHideTimeout);
  });
}

function setFooterFeather() {
  feather.replace();
  footerMenuIcon = document.getElementById('footer-menu-icon');
  setupFooterMenuIcon();
}

setFooterFeather();
