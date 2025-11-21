'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { Expense } from '@prisma/client'
import { createExpense, getUserBudget } from '@/app/actions/budget'
import { createCategory, deleteCategory, getCategories } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { defaultCategories } from "@/lib/categories"

interface AddExpenseFormProps {
    onExpenseAdded: () => void
}

type CategoryItem = {
    name: string
    id?: string
    type: 'default' | 'custom' | 'historical'
}

export function AddExpenseForm({ onExpenseAdded }: AddExpenseFormProps) {
    const { user } = useUser()
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Category Management State
    const [categories, setCategories] = useState<CategoryItem[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)

    useEffect(() => {
        loadData()
    }, [user])

    async function loadData() {
        if (!user) return

        // 1. Start with default categories
        const items: CategoryItem[] = defaultCategories.map(c => ({ name: c, type: 'default' }))

        // 2. Fetch custom categories
        const customRes = await getCategories(user.id)
        if (customRes.success && customRes.data) {
            customRes.data.forEach(c => {
                // Avoid duplicates if user created a custom category with same name as default (unlikely but possible)
                if (!items.some(i => i.name === c.name)) {
                    items.push({ name: c.name, id: c.id, type: 'custom' })
                }
            })
        }

        // 3. Fetch used categories from expenses to catch any historical ones
        const budgetRes = await getUserBudget(user.id)
        if (budgetRes.success && budgetRes.data) {
            const usedNames = new Set(budgetRes.data.expenses.map((e: Expense) => e.category))
            usedNames.forEach(name => {
                if (!items.some(i => i.name === name)) {
                    items.push({ name, type: 'historical' })
                }
            })
        }

        // Sort alphabetically
        items.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(items)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user || !name || !amount || !category) return

        setIsLoading(true)
        const res = await createExpense(user.id, name, parseFloat(amount), category)

        if (res.success) {
            setName('')
            setAmount('')
            setCategory('')
            onExpenseAdded()
            // Reload categories in case a new one was added (though we handle that separately now)
            loadData()
        }
        setIsLoading(false)
    }

    async function handleCreateCategory() {
        if (!user || !newCategoryName.trim()) return

        setIsCreatingCategory(true)
        const res = await createCategory(user.id, newCategoryName.trim())

        if (res.success && res.data) {
            setCategory(res.data.name)
            setNewCategoryName('')
            setIsDialogOpen(false)
            setOpen(false)
            loadData()
        }
        setIsCreatingCategory(false)
    }

    async function handleDeleteCategory(e: React.MouseEvent, id: string) {
        e.stopPropagation() // Prevent selecting the category when clicking delete
        if (!confirm('Are you sure you want to delete this category?')) return

        const res = await deleteCategory(id)
        if (res.success) {
            if (category === categories.find(c => c.id === id)?.name) {
                setCategory('')
            }
            loadData()
        }
    }

    return (
        <div className="flex gap-2 items-end">
            <form onSubmit={handleSubmit} className="contents">
                <div className="grid gap-1 flex-[2]">
                    <Input
                        placeholder="Expense Name (e.g. Rent)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="grid gap-1 flex-1">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between font-normal"
                            >
                                {category || "Select Category..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                    <CommandEmpty>
                                        <div className="p-2">
                                            <p className="text-sm text-muted-foreground mb-2">No category found.</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full h-8"
                                                onClick={() => setIsDialogOpen(true)}
                                            >
                                                Create New
                                            </Button>
                                        </div>
                                    </CommandEmpty>
                                    <CommandGroup heading="Categories">
                                        {categories.map((c) => (
                                            <CommandItem
                                                key={c.name}
                                                value={c.name}
                                                onSelect={(currentValue) => {
                                                    setCategory(c.name)
                                                    setOpen(false)
                                                }}
                                                className="flex justify-between items-center group"
                                            >
                                                <div className="flex items-center">
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            category === c.name ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {c.name}
                                                </div>
                                                {c.type === 'custom' && c.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => handleDeleteCategory(e, c.id!)}
                                                    >
                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                    </Button>
                                                )}
                                            </CommandItem>
                                        ))}
                                        <CommandItem
                                            value="create-custom-action"
                                            onSelect={() => setIsDialogOpen(true)}
                                            className="text-muted-foreground italic border-t mt-2"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New...
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid gap-1 w-32">
                    <div className="relative">
                        <span className="absolute left-2 top-2.5 text-muted-foreground">$</span>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-6"
                            required
                            step="0.01"
                        />
                    </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                </Button>
            </form>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                        <DialogDescription>
                            Add a new custom category for your expenses.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Category Name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCreateCategory()
                                }
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || isCreatingCategory}>
                            {isCreatingCategory ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
