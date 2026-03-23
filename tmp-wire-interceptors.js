const fs = require("fs");
const path = "/app/dist/app.module.js";
let code = fs.readFileSync(path, "utf8");

// 1. Add require for MetricsInterceptor and HttpLoggingInterceptor if not present
if (!code.includes("metrics_interceptor_1")) {
  code = code.replace(
    "Object.defineProperty(exports,",
    `const metrics_interceptor_1 = require("./metrics/metrics.interceptor");\nconst http_logging_interceptor_1 = require("./logger/http-logging.interceptor");\nObject.defineProperty(exports,`,
  );
}

// 2. Add APP_INTERCEPTOR providers after the last APP_GUARD
const interceptorBlock = `            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: metrics_interceptor_1.MetricsInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: http_logging_interceptor_1.HttpLoggingInterceptor,
            },`;

// Find the closing of the last APP_GUARD block and insert after
const lastGuardPattern = `                provide: core_1.APP_GUARD,
                useClass: api_key_guard_1.ApiKeyGuard,
            },`;

if (code.includes(lastGuardPattern) && !code.includes("APP_INTERCEPTOR")) {
  code = code.replace(
    lastGuardPattern,
    lastGuardPattern + "\n" + interceptorBlock,
  );
  console.log("Added APP_INTERCEPTOR providers");
} else if (code.includes("APP_INTERCEPTOR")) {
  console.log("APP_INTERCEPTOR already present");
} else {
  console.log("ERROR: Could not find insertion point");
  process.exit(1);
}

// Also need to make sure core_1 has APP_INTERCEPTOR - check if it uses @nestjs/core
// APP_INTERCEPTOR is exported from @nestjs/core, same as APP_GUARD
// core_1 is already required for APP_GUARD, so APP_INTERCEPTOR should work

fs.writeFileSync(path, code, "utf8");
console.log("Patched app.module.js successfully");

// Verify
const verify = fs.readFileSync(path, "utf8");
const hasMetrics = verify.includes("MetricsInterceptor");
const hasLogging = verify.includes("HttpLoggingInterceptor");
console.log(`MetricsInterceptor registered: ${hasMetrics}`);
console.log(`HttpLoggingInterceptor registered: ${hasLogging}`);
