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

const categoryButtons = document.querySelectorAll('.catalog__category-btn');
const catalogGrids = document.querySelectorAll('.catalog__grid');
const loadMoreBtn = document.querySelector('.catalog__more');

if (categoryButtons.length && loadMoreBtn) {
    const updateLoadMore = (grid) => {
        loadMoreBtn.hidden = grid.children.length <= 4 || !grid.classList.contains('is-collapsed');
    };

    categoryButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach((b) => {
                b.classList.remove('catalog__category-btn--active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('catalog__category-btn--active');
            btn.setAttribute('aria-pressed', 'true');

            catalogGrids.forEach((grid) => {
                grid.hidden = grid.dataset.category !== btn.dataset.category;
            });

            const activeGrid = document.querySelector('.catalog__grid:not([hidden])');
            if (activeGrid.children.length > 4) {
                activeGrid.classList.add('is-collapsed');
            }
            updateLoadMore(activeGrid);
        });
    });

    loadMoreBtn.addEventListener('click', () => {
        const activeGrid = document.querySelector('.catalog__grid:not([hidden])');
        activeGrid.classList.remove('is-collapsed');
        loadMoreBtn.hidden = true;
    });

    updateLoadMore(document.querySelector('.catalog__grid:not([hidden])'));
}