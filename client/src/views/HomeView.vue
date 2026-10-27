<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';

const posts = ref([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const selectedCategory = ref('All');

const categories = computed(() => {
  const values = posts.value
    .map(post => post.category)
    .filter(Boolean);

  return ['All', ...new Set(values)];
});

const filteredPosts = computed(() => {
  const query = search.value.trim().toLowerCase();

  return posts.value.filter(post => {
    const title = (post.title || '').toLowerCase();
    const content = (post.content || post.body || '').toLowerCase();
    const category = post.category || '';

    const matchesSearch =
      !query ||
      title.includes(query) ||
      content.includes(query);

    const matchesCategory =
      selectedCategory.value === 'All' ||
      category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

function excerpt(post) {
  const content = post.content || post.body || '';
  return content.length > 120
    ? `${content.slice(0, 120)}...`
    : content || 'Discover the story behind this post.';
}

function authorName(post) {
  return post.author?.name ||
    post.user?.name ||
    post.authorName ||
    'Blog Contributor';
}

function postId(post) {
  return post._id || post.id;
}

function formattedDate(post) {
  const value = post.createdAt || post.date;

  if (!value) return 'Recently published';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Recently published'
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
}

async function fetchPosts() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/posts');
    const data = response.data;

    posts.value = Array.isArray(data)
      ? data
      : Array.isArray(data.posts)
        ? data.posts
        : Array.isArray(data.data)
          ? data.data
          : [];
  } catch (err) {
    error.value = 'We could not load the posts. Please try again.';
    console.error('Failed to fetch posts:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPosts);
</script>

<template>
    <main class="page-shell">
      <section class="hero">
        <span class="eyebrow">Ideas worth sharing</span>
        <h1 class="display-title">
          Stories that make<br />
          you <span style="color: var(--accent)">think differently.</span>
        </h1>

        <p class="muted">
          A little space on the internet for big ideas, fresh perspectives,
          and stories from people like you.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px">
          <RouterLink to="/register" class="btn-primary">
            Start writing <span aria-hidden="true">&nbsp;↗</span>
          </RouterLink>

          <a href="#latest-stories" class="btn-secondary">
            Explore stories
          </a>
        </div>
      </section>

      <section id="latest-stories">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Fresh perspectives</span>
            <h2 class="section-title" style="margin-top: 8px">
              Latest stories
            </h2>
          </div>

          <span class="muted" style="font-size: 13px">
            {{ filteredPosts.length }} stories
          </span>
        </div>

        <div style="display: grid; gap: 16px; margin-bottom: 24px">
          <input
            v-model="search"
            type="search"
            placeholder="Search stories..."
            aria-label="Search stories"
            style="width: 100%; max-width: 460px; padding: 13px 16px; border: 1px solid var(--line); border-radius: 10px; background: white"
          />

          <div style="display: flex; gap: 9px; flex-wrap: wrap">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              @click="selectedCategory = category"
              :aria-pressed="selectedCategory === category"
              :style="{
                padding: '8px 14px',
                borderRadius: '30px',
                border: '1px solid var(--line)',
                cursor: 'pointer',
                background: selectedCategory === category ? 'var(--ink)' : 'white',
                color: selectedCategory === category ? 'white' : 'var(--ink)'
              }"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="muted" style="padding: 40px 0">
          Gathering the latest stories...
        </div>

        <div v-else-if="error" style="padding: 30px 0">
          <p class="muted">{{ error }}</p>
          <button class="btn-primary" type="button" @click="fetchPosts">
            Try again
          </button>
        </div>

        <div
          v-else-if="filteredPosts.length"
          class="post-grid"
        >
          <article
            v-for="(post, index) in filteredPosts"
            :key="postId(post) ?? index"
            class="post-card"
          >
            <div class="post-cover">
              <img
                v-if="post.image"
                :src="post.image"
                :alt="post.title || 'Story cover'"
                style="width: 100%; height: 180px; object-fit: cover"
              />
                <span v-else aria-hidden="true">
                    {{ String(index + 1).padStart(2, '0') }}
                </span>
            </div>

            <div class="post-content">
                <span class="eyebrow">
                    {{ post.category || 'Community story' }}
                </span>

                <h2>{{ post.title || 'Untitled story' }}</h2>

                <p>{{ excerpt(post) }}</p>

                <div class="post-meta" style="margin: 18px 0 14px">
                    {{ authorName(post) }} · {{ formattedDate(post) }}
                </div>

                <RouterLink
                    v-if="postId(post) != null"
                    :to="`/posts/${postId(post)}`"
                    class="text-link"
                    style="font-size: 14px; font-weight: 700"
                >
                    Read story →
                </RouterLink>
                </div>
            </article>
        </div>

        <div
            v-else
            style="padding: 45px 20px; text-align: center; border: 1px dashed var(    --line); border-radius: 14px; margin-bottom: 60px"
            >
            <h3 style="font-family: 'Playfair Display', serif">
                No stories found just yet.
            </h3>
            <p class="muted">
                Try another search, or be the first to share a story.
            </p>
            <RouterLink to="/create-post" class="btn-primary">
                Write a story
            </RouterLink>
        </div>
      </section>
    </main>
</template>