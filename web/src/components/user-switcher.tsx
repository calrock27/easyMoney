'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/user-provider'
import { getUsers, createUser } from '@/app/actions/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { User } from '@prisma/client'
import { Plus, User as UserIcon, ArrowRight } from 'lucide-react'

export function UserSwitcher() {
    const { setUser } = useUser()
    const [users, setUsers] = useState<User[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newUserName, setNewUserName] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setIsLoading(true)
        const res = await getUsers()
        if (res.success && res.data) {
            setUsers(res.data)
        }
        setIsLoading(false)
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault()
        if (!newUserName.trim()) return

        const res = await createUser(newUserName)
        if (res.success && res.data) {
            setUsers([res.data, ...users])
            setUser(res.data)
            setNewUserName('')
            setIsCreating(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading profiles...</div>
    }

    return (
        <div className="flex min-h-screen items-start md:items-center justify-center bg-background p-4 pt-20 md:pt-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        {isCreating ? 'Create Profile' : 'Who is spending?'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isCreating ? (
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input
                                placeholder="Enter your name"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setIsCreating(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Create
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                {users.map((user) => (
                                    <Button
                                        key={user.id}
                                        variant="outline"
                                        className="h-14 justify-between px-4 text-lg"
                                        onClick={() => setUser(user)}
                                    >
                                        <span className="flex items-center gap-3">
                                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                                            {user.name}
                                        </span>
                                        <ArrowRight className="h-4 w-4 opacity-50" />
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full gap-2 border-dashed border-2 h-12"
                                onClick={() => setIsCreating(true)}
                            >
                                <Plus className="h-4 w-4" />
                                New Profile
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
