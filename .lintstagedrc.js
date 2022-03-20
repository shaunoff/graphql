module.exports = {
  '*.{js,ts,graphql}': 'yarn run eslint',
  '*.{js,ts,tsx,css,md,graphql}': 'prettier --write',
  '*.prisma': () => 'yarn prisma format',
}
