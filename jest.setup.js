import '@testing-library/jest-dom'

// Polyfill for TextEncoder/TextDecoder (required by Next.js in Jest)
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder
