<script>
// --- UTILIDADES DE USUARIOS (localStorage) ---
const USERS_KEY = 'animeflx_users';
const CURRENT_KEY = 'animeflx_current';

// obtener todos los usuarios (objeto: username -> userObject)
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function setCurrentUser(username) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(username));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
}
function logoutCurrentUser() {
  localStorage.removeItem(CURRENT_KEY);
}

// crear nuevo usuario (simple - prototipo)
function registerUser({ username, email, password }) {
  const users = getUsers();
  if (users[username]) {
    throw new Error('El usuario ya existe');
  }
  // ¡ADVERTENCIA! Aquí la contraseña se guarda en claro en localStorage (prototipo).
  // Para producción: usa hashing + servidor.
  users[username] = {
    username,
    email,
    password,
    likes: [],
    myList: [],
    history: []
  };
  saveUsers(users);
  setCurrentUser(username);
  return users[username];
}

// login (verifica username + password)
function loginUser({ username, password }) {
  const users = getUsers();
  const user = users[username];
  if (!user) throw new Error('Usuario no encontrado');
  if (user.password !== password) throw new Error('Contraseña incorrecta');
  setCurrentUser(username);
  return user;
}

// obtener objeto user actual (o null)
function getCurrentUserObject() {
  const username = getCurrentUser();
  if (!username) return null;
  const users = getUsers();
  return users[username] || null;
}

// actualizar datos del usuario actual y persistir
function updateCurrentUserObject(newObj) {
  const username = getCurrentUser();
  if (!username) return;
  const users = getUsers();
  users[username] = { ...users[username], ...newObj };
  saveUsers(users);
}

// helper: require login y redirigir al modal si no
function requireLogin(redirectTo) {
  const user = getCurrentUserObject();
  if (!user) {
    openAuthModal();
    return false;
  }
  if (redirectTo) window.location.href = redirectTo;
  return true;
}

// --- UI / Modal Auth ---
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const switchToRegisterBtn = document.getElementById('switch-to-register');
const authSubmit = document.getElementById('auth-submit');
const closeAuth = document.querySelector('.close-auth');
const profileBtn = document.getElementById('profile-btn');
const profileNameSpan = document.getElementById('profile-name');

let isRegister = false;

function openAuthModal() {
  isRegister = false;
  authTitle.innerText = 'Iniciar sesión';
  authSubmit.innerText = 'Entrar';
  document.getElementById('auth-password').value = '';
  authModal.style.display = 'flex';
}
function closeAuthModal() {
  authModal.style.display = 'none';
}
switchToRegisterBtn.addEventListener('click', () => {
  isRegister = !isRegister;
  if (isRegister) {
    authTitle.innerText = 'Registro';
    authSubmit.innerText = 'Registrarse';
  } else {
    authTitle.innerText = 'Iniciar sesión';
    authSubmit.innerText = 'Entrar';
  }
});
closeAuth.addEventListener('click', closeAuthModal);
window.addEventListener('click', (e) => { if (e.target === authModal) closeAuthModal(); });

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  try {
    if (isRegister) {
      registerUser({ username, email, password });
      alert('Registro exitoso. Bienvenido ' + username);
    } else {
      loginUser({ username, password });
      alert('Sesión iniciada: ' + username);
    }
    closeAuthModal();
    refreshProfileUI();
  } catch (err) {
    alert(err.message);
  }
});

// perfil / botón: si hay user -> ir a profile.html; si no -> abrir modal
profileBtn.addEventListener('click', () => {
  const current = getCurrentUser();
  if (!current) {
    openAuthModal();
  } else {
    window.location.href = 'profile.html';
  }
});

// muestra nombre del usuario en el header si está logueado
function refreshProfileUI() {
  const user = getCurrentUserObject();
  if (user) {
    profileNameSpan.style.display = 'inline';
    profileNameSpan.textContent = user.username;
    // opcional: cambia icono o estilo
    profileBtn.title = 'Ver perfil';
  } else {
    profileNameSpan.style.display = 'none';
    profileBtn.title = 'Iniciar sesión / Registrarse';
  }
}

// inicializar en la carga
refreshProfileUI();
</script>
