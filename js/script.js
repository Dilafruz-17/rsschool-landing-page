// ---------- Theme ----------
const root = document.documentElement;
const themeSwitch = document.querySelector('.theme-switch');

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
}

if (themeSwitch) {
    themeSwitch.addEventListener('click', () => {
        const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
    });
}

// ---------- Burger menu ----------
const burger = document.querySelector('.burger');
const headerNav = document.querySelector('.header__nav');

function closeMenu() {
    if (!burger || !headerNav) return;
    headerNav.classList.remove('header__nav--open');
    burger.classList.remove('burger--active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
}

function openMenu() {
    if (!burger || !headerNav) return;
    headerNav.classList.add('header__nav--open');
    burger.classList.add('burger--active');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
}

if (burger && headerNav) {
    burger.addEventListener('click', () => {
        headerNav.classList.contains('header__nav--open') ? closeMenu() : openMenu();
    });

    headerNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
}

// ---------- Product data (used for modal sizes/additives/price + slider) ----------
let products = [];

async function loadProducts() {
    try {
        const response = await fetch('assets/data/products.json');
        products = await response.json();
    } catch (error) {
        console.error('Failed to load products:', error);
        products = [];
    }
}

function getImagePath(product, categoryIndex) {
    return `assets/images/${product.category}-${categoryIndex}.png`;
}

function calcPrice(product, sizeKey, additiveNames) {
    let total = Number(product.price) + Number(product.sizes[sizeKey]['add-price']);
    additiveNames.forEach((additiveName) => {
        const additive = product.additives.find((a) => a.name === additiveName);
        if (additive) total += Number(additive['add-price']);
    });
    return total.toFixed(2);
}

// ---------- Catalog (menu.html) — works with EXISTING static cards ----------
function initCatalog() {
    const grids = document.querySelectorAll('.catalog__grid');
    if (!grids.length) return;

    const categoryButtons = document.querySelectorAll('.catalog__category-btn');
    const loadMoreBtn = document.querySelector('.catalog__more');
    const initialCount = 4;
    let activeCategory = 'coffee';

    function applyCollapse(grid) {
        const isMobile = window.innerWidth <= 768;
        const cards = [...grid.children];
        cards.forEach((card, i) => {
            const shouldHide = isMobile && i >= initialCount && grid.classList.contains('is-collapsed');
            card.style.display = shouldHide ? 'none' : '';
        });
        const hasHidden = isMobile && cards.length > initialCount && grid.classList.contains('is-collapsed');
        loadMoreBtn.hidden = !hasHidden;
    }

    function showCategory(category) {
        grids.forEach((grid) => {
            grid.hidden = grid.dataset.category !== category;
        });
        const grid = document.querySelector(`.catalog__grid[data-category="${category}"]`);
        grid.classList.add('is-collapsed');
        applyCollapse(grid);
    }

    showCategory(activeCategory);

    categoryButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach((b) => {
                b.classList.remove('catalog__category-btn--active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('catalog__category-btn--active');
            btn.setAttribute('aria-pressed', 'true');

            activeCategory = btn.dataset.category;
            showCategory(activeCategory);
        });
    });

    loadMoreBtn.addEventListener('click', () => {
        const grid = document.querySelector(`.catalog__grid[data-category="${activeCategory}"]`);
        grid.classList.remove('is-collapsed');
        applyCollapse(grid);
    });

    window.addEventListener('resize', () => {
        const grid = document.querySelector(`.catalog__grid[data-category="${activeCategory}"]`);
        applyCollapse(grid);
    });

    grids.forEach((grid) => {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.catalog__card');
            if (!card) return;
            const name = card.querySelector('.catalog__card-name').textContent;
            const imgSrc = card.querySelector('img').src;
            openModalByName(name, imgSrc);
        });
    });
}

// ---------- Slider (index.html) ----------
function initSlider() {
    const track = document.querySelector('.slider__track');
    if (!track) return;

    const dotsWrap = document.querySelector('.slider__dots');
    const prevBtn = document.querySelector('.slider__btn--prev');
    const nextBtn = document.querySelector('.slider__btn--next');
    const items = products.filter((p) => p.category === 'coffee').slice(0, 4);
    let current = 0;

    items.forEach((product, i) => {
        const slide = document.createElement('article');
        slide.className = 'slider__slide';
        slide.innerHTML = `
            <img src="${getImagePath(product, i + 1)}" alt="${product.name}" width="300" height="300">
            <h3 class="slider__name">${product.name}</h3>
            <p class="slider__text">${product.description}</p>
            <p class="slider__price">$${product.price}</p>`;
        track.appendChild(slide);

        const dot = document.createElement('span');
        dot.className = 'slider__dot';
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    function update() {
        track.style.transform = `translateX(-${current * 100}%)`;
        [...dotsWrap.children].forEach((dot, i) => {
            dot.classList.toggle('slider__dot--active', i === current);
        });
    }

    function goTo(index) {
        current = (index + items.length) % items.length;
        update();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    update();
}

// ---------- Modal ----------
const modal = document.querySelector('.modal');

function openModalByName(name, imgSrc) {
    const product = products.find((p) => p.name === name);
    if (!product || !modal) return;

    let selectedSize = 's';
    let selectedAdditives = [];

    const img = modal.querySelector('.modal__image');
    const nameEl = modal.querySelector('.modal__name');
    const desc = modal.querySelector('.modal__description');
    const price = modal.querySelector('.modal__price');
    const sizesWrap = modal.querySelector('.modal__sizes');
    const additivesWrap = modal.querySelector('.modal__additives');

    img.src = imgSrc;
    img.alt = product.name;
    nameEl.textContent = product.name;
    desc.textContent = product.description;

    function updatePrice() {
        price.textContent = `$${calcPrice(product, selectedSize, selectedAdditives)}`;
    }

    sizesWrap.innerHTML = '';
    Object.entries(product.sizes).forEach(([key, value]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'modal__option';
        btn.textContent = value.size;
        if (key === selectedSize) btn.classList.add('modal__option--active');
        btn.addEventListener('click', () => {
            selectedSize = key;
            [...sizesWrap.children].forEach((b) => b.classList.remove('modal__option--active'));
            btn.classList.add('modal__option--active');
            updatePrice();
        });
        sizesWrap.appendChild(btn);
    });

    additivesWrap.innerHTML = '';
    product.additives.forEach((additive) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'modal__option';
        btn.textContent = additive.name;
        btn.addEventListener('click', () => {
            btn.classList.toggle('modal__option--active');
            selectedAdditives = [...additivesWrap.querySelectorAll('.modal__option--active')].map((b) => b.textContent);
            updatePrice();
        });
        additivesWrap.appendChild(btn);
    });

    updatePrice();
    modal.hidden = false;
    document.body.classList.add('no-scroll');
}

function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
}

if (modal) {
    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
}

// ---------- Init ----------
loadProducts().then(() => {
    initCatalog();
    initSlider();
});