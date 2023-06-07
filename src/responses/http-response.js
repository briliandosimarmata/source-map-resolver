const buildHttpResponse = (status, message, data) => {
    return {
        status: status,
        message: message,
        data: data,
    }
}

module.exports = buildHttpResponse;