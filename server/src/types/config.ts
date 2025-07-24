export interface Config {
    app: {
        env: "development" | "test" | "production";
        port: number;
        name: string;
    };
    db: {
        uri: string;
    };
    auth: {
        secret: string;
        refresh: string
        expiresIn: string;
    };
}