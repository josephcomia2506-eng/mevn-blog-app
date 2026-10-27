<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

async function register() {
  errorMessage.value = '';

  if (!name.value.trim() || !email.value.trim() || !password.value) {
    errorMessage.value = 'Please complete all required fields.';
    return;
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Your password must be at least 8 characters.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Your passwords do not match.';
    return;
  }

  loading.value = true;

  try {
    await api.post('/users/register', {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value
    });

    await router.push('/login');
  } catch (error) {
    console.error('Registration error:', error);
    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Unable to create your account. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="page-shell form-page">
    <section class="form-card">
      <span class="eyebrow">Your story matters</span>

      <h1>Find your<br />voice here.</h1>

      <p class="muted">
        Create an account and join a community that loves sharing ideas.
      </p>

      <div
        v-if="errorMessage"
        role="alert"
        style="margin-top: 20px; padding: 12px; border-radius: 8px; background: #fff0ed; color: #a53324; font-size: 14px"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="register">
        <div class="form-field">
          <label for="register-name">Full name</label>
          <input
            id="register-name"
            v-model="name"
            type="text"
            placeholder="Your name"
            autocomplete="name"
            required
          />
        </div>

        <div class="form-field">
          <label for="register-email">Email address</label>
          <input
            id="register-email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-field">
          <label for="register-password">Password</label>

          <div style="display: flex; gap: 8px">
            <input
              id="register-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              minlength="8"
              required
            />

            <button
              type="button"
              class="btn-secondary"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div class="form-field">
          <label for="register-confirm">Confirm password</label>
          <input
            id="register-confirm"
            v-model="confirmPassword"
            type="password"
            placeholder="Enter your password again"
            autocomplete="new-password"
            required
          />
        </div>

        <button
          class="btn-primary"
          type="submit"
          :disabled="loading"
          style="width: 100%; margin-top: 8px"
        >
          {{ loading ? 'Creating account...' : 'Create my account →' }}
        </button>
      </form>

      <p class="muted" style="text-align: center; margin-top: 25px; font-size: 14px">
        Already have an account?
        <RouterLink
          to="/login"
          style="color: var(--accent); font-weight: 700"
        >
          Sign in
        </RouterLink>
      </p>

      <div style="text-align: center; margin-top: 15px">
        <RouterLink to="/" class="text-link" style="font-size: 13px">
          ← Back to home
        </RouterLink>
      </div>
    </section>
  </main>
</template>