export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: { id: string; username: string; email: string } | null;
    loading: boolean;
    successMessage: string | null;
    errorMessage: string | null
}

export interface IRegisterUserInput {
    username: string;
    email: string;
    password: string;
    role: string;
}
