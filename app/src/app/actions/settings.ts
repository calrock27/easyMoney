'use server'

import { getPrisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const ImportSchema = z.object({
    income: z.number(),
    currency: z.string(),
    expenses: z.array(z.object({
        name: z.string(),
        amount: z.number(),
        category: z.string()
    })),
    categories: z.array(z.string()).optional()
})

const UpdateCurrencySchema = z.object({
    userId: z.string().uuid("Invalid User ID"),
    currency: z.string().min(3, "Currency code must be 3 characters").max(3, "Currency code must be 3 characters")
})

export async function updateCurrency(userId: string, currency: string) {
    logger.info(`Updating currency for user: ${userId}, currency: ${currency}`);
    const prisma = getPrisma();
    try {
        const result = UpdateCurrencySchema.safeParse({ userId, currency })
        if (!result.success) {
            return { success: false, error: result.error.issues[0].message }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { currency }
        })
        logger.info(`Currency updated successfully for user: ${userId}`);
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        logger.error('Error updating currency:', error);
        return { success: false, error: 'Failed to update currency' }
    }
}

export async function importData(userId: string, jsonData: string) {
    logger.info(`Importing data for user: ${userId}`);
    const prisma = getPrisma();
    try {
        const data = JSON.parse(jsonData)
        const parsed = ImportSchema.parse(data)

        // Transaction to update user and replace expenses
        await prisma.$transaction(async (tx) => {
            // Update user settings
            await tx.user.update({
                where: { id: userId },
                data: {
                    income: parsed.income,
                    currency: parsed.currency
                }
            })

            // Delete existing expenses
            await tx.expense.deleteMany({
                where: { userId }
            })

            // Delete existing custom categories
            await tx.category.deleteMany({
                where: { userId }
            })

            // Create new expenses
            if (parsed.expenses.length > 0) {
                await tx.expense.createMany({
                    data: parsed.expenses.map(e => ({
                        ...e,
                        userId
                    }))
                })
            }

            // Create new custom categories
            if (parsed.categories && parsed.categories.length > 0) {
                await tx.category.createMany({
                    data: parsed.categories.map(name => ({
                        name,
                        userId
                    }))
                })
            }
        })

        logger.info(`Data imported successfully for user: ${userId}`);
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        logger.error('Import error:', error);
        return { success: false, error: 'Failed to import data. Invalid format.' }
    }
}

export async function clearData(userId: string) {
    logger.info(`Clearing data for user: ${userId}`);
    const prisma = getPrisma();
    try {
        await prisma.$transaction(async (tx) => {
            // Delete all expenses
            await tx.expense.deleteMany({
                where: { userId }
            })

            // Delete all custom categories
            await tx.category.deleteMany({
                where: { userId }
            })

            // Reset income to 0
            await tx.user.update({
                where: { id: userId },
                data: { income: 0 }
            })
        })

        logger.info(`Data cleared successfully for user: ${userId}`);
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        logger.error('Error clearing data:', error);
        return { success: false, error: 'Failed to clear data' }
    }
}
