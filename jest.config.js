const {defaults} = require('jest-config');

module.exports = {
    globals: {
        'ts-jest': {
          tsConfig: 'tsconfig.test.json'
        }
    },
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
    moduleNameMapper: {
        "^APP/(.*)$": "<rootDir>/app/$1",
    },
    setupFiles: ['<rootDir>/jest.setup.js'], // 运行测试前可执行的脚本（比如注册enzyme的兼容）
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
    },
    testRegex: '^.+\\.test\\.(js|ts)$',
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'], //转换时需忽略的文件
    testURL: 'http://localhost/', // 运行环境下的URl
};
