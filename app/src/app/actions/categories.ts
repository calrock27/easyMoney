'use server'

import { getPrisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export async function createCategory(userId: string, name: string) {
    logger.info(`Creating category for user: ${userId}, name: ${name}`);
    const prisma = getPrisma();
    try {
        const category = await prisma.category.create({
            data: {
                name,
                userId
            }
        })
        logger.info(`Category created successfully: ${category.id}`);
        revalidatePath('/')
        return { success: true, data: category }
    } catch (error) {
        logger.error('Error creating category:', error);
        return { success: false, error: 'Failed to create category' }
    }
}

export async function deleteCategory(categoryId: string) {
    logger.info(`Deleting category: ${categoryId}`);
    const prisma = getPrisma();
    try {
        await prisma.category.delete({
            where: { id: categoryId }
        })
        logger.info(`Category deleted successfully: ${categoryId}`);
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        logger.error('Error deleting category:', error);
        return { success: false, error: 'Failed to delete category' }
    }
}

export async function getCategories(userId: string) {
    logger.debug(`Fetching categories for user: ${userId}`);
    const prisma = getPrisma();
    try {
        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' }
        })
        logger.debug(`Fetched ${categories.length} categories for user: ${userId}`);
        return { success: true, data: categories }
    } catch (error) {
        logger.error('Error fetching categories:', error);
        return { success: false, error: 'Failed to fetch categories' }
    }
}
