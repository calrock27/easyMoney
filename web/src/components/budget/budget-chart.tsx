'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { getUserBudget } from '@/app/actions/budget'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Expense } from '@prisma/client'
import { cn } from '@/lib/utils'
import { RotateCcw, Banknote, PieChart as PieChartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COLORS = [
    '#0ea5e9', // sky-500
    '#22c55e', // green-500
    '#eab308', // yellow-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
]

export function BudgetChart({ refreshKey }: { refreshKey?: number }) {
    const { user } = useUser()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [excludedItems, setExcludedItems] = useState<string[]>([])
    const [viewMode, setViewMode] = useState<'category' | 'expense'>('category')

    useEffect(() => {
        if (user) {
            loadData()
        }
    }, [user, refreshKey])

    async function loadData() {
        if (!user) return
        const res = await getUserBudget(user.id)
        if (res.success && res.data) {
            setExpenses(res.data.expenses)
        }
    }

    // Create a stable color map based on the full list of expenses
    const categoryColorMap = useMemo(() => {
        const map: Record<string, string> = {}

        // Aggregate expenses by category first
        const aggregated = expenses.reduce((acc: Record<string, number>, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount
            return acc
        }, {})

        // Sort categories by value descending
        const sortedCategories = Object.entries(aggregated)
            .sort(([, a], [, b]) => b - a)
            .map(([category]) => category)

        // Assign colors
        sortedCategories.forEach((category, index) => {
            map[category] = COLORS[index % COLORS.length]
        })
        return map
    }, [expenses])

    const chartData = useMemo(() => {
        let data: any[] = []

        if (viewMode === 'category') {
            data = expenses.reduce((acc: any[], curr) => {
                const existing = acc.find(item => item.name === curr.category)
                if (existing) {
                    existing.value += curr.amount
                } else {
                    acc.push({ name: curr.category, value: curr.amount, isUnallocated: false, type: 'category' })
                }
                return acc
            }, [])
        } else {
            data = expenses.map(expense => ({
                name: expense.name,
                value: expense.amount,
                isUnallocated: false,
                type: 'expense',
                id: expense.id,
                category: expense.category
            }))
        }

        // Sort by value descending
        const sortedData = data.sort((a: any, b: any) => b.value - a.value)

        // Filter out excluded items for the chart
        const activeData = sortedData.filter((item: any) => {
            const key = viewMode === 'category' ? item.name : item.id
            return !excludedItems.includes(key)
        })

        if (user) {
            // Recalculate unallocated with excluded amounts added back
            // For unallocated calculation, we need the TOTAL of active items
            const totalActiveValue = activeData.reduce((sum: number, item: any) => sum + item.value, 0)
            const newUnallocated = user.income - totalActiveValue

            if (newUnallocated > 0) {
                return [...activeData, { name: 'Unallocated', value: newUnallocated, isUnallocated: true }]
            } else if (newUnallocated < 0) {
                return [...activeData, { name: 'Over Budget', value: Math.abs(newUnallocated), isOverBudget: true }]
            }
        }

        return activeData
    }, [expenses, user, excludedItems, viewMode])

    const toggleItem = (item: any) => {
        if (item.name === 'Unallocated' || item.name === 'Over Budget') return

        const key = viewMode === 'category' ? item.name : item.id

        setExcludedItems(prev => {
            if (prev.includes(key)) {
                return prev.filter(c => c !== key)
            } else {
                return [...prev, key]
            }
        })
    }

    // Calculate full list for the breakdown view (including excluded items)
    const fullBreakdownData = useMemo(() => {
        let data: any[] = []

        if (viewMode === 'category') {
            data = expenses.reduce((acc: any[], curr) => {
                const existing = acc.find(item => item.name === curr.category)
                if (existing) {
                    existing.value += curr.amount
                } else {
                    acc.push({ name: curr.category, value: curr.amount, isUnallocated: false, type: 'category' })
                }
                return acc
            }, [])
        } else {
            data = expenses.map(expense => ({
                name: expense.name,
                value: expense.amount,
                isUnallocated: false,
                type: 'expense',
                id: expense.id,
                category: expense.category
            }))
        }

        const sortedData = data.sort((a: any, b: any) => b.value - a.value)

        if (user) {
            // Calculate unallocated based on TOTAL income minus TOTAL active expenses
            const activeData = sortedData.filter((item: any) => {
                const key = viewMode === 'category' ? item.name : item.id
                return !excludedItems.includes(key)
            })

            const totalActiveValue = activeData.reduce((sum: number, item: any) => sum + item.value, 0)
            const unallocatedAmount = user.income - totalActiveValue

            if (unallocatedAmount > 0) {
                return [{ name: 'Unallocated', value: unallocatedAmount, isUnallocated: true }, ...sortedData]
            } else if (unallocatedAmount < 0) {
                return [{ name: 'Over Budget', value: Math.abs(unallocatedAmount), isOverBudget: true }, ...sortedData]
            }
        }

        return sortedData
    }, [expenses, user, excludedItems, viewMode])

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0)
    const totalSpent = expenses
        .filter(expense => {
            if (viewMode === 'category') {
                return !excludedItems.includes(expense.category)
            } else {
                return !excludedItems.includes(expense.id)
            }
        })
        .reduce((acc, curr) => acc + curr.amount, 0)

    const activeItem = activeCategory ? chartData.find(item => item.name === activeCategory) : null
    const isOverBudget = user && totalSpent > user.income

    if (!user || (expenses.length === 0 && user.income === 0)) return (
        <Card className="h-[400px] flex items-center justify-center text-muted-foreground">
            No data to display
        </Card>
    )

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle>Spending Breakdown</CardTitle>
                    <CardDescription>
                        Interactive view of your monthly expenses
                    </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setViewMode(prev => prev === 'category' ? 'expense' : 'category')
                            setExcludedItems([])
                        }}
                        title={viewMode === 'category' ? "Show Expenses" : "Show Categories"}
                    >
                        {viewMode === 'category' ? <Banknote className="h-4 w-4" /> : <PieChartIcon className="h-4 w-4" />}
                    </Button>
                    {excludedItems.length > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setExcludedItems([])}
                            title="Reset Exclusions"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-8 items-center justify-center p-6">

                {/* Donut Chart Section */}
                <div className="relative w-[250px] h-[250px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                onMouseEnter={(_, index) => {
                                    // Recharts passes the payload in the event, but we can also just use the index to look up in chartData
                                    // However, we want to use the name.
                                    // Let's rely on the Cell's onMouseEnter which we set below.
                                }}
                                onMouseLeave={() => setActiveCategory(null)}
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isUnallocated ? '#e2e8f0' : (entry.type === 'expense' ? categoryColorMap[entry.category] : categoryColorMap[entry.name])}
                                        className={cn(
                                            "transition-all duration-300 cursor-pointer",
                                            activeCategory === entry.name ? "opacity-100 stroke-4" : "opacity-80 hover:opacity-100"
                                        )}
                                        stroke={activeCategory === entry.name ? "hsl(var(--background))" : "none"}
                                        onClick={() => toggleItem(entry)}
                                        onMouseEnter={() => setActiveCategory(entry.name)}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {activeItem ? (
                            <>
                                <span className="text-sm text-muted-foreground font-medium">
                                    {activeItem.name}
                                </span>
                                <span className="text-2xl font-bold">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: user.currency,
                                        maximumFractionDigits: 0
                                    }).format(activeItem.value)}
                                </span>
                            </>
                        ) : isOverBudget ? (
                            <>
                                <span className="text-sm font-medium text-red-500">
                                    Over Budget
                                </span>
                                <span className="text-2xl font-bold text-red-500">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: user.currency,
                                        maximumFractionDigits: 0
                                    }).format(totalSpent)}
                                </span>
                                <span className="text-xs text-red-400/80">
                                    by {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: user.currency,
                                        maximumFractionDigits: 0
                                    }).format(totalSpent - user.income)}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm text-muted-foreground font-medium">
                                    {excludedItems.length > 0 ? 'Total Estimated Spend' : 'Total Spent'}
                                </span>
                                <span className="text-2xl font-bold">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: user.currency,
                                        maximumFractionDigits: 0
                                    }).format(totalSpent)}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Breakdown List Section */}
                <div className="flex-1 w-full space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    {fullBreakdownData.map((item, index) => {
                        const key = viewMode === 'category' ? item.name : item.id
                        const isExcluded = excludedItems.includes(key)
                        const percentage = (item.value / (user.income || totalSpent)) * 100
                        const isHovered = activeCategory === item.name
                        const color = item.isUnallocated ? '#e2e8f0' : (item.isOverBudget ? '#ef4444' : (item.type === 'expense' ? categoryColorMap[item.category] : categoryColorMap[item.name]))

                        return (
                            <div
                                key={item.id || item.name}
                                className={cn(
                                    "group flex flex-col gap-1 p-2 rounded-lg transition-colors cursor-pointer",
                                    isHovered ? "bg-accent" : "hover:bg-accent/50",
                                    isExcluded && "opacity-50 grayscale",
                                    item.isOverBudget && "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                                )}
                                onMouseEnter={() => !item.isOverBudget && setActiveCategory(item.name)}
                                onMouseLeave={() => setActiveCategory(null)}
                                onClick={() => !item.isOverBudget && toggleItem(item)}
                            >
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className={cn("font-medium truncate max-w-[150px]", item.isOverBudget && "text-red-600 dark:text-red-400")} title={item.name}>{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {!item.isOverBudget && (
                                            <span className="text-muted-foreground">
                                                {percentage.toFixed(1)}%
                                            </span>
                                        )}
                                        <span className={cn("font-bold w-20 text-right", item.isOverBudget && "text-red-600 dark:text-red-400")}>
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: user.currency
                                            }).format(item.value)}
                                        </span>
                                    </div>
                                </div>
                                {!item.isOverBudget && (
                                    <Progress
                                        value={percentage}
                                        className="h-1.5"
                                        indicatorColor={color}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>

            </CardContent>
        </Card >
    )
}
