const msgProp = require('./error-message-properties.json')

const getErrorMessage = (name, ...args) => {
    let msg = msgProp[name]

    if (args.length > 0) {
        const argsIndex = msg.match(/(?<=\{).*?(?=\})/gm)
        argsIndex.forEach(idx => {
            const arg = args[idx] ?? ''
            msg = msg.replace(`{${idx}}`, arg)
        })
    }

    return msg ?? '';
}

module.exports = getErrorMessage