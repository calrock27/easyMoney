'use server'

import { getPrisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

// Update User Income
export async function updateIncome(userId: string, income: number) {
  logger.info(`Updating income for user: ${userId}, amount: ${income}`);
  const prisma = getPrisma();
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { income }
    })
    logger.info(`Income updated successfully for user: ${userId}`);
    revalidatePath('/')
    return { success: true, data: user }
  } catch (error) {
    logger.error('Error updating income:', error);
    return { success: false, error: 'Failed to update income' }
  }
}

// Create Expense
export async function createExpense(userId: string, name: string, amount: number, category: string) {
  logger.info(`Creating expense for user: ${userId}, amount: ${amount}, category: ${category}`);
  const prisma = getPrisma();
  try {
    const expense = await prisma.expense.create({
      data: {
        name,
        amount,
        category,
        userId
      }
    })
    logger.info(`Expense created successfully: ${expense.id}`);
    revalidatePath('/')
    return { success: true, data: expense }
  } catch (error) {
    logger.error('Error creating expense:', error);
    return { success: false, error: 'Failed to create expense' }
  }
}

// Delete Expense
export async function deleteExpense(expenseId: string) {
  logger.info(`Deleting expense: ${expenseId}`);
  const prisma = getPrisma();
  try {
    await prisma.expense.delete({
      where: { id: expenseId }
    })
    logger.info(`Expense deleted successfully: ${expenseId}`);
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    logger.error('Error deleting expense:', error);
    return { success: false, error: 'Failed to delete expense' }
  }
}

// Get User Data (Income + Expenses)
export async function getUserBudget(userId: string) {
  logger.debug(`Fetching budget for user: ${userId}`);
  const prisma = getPrisma();
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        expenses: {
          orderBy: { amount: 'desc' }
        }
      }
    })
    if (user) {
      logger.debug(`Fetched budget for user: ${userId}, expenses: ${user.expenses.length}`);
    } else {
      logger.warn(`Budget not found for user: ${userId}`);
    }
    return { success: true, data: user }
  } catch (error) {
    logger.error('Error fetching budget data:', error);
    return { success: false, error: 'Failed to fetch budget data' }
  }
}
