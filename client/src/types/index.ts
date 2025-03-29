import { ReactNode } from "react"

export interface LoginSignUpProps{
    toggleForm: () => void
}

export interface ProtectedRouteProps{
    children: ReactNode
}
