<template>
  <main class="page-shell">
    <section v-if="loading" class="form-page">
      <p class="muted">Loading article...</p>
    </section>

    <section v-else-if="error" class="form-page">
      <div class="form-card text-center">
        <p class="eyebrow">Something went wrong</p>
        <h1 class="section-title">Article unavailable</h1>
        <p class="muted">{{ error }}</p>

        <RouterLink to="/" class="btn-primary">
          Return home
        </RouterLink>
      </div>
    </section>

    <article v-else-if="post" class="article">
      <header class="article-header">
        <p class="eyebrow">{{ post.category || 'THE DAILY JOURNAL' }}</p>

        <h1 class="display-title article-title">
          {{ post.title || 'Untitled story' }}
        </h1>

        <p v-if="post.excerpt" class="article-excerpt">
          {{ post.excerpt }}
        </p>

        <div class="post-meta article-meta">
          <span>By {{ authorName }}</span>
          <span class="meta-divider">•</span>
          <time v-if="publishedDate" :datetime="publishedDate">
            {{ formatDate(publishedDate) }}
          </time>
        </div>
      </header>

      <img
        v-if="post.image || post.imageUrl"
        :src="post.image || post.imageUrl"
        :alt="post.title || 'Article cover image'"
        class="article-cover"
      />

      <div class="article-body">
        <p class="article-text">{{ post.content || post.body || 'No article content available.' }}</p>
      </div>

      <footer class="article-footer">
        <div>
          <p class="eyebrow">YOU'VE REACHED THE END</p>
          <h2 class="section-title">Thanks for reading.</h2>
        </div>

        <RouterLink to="/" class="btn-primary">
          Explore more stories →
        </RouterLink>
      </footer>
    </article>

    <section v-else class="form-page">
      <div class="form-card text-center">
        <h1 class="section-title">Story not found</h1>
        <p class="muted">This article may have been removed or the link is incorrect.</p>
        <RouterLink to="/" class="btn-primary">
          Return home
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();

const post = ref(null);
const loading = ref(true);
const error = ref('');

const authorName = computed(() => {
  return (
    post.value?.author?.name ||
    post.value?.user?.name ||
    post.value?.authorName ||
    'Guest Author'
  );
});

const publishedDate = computed(() => {
  return post.value?.createdAt || post.value?.publishedAt || post.value?.date || '';
});

function formatDate(date) {
  if (!date) return '';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function fetchPost() {
  loading.value = true;
  error.value = '';
  post.value = null;

  try {
    const response = await axios.get(
      `http://localhost:4000/posts/${route.params.id}`
    );

    // Supports APIs that return either the post directly
    // or wrap it inside a "post" or "data" property.
    const result = response.data;
    post.value = result?.post || result?.data || result;

    if (!post.value || !post.value.title) {
      error.value = 'The server returned an unexpected article format.';
    }
  } catch (err) {
    console.error('Failed to fetch article:', err);

    if (err.response?.status === 404) {
      error.value = 'We could not find an article with this ID.';
    } else {
      error.value =
        err.response?.data?.message ||
        'Unable to load this article. Please check that your server is running.';
    }
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPost);
</script>

<style scoped>
.article {
  max-width: 860px;
  margin: 56px auto 80px;
}

.article-header {
  max-width: 760px;
  margin: 0 auto 36px;
  text-align: center;
}

.article-title {
  margin: 18px 0;
  line-height: 1.12;
  overflow-wrap: anywhere;
}

.article-excerpt {
  max-width: 680px;
  margin: 0 auto 24px;
  color: var(--muted);
  font-size: 1.15rem;
  line-height: 1.8;
}

.article-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.meta-divider {
  color: var(--accent);
}

.article-cover {
  display: block;
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 20px;
  margin: 36px 0 44px;
}

.article-body {
  max-width: 700px;
  margin: 0 auto;
}

.article-text {
  color: var(--ink);
  font-size: 1.1rem;
  line-height: 2;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.article-footer {
  margin-top: 64px;
  padding: 32px 0;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .article {
    margin-top: 32px;
  }

  .article-title {
    font-size: 2.4rem;
  }

  .article-cover {
    max-height: 300px;
    border-radius: 14px;
  }

  .article-text {
    font-size: 1rem;
  }

  .article-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>