<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { setAuth } from '../Auth.js';

const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

async function login() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter your email and password.';
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post(
      'http://localhost:4000/users/login',
      {
        email: email.value.trim(),
        password: password.value
      }
    );
    
    const data = response.data;

    const token = data.accessToken || data.token;
    const userData = data.user || data.data?.user;

    if (!token || !userData) {
      errorMessage.value =
        'The login response is missing the token or user information.';
      return;
    }

    // Save authentication and update the reactive navbar state
    setAuth(token, userData);

    const role = String(
      userData.role || userData.userType || ''
    ).toLowerCase();

    const isAdmin =
      userData.isAdmin === true || role === 'admin';

    await router.push(isAdmin ? '/admin' : '/dashboard');

  } catch (error) {
    console.error('Login error:', error);
    console.error('API response:', error.response?.data);
    console.error('HTTP status:', error.response?.status);

    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Unable to log in. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="page-shell form-page">
    <section class="form-card">
      <span class="eyebrow">Welcome back</span>

      <h1>Good stories<br />start here.</h1>

      <p class="muted">
        Sign in to continue reading, sharing, and discovering new ideas.
      </p>

      <div
        v-if="errorMessage"
        role="alert"
        style="margin-top: 20px; padding: 12px; border-radius: 8px; background: #fff0ed; color: #a53324; font-size: 14px"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="successMessage"
        role="status"
        style="margin-top: 20px; color: #18794e"
      >
        {{ successMessage }}
      </div>

      <form @submit.prevent="login">
        <div class="form-field">
          <label for="login-email">Email address</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-field">
          <label for="login-password">Password</label>

          <div style="display: flex; gap: 8px">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />

            <button
              type="button"
              class="btn-secondary"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <button
          class="btn-primary"
          type="submit"
          :disabled="loading"
          style="width: 100%; margin-top: 8px"
        >
          {{ loading ? 'Signing in...' : 'Sign in →' }}
        </button>
      </form>

      <p class="muted" style="text-align: center; margin-top: 25px; font-size: 14px">
        New around here?
        <RouterLink
          to="/register"
          style="color: var(--accent); font-weight: 700"
        >
          Create an account
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