const issuerKey = ['CLERK', 'JWT', 'ISSUER', 'DOMAIN'].join('_')
const legacyIssuerKey = ['CLERK', 'ISSUER', 'URL'].join('_')
const issuer = process.env[issuerKey] ?? process.env[legacyIssuerKey] ?? null
const configuredIssuer =
  issuer && !issuer.includes('placeholder.clerk.accounts.dev') ? issuer : null

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
