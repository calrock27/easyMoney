'use client'

import { useState, useRef } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { updateCurrency, importData, clearData } from '@/app/actions/settings'
import { deleteUser } from '@/app/actions/user'
import { getUserBudget } from '@/app/actions/budget'
import { getCategories } from '@/app/actions/categories'
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
import { Settings, Upload, Download, Save, Check, ChevronsUpDown, Trash2 } from 'lucide-react'
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

export function SettingsDialog({ trigger }: { trigger?: React.ReactNode }) {
    const { user, setUser } = useUser()
    const [open, setOpen] = useState(false)
    const [currency, setCurrency] = useState(user?.currency || 'USD')
    const [isLoading, setIsLoading] = useState(false)
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false)
    const [confirmUsername, setConfirmUsername] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!user) return null

    async function handleSaveCurrency(newCurrency: string) {
        setIsLoading(true)
        try {
            const res = await updateCurrency(user!.id, newCurrency)
            if (res.success) {
                setCurrency(newCurrency)
                setUser({ ...user!, currency: newCurrency })
                setOpen(false)
            } else {
                alert('Failed to update currency: ' + res.error)
            }
        } catch (error) {
            alert('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleExport() {
        setIsLoading(true)
        try {
            const res = await getUserBudget(user!.id)
            const catRes = await getCategories(user!.id)

            if (res.success && res.data) {
                const fullUser = res.data
                const data = {
                    income: fullUser.income,
                    currency: fullUser.currency,
                    expenses: fullUser.expenses.map(e => ({
                        name: e.name,
                        amount: e.amount,
                        category: e.category
                    })),
                    categories: catRes.success && catRes.data ? catRes.data.map(c => c.name) : []
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
            } else {
                alert('Failed to export data')
            }
        } catch (error) {
            alert('An unexpected error occurred during export')
        } finally {
            setIsLoading(false)
        }
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

    async function handleClearData() {
        if (confirmUsername.toLowerCase() !== user!.name.toLowerCase()) return

        setIsLoading(true)
        const res = await clearData(user!.id)
        if (res.success) {
            setIsClearDialogOpen(false)
            setConfirmUsername('')
            setOpen(false)
            window.location.reload()
        } else {
            alert('Failed to clear data: ' + res.error)
        }
        setIsLoading(false)
    }

    async function handleDeleteAccount() {
        if (confirmUsername.toLowerCase() !== user!.name.toLowerCase()) return

        setIsLoading(true)
        const res = await deleteUser(user!.id)
        if (res.success) {
            localStorage.removeItem('static_budget_user_id')
            setIsDeleteAccountDialogOpen(false)
            setConfirmUsername('')
            setOpen(false)
            window.location.reload()
        } else {
            alert('Failed to delete account: ' + res.error)
        }
        setIsLoading(false)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="icon" title="Settings">
                        <Settings className="h-4 w-4" />
                    </Button>
                )}
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

                    <div className="border-t" />

                    {/* Danger Zone */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                        <div className="grid gap-2">
                            <Button
                                variant="outline"
                                className="w-full gap-2 text-destructive hover:text-destructive"
                                onClick={() => setIsClearDialogOpen(true)}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear All Data
                            </Button>
                            <Button
                                variant="destructive"
                                className="w-full gap-2"
                                onClick={() => setIsDeleteAccountDialogOpen(true)}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Clear data resets your budget. Delete account removes you completely.
                        </p>
                    </div>

                </div>
            </DialogContent>

            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Data?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete all expenses and reset your income. Your account will remain.
                            <br /><br />
                            Please type <span className="font-bold">{user.name}</span> to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Type your username"
                            value={confirmUsername}
                            onChange={(e) => setConfirmUsername(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleClearData}
                            disabled={confirmUsername.toLowerCase() !== user.name.toLowerCase() || isLoading}
                        >
                            {isLoading ? 'Clearing...' : 'Clear Data'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and all associated data.
                            <br /><br />
                            Please type <span className="font-bold">{user.name}</span> to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Type your username"
                            value={confirmUsername}
                            onChange={(e) => setConfirmUsername(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteAccountDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={confirmUsername.toLowerCase() !== user.name.toLowerCase() || isLoading}
                        >
                            {isLoading ? 'Deleting...' : 'Delete Account'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    )
}
