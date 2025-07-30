// Polyfill for TextEncoder/TextDecoder which are not available in jsdom environment
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
