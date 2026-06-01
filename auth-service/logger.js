// Structured JSON Logger - Simulates AWS CloudWatch Log Insights Format
const log = (level, service, message, extra = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        level,        
        service,      
        message,      
        ...extra      
    };
    console.log(JSON.stringify(entry));
};

module.exports = {
    info:  (service, message, extra) => log('INFO',  service, message, extra),
    warn:  (service, message, extra) => log('WARN',  service, message, extra),
    error: (service, message, extra) => log('ERROR', service, message, extra),
};