import { User, Expense, Category } from '@/types'
import * as storage from '@/lib/storage'

// Mock Delegate for User
class UserDelegate {
    async findUnique({ where }: { where: { id: string }, include?: any }) {
        const user = storage.getUser()
        if (user && user.id === where.id) {
            // In our simple demo, we always return the full user with expenses if requested
            // But storage.getUser() only returns the user. 
            // storage.getUserBudget() returns user + expenses.
            // Let's check if we need expenses.
            // For now, let's just return what storage gives us, and if 'expenses' are needed, we fetch them.
            // Actually, looking at budget.ts: getUserBudget calls findUnique with include: { expenses: ... }

            const expenses = storage.getExpenses()
            // Sort if needed, but storage.getUserBudget sorts by amount desc.
            // budget.ts sorts by amount desc.
            expenses.sort((a, b) => b.amount - a.amount)

            return {
                ...user,
                expenses
            }
        }
        return null
    }

    async update({ where, data }: { where: { id: string }, data: Partial<User> }) {
        // We ignore 'where' because we only have one user in demo
        return storage.updateUser(data)
    }
}

// Mock Delegate for Expense
class ExpenseDelegate {
    async create({ data }: { data: Omit<Expense, 'id'> }) {
        return storage.createExpense(data.name, data.amount, data.category)
    }

    async delete({ where }: { where: { id: string } }) {
        const success = storage.deleteExpense(where.id)
        if (!success) throw new Error('Record to delete does not exist.')
        return { id: where.id }
    }
}

// Mock Delegate for Category
class CategoryDelegate {
    async create({ data }: { data: Omit<Category, 'id' | 'userId'> }) {
        return storage.createCategory(data.name)
    }

    async delete({ where }: { where: { id: string } }) {
        const success = storage.deleteCategory(where.id)
        if (!success) throw new Error('Record to delete does not exist.')
        return { id: where.id }
    }

    async findMany({ where }: { where: { userId: string } }) {
        const categories = storage.getCategories()
        categories.sort((a, b) => a.name.localeCompare(b.name))
        return categories
    }
}

// Mock Prisma Client
export const prisma = {
    user: new UserDelegate(),
    expense: new ExpenseDelegate(),
    category: new CategoryDelegate(),
}

export default prisma
