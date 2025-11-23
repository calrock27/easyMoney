import * as storage from '@/lib/storage'

export async function createCategory(userId: string, name: string) {
    try {
        const category = storage.createCategory(name)
        return { success: true, data: category }
    } catch (error) {
        return { success: false, error: 'Failed to create category' }
    }
}

export async function deleteCategory(categoryId: string) {
    try {
        const success = storage.deleteCategory(categoryId)
        if (!success) {
            return { success: false, error: 'Category not found' }
        }
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete category' }
    }
}

export async function getCategories(userId: string) {
    try {
        const categories = storage.getCategories()
        // Sort by name ascending
        categories.sort((a, b) => a.name.localeCompare(b.name))
        return { success: true, data: categories }
    } catch (error) {
        return { success: false, error: 'Failed to fetch categories' }
    }
}
