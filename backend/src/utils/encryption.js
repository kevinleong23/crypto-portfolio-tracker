const crypto = require('crypto')

const algorithm = 'aes-256-cbc'
const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default32characterencryptionkey!', 'utf8').slice(0, 32)
const iv = crypto.randomBytes(16)

function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Encryption failed')
  }
}

function decrypt(encryptedText) {
  try {
    const parts = encryptedText.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Decryption failed')
  }
}

module.exports = {
  encrypt,
  decrypt
}