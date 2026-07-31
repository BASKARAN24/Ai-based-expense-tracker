document.addEventListener('DOMContentLoaded', () => {
  Auth.redirectIfLoggedIn();

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) initLoginForm(loginForm);
  if (registerForm) initRegisterForm(registerForm);
});

function setBanner(el, message, type) {
  el.textContent = message;
  el.className = `banner show banner-${type}`;
}

function setLoading(button, loading, labelWhileLoading) {
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = labelWhileLoading;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function initLoginForm(form) {
  const banner = document.getElementById('auth-banner');
  const button = document.getElementById('login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    banner.classList.remove('show');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    setLoading(button, true, 'Signing in…');
    try {
      const res = await Api.login({ email, password });
      Auth.setSession(res.token, { fullName: res.fullName, email: res.email });
      window.location.href = '/dashboard.html';
    } catch (err) {
      setBanner(banner, err.message, 'error');
    } finally {
      setLoading(button, false);
    }
  });
}

function initRegisterForm(form) {
  const banner = document.getElementById('auth-banner');
  const button = document.getElementById('register-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    banner.classList.remove('show');

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const monthlyIncomeRaw = document.getElementById('monthlyIncome').value;

    if (password !== confirmPassword) {
      setBanner(banner, 'Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      setBanner(banner, 'Password must be at least 6 characters', 'error');
      return;
    }

    const payload = {
      fullName, email, password,
      monthlyIncome: monthlyIncomeRaw ? Number(monthlyIncomeRaw) : null
    };

    setLoading(button, true, 'Creating account…');
    try {
      const res = await Api.register(payload);
      Auth.setSession(res.token, { fullName: res.fullName, email: res.email });
      window.location.href = '/dashboard.html';
    } catch (err) {
      setBanner(banner, err.message, 'error');
    } finally {
      setLoading(button, false);
    }
  });
}

