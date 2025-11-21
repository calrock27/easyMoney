'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCategory(userId: string, name: string) {
    try {
        const category = await prisma.category.create({
            data: {
                name,
                userId
            }
        })
        revalidatePath('/')
        return { success: true, data: category }
    } catch (error) {
        return { success: false, error: 'Failed to create category' }
    }
}

export async function deleteCategory(categoryId: string) {
    try {
        await prisma.category.delete({
            where: { id: categoryId }
        })
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete category' }
    }
}

export async function getCategories(userId: string) {
    try {
        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: categories }
    } catch (error) {
        return { success: false, error: 'Failed to fetch categories' }
    }
}
