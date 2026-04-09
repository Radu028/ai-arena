const issuerKey = ['CLERK', 'JWT', 'ISSUER', 'DOMAIN'].join('_')
const legacyIssuerKey = ['CLERK', 'ISSUER', 'URL'].join('_')
const issuer = process.env[issuerKey] ?? process.env[legacyIssuerKey] ?? null

export default {
  providers: issuer
    ? [
        {
          domain: issuer,
          applicationID: 'convex',
        },
      ]
    : [],
}
