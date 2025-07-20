export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: { _id: string; userID: string; username: string; email: string; role: string, balance: number} | null;
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
