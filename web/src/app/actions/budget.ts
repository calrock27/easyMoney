'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Update User Income
export async function updateIncome(userId: string, income: number) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { income }
    })
    revalidatePath('/')
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to update income' }
  }
}

// Create Expense
export async function createExpense(userId: string, name: string, amount: number, category: string) {
  try {
    const expense = await prisma.expense.create({
      data: {
        name,
        amount,
        category,
        userId
      }
    })
    revalidatePath('/')
    return { success: true, data: expense }
  } catch (error) {
    return { success: false, error: 'Failed to create expense' }
  }
}

// Delete Expense
export async function deleteExpense(expenseId: string) {
  try {
    await prisma.expense.delete({
      where: { id: expenseId }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete expense' }
  }
}

// Get User Data (Income + Expenses)
export async function getUserBudget(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        expenses: {
          orderBy: { amount: 'desc' }
        }
      }
    })
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to fetch budget data' }
  }
}
