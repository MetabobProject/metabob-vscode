module.exports = {
  // Run type-check on changes to TypeScript files
  '**/*.ts?(x)': filenames =>
    `concurrently -p "[TS - {name}]" -n "Tests, Type Check" -c "yellow.bold,green.bold" "yarn test:staged ${filenames.join(
      ' ',
    )}" "yarn type-check"`,

  // Run ESLint on changes to JavaScript/TypeScript files
  '**/*.(ts|js)?(x)': filenames =>
    filenames.some(filename => filename.match(/\.eslintrc/))
      ? 'yarn lint:scripts'
      : `yarn eslint ${filenames.join(' ')}`,
};
