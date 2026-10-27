<template>
  <main class="page-shell">
    <section class="form-page">
      <div class="form-card create-card">
        <header class="form-header">
          <p class="eyebrow">YOUR NEXT STORY STARTS HERE</p>
          <h1 class="display-title">Write something <em>meaningful.</em></h1>
          <p class="muted">
            Share your ideas, experiences, and stories with the world.
          </p>
        </header>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="createPost">
          <div class="form-field">
            <label for="title">Story title</label>
            <input
              id="title"
              v-model.trim="form.title"
              type="text"
              placeholder="Give your story a great title..."
              maxlength="150"
              required
            />
            <small class="muted">{{ form.title.length }}/150 characters</small>
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
              placeholder="https://example.com/your-image.jpg"
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
              placeholder="Start writing your story here..."
              required
            ></textarea>
            <small class="muted">
              {{ form.content.length }} characters
            </small>
          </div>

          <div class="form-actions">
            <RouterLink to="/" class="btn-secondary">
              Cancel
            </RouterLink>

            <button
              type="submit"
              class="btn-primary"
              :disabled="submitting"
            >
              {{ submitting ? 'Publishing...' : 'Publish story →' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const submitting = ref(false);
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

async function createPost() {
  errorMessage.value = '';
  successMessage.value = '';

  const token = localStorage.getItem('token');

  if (!token) {
    errorMessage.value = 'Please log in before publishing a story.';
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
    };

    if (form.image) {
      payload.image = form.image;
    }

    const response = await axios.post(
      'http://localhost:4000/posts',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    successMessage.value = 'Your story has been published!';

    const createdPost =
      response.data?.post ||
      response.data?.data ||
      response.data;

    const postId = createdPost?._id || createdPost?.id;

    setTimeout(() => {
      if (postId) {
        router.push(`/posts/${postId}`);
      } else {
        router.push('/');
      }
    }, 700);
  } catch (error) {
    console.error('Failed to create post:', error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage.value =
        'Your session may have expired. Please log in again.';
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        'Unable to publish your story. Please check your server and try again.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.create-card {
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
  resize: vertical;
  min-height: 220px;
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