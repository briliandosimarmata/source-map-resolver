
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const corsOptions = {
    // origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
}

const buildHttpResponse = require('./src/responses/http-response')
const buildHttpErrorResponse = require('./src/responses/http-error-response')

const tokenCreatorService = require('./src/services/token-creator')
const tokenValidatorService = require('./src/services/token-validator')
const sourceMapResolverService = require('./src/services/source-map-resolver')
const saveRawSourceMapService = require('./src/services/save-raw-source-map')

app.use(express.json({
    limit: '50mb',
}))

app.use(cors(corsOptions))

app.use('/private', tokenValidatorService)
app.post('/create-auth-token', tokenCreatorService)
app.post('/private/upload-source-maps', express.raw({
    type: 'application/zip',
    limit: '10mb'
}), saveRawSourceMapService)
app.post('/private/resolve', sourceMapResolverService)

app.use((err, req, res, next) => {
    const status = req.status ? req.status : 400
    res.status(status).json(
        buildHttpErrorResponse(err.name, err.message))
    throw err
}, (req, res, next) => {
    const message = req.message ? req.message : 'Success.'
    res.json(buildHttpResponse(200, message, { ...req.responseData }))
    return
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})