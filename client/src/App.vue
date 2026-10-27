<script setup>
import { useRouter } from 'vue-router';
import { user, clearAuth } from './Auth.js';

const router = useRouter();

async function logout() {
  clearAuth();
  await router.push('/login');
}
</script>

<template>
  <div class="app-wrapper">
    <header class="site-nav">
      <RouterLink to="/" class="brand">
        the daily<span class="brand-dot">.</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">
          Discover
        </RouterLink>

        <RouterLink
          v-if="user"
          to="/create"
          class="nav-link"
        >
          Write a story <span class="write-icon">↗</span>
        </RouterLink>

        <template v-if="!user">
          <RouterLink to="/login" class="nav-link">
            Log in
          </RouterLink>

          <RouterLink to="/register" class="btn-primary nav-cta">
            Join the community
          </RouterLink>
        </template>

        <template v-else>
          <RouterLink
            v-if="user.role?.toLowerCase() === 'admin' || user.isAdmin === true"
            to="/admin"
            class="nav-link"
          >
            Home
          </RouterLink>

          <RouterLink
            v-else
            to="/dashboard"
            class="nav-link"
          >
            Home
          </RouterLink>

          <span class="welcome-message">
            Hello, {{ user.username || user.name || 'Writer' }}
          </span>

          <button class="btn-secondary logout-button" @click="logout">
            Log out
          </button>
        </template>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="site-footer">
      <RouterLink to="/" class="brand footer-brand">
        the daily<span class="brand-dot">.</span>
      </RouterLink>

      <p class="footer-tagline">
        Ideas worth sharing.
      </p>

      <p class="footer-copyright">
        © {{ new Date().getFullYear() }} The Daily Journal
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--paper, #faf9f6);
  color: var(--ink, #20211f);
}

.site-nav {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 5%;
  border-bottom: 1px solid var(--line, #e8e5df);
  background: var(--paper, #faf9f6);
}

.brand {
  text-decoration: none;
  color: var(--ink, #20211f);
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -1px;
  white-space: nowrap;
}

.brand-dot {
  color: var(--accent, #ee6853);
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 22px;
}

.nav-link {
  color: var(--ink, #20211f);
  text-decoration: none;
  font-size: 0.92rem;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--accent, #ee6853);
}

.write-icon {
  color: var(--accent, #ee6853);
}

.welcome-message {
  color: var(--muted, #77766f);
  font-size: 0.9rem;
}

.nav-cta {
  text-decoration: none;
  text-align: center;
}

.logout-button {
  font: inherit;
  cursor: pointer;
}

.main-content {
  flex: 1;
  width: 100%;
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 36px;
  padding: 26px 5%;
  border-top: 1px solid var(--line, #e8e5df);
}

.footer-brand {
  font-size: 1.4rem;
}

.footer-tagline,
.footer-copyright {
  margin: 0;
  color: var(--muted, #77766f);
  font-size: 0.85rem;
}

@media (max-width: 700px) {
  .site-nav {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px 5%;
  }

  .nav-links {
    justify-content: flex-start;
    gap: 14px;
  }

  .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>