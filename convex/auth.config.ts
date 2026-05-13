const issuerKey = ['CLERK', 'JWT', 'ISSUER', 'DOMAIN'].join('_')
const legacyIssuerKey = ['CLERK', 'ISSUER', 'URL'].join('_')
const publishableKey = firstConfiguredEnv([
  ['VITE', 'CLERK', 'PUBLISHABLE', 'KEY'].join('_'),
  ['NEXT', 'PUBLIC', 'CLERK', 'PUBLISHABLE', 'KEY'].join('_'),
  ['CLERK', 'PUBLISHABLE', 'KEY'].join('_'),
])
const issuer =
  process.env[issuerKey] ??
  process.env[legacyIssuerKey] ??
  issuerFromPublishableKey(publishableKey)
const configuredIssuer =
  issuer && !issuer.includes('placeholder.clerk.accounts.dev') ? issuer : null

function issuerFromPublishableKey(key: string | null) {
  const encoded = key?.match(/^pk_(?:test|live)_(.+)$/)?.[1]
  if (!encoded) {
    return null
  }

  const decoded = decodeBase64Url(encoded).replace(/\$$/, '')
  if (!decoded || decoded.includes('placeholder.clerk.accounts.dev')) {
    return null
  }
  return decoded.startsWith('http') ? decoded : `https://${decoded}`
}

function firstConfiguredEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]
    if (value) {
      return value
    }
  }
  return null
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf8')
}

export default {
  providers: configuredIssuer
    ? [
        {
          domain: configuredIssuer,
          applicationID: 'convex',
        },
      ]
    : [],
}
