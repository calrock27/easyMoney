'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { createExpense } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown, Plus } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { defaultCategories } from "@/lib/categories"

interface AddExpenseFormProps {
    onExpenseAdded: () => void
}

export function AddExpenseForm({ onExpenseAdded }: AddExpenseFormProps) {
    const { user } = useUser()
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [categories, setCategories] = useState<string[]>(defaultCategories)

    useEffect(() => {
        if (user?.expenses) {
            const usedCategories = Array.from(new Set(user.expenses.map(e => e.category)))
            setCategories(prev => Array.from(new Set([...defaultCategories, ...usedCategories])).sort())
        }
    }, [user])

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
        }
        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
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
                            <CommandInput placeholder="Search or create..." />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="p-2">
                                        <p className="text-sm text-muted-foreground mb-2">No category found.</p>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full h-8"
                                            onClick={() => {
                                                // Fallback for when CommandEmpty shows (no match)
                                                const newCat = prompt("Enter new category name:")
                                                if (newCat) {
                                                    setCategory(newCat)
                                                    setCategories(prev => [...prev, newCat].sort())
                                                    setOpen(false)
                                                }
                                            }}
                                        >
                                            Create New
                                        </Button>
                                    </div>
                                </CommandEmpty>
                                <CommandGroup heading="Categories">
                                    {categories.map((c) => (
                                        <CommandItem
                                            key={c}
                                            value={c}
                                            onSelect={(currentValue) => {
                                                // Use the actual category name 'c' to avoid lowercase issues
                                                setCategory(c)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    category === c ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {c}
                                        </CommandItem>
                                    ))}
                                    <CommandItem
                                        value="create-custom"
                                        onSelect={() => {
                                            const newCat = prompt("Enter new category name:")
                                            if (newCat) {
                                                setCategory(newCat)
                                                setCategories(prev => [...prev, newCat].sort())
                                                setOpen(false)
                                            }
                                        }}
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
    )
}
