/** @type {import('ts-jest').JestConfigWithTsJest} **/
const config = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};

export default config
