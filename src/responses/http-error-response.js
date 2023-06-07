const buildHttpErrorResponse = (name, message) => {
    return {
        name: name,
        message: message
    }
}

module.exports = buildHttpErrorResponse;