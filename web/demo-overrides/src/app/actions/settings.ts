import * as storage from '@/lib/storage'
import { z } from 'zod'

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

export async function updateCurrency(userId: string, currency: string) {
    try {
        storage.updateUser({ currency })
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update currency' }
    }
}

export async function importData(userId: string, jsonData: string) {
    try {
        const data = JSON.parse(jsonData)
        const parsed = ImportSchema.parse(data)

        // Import data using storage utility
        storage.importData(parsed)

        return { success: true }
    } catch (error) {
        console.error('Import error:', error)
        return { success: false, error: 'Failed to import data. Invalid format.' }
    }
}

export async function clearData(userId: string) {
    try {
        storage.clearAllData()
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to clear data' }
    }
}

