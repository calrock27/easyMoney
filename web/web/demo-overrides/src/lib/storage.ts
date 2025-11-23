// Browser storage utilities for easyMoney demo
// Replaces Prisma database with localStorage

import { User, Expense, Category, UserWithExpenses } from '@/types'

const STORAGE_KEYS = {
    USER: 'easymoney_user',
    EXPENSES: 'easymoney_expenses',
    CATEGORIES: 'easymoney_categories',
} as const

// Generate UUID
function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// Initialize storage with default demo user
export function initializeStorage(): void {
    if (typeof window === 'undefined') return

    // Initialize user if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
        const defaultUser: User = {
            id: generateId(),
            name: 'Demo User',
            currency: 'USD',
            theme: 'system',
            income: 0,
            createdAt: new Date().toISOString(),
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser))
    }

    // Initialize expenses array if not exists
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]))
    }

    // Initialize categories array if not exists
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]))
    }
}

// ============= USER OPERATIONS =============

export function getUser(): User | null {
    if (typeof window === 'undefined') return null

    const userData = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userData) return null

    try {
        return JSON.parse(userData) as User
    } catch {
        return null
    }
}

export function updateUser(updates: Partial<User>): User | null {
    const user = getUser()
    if (!user) return null

    const updatedUser = { ...user, ...updates }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
    return updatedUser
}

export function deleteUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.EXPENSES)
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES)
}

// ============= EXPENSE OPERATIONS =============

export function getExpenses(): Expense[] {
    if (typeof window === 'undefined') return []

    const expensesData = localStorage.getItem(STORAGE_KEYS.EXPENSES)
    if (!expensesData) return []

    try {
        return JSON.parse(expensesData) as Expense[]
    } catch {
        return []
    }
}

export function createExpense(name: string, amount: number, category: string): Expense {
    const user = getUser()
    if (!user) throw new Error('No user found')

    const expense: Expense = {
        id: generateId(),
        name,
        amount,
        category,
        userId: user.id,
    }

    const expenses = getExpenses()
    expenses.push(expense)
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))

    return expense
}

export function deleteExpense(expenseId: string): boolean {
    const expenses = getExpenses()
    const filtered = expenses.filter(e => e.id !== expenseId)

    if (filtered.length === expenses.length) {
        return false // Expense not found
    }

    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered))
    return true
}

// ============= CATEGORY OPERATIONS =============

export function getCategories(): Category[] {
    if (typeof window === 'undefined') return []

    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    if (!categoriesData) return []

    try {
        return JSON.parse(categoriesData) as Category[]
    } catch {
        return []
    }
}

export function createCategory(name: string): Category {
    const user = getUser()
    if (!user) throw new Error('No user found')

    // Check if category already exists
    const categories = getCategories()
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (existing) {
        throw new Error('Category already exists')
    }

    const category: Category = {
        id: generateId(),
        name,
        userId: user.id,
    }

    categories.push(category)
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))

    return category
}

export function deleteCategory(categoryId: string): boolean {
    const categories = getCategories()
    const filtered = categories.filter(c => c.id !== categoryId)

    if (filtered.length === categories.length) {
        return false // Category not found
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered))
    return true
}

// ============= COMBINED OPERATIONS =============

export function getUserBudget(): UserWithExpenses | null {
    const user = getUser()
    if (!user) return null

    const expenses = getExpenses()
    // Sort by amount descending
    expenses.sort((a, b) => b.amount - a.amount)

    return {
        ...user,
        expenses,
    }
}

// ============= DATA MANAGEMENT =============

export function clearAllData(): void {
    const user = getUser()
    if (!user) return

    // Clear expenses
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]))

    // Clear categories
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]))

    // Reset income
    updateUser({ income: 0 })
}

export function importData(data: {
    income: number
    currency: string
    expenses: Array<{ name: string; amount: number; category: string }>
    categories?: string[]
}): void {
    const user = getUser()
    if (!user) throw new Error('No user found')

    // Update user settings
    updateUser({
        income: data.income,
        currency: data.currency,
    })

    // Replace expenses
    const userId = user.id
    const expenses: Expense[] = data.expenses.map(e => ({
        id: generateId(),
        name: e.name,
        amount: e.amount,
        category: e.category,
        userId,
    }))
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))

    // Replace categories
    if (data.categories) {
        const categories: Category[] = data.categories.map(name => ({
            id: generateId(),
            name,
            userId,
        }))
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    }
}

export function exportData(): {
    income: number
    currency: string
    expenses: Array<{ name: string; amount: number; category: string }>
    categories: string[]
} {
    const user = getUser()
    const expenses = getExpenses()
    const categories = getCategories()

    return {
        income: user?.income || 0,
        currency: user?.currency || 'USD',
        expenses: expenses.map(e => ({
            name: e.name,
            amount: e.amount,
            category: e.category,
        })),
        categories: categories.map(c => c.name),
    }
}
