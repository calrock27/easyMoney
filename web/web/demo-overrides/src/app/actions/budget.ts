import * as storage from '@/lib/storage'

// Update User Income
export async function updateIncome(userId: string, income: number) {
  try {
    const user = storage.updateUser({ income })
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to update income' }
  }
}

// Create Expense
export async function createExpense(userId: string, name: string, amount: number, category: string) {
  try {
    const expense = storage.createExpense(name, amount, category)
    return { success: true, data: expense }
  } catch (error) {
    return { success: false, error: 'Failed to create expense' }
  }
}

// Delete Expense
export async function deleteExpense(expenseId: string) {
  try {
    const success = storage.deleteExpense(expenseId)
    if (!success) {
      return { success: false, error: 'Expense not found' }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete expense' }
  }
}

// Get User Data (Income + Expenses)
export async function getUserBudget(userId: string) {
  try {
    const user = storage.getUserBudget()
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to fetch budget data' }
  }
}

