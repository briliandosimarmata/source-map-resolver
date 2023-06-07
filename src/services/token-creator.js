const jwt = require('jsonwebtoken')
const projectKeys =  require('../.securities/project-keys.json')
const fs = require('fs')

const ResolverError = require('../error-handlers/resolver-error')

const tokenCreator = (req, res, next) => {
    const privateKey = fs.readFileSync('src/.securities/private.key').toString('utf-8')
    const projectKey = req.body.projectKey

    if(projectKeys.indexOf(projectKey) === -1) {
        throw new ResolverError('InvalidProjectKey')
    }

    const authToken = jwt.sign(projectKey, privateKey, {
        algorithm: 'ES256'
    })

    req.responseData = {
        authToken: authToken
    }

    next()
}

module.exports = tokenCreator