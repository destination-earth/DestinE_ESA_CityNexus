/* get css variables */
let backgroundColor = getComputedStyle(body).getPropertyValue('--desp-background-color');
let backgroundColorTransparent = getComputedStyle(body).getPropertyValue('--desp-background-color-transparent');

/* set variables */
let mainContainer = document.getElementById('main-container');
let header = document.getElementById('desp-header-container');
let headerInfoButton = document.getElementById('info-button');
let headerUserButton = document.getElementById('login-div');
let headerInfoFrame = document.getElementById('info-frame');
let headerUserFrame = document.getElementById('user-frame');
let headerInfoMenuIsVisible = false;
let headerUserMenuIsVisible = false;
let headerHeight = getComputedStyle(body).getPropertyValue('--header-height');
let headerHasRevealed = false;
let headerHidingTimeoutId;
let headerHideTimeout = 500;
let dropdownMenuContainer = document.getElementById('dropdown-menu-container');
let menuIcon = document.getElementById('menu-icon');
let dropdownIsVisible = false;
let headerHoverHeight = 10;
let footerHoverHeight = 10;

/* TO DEVS: Boolean that has to be set on user login/logout -> see onUserAuthenticationChange() example code*/
let userIsAuthenticated = true;

function hideHeader() {
    if (headerHasRevealed) {
      headerHasRevealed = false;
      header.style.transition = 'top 250ms ease-in-out, background-color 250ms ease-in-out';
      header.style.top = "-" + headerHeight;
      hideHeaderUserMenu();
      hideHeaderInfoMenu();
    }
}

function showHeader() {
  if (!headerHasRevealed) {
    headerHasRevealed = true;
    header.style.transition = 'top 250ms ease-in-out, background-color 250ms ease-in-out';
    header.style.top = '0px';
    header.style.position = 'fixed';

    clearTimeout(headerHidingTimeoutId);
    headerHidingTimeoutId = setTimeout(() => {
      hideHeader();
    }, headerHideTimeout);
  }
}

header.addEventListener('mouseover', () => {
  clearTimeout(headerHidingTimeoutId);
});
header.addEventListener('mouseleave', () => {
  clearTimeout(headerHidingTimeoutId);
  headerHidingTimeoutId = setTimeout(() => {
    hideHeader();
  }, headerHideTimeout);
});

function onUserAuthenticationChange() {
  let loggedElements = document.getElementsByClassName('logged');
  let notLoggedElements = document.getElementsByClassName('not-logged');
  if (userIsAuthenticated) {
    [].forEach.call(loggedElements, (el) => {
      el.style.display = 'flex';
    });
    [].forEach.call(notLoggedElements, (el) => {
      el.style.display = 'none';
    });
  } else {
    [].forEach.call(loggedElements, (el) => {
      el.style.display = 'none';
    });
    [].forEach.call(notLoggedElements, (el) => {
      el.style.display = 'flex';
    });
  }
}
onUserAuthenticationChange();


/* Header info/user menu show/hide functions */
function showHeaderInfoMenu() {
  headerInfoFrame.style.display = 'flex';
  headerInfoFrame.style.opacity = '1.0';
  headerInfoMenuIsVisible = true;
}
function hideHeaderInfoMenu() {
  headerInfoFrame.style.display = 'none';
  headerInfoFrame.style.opacity = '0.0';
  headerInfoMenuIsVisible = false;
}
function showHeaderUserMenu() {
  headerUserFrame.style.display = 'flex';
  headerUserFrame.style.opacity = '1.0';
  headerUserMenuIsVisible = true;
}
function hideHeaderUserMenu() {
  headerUserFrame.style.display = 'none';
  headerUserFrame.style.opacity = '0.0';
  headerUserMenuIsVisible = false;
}
let events = ['click'];
events.forEach(event => {
  headerInfoButton.addEventListener(event, () => {
    if (headerInfoMenuIsVisible) {
      hideHeaderInfoMenu();
    } else {
      showHeaderInfoMenu();
      hideHeaderUserMenu();
    }
  });
  
  headerUserButton.addEventListener(event, () => {
    if (headerUserMenuIsVisible) {
      hideHeaderUserMenu();
    } else {
      if (userIsAuthenticated) {
        showHeaderUserMenu();
        hideHeaderInfoMenu();
      }
    }
  });
});


/* Header mobile dropdown menu show/hide functions */
function hideDropdownMenu() {
  dropdownMenuContainer.style.display = 'none';
  dropdownIsVisible = false;
}

function setupHeaderMenuIcon() {
  menuIcon.addEventListener('click', (e) => {
    clearTimeout(headerHidingTimeoutId);
    if (dropdownIsVisible) {
      menuIcon.setAttribute('data-feather', 'menu');
      hideDropdownMenu();
      mainContainer.style.display = 'block';
      footer.style.display = 'flex';
    } else {
      menuIcon.setAttribute('data-feather', 'x');
      mainContainer.style.display = 'none';
      footer.style.display = 'none';
      header.style.backgroundColor = backgroundColor;
      dropdownMenuContainer.style.display = 'flex';
      dropdownIsVisible = true;
    }
    setHeaderFeather();
  });
}

function setHeaderFeather() {
  feather.replace();
  menuIcon = document.getElementById('menu-icon');
  setupHeaderMenuIcon();
}

setHeaderFeather();

// This hack is the only way I found to trigger the mouseleave event for both header and footer when we first load the page
// Without it, the first mouseleave event is only received by the header and is cancelled afterwards
// With this we simulate the mouseleave event that should reach the footer on boot
// It also makes sure we initialise the header and footer correctly (without the dropdown menus being in a weird state
// of not being visible but being clickable)
document.addEventListener('DOMContentLoaded', (event) => {
  showHeader();
  showFooter();

  header.dispatchEvent(new Event('mouseleave', {
    bubbles: true,
    cancelable: true,
  }));

  footer.dispatchEvent(new Event('mouseleave', {
    bubbles: true,
    cancelable: true,
  }));

  let currentLinks = document.querySelectorAll('a[href="'+document.URL+'"]');
  currentLinks.forEach(link => link.classList.add('current-link'));
});

// we need onmousemove to handle both footer and header, as having multiple onmousemove listeners on the same
// component is not supported
document.onmousemove = (e) => {
  if (e.y > window.innerHeight - footerHoverHeight) {
    showFooter();
  } else if (e.y < headerHoverHeight) {
    showHeader();
  }
}
