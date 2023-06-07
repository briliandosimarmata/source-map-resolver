const errorLineFinder = (source, line, column) => {
    const lineCodes = source.split("\n")
    const marker = '^'
    const errorLineCode = `${lineCodes[line - 1]}\n${marker.padStart(column + 1, ' ')}`

    return errorLineCode
}

module.exports = errorLineFinder