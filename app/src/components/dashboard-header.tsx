'use client'

import { useUser } from '@/components/providers/user-provider'
import { useTheme } from "next-themes"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { SettingsDialog } from '@/components/settings-dialog'
import { LogOut, Printer, Settings, Moon, Sun, Laptop, Search, X, Plus } from 'lucide-react'
import { MountFuji } from '@/components/icons/mount-fuji'
import { Logo } from '@/components/logo'
import { DemoTimer } from '@/components/demo-timer'
import Link from 'next/link'
import { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
    userName: string
    compact?: boolean
    searchQuery?: string
    onSearchChange?: (query: string) => void
    showSearch?: boolean
    isSearchOpen?: boolean
    onSearchOpenChange?: (isOpen: boolean) => void
    onAddClick?: () => void
    showAddButton?: boolean
    isDemoMode?: boolean
}

export function DashboardHeader({
    userName,
    compact = false,
    searchQuery,
    onSearchChange,
    showSearch = true,
    isSearchOpen: controlledIsSearchOpen,
    onSearchOpenChange,
    onAddClick,
    showAddButton = false,
    isDemoMode = false
}: DashboardHeaderProps) {
    const { setUser } = useUser()
    const { setTheme } = useTheme()

    const [internalIsSearchOpen, setInternalIsSearchOpen] = useState(false)
    const isSearchOpen = controlledIsSearchOpen ?? internalIsSearchOpen
    const setIsSearchOpen = onSearchOpenChange ?? setInternalIsSearchOpen

    if (compact) {
        return (
            <div className="flex flex-shrink-0 justify-between items-center gap-2 mb-3 h-10">
                {isSearchOpen ? (
                    <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                autoFocus
                                placeholder="Search expenses..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 flex-shrink-0"
                            onClick={() => {
                                setIsSearchOpen(false)
                                onSearchChange?.('')
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Logo variant="icon-only" size="sm" className="flex-shrink-0" />
                            <h1 className="text-lg font-bold tracking-tight truncate">Welcome, {userName}</h1>
                        </div>

                        <div className="flex items-center gap-1">
                            {isDemoMode && <DemoTimer />}
                            {showAddButton && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0"
                                    onClick={onAddClick}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            )}

                            {showSearch && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0"
                                    onClick={() => setIsSearchOpen(true)}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="flex-shrink-0">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Theme</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        <Sun className="mr-2 h-4 w-4" />
                                        Light
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        <Moon className="mr-2 h-4 w-4" />
                                        Dark
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("tokyo")}>
                                        <MountFuji className="mr-2 h-4 w-4" />
                                        Tokyo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        <Laptop className="mr-2 h-4 w-4" />
                                        System
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>

                                    <SettingsDialog
                                        trigger={
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </DropdownMenuItem>
                                        }
                                    />

                                    <Link href="/print" className="w-full">
                                        <DropdownMenuItem>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print Report
                                        </DropdownMenuItem>
                                    </Link>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setUser(null)} className="text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Switch User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-shrink-0 justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                <Logo className="hidden md:flex" />
                <div className="h-8 w-px bg-border hidden md:block" />
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
                    <p className="text-muted-foreground">Here's your budget</p>
                </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
                {isDemoMode && <DemoTimer />}
                <ThemeToggle />
                <SettingsDialog />
                <Link href="/print">
                    <Button variant="outline" size="icon" title="Print Report">
                        <Printer className="h-4 w-4" />
                    </Button>
                </Link>
                <Button variant="outline" onClick={() => setUser(null)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Switch User
                </Button>
            </div>

            {/* Mobile Actions Menu */}
            <div className="md:hidden flex items-center gap-2">
                {isDemoMode && <DemoTimer />}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Theme</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("tokyo")}>
                            <MountFuji className="mr-2 h-4 w-4" />
                            Tokyo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Laptop className="mr-2 h-4 w-4" />
                            System
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>

                        <SettingsDialog
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                            }
                        />

                        <Link href="/print" className="w-full">
                            <DropdownMenuItem>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </DropdownMenuItem>
                        </Link>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setUser(null)} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Switch User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
