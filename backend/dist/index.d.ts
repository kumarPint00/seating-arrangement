import { EnhancedLRUCache } from './utils/EnhancedLRUCache';
import { User } from './services/userService';
declare const app: import("express-serve-static-core").Express;
export declare const cache: EnhancedLRUCache<User>;
declare const server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export default app;
export { server };
//# sourceMappingURL=index.d.ts.map