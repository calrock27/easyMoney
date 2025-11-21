'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ImportSchema = z.object({
    income: z.number(),
    currency: z.string(),
    expenses: z.array(z.object({
        name: z.string(),
        amount: z.number(),
        category: z.string()
    }))
})

export async function updateCurrency(userId: string, currency: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { currency }
        })
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update currency' }
    }
}

export async function importData(userId: string, jsonData: string) {
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

            // Create new expenses
            if (parsed.expenses.length > 0) {
                await tx.expense.createMany({
                    data: parsed.expenses.map(e => ({
                        ...e,
                        userId
                    }))
                })
            }
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Import error:', error)
        return { success: false, error: 'Failed to import data. Invalid format.' }
    }
}
