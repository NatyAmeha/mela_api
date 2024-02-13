export const configuration = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432
    },
    auth: {
        acessToken: process.env.ACCESS_TOKEN || "DEFAULTACCESSTOKEN",
        refreshToken: process.env.REFRESH_TOKEN || "DEFAULT_REFRESH_TOKEN",
        accessTokenExpiresIn: "1d",
        refreshTokenExpiresIn: "7d"
    }
});

export const ACCESS_TOKEN = 'auth.acessToken';
export const REFRESH_TOKEN = "auth.refreshToken";
export const ACCESS_TOKEN_EXPIRES_IN = "auth.accessTokenExpiresIn";
export const REFRESH_TOKEN_EXPIRES_IN = "auth.refreshTokenExpiresIn";

