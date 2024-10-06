import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(sessionStorage.getItem('user') || 'null') as any,
  }),
  actions: {
    setUser(user: any) {
      this.user = user
      sessionStorage.setItem('user', JSON.stringify(user))
    },
    clearUser() {
      this.user = null
      sessionStorage.removeItem('user')
    },
  },
})