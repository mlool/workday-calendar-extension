/** @type {import('ts-jest').JestConfigWithTsJest} **/
const config = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
};

export default config
