const getErrorMessage = require('./error-message-getter')

class ResolverError extends Error {
    constructor(name, ...args) {
        super();
        super.name = name;
        super.message = getErrorMessage(name, ...args)
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ResolverError