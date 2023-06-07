function generateKeyPair() {
    const { privateKey, publicKey } = require('crypto').generateKeyPairSync('ec', {
        namedCurve: 'P-256'
    })

    const privateKeyPem = privateKey.export({
        format: 'pem',
        type: 'pkcs8'
    })

    const publicKeyPem = publicKey.export({
        format: 'pem',
        type: 'spki'
    })

    const fs = require('fs')

    fs.writeFileSync('src/.securities/private.key', privateKeyPem, {
        encoding: 'utf-8'
    })

    fs.writeFileSync('src/.securities/public.key', publicKeyPem, {
        encoding: 'utf-8'
    })

    console.log({ PRIVATE_KEY: privateKeyPem });
    console.log({ PUBLIC_KEY: publicKeyPem });
}

generateKeyPair()