'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@/components/providers/user-provider'

import { createExpense } from '@/app/actions/budget'
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
    variant?: 'default' | 'mobile'
}

type CategoryItem = {
    name: string
    id?: string
    type: 'default' | 'custom'
}

export function AddExpenseForm({ onExpenseAdded, variant = 'default' }: AddExpenseFormProps) {
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

    // Long press logic
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)
    const isLongPressing = useRef(false)

    function handleTouchStart(categoryItem: CategoryItem) {
        if (categoryItem.type !== 'custom' || !categoryItem.id) return

        isLongPressing.current = false
        longPressTimer.current = setTimeout(() => {
            isLongPressing.current = true
            if (confirm(`Delete category "${categoryItem.name}"?`)) {
                // We can't pass the event here easily, so we just call the logic directly
                deleteCategory(categoryItem.id!).then(res => {
                    if (res.success) {
                        if (category === categoryItem.name) {
                            setCategory('')
                        }
                        loadData()
                    }
                })
            }
        }, 600) // 600ms long press
    }

    function handleTouchEnd() {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }

    function handleTouchMove() {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }

    if (variant === 'mobile') {
        return (
            <div className="flex flex-col h-full">
                <form onSubmit={handleSubmit} className="flex flex-col h-full gap-2">
                    {/* Large Amount Input */}
                    <div className="flex justify-center py-4 shrink-0">
                        <div className="relative inline-block">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground -ml-5">$</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-4xl font-bold text-center h-auto border-none bg-transparent focus-visible:ring-0 p-0 w-40 placeholder:text-muted-foreground/20"
                                required
                                step="0.01"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="shrink-0">
                        <Input
                            placeholder="What is this for? (e.g. Dinner)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-muted/50 border-0 h-10 text-base"
                        />
                    </div>

                    {/* Category Selection - Horizontal Pills */}
                    <div className="space-y-1 flex-1 min-h-0 flex flex-col">
                        <div className="flex justify-between items-center ml-1 shrink-0">
                            <label className="text-xs font-medium text-muted-foreground">Category</label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-primary px-2"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <Plus className="h-3 w-3 mr-1" /> New
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 overflow-y-auto p-1 content-start">
                            {categories.map((c) => (
                                <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => {
                                        if (!isLongPressing.current) {
                                            setCategory(c.name)
                                        }
                                    }}
                                    onTouchStart={() => handleTouchStart(c)}
                                    onTouchEnd={handleTouchEnd}
                                    onTouchMove={handleTouchMove}
                                    // Mouse events for desktop testing of long press (optional, but helpful)
                                    onMouseDown={() => handleTouchStart(c)}
                                    onMouseUp={handleTouchEnd}
                                    onMouseLeave={handleTouchEnd}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border shrink-0 select-none",
                                        category === c.name
                                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                            : "bg-background hover:bg-muted border-border text-foreground"
                                    )}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} size="lg" className="w-full mt-2 text-base h-11 rounded-xl shrink-0">
                        {isLoading ? "Adding..." : "Add Expense"}
                    </Button>
                </form>

                {/* Create Category Dialog (Mobile Optimized) */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="top-[20%] translate-y-0 sm:top-[50%] sm:-translate-y-1/2 gap-2">
                        <DialogHeader className="space-y-1">
                            <DialogTitle>New Category</DialogTitle>
                            <DialogDescription className="text-xs">
                                Create a custom category.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                            <Input
                                placeholder="Category Name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateCategory()
                                    }
                                }}
                                className="h-10"
                            />
                        </div>
                        <DialogFooter className="flex-row gap-2 sm:justify-end">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 sm:flex-none h-9">Cancel</Button>
                            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || isCreatingCategory} className="flex-1 sm:flex-none h-9">
                                {isCreatingCategory ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )
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
