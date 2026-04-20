import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { c as cn } from "./card-CtI9zUkN.mjs";
import { n as MAX_MODELS_PER_SESSION, r as SESSION_THEMES } from "./arena-COEnf_2-.mjs";
import { a as object, i as literal, n as _enum, o as string, r as array, t as number } from "../_libs/zod.mjs";
require_react();
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
var createSessionSchema = object({
	title: string().trim().min(3, "Give the session a clear title.").max(80, "Keep the session title under 80 characters."),
	theme: _enum(SESSION_THEMES),
	roundCount: number().int().min(1).max(10),
	modelKeys: array(string().min(1)).min(2, "Select at least two models.").max(MAX_MODELS_PER_SESSION).refine((items) => new Set(items).size === items.length, "Pick each model once."),
	maxParticipants: number().int().min(2).max(1e3).default(200)
});
var joinSessionSchema = object({
	displayName: string().trim().min(2, "Use a display name with at least 2 characters.").max(40, "Display names must stay under 40 characters."),
	email: string().trim().email("Use a valid email address.").max(120).or(literal("")).optional().default("")
});
var joinCodeSchema = object({
	code: string().trim().min(4, "Join codes are short, but not that short.").max(12, "Join code looks too long."),
	displayName: joinSessionSchema.shape.displayName,
	email: joinSessionSchema.shape.email
});
var topicSchema = object({ topic: string().trim().min(5, `Topic must be at least 5 characters.`).max(300, `Topic must stay under 300 characters.`) });
function normalizeOptionalEmail(email) {
	const normalized = email?.trim() ?? "";
	return normalized.length > 0 ? normalized : null;
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
function Label$1({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "label",
		className: cn("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { joinSessionSchema as a, joinCodeSchema as i, Label$1 as n, normalizeOptionalEmail as o, createSessionSchema as r, topicSchema as s, Input as t };
