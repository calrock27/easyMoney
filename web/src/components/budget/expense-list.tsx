'use client'

import { useState, useEffect, useMemo } from 'react'
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
    Check
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
import { Expense } from '@prisma/client'

interface ExpenseListProps {
    onExpenseChange?: () => void
}

type SortKey = 'name' | 'amount' | 'category'
type SortOrder = 'asc' | 'desc'

export function ExpenseList({ onExpenseChange }: ExpenseListProps) {
    const { user } = useUser()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Sort & Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [sortKey, setSortKey] = useState<SortKey>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    useEffect(() => {
        if (user) {
            loadExpenses()
        }
    }, [user])

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

        // 2. Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(e =>
                e.name.toLowerCase().includes(lowerQuery) ||
                e.category.toLowerCase().includes(lowerQuery)
            )
        }

        // 3. Sort
        result.sort((a, b) => {
            let cmp = 0
            if (sortKey === 'amount') {
                cmp = a.amount - b.amount
            } else {
                cmp = a[sortKey].localeCompare(b[sortKey])
            }
            return sortOrder === 'asc' ? cmp : -cmp
        })

        return result
    }, [expenses, filterCategory, searchQuery, sortKey, sortOrder])

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)

    if (!user) return null

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Monthly Expenses</span>
                    <span className="text-muted-foreground font-normal text-base">
                        Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(totalExpenses)}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <AddExpenseForm onExpenseAdded={handleExpenseAdded} />

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className={filterCategory !== 'all' ? "bg-accent text-accent-foreground" : ""}>
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
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

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={sortKey} onValueChange={(val) => setSortKey(val as SortKey)}>
                                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="category">Category</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={sortOrder} onValueChange={(val) => setSortOrder(val as SortOrder)}>
                                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-2">
                    {filteredExpenses.map((expense) => (
                        <div
                            key={expense.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium">{expense.name}</span>
                                <span className="text-xs text-muted-foreground">{expense.category}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(expense.amount)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(expense.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {expenses.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No expenses added yet. Add your fixed monthly bills above.
                        </div>
                    )}
                    {expenses.length > 0 && filteredExpenses.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No expenses match your search/filter.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
