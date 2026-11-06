// Базовые машины (если localStorage пуст)
const initialCars = [
  {
    id: 1,
    title: 'Porsche 911 GT3',
    price: 18500000,
    year: 2022,
    mileage: 12000,
    body: 'Купе',
    fuel: 'Бензин',
    city: 'Москва',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Tesla Model S Plaid',
    price: 12400000,
    year: 2023,
    mileage: 5000,
    body: 'Седан',
    fuel: 'Электро',
    city: 'Санкт-Петербург',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'BMW X5 M Competition',
    price: 14200000,
    year: 2021,
    mileage: 34000,
    body: 'Внедорожник',
    fuel: 'Бензин',
    city: 'Казань',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'Audi RS6 Avant',
    price: 15800000,
    year: 2022,
    mileage: 19000,
    body: 'Хэтчбек',
    fuel: 'Гибрид',
    city: 'Москва',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80'
  }
];

// Состояние приложения (с использованием localStorage)
let cars = JSON.parse(localStorage.getItem('dm_cars')) || initialCars;
let users = JSON.parse(localStorage.getItem('dm_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('dm_current_user')) || null;
let favorites = JSON.parse(localStorage.getItem('dm_favorites')) || [];

// DOM Элементы
const carGrid = document.getElementById('carGrid');
const searchInput = document.getElementById('searchInput');
const bodyFilter = document.getElementById('bodyFilter');
const fuelFilter = document.getElementById('fuelFilter');
const sortSelect = document.getElementById('sortSelect');
const favCountEl = document.getElementById('favCount');
const addCarForm = document.getElementById('addCarForm');

// Модалки
const carModal = document.getElementById('carModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

const authModal = document.getElementById('authModal');
const openAuthBtn = document.getElementById('openAuthBtn');
const closeAuthModal = document.getElementById('closeAuthModal');
const authHeaderBlock = document.getElementById('authHeaderBlock');

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Вспомогательное сохранение данных
function saveState() {
  localStorage.setItem('dm_cars', JSON.stringify(cars));
  localStorage.setItem('dm_users', JSON.stringify(users));
  localStorage.setItem('dm_current_user', JSON.stringify(currentUser));
  localStorage.setItem('dm_favorites', JSON.stringify(favorites));
}

// Рендер авторизационного блока в шапке
function renderAuthHeader() {
  if (currentUser) {
    authHeaderBlock.innerHTML = `
      <div class="user-badge">
        <i class="fa-solid fa-user-check"></i>
        <span>${currentUser.name}</span>
        <button class="logout-btn" id="logoutBtn" title="Выйти">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  } else {
    authHeaderBlock.innerHTML = `
      <button class="auth-btn" id="openAuthBtn">
        <i class="fa-solid fa-user"></i> Войти
      </button>
    `;
    document.getElementById('openAuthBtn').addEventListener('click', () => {
      authModal.style.display = 'flex';
    });
  }
}

// Отображение списка машин
function renderCars(carsToRender) {
  carGrid.innerHTML = '';
  
  if (carsToRender.length === 0) {
    carGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 18px; padding: 40px 0;">Ничего не найдено</p>';
    return;
  }

  carsToRender.forEach(car => {
    const isFav = favorites.includes(car.id);
    const card = document.createElement('div');
    card.className = 'car-card';
    card.innerHTML = `
      <img src="${car.image}" alt="${car.title}" class="car-img" onerror="this.src='https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'">
      <div class="like-icon ${isFav ? 'active' : ''}" onclick="toggleFavorite(${car.id})">
        <i class="fa-solid fa-heart"></i>
      </div>
      <div class="car-details">
        <h3 class="car-title">${car.title}</h3>
        <div class="car-price">${car.price.toLocaleString('ru-RU')} ₽</div>
        <div class="car-specs">
          <span><i class="fa-regular fa-calendar"></i> ${car.year}</span>
          <span><i class="fa-solid fa-gauge"></i> ${car.mileage.toLocaleString()} км</span>
          <span><i class="fa-solid fa-gas-pump"></i> ${car.fuel}</span>
        </div>
        <button class="card-btn" onclick="openDetails(${car.id})">Подробнее</button>
      </div>
    `;
    carGrid.appendChild(card);
  });
}

// Фильтрация и сортировка
function filterAndSortCars() {
  let result = [...cars];

  const query = searchInput.value.toLowerCase().trim();
  if (query) {
    result = result.filter(car => 
      car.title.toLowerCase().includes(query) || 
      car.city.toLowerCase().includes(query)
    );
  }

  if (bodyFilter.value !== 'all') {
    result = result.filter(car => car.body === bodyFilter.value);
  }

  if (fuelFilter.value !== 'all') {
    result = result.filter(car => car.fuel === fuelFilter.value);
  }

  if (sortSelect.value === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortSelect.value === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sortSelect.value === 'year-desc') {
    result.sort((a, b) => b.year - a.year);
  }

  renderCars(result);
}

// Добавление в Избранное
window.toggleFavorite = function(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
  } else {
    favorites.push(id);
  }
  favCountEl.textContent = favorites.length;
  saveState();
  filterAndSortCars();
};

// Открытие модального окна авто
window.openDetails = function(id) {
  const car = cars.find(c => c.id === id);
  if (!car) return;

  modalBody.innerHTML = `
    <h2>${car.title}</h2>
    <img src="${car.image}" style="width: 100%; height: 260px; object-fit: cover; border-radius: 8px; margin: 15px 0;" onerror="this.src='https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'">
    <p style="font-size: 20px; color: var(--accent-color); font-weight: bold; margin-bottom: 10px;">
      ${car.price.toLocaleString('ru-RU')} ₽
    </p>
    <p><strong>Год выпуска:</strong> ${car.year}</p>
    <p><strong>Пробег:</strong> ${car.mileage.toLocaleString()} км</p>
    <p><strong>Тип кузова:</strong> ${car.body}</p>
    <p><strong>Двигатель:</strong> ${car.fuel}</p>
    <p><strong>Город:</strong> ${car.city}</p>
    <button class="cta-btn" style="width: 100%; margin-top: 20px;" onclick="contactSeller()">
      Связаться с продавцом
    </button>
  `;
  carModal.style.display = 'flex';
};

window.contactSeller = function() {
  if (!currentUser) {
    alert('Пожалуйста, войдите в аккаунт, чтобы написать продавцу!');
    carModal.style.display = 'none';
    authModal.style.display = 'flex';
  } else {
    alert(`Спасибо, ${currentUser.name}! Ваша заявка отправлена продавцу.`);
  }
};

// --- Логика авторизации ---

// Переключение вкладок Вход / Регистрация
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
});

// Обработка регистрации
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value.trim();

  if (users.some(u => u.email === email)) {
    alert('Пользователь с таким Email уже зарегистрирован!');
    return;
  }

  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  currentUser = newUser;
  saveState();

  renderAuthHeader();
  authModal.style.display = 'none';
  registerForm.reset();
  alert(`Добро пожаловать, ${name}! Аккаунт успешно создан.`);
});

// Обработка входа
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('Неверный Email или пароль!');
    return;
  }

  currentUser = user;
  saveState();

  renderAuthHeader();
  authModal.style.display = 'none';
  loginForm.reset();
  alert(`С возвращением, ${user.name}!`);
});

// Выход из системы
function handleLogout() {
  currentUser = null;
  saveState();
  renderAuthHeader();
  alert('Вы вышли из аккаунта.');
}

// Добавление автомобиля
addCarForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert('Для публикации объявлений нужно войти в аккаунт!');
    authModal.style.display = 'flex';
    return;
  }

  const newCar = {
    id: Date.now(),
    title: document.getElementById('carTitle').value.trim(),
    price: Number(document.getElementById('carPrice').value),
    year: Number(document.getElementById('carYear').value),
    mileage: Number(document.getElementById('carMileage').value),
    body: document.getElementById('carBody').value,
    fuel: document.getElementById('carFuel').value,
    city: document.getElementById('carCity').value.trim(),
    image: document.getElementById('carImage').value.trim(),
    authorId: currentUser.id
  };

  cars.unshift(newCar);
  saveState();
  
  filterAndSortCars();
  addCarForm.reset();

  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
  alert('Объявление успешно опубликовано!');
});

// Закрытие модалок
closeModal.onclick = () => carModal.style.display = 'none';
closeAuthModal.onclick = () => authModal.style.display = 'none';

window.onclick = (e) => {
  if (e.target === carModal) carModal.style.display = 'none';
  if (e.target === authModal) authModal.style.display = 'none';
};

// Слушатели событий фильтров
searchInput.addEventListener('input', filterAndSortCars);
bodyFilter.addEventListener('change', filterAndSortCars);
fuelFilter.addEventListener('change', filterAndSortCars);
sortSelect.addEventListener('change', filterAndSortCars);

// Первичная инициализация
favCountEl.textContent = favorites.length;
renderAuthHeader();
filterAndSortCars();