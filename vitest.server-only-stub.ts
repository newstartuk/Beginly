// Test-only stand-in for the "server-only" package (see vitest.config.ts's alias) —
// its real implementation throws outside Next's server runtime, which breaks any
// test importing a server-only-guarded module directly instead of via vi.mock.
export {};
