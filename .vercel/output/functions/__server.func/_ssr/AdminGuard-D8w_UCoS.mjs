import { i as __toESM } from "../_runtime.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as CardDescription, n as Card, o as CardHeader, r as CardContent, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { a as useRuntimeConfig, i as useAuth, n as SignInButton } from "./AppProviders-BNDEdYl_.mjs";
import { o as ShieldCheck, s as ShieldAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdminGuard-D8w_UCoS.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
function AdminGuard({ children, title = "Admin access required" }) {
	if (!useRuntimeConfig().hasClerk) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "arena-panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 font-serif text-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-[var(--arena-signal)]" }), "Clerk is not configured"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Add `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_JWT_ISSUER_DOMAIN` to unlock admin auth." })] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfiguredAdminGuard, {
		title,
		children
	});
}
function ConfiguredAdminGuard({ children, title }) {
	const { isLoaded, isSignedIn } = useAuth();
	if (!isLoaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "arena-panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "font-serif text-2xl",
			children: "Checking admin session"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Loading Clerk authentication state." })] })
	});
	if (!isSignedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "arena-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 font-serif text-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-[var(--arena-cobalt)]" }), title]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Sign in with Clerk to create sessions, start rounds, and control costs." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInButton, {
			mode: "modal",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				children: "Sign In As Admin"
			})
		}) })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { AdminGuard as t };
