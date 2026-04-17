<script setup>
</script>

<template>
  <div class="app-layout">
    <header class="main-header">
      <div class="logo">NASA EONET Tracker</div>
      <nav class="main-nav">
        <router-link to="/">Carte Interactive</router-link>
        <router-link to="/favoris">Mes Favoris</router-link>
        <router-link to="/stats">Statistiques</router-link>
      </nav>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Arial', sans-serif;
  background-color: #f8f9fa;
  overflow: hidden;
}

#app {
  height: 100%;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-header {
  background-color: #0b3d91;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  flex-shrink: 0;
  position: relative;
  z-index: 2000;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.main-nav a {
  color: #e0e0e0;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem;
  transition: color 0.3s;
}

.main-nav a:hover, .main-nav a.router-link-active {
  color: white;
  border-bottom: 2px solid white;
}

.main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    height: auto;
    padding: 1rem;
    gap: 1rem;
  }

  .main-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .main-nav a {
    font-size: 0.9rem;
    padding: 0.3rem;
  }
}
</style>
