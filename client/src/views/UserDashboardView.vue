<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.replace('/login');
}
</script>

<template>
  <main class="page-shell dashboard">
    <section class="hero">
      <span class="eyebrow">YOUR PERSONAL SPACE</span>
      <h1 class="display-title">
        Welcome back,<br />
        <span class="accent">storyteller.</span>
      </h1>
      <p class="muted">
        Discover new perspectives or share your own story with the community.
      </p>

      <div class="actions">
        <button class="btn-primary" @click="router.push('/create')">
          Write a story →
        </button>
        <button class="btn-secondary" @click="router.push('/')">
          Explore stories
        </button>
      </div>
    </section>

    <section class="dashboard-grid">
      <button class="dashboard-card" @click="router.push('/')">
        <span class="card-icon">📚</span>
        <h2>Discover stories</h2>
        <p>Browse articles and find fresh ideas from the community.</p>
        <span class="card-link">Explore posts →</span>
      </button>

      <button class="dashboard-card" @click="router.push('/create')">
        <span class="card-icon">✍️</span>
        <h2>Create a story</h2>
        <p>Turn your thoughts and experiences into a blog post.</p>
        <span class="card-link">Start writing →</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  padding-top: 30px;
  padding-bottom: 60px;
}

.accent {
  color: var(--accent);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 36px;
}

.dashboard-card {
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--white);
  color: var(--ink);
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.card-icon {
  font-size: 28px;
}

.dashboard-card h2 {
  margin-top: 16px;
  font-family: 'Playfair Display', Georgia, serif;
}

.dashboard-card p {
  color: var(--muted);
  line-height: 1.7;
}

.card-link {
  color: var(--accent);
  font-weight: 700;
}

.logout {
  margin-top: 28px;
}

@media (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>