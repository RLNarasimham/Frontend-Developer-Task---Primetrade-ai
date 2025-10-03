const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 100,
    standardHeaders: true,
    legacyHeaders: false
});

app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.MORGAN_FORMAT || 'combined'));

// const corsOptions = {
//     origin: (origin, callback) => callback(null, true),
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
//     credentials: true,
//     optionsSuccessStatus: 204
// };

// server.js

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://frontend-developer-task-primetrade-ai-1.onrender.com",
];

const corsOptions = {
    origin: (origin, callback) => {
        // Check if the request's origin is in our list of allowed origins.
        // The '!origin' part allows requests from tools like Postman where origin is undefined.
        if (!origin || allowedOrigins.includes(origin)) {
            // If it is, allow the request by passing 'true' to the callback.
            // The 'cors' package will then set the Access-Control-Allow-Origin header
            // to the specific origin of the request.
            callback(null, true);
        } else {
            // If the origin is not allowed, reject the request.
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // This is crucial for allowing credentials.
    optionsSuccessStatus: 204,
};


app.use(cors(corsOptions));



// app.use(cors({
//     origin: true, // Allow all origins temporarily
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"]
// }));
// app.options('*', cors());

// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/tasks', require('./routes/taskRoutes'));

// Add logging and error handling for routes
try {
    const userRoutes = require('./routes/userRoutes');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded');
} catch (error) {
    console.error('❌ Failed to load user routes:', error);
}

try {
    const taskRoutes = require('./routes/taskRoutes');
    app.use('/api/tasks', taskRoutes);
    console.log('✅ Task routes loaded');
} catch (error) {
    console.error('❌ Failed to load task routes:', error);
}

// Health check endpoint - MUST come before static files
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// Only serve static files if they exist (for monorepo deployments)
// if (process.env.NODE_ENV === 'production') {
//     const clientBuildPath = path.join(__dirname, '..', 'frontend', 'build');
//     const fs = require('fs');

//     if (fs.existsSync(clientBuildPath)) {
//         app.use(express.static(clientBuildPath));
//         app.get('*', (req, res) => {
//             res.sendFile(path.join(clientBuildPath, 'index.html'));
//         });
//     }
// }

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const payload = { message: err.message || 'Internal Server Error' };
    if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
    res.status(status).json(payload);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled Rejection:', reason);
    try { await server.close(); } catch (e) { }
    process.exit(1);
});

const gracefulShutdown = () => {
    server.close(() => {
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
