<template>
  <main class="page-shell">
    <section class="form-page">
      <div class="form-card edit-card">
        <header class="form-header">
          <p class="eyebrow">MAKE IT EVEN BETTER</p>
          <h1 class="display-title">Edit your <em>story.</em></h1>
          <p class="muted">
            Refine your words and keep your story up to date.
          </p>
        </header>

        <div v-if="loading" class="status-message">
          Loading your story...
        </div>

        <template v-else>
          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <form v-if="postLoaded" @submit.prevent="updatePost">
            <div class="form-field">
              <label for="title">Story title</label>
              <input
                id="title"
                v-model.trim="form.title"
                type="text"
                maxlength="150"
                placeholder="Enter your story title"
                required
              />
              <small class="muted">
                {{ form.title.length }}/150 characters
              </small>
            </div>

            <div class="form-field">
              <label for="category">Category</label>
              <select id="category" v-model="form.category" required>
                <option disabled value="">Choose a category</option>
                <option value="Technology">Technology</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Education">Education</option>
                <option value="Travel">Travel</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-field">
              <label for="image">Cover image URL <span>(optional)</span></label>
              <input
                id="image"
                v-model.trim="form.image"
                type="url"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div v-if="form.image && isValidImageUrl" class="image-preview">
              <img
                :src="form.image"
                alt="Cover image preview"
                @error="imagePreviewError = true"
                @load="imagePreviewError = false"
              />
              <p v-if="imagePreviewError" class="muted">
                The image preview could not be loaded.
              </p>
            </div>

            <div class="form-field">
              <label for="content">Your story</label>
              <textarea
                id="content"
                v-model.trim="form.content"
                rows="12"
                placeholder="Update your story..."
                required
              ></textarea>
              <small class="muted">
                {{ form.content.length }} characters
              </small>
            </div>

            <div class="form-actions">
              <RouterLink
                :to="`/posts/${postId}`"
                class="btn-secondary"
              >
                Cancel
              </RouterLink>

              <button
                type="submit"
                class="btn-primary"
                :disabled="submitting"
              >
                {{ submitting ? 'Saving changes...' : 'Save changes →' }}
              </button>
            </div>
          </form>

          <div v-else class="not-found">
            <h2 class="section-title">Story unavailable</h2>
            <p class="muted">
              We couldn't load this story. It may have been removed,
              or you may not have permission to edit it.
            </p>
            <RouterLink to="/" class="btn-primary">
              Return home
            </RouterLink>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const postId = route.params.id;

const loading = ref(true);
const submitting = ref(false);
const postLoaded = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const imagePreviewError = ref(false);

const form = reactive({
  title: '',
  category: '',
  image: '',
  content: '',
});

const isValidImageUrl = computed(() => {
  try {
    const url = new URL(form.image);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
});

function getPostData(responseData) {
  return responseData?.post || responseData?.data || responseData;
}

async function fetchPost() {
  loading.value = true;
  errorMessage.value = '';
  postLoaded.value = false;

  const token = localStorage.getItem('token');

  if (!token) {
    errorMessage.value = 'Please log in before editing a story.';
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get(
      `http://localhost:4000/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const post = getPostData(response.data);

    if (!post || !post.title) {
      throw new Error('The server returned an unexpected article format.');
    }

    form.title = post.title || '';
    form.category = post.category || '';
    form.image = post.image || post.imageUrl || '';
    form.content = post.content || post.body || '';

    postLoaded.value = true;
  } catch (error) {
    console.error('Failed to load post for editing:', error);

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to load this story.';
  } finally {
    loading.value = false;
  }
}

async function updatePost() {
  errorMessage.value = '';
  successMessage.value = '';

  const token = localStorage.getItem('token');

  if (!token) {
    errorMessage.value = 'Please log in before saving changes.';
    return;
  }

  if (!form.title || !form.category || !form.content) {
    errorMessage.value = 'Please complete the title, category, and story.';
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      title: form.title,
      category: form.category,
      content: form.content,
      image: form.image || '',
    };

    await axios.put(
      `http://localhost:4000/posts/${postId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    successMessage.value = 'Your changes have been saved!';

    setTimeout(() => {
      router.push(`/posts/${postId}`);
    }, 700);
  } catch (error) {
    console.error('Failed to update post:', error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage.value =
        'You are not authorized to edit this story. Please check your login and permissions.';
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        'Unable to save changes. Please try again.';
    }
  } finally {
    submitting.value = false;
  }
}

onMounted(fetchPost);
</script>

<style scoped>
.edit-card {
  max-width: 760px;
}

.form-header {
  margin-bottom: 36px;
}

.form-header .display-title {
  margin: 14px 0;
  line-height: 1.15;
}

.form-header .display-title em {
  color: var(--accent);
}

.form-field label span {
  color: var(--muted);
  font-weight: 400;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--white);
  color: var(--ink);
  font: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgb(238 104 83 / 12%);
}

.form-field textarea {
  min-height: 220px;
  resize: vertical;
  line-height: 1.8;
}

.form-field small {
  display: block;
  margin-top: 7px;
  font-size: 0.8rem;
}

.image-preview {
  margin: -8px 0 24px;
}

.image-preview img {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}

.form-actions button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.status-message {
  padding: 24px 0;
  color: var(--muted);
}

.not-found {
  padding: 16px 0;
}

@media (max-width: 600px) {
  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .form-actions > * {
    text-align: center;
  }
}
</style>