import { ReactNode } from "react"

export interface LoginSignUpProps{
    toggleForm: () => void
}

export interface ProtectedRouteProps{
    children: ReactNode
}

// Toast options
export const successToastOptions = {
    style: {
      border: '4px solid #0d542b',
      padding: '10px',
      color: '#0d542b',
      backgroundColor: '#ffffff',
    },
    iconTheme: {
      primary: '#0d542b',
      secondary: '#ffffff',
    },
};

export const errorToastOptions = {
    style: {
      border: '4px solid #c42501',
      padding: '10px',
      color: '#c42501',
      backgroundColor: '#ffffff',
    },
    iconTheme: {
      primary: '#c42501',
      secondary: '#ffffff',
    },
};

export const invalidPaawordOptions = {
    style: {
        border: '4px solid #c42501',
        padding: '10px',
        color: '#c42501',
        backgroundColor: '#ffffff',
      },
      iconTheme: {
        primary: '#c42501',
        secondary: '#ffffff',
      },
    duration: 5000
}

export const inGameNotificationOptions = {
      style: {
        border: '4px solid #c42501',
        padding: '10px',
        color: '#c42501',
        backgroundColor: '#ffffff',
      },
      iconTheme: {
        primary: '#c42501',
        secondary: '#ffffff',
      },
    duration: 5000
}
