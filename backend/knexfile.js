module.exports = {
    production: {
        client: 'postgresql',
        connection: process.env.DATABASE_URL + '?ssl=true',
    },
    dev: {
        client: 'postgresql',
        connection: process.env.DATABASE_URL,
    },
};
