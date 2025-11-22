'use client'

import { useEffect, useState, useRef } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { getUserBudget } from '@/app/actions/budget'
import { IncomeInput } from '@/components/budget/income-input'
import { ExpenseList } from '@/components/budget/expense-list'
import { BudgetChart } from '@/components/budget/budget-chart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet } from 'lucide-react'

export function Dashboard() {
    const { user } = useUser()
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [refreshKey, setRefreshKey] = useState(0)

    // Lifted state for BudgetChart synchronization
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [excludedItems, setExcludedItems] = useState<string[]>([])
    const [viewMode, setViewMode] = useState<'category' | 'expense'>('category')

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('chart')

    function handleTabChange(value: string) {
        setActiveTab(value)
        setIsSearchOpen(false)
    }

    // Ref for scroll passthrough
    const listRef = useRef<HTMLDivElement>(null)
    const touchStartY = useRef(0)

    useEffect(() => {
        if (user) {
            loadTotalExpenses()
        }
    }, [user, refreshKey])

    async function loadTotalExpenses() {
        if (!user) return
        const res = await getUserBudget(user.id)
        if (res.success && res.data) {
            const total = res.data.expenses.reduce((acc, curr) => acc + curr.amount, 0)
            setTotalExpenses(total)
        }
    }

    function handleExpenseChange() {
        setRefreshKey(prev => prev + 1)
    }

    // Scroll Passthrough Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!listRef.current) return
        const touchY = e.touches[0].clientY
        const deltaY = touchStartY.current - touchY
        listRef.current.scrollTop += deltaY
        touchStartY.current = touchY
    }

    const handleWheel = (e: React.WheelEvent) => {
        if (!listRef.current) return
        listRef.current.scrollTop += e.deltaY
    }

    if (!user) return null

    const disposableIncome = user.income - totalExpenses
    const percentSpent = user.income > 0 ? (totalExpenses / user.income) * 100 : 0

    return (
        <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
            <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full overflow-hidden">
                {/* Desktop Header - Fixed at top */}
                <div className="hidden md:block p-4 md:p-8 pb-0">
                    <DashboardHeader userName={user.name} />
                </div>

                {/* Mobile View - Bottom navigation */}
                <div className="md:hidden flex-1 flex flex-col overflow-hidden">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 p-4 pb-2">
                        <DashboardHeader
                            userName={user.name}
                            compact
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            showSearch={activeTab === 'expenses'}
                            isSearchOpen={isSearchOpen}
                            onSearchOpenChange={setIsSearchOpen}
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
                        {/* Tab Content - fills space between header and bottom tabs */}
                        <div className="flex-1 overflow-hidden pb-16">
                            {/* Chart Tab: Fixed chart + scrollable category list */}
                            <TabsContent value="chart" className="mt-0 h-full flex flex-col overflow-hidden">
                                {/* Fixed Chart Section - 60% height */}
                                <div
                                    className="h-[60%] flex-shrink-0 px-4 overflow-hidden touch-none"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onWheel={handleWheel}
                                >
                                    <BudgetChart
                                        refreshKey={refreshKey}
                                        compact
                                        chartOnly
                                        // Controlled state
                                        excludedItems={excludedItems}
                                        onExcludedItemsChange={setExcludedItems}
                                        viewMode={viewMode}
                                        onViewModeChange={setViewMode}
                                        activeCategory={activeCategory}
                                        onActiveCategoryChange={setActiveCategory}
                                    />
                                </div>

                                {/* Scrollable Category List - 40% height */}
                                <div
                                    ref={listRef}
                                    className="h-[40%] flex-shrink-0 overflow-y-auto px-4"
                                >
                                    <BudgetChart
                                        refreshKey={refreshKey}
                                        compact
                                        listOnly
                                        // Controlled state
                                        excludedItems={excludedItems}
                                        onExcludedItemsChange={setExcludedItems}
                                        viewMode={viewMode}
                                        onViewModeChange={setViewMode}
                                        activeCategory={activeCategory}
                                        onActiveCategoryChange={setActiveCategory}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="summary" className="space-y-4 mt-0 p-4 h-full overflow-y-auto">
                                <IncomeInput />
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-destructive">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(totalExpenses)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {percentSpent.toFixed(1)}% of income
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className={disposableIncome >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Left to Spend</CardTitle>
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${disposableIncome >= 0 ? "text-primary" : "text-destructive"}`}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(disposableIncome)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Disposable monthly income
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="expenses" className="mt-0 p-4 h-full overflow-y-auto">
                                <ExpenseList
                                    onExpenseChange={handleExpenseChange}
                                    searchQuery={searchQuery}
                                    compact
                                />
                            </TabsContent>
                        </div>

                        {/* Fixed Bottom Tabs */}
                        <TabsList className="grid w-full grid-cols-3 flex-shrink-0 rounded-none border-t fixed bottom-0 left-0 right-0 h-16 bg-background">
                            <TabsTrigger value="chart" className="h-full">Chart</TabsTrigger>
                            <TabsTrigger value="summary" className="h-full">Summary</TabsTrigger>
                            <TabsTrigger value="expenses" className="h-full">Expenses</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Desktop Grid View */}
                <div className="hidden md:flex flex-1 flex-col overflow-hidden p-4 md:p-8 pt-4">
                    <div className="flex-shrink-0 grid gap-4 md:grid-cols-3 mb-4">
                        <IncomeInput />

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(totalExpenses)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {percentSpent.toFixed(1)}% of income
                                </p>
                            </CardContent>
                        </Card>

                        <Card className={disposableIncome >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Left to Spend</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${disposableIncome >= 0 ? "text-primary" : "text-destructive"}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency }).format(disposableIncome)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Disposable monthly income
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Desktop Main Content */}
                    <div className="flex-1 min-h-0 flex gap-4 mt-4">
                        <ExpenseList
                            onExpenseChange={handleExpenseChange}
                            className="flex-[2] h-full min-h-0"
                            scrollable
                        />
                        <div className="flex-1 h-full min-h-0">
                            <BudgetChart
                                refreshKey={refreshKey}
                                className="h-full"
                                flexList
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
