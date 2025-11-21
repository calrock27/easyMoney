'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@prisma/client'
import { getUser } from '@/app/actions/user'

interface UserContextType {
    user: User | null
    setUser: (user: User | null) => void
    isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function restoreUser() {
            const storedUserId = localStorage.getItem('static_budget_user_id')
            if (storedUserId) {
                const res = await getUser(storedUserId)
                if (res.success && res.data) {
                    setUser(res.data)
                } else {
                    localStorage.removeItem('static_budget_user_id')
                }
            }
            setIsLoading(false)
        }
        restoreUser()
    }, [])

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser)
        if (newUser) {
            localStorage.setItem('static_budget_user_id', newUser.id)
        } else {
            localStorage.removeItem('static_budget_user_id')
        }
    }

    return (
        <UserContext.Provider value={{ user, setUser: handleSetUser, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
