const fs = require('fs')
const AdmZip = require('adm-zip')

const saveRawSourceMap = (req, res, next) => {
    const rawSourceMaps = req.body
    const zip = new AdmZip(rawSourceMaps)
    const zipEntry = zip.getEntries()
    const projectSrcMapPath = `src/.raw-source-map/.${req.projectKey}`

    let extractedSrcMaps = []

    fs.rmSync(projectSrcMapPath, { force: true, recursive: true })
    fs.mkdirSync(projectSrcMapPath, { recursive: true })

    zipEntry.forEach((entry) => {
        if(entry.getData().byteLength > 0) {
            zip.extractEntryTo(entry, projectSrcMapPath, false, true)
            extractedSrcMaps.push(entry.entryName)
        }
    })

    req.responseData = {
        extractedSrcMaps: extractedSrcMaps
    }

    next()
}

module.exports = saveRawSourceMap