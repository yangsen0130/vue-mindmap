<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo or App Name -->
            <router-link to="/" class="flex-shrink-0 flex items-center text-xl font-bold">MindMap App</router-link>
          </div>
          <div class="flex items-center">
            <!-- Authentication Links -->
            <router-link v-if="!user" to="/login" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</router-link>
            <router-link v-if="!user" to="/register" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Register</router-link>
            <!-- Logout Button -->
            <button v-if="user" @click="logout" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
          </div>
        </div>
      </div>
    </nav>
    <!-- Router View -->
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'

export default defineComponent({
  name: 'App',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()

    const user = computed(() => userStore.user)

    const logout = () => {
      userStore.clearUser()
      router.push('/login')
    }

    return { user, logout }
  }
})
</script>

<style>
/* Optional global styles */
</style>