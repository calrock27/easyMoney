'use server'

import { getPrisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const CreateUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
    currency: z.string().min(3).max(3).optional().default('USD'),
    theme: z.enum(['light', 'dark', 'system']).optional().default('system')
})

export async function getUsers() {
    logger.debug('Fetching users');
    const prisma = getPrisma();
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        })
        logger.debug(`Fetched ${users.length} users`);
        return { success: true, data: users }
    } catch (error) {
        logger.error('Error fetching users:', error);
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function createUser(name: string, currency: string = 'USD', theme: string = 'system') {
    logger.info(`Creating user: ${name} with currency: ${currency}`);
    const prisma = getPrisma();
    try {
        const result = CreateUserSchema.safeParse({ name, currency, theme })

        if (!result.success) {
            logger.warn('Validation failed for createUser:', result.error.format());
            return { success: false, error: result.error.issues[0].message }
        }

        const data = result.data;

        const user = await prisma.user.create({
            data: {
                name: data.name,
                currency: data.currency,
                theme: data.theme as string
            }
        })
        logger.info(`User created successfully: ${user.id}`);
        revalidatePath('/')
        return { success: true, data: user }
    } catch (error) {
        logger.error('Error creating user:', error);
        return { success: false, error: 'Failed to create user' }
    }
}

export async function deleteUser(id: string) {
    logger.info(`Deleting user: ${id}`);
    const prisma = getPrisma();
    try {
        await prisma.user.delete({
            where: { id }
        })
        logger.info(`User deleted successfully: ${id}`);
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        logger.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function getUser(id: string) {
    logger.debug(`Fetching user: ${id}`);
    const prisma = getPrisma();
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        })
        if (user) {
            logger.debug(`Fetched user: ${user.name}`);
        } else {
            logger.warn(`User not found: ${id}`);
        }
        return { success: true, data: user }
    } catch (error) {
        logger.error('Error fetching user:', error);
        return { success: false, error: 'Failed to fetch user' }
    }
}

export async function switchUser(userId: string) {
    logger.info(`Switching to user: ${userId}`);
    const prisma = getPrisma();
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            logger.warn(`User not found: ${userId}`);
            return { success: false, error: 'User not found' }
        }

        logger.info(`Switched to user: ${user.name}`);
        revalidatePath('/')
        return { success: true, user }
    } catch (error) {
        logger.error('Error switching user:', error);
        return { success: false, error: 'Failed to switch user' }
    }
}
