<template>
  <div class="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-300 rounded-lg shadow-sm">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Register</h2>
    <el-form @submit.prevent="handleSubmit">
      <el-form-item label="Username" required>
        <el-input v-model="username" placeholder="Choose a username"></el-input>
      </el-form-item>
      <el-form-item label="Email" required>
        <el-input v-model="email" type="email" placeholder="Enter your email"></el-input>
      </el-form-item>
      <el-form-item label="Password" required>
        <el-input v-model="password" type="password" placeholder="Choose a password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">Register</el-button>
      </el-form-item>
    </el-form>
    <!-- New Line Under the Form -->
    <div class="mt-4 text-center">
      <p class="text-gray-600">
        Already registered?
        <router-link to="/login" class="text-blue-500 hover:underline">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, requestEmailVerification } from '../services/api'

export default defineComponent({
  name: 'Register',
  setup() {
    const router = useRouter()

    const username = ref('')
    const email = ref('')
    const password = ref('')
    const loading = ref(false)

    const handleSubmit = async () => {
      loading.value = true
      try {
        await register(username.value, password.value, email.value)
        await requestEmailVerification(email.value)
        ElMessage.success('Registration successful. Please check your email to verify your account before logging in.')
        router.push('/login')
      } catch (error) {
        ElMessage.error('Registration failed. Please try again.')
      } finally {
        loading.value = false
      }
    }

    return { username, email, password, loading, handleSubmit }
  }
})
</script>