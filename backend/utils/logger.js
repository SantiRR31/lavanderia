const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure log directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for security logs
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: 'info',
    format: customFormat,
    transports: [
        // Security-related logs
        new winston.transports.File({ 
            filename: path.join(logDir, 'security.log'), 
            level: 'info' 
        }),
        // Error logs
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error' 
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
    ]
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `[${timestamp}] ${level}: ${message}${metaString}`;
            })
        )
    }));
}

module.exports = logger;
