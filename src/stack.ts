// Stack Auth configuration
// This is a placeholder that prevents build errors when Stack Auth is not configured
// To enable authentication, set up Stack Auth environment variables as described in .env.example

let stackServerApp: any;

if (process.env.NEXT_PUBLIC_STACK_PROJECT_ID) {
  const { StackServerApp } = require("@stackframe/stack");
  stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
  });
} else {
  // Placeholder when Stack Auth is not configured
  stackServerApp = {
    getUser: async () => null,
    isAuthenticated: async () => false,
  };
}

export { stackServerApp };