// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// dotenv.config();

// connectDB();

// const app = express();

// app.use(express.json());
// app.use(cors());

// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/tasks', require('./routes/taskRoutes'));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


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

const allowedOrigins = [
    "https://frontend-developer-task-primetrade-ai-1.onrender.com",
    'http://localhost:5173', // your frontend
];

const corsOptions = {
    origin: (origin, callback) => {
        // if (!origin || allowedOrigins.includes(origin)) {
        //     callback(null, origin); // allow the request
        // } else {
        //     callback(new Error("Not allowed by CORS"));
        // }
        if (!origin) return callback(null, true); // allow non-browser requests (like Postman)
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// if (process.env.NODE_ENV === 'production') {
//     const clientBuildPath = path.join(__dirname, '..', 'frontend', 'build');
//     app.use(express.static(clientBuildPath));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(clientBuildPath, 'index.html'));
//     });
// } else {
//     app.get('/', (req, res) => {
//         res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
//     });
// }

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
