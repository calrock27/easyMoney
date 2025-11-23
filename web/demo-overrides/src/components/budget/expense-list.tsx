'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { getUserBudget, deleteExpense } from '@/app/actions/budget'
import { AddExpenseForm } from './add-expense-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
    Trash2,
    Search,
    Filter,
    ArrowUpDown,
    Check,
    Plus
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Expense } from '@/types'
import { cn } from '@/lib/utils'

interface ExpenseListProps {
    onExpenseChange?: () => void
    className?: string
    compact?: boolean
    searchQuery?: string
    scrollable?: boolean
    refreshKey?: number
}

type SortKey = 'name' | 'amount' | 'category'
type SortOrder = 'asc' | 'desc'

export function ExpenseList({ onExpenseChange, className, compact = false, searchQuery, scrollable = false, refreshKey }: ExpenseListProps) {
    const { user } = useUser()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Sort & Filter State
    const [localSearchQuery, setLocalSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [sortKey, setSortKey] = useState<SortKey>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    // Swipe to Delete Logic (Mobile Only)
    const [deleteModeId, setDeleteModeId] = useState<string | null>(null)
    const touchStartX = useRef(0)
    const touchCurrentX = useRef(0)

    function handleTrashClick(id: string) {
        if (compact) {
            // Mobile: Toggle delete mode
            setDeleteModeId(deleteModeId === id ? null : id)
        } else {
            // Desktop: Immediate delete
            handleDelete(id)
        }
    }

    function handleTouchStart(e: React.TouchEvent, id: string) {
        if (deleteModeId !== id) return
        touchStartX.current = e.touches[0].clientX
        touchCurrentX.current = e.touches[0].clientX
    }

    function handleTouchMove(e: React.TouchEvent, id: string) {
        if (deleteModeId !== id) return
        touchCurrentX.current = e.touches[0].clientX
    }

    function handleTouchEnd(id: string) {
        if (deleteModeId !== id) return

        const diff = touchStartX.current - touchCurrentX.current
        // If swiped left significantly (> 50px)
        if (diff > 50) {
            handleDelete(id)
            setDeleteModeId(null)
        }
    }

    useEffect(() => {
        if (user) {
            loadExpenses()
        }
    }, [user, refreshKey])

    async function loadExpenses() {
        if (!user) return
        const res = await getUserBudget(user.id)
        if (res.success && res.data) {
            setExpenses(res.data.expenses)
        }
        setIsLoading(false)
    }

    async function handleDelete(id: string) {
        const res = await deleteExpense(id)
        if (res.success) {
            setExpenses(expenses.filter(e => e.id !== id))
            onExpenseChange?.()
        }
    }

    function handleExpenseAdded() {
        loadExpenses()
        onExpenseChange?.()
        setIsAddDialogOpen(false)
    }

    const uniqueCategories = useMemo(() => {
        const cats = new Set(expenses.map(e => e.category))
        return Array.from(cats).sort()
    }, [expenses])

    const filteredExpenses = useMemo(() => {
        let result = [...expenses]

        // 1. Filter by Category
        if (filterCategory !== 'all') {
            result = result.filter(e => e.category === filterCategory)
        }

        // 2. Filter by Search (using prop if provided, else local)
        const query = searchQuery !== undefined ? searchQuery : localSearchQuery
        if (query) {
            const lowerQuery = query.toLowerCase()
            result = result.filter(e =>
                e.name.toLowerCase().includes(lowerQuery) ||
                e.category.toLowerCase().includes(lowerQuery)
            )
        }

        // 3. Sort
        result.sort((a, b) => {
            let comparison = 0
            if (sortKey === 'name') {
                comparison = a.name.localeCompare(b.name)
            } else if (sortKey === 'amount') {
                comparison = a.amount - b.amount
            } else if (sortKey === 'category') {
                comparison = a.category.localeCompare(b.category)
            }
            return sortOrder === 'asc' ? comparison : -comparison
        })

        return result
    }, [expenses, filterCategory, searchQuery, localSearchQuery, sortKey, sortOrder])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortOrder('asc')
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center">Loading expenses...</div>
    }

    if (!user) return null

    return (
        <div className={cn("space-y-4 pb-20 md:pb-0", scrollable ? "flex flex-col h-full space-y-0 gap-4" : "", className)}>
            {/* Header Section (Add Form + Filters) */}
            <div className={cn("space-y-4", scrollable ? "flex-shrink-0" : "")}>
                {/* Desktop: Inline Add Form */}
                <div className="hidden md:block">
                    <AddExpenseForm onExpenseAdded={handleExpenseAdded} />
                </div>

                {/* Mobile: FAB Add Button */}
                <div className="md:hidden fixed bottom-20 right-4 z-50">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90">
                                <Plus className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] h-[80vh] sm:h-auto flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Add New Expense</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 pt-4 overflow-y-auto">
                                <AddExpenseForm onExpenseAdded={handleExpenseAdded} variant="mobile" />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Only show local search input if searchQuery prop is NOT provided */}
                    {searchQuery === undefined && (
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search expenses..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    )}

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={filterCategory} onValueChange={setFilterCategory}>
                                    <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                                    {uniqueCategories.map(cat => (
                                        <DropdownMenuRadioItem key={cat} value={cat}>
                                            {cat}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10">
                                    <ArrowUpDown className="mr-2 h-4 w-4" />
                                    Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={sortKey} onValueChange={(v) => handleSort(v as SortKey)}>
                                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="category">Category</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                                    <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Expense List */}
            <div className={cn(
                "flex flex-col gap-4",
                scrollable ? "flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2" : ""
            )}>
                {filteredExpenses.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                        No expenses found
                    </div>
                ) : (
                    filteredExpenses.map((expense) => (
                        <Card
                            key={expense.id}
                            className={cn(
                                "overflow-hidden transition-all relative flex-shrink-0", // Added flex-shrink-0
                                deleteModeId === expense.id ? "bg-destructive text-destructive-foreground" : ""
                            )}
                            onTouchStart={(e) => handleTouchStart(e, expense.id)}
                            onTouchMove={(e) => handleTouchMove(e, expense.id)}
                            onTouchEnd={() => handleTouchEnd(expense.id)}
                            onClick={() => setDeleteModeId(null)}
                        >
                            {/* Swipe Instruction Overlay */}
                            {deleteModeId === expense.id && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                    <span className="text-destructive-foreground text-lg font-bold animate-pulse flex items-center">
                                        Swipe left to delete <Trash2 className="ml-2 h-5 w-5" />
                                    </span>
                                </div>
                            )}

                            <CardContent className={cn(
                                "p-4 flex items-center justify-between relative z-10 transition-opacity",
                                deleteModeId === expense.id ? "opacity-10" : "opacity-100"
                            )}>
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium truncate">{expense.name}</h3>
                                        <span className={cn(
                                            "font-bold whitespace-nowrap ml-2",
                                            deleteModeId === expense.id ? "text-destructive-foreground" : "text-destructive"
                                        )}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(expense.amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="truncate bg-muted px-2 py-0.5 rounded-full">
                                            {expense.category}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 flex-shrink-0 transition-colors",
                                        deleteModeId === expense.id
                                            ? "text-destructive-foreground hover:bg-white/20"
                                            : "text-muted-foreground hover:text-destructive"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleTrashClick(expense.id)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div >
    )
}
