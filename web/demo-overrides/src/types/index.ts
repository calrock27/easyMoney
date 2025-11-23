// Type definitions for easyMoney (replacing Prisma-generated types)

export interface User {
    id: string
    name: string
    currency: string
    theme: string
    income: number
    createdAt?: string | Date
}

export interface Expense {
    id: string
    name: string
    amount: number
    category: string
    userId: string
}

export interface Category {
    id: string
    name: string
    userId: string
}

export interface UserWithExpenses extends User {
    expenses: Expense[]
}
