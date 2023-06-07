const sourceMap = require('source-map')
const fs = require('fs')

const ResolverError = require('../error-handlers/resolver-error')
const errorLineFinder = require('../utilities/error-line-finder')

const sourceMapResolver = (req, res, next) => {
    valReqBody(req.body)

    const sourceMapInfo = getRawSourceMapInfo(req.body.stack, req.projectKey)
    const rawSourceMap = sourceMapInfo.rawSourceMap

    const sourceMapConsumer = new sourceMap.SourceMapConsumer(rawSourceMap)

    sourceMapConsumer.then(
        (consumer) => {
            const pos = consumer.originalPositionFor(
                {
                    line: sourceMapInfo.line,
                    column: sourceMapInfo.column
                }
            )

            if (!pos.source) {
                throw new ResolverError('MappedLocationNotFound',
                    sourceMapInfo.source, sourceMapInfo.line, sourceMapInfo.column)
            }

            const soc = consumer.sourceContentFor(pos.source)

            const errorLineCode = errorLineFinder(soc, pos.line, pos.column)
            const sourceName = pos.source.substring(pos.source.lastIndexOf('/') + 1)
            const stack = `${sourceMapInfo.stackName} error was found at ${sourceName}:${pos.line}:${pos.column}\n${errorLineCode}`
            // const base64Soc = Buffer.from(soc, 'utf-8').toString('base64')

            req.message = 'Resolve success.'
            req.responseData = {
                line: pos.line,
                column: pos.column,
                name: pos.name,
                stack: stack,
                source: sourceName
            }

            next()
        }
    ).catch(next)
}

function valReqBody(body) {
    const requiredField = ['stack']

    if (!body.stack) {
        throw new ResolverError('InvalidPayload', requiredField)
    }

    if (body.stack.trim().length === 0) {
        throw new ResolverError('InvalidPayload', requiredField)
    }
}

function getRawSourceMapInfo(stack, projectKey) {
    const stackInfo = getStackInfo(stack)
    const projectSrcMapPath = `src/.raw-source-map/.${projectKey}`
    const rawSourceMap = getSrcMap(projectSrcMapPath, stackInfo.source)

    valRawSrcMapFrmt(rawSourceMap)

    const rawSourceMapObj = JSON.parse(rawSourceMap)
    valRawSrcMapFld(rawSourceMapObj)

    return {
        line: stackInfo.line,
        column: stackInfo.column,
        source: stackInfo.source,
        rawSourceMap: rawSourceMapObj,
        stackName: stackInfo.stackName
    }
}

function getSrcMap(projectSrcMapPath, sourceName) {
    try {
        return fs.readFileSync(`${projectSrcMapPath}/${sourceName}.map`, { encoding: 'utf-8' })
    } catch (error) {
        throw new ResolverError('SourceMapNotFound', sourceName)
    }
}

function getStackInfo(stack) {
    const stackName = stack.substring(0, stack.search(/(?=at).*?(\d\:\d+)/) - 1)
    const stackLoc = stack.match(/(?=at).*?(\d\:\d+)/gm)[0]
    let stackLocVar = null

    if (stackLoc) {
        stackLocVar = stackLoc.substring(stackLoc.lastIndexOf('/') + 1, stackLoc.length).split(':')
    }

    if (stackLocVar) {
        return {
            source: stackLocVar[0],
            line: parseInt(stackLocVar[1]),
            column: parseInt(stackLocVar[2]),
            stackName: stackName
        }
    } else {
        throw new ResolverError("UnreadbleStack")
    }
}

function valRawSrcMapFld(rawSourceMap) {
    const rawSrcMapFldsKey = ['file', 'mappings', 'names', 'sources', 'version']
    let rawSrcMapFldsNotFound = []

    if (!rawSourceMap) {
        throw new ResolverError('InvalidSourceMap', rawSrcMapFldsKey)
    }

    rawSrcMapFldsKey.forEach(key => {
        if (rawSourceMap[key] === undefined || rawSourceMap[key] === null) {
            rawSrcMapFldsNotFound.push(key)
        }
    })

    if (rawSrcMapFldsNotFound.length > 0) {
        throw new ResolverError('InvalidSourceMap', rawSrcMapFldsNotFound)
    }

}

function valRawSrcMapFrmt(rawSourceMap) {
    if (typeof rawSourceMap === 'string') {
        try {
            rawSourceMap = JSON.parse(rawSourceMap)
        } catch (error) {
            throw new ResolverError('InvalidFormat', rawSourceMap.padEnd(10, '...'))
        }
    } else if (typeof rawSourceMap !== 'object') {
        throw new ResolverError('InvalidFormat', rawSourceMap.padEnd(10, '...'))
    }
}

module.exports = sourceMapResolver