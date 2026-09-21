const root = document.documentElement;
const themeSwitch = document.querySelector('.theme-switch');

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
}

themeSwitch.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
});