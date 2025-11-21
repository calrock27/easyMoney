'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function createUser(name: string, currency: string = 'USD', theme: string = 'system') {
    try {
        const user = await prisma.user.create({
            data: {
                name,
                currency,
                theme
            }
        })
        revalidatePath('/')
        return { success: true, data: user }
    } catch (error) {
        return { success: false, error: 'Failed to create user' }
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function getUser(id: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        })
        return { success: true, data: user }
    } catch (error) {
        return { success: false, error: 'Failed to fetch user' }
    }
}
