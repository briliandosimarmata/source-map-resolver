const jwt = require('jsonwebtoken')
const projectKeys = require('../.securities/project-keys.json')
const fs = require('fs')

const ResolverError = require('../error-handlers/resolver-error')

let projectKey = null

const tokenValidator = (req, res, next) => {
    const authToken = req.headers['auth-token']

    if (!authToken) {
        req.status = 401
        throw new ResolverError('TokenNotFound')
    }

    if (!isTokenValid(authToken)) {
        req.status = 401
        throw new ResolverError('InvalidToken')
    }

    req.projectKey = projectKey

    next()
}

function isTokenValid(authToken) {
    const publicKey = fs.readFileSync('src/.securities/private.key').toString('utf-8')

    if (!authToken) {
        return false;
    }

    try {
        projectKey = jwt.verify(authToken, publicKey, {
            algorithms: ['ES256']
        })

        if (projectKeys.indexOf(projectKey) === -1) {
            return false
        }

    } catch (error) {
        return false
    }

    return true
}

module.exports = tokenValidator