'use client'

import { useState, useRef } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { updateCurrency, importData } from '@/app/actions/settings'
import { getUserBudget } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Upload, Download, Save, Check, ChevronsUpDown } from 'lucide-react'
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
import { currencies } from "@/lib/currencies"

export function SettingsDialog() {
    const { user, setUser } = useUser()
    const [open, setOpen] = useState(false)
    const [currency, setCurrency] = useState(user?.currency || 'USD')
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!user) return null

    async function handleSaveCurrency(newCurrency: string) {
        setIsLoading(true)
        const res = await updateCurrency(user!.id, newCurrency)
        if (res.success) {
            setCurrency(newCurrency)
            setUser({ ...user!, currency: newCurrency })
        }
        setIsLoading(false)
        setOpen(false)
    }

    async function handleExport() {
        setIsLoading(true)
        const res = await getUserBudget(user!.id)

        if (res.success && res.data) {
            const fullUser = res.data
            const data = {
                income: fullUser.income,
                currency: fullUser.currency,
                expenses: fullUser.expenses.map(e => ({
                    name: e.name,
                    amount: e.amount,
                    category: e.category
                }))
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `budget-${fullUser.name}-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
        setIsLoading(false)
    }

    async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        const reader = new FileReader()
        reader.onload = async (event) => {
            const text = event.target?.result as string
            const res = await importData(user!.id, text)
            if (res.success) {
                window.location.reload()
            } else {
                alert('Import failed: ' + res.error)
            }
            setIsLoading(false)
        }
        reader.readAsText(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your preferences and data.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    {/* Currency Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Currency</h3>
                        <Popover open={open} onOpenChange={setOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {currency
                                        ? currencies.find((c) => c.value === currency)?.label || currency
                                        : "Select currency..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search currency..." />
                                    <CommandList>
                                        <CommandEmpty>No currency found.</CommandEmpty>
                                        <CommandGroup>
                                            {currencies.map((c) => (
                                                <CommandItem
                                                    key={c.value}
                                                    value={c.label}
                                                    onSelect={() => handleSaveCurrency(c.value)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            currency === c.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {c.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="border-t" />

                    {/* Data Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Data Management</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 gap-2" onClick={handleExport} disabled={isLoading}>
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button variant="outline" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                <Upload className="h-4 w-4" />
                                Import
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json"
                                onChange={handleImport}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Export your budget to JSON or import a backup. Importing will overwrite current data.
                        </p>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
