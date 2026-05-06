const issuerKey = ['CLERK', 'JWT', 'ISSUER', 'DOMAIN'].join('_')
const legacyIssuerKey = ['CLERK', 'ISSUER', 'URL'].join('_')
const publishableKey =
  process.env.VITE_CLERK_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  process.env.CLERK_PUBLISHABLE_KEY ??
  null
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
