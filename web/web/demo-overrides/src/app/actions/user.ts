import * as storage from '@/lib/storage'
import { User } from '@/types'

export async function getUsers() {
    try {
        const user = storage.getUser()
        const users = user ? [user] : []
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function createUser(name: string, currency: string = 'USD', theme: string = 'system') {
    // In demo mode, we only have one user, so this updates the existing user
    try {
        const user = storage.updateUser({ name, currency, theme })
        return { success: true, data: user }
    } catch (error) {
        return { success: false, error: 'Failed to create user' }
    }
}

export async function deleteUser(id: string) {
    try {
        // In demo mode, deleting the user just clears all storage
        // The app will re-initialize with a fresh user on next load
        storage.deleteUser()
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function getUser(id: string) {
    try {
        const user = storage.getUser()
        return { success: true, data: user }
    } catch (error) {
        return { success: false, error: 'Failed to fetch user' }
    }
}

