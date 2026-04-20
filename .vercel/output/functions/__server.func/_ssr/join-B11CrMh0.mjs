import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as CardDescription, n as Card, o as CardHeader, r as CardContent, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { i as useMutation } from "../_libs/convex.mjs";
import { t as api } from "./api-BYwlqCnN.mjs";
import { p as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as joinCodeSchema, n as Label$1, o as normalizeOptionalEmail, t as Input } from "./label-Dl3dzCU8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/join-B11CrMh0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
function JoinPage() {
	const navigate = useNavigate();
	const joinByCode = useMutation(api.sessions.joinByCode);
	const [code, setCode] = (0, import_react.useState)("");
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		const parsed = joinCodeSchema.safeParse({
			code,
			displayName,
			email
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Join details are invalid.");
			return;
		}
		setPending(true);
		try {
			const result = await joinByCode({
				code: parsed.data.code.trim().toUpperCase(),
				displayName: parsed.data.displayName,
				email: normalizeOptionalEmail(parsed.data.email)
			});
			window.localStorage.setItem(`ai-arena.participant.${result.slug}`, result.accessToken);
			toast.success("Joined session.");
			(0, import_react.startTransition)(() => {
				navigate({
					to: "/sessions/$slug",
					params: { slug: result.slug }
				});
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not join that session.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-frame",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[0.9fr_1.1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "arena-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-4xl",
					children: "Join the crowd"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-base leading-7",
					children: "Enter the short join code, choose a display name, and drop directly into the live lobby or active round."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Guests do not need a full account." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your vote persists across refreshes with a local session token." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Model identities stay hidden until each round closes." })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "arena-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-3xl",
					children: "Join by code"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-5",
					onSubmit: handleSubmit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
								htmlFor: "code",
								children: "Join code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "code",
								value: code,
								onChange: (event) => setCode(event.target.value),
								placeholder: "A1B2C3",
								className: "uppercase"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
								htmlFor: "displayName",
								children: "Display name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "displayName",
								value: displayName,
								onChange: (event) => setDisplayName(event.target.value),
								placeholder: "Radu"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
								htmlFor: "email",
								children: "Email (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								value: email,
								onChange: (event) => setEmail(event.target.value),
								placeholder: "radu@example.com"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "lg",
							disabled: pending,
							children: pending ? "Joining…" : "Join Session"
						})
					]
				}) })]
			})]
		})
	});
}
//#endregion
export { JoinPage as component };
