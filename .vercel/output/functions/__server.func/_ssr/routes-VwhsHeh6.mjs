import { i as __toESM } from "../_runtime.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as CardDescription, n as Card, o as CardHeader, r as CardContent, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { f as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as MicVocal, f as MessageSquareHeart, n as Trophy, t as UsersRound } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BqpRPnfu.mjs";
import { i as THEME_COPY, t as AVAILABLE_MODELS } from "./arena-COEnf_2-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-VwhsHeh6.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-frame space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "hero-shell overflow-hidden px-6 py-8 md:px-10 md:py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "rounded-full bg-[var(--arena-signal)] px-4 py-1.5 text-white",
								children: "Host + Critic agents included"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow",
										children: "Live editorial AI battles"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "display max-w-4xl text-balance",
										children: "One prompt. Five major models. Real people voting alongside them."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "max-w-2xl text-lg leading-8 text-muted-foreground",
										children: "AI Arena runs synchronized rounds where every selected model answers the same topic, judges its peers without self-voting, and competes in front of a live audience."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/join",
										children: "Join With Code"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									variant: "outline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/admin",
										children: "Open Admin Console"
									})
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "arena-panel bg-card/88",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-serif text-3xl",
							children: "Round loop"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Topic lock, simultaneous responses, anonymous voting, critic analysis, then the next round." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								[
									"1",
									"Topic locks once",
									"The first valid submission freezes the prompt."
								],
								[
									"2",
									"Models answer",
									"Responses arrive in parallel with timeout handling."
								],
								[
									"3",
									"Crowd and AI vote",
									"Humans and eligible models cast one ballot each."
								],
								[
									"4",
									"Host and Critic react",
									"The MC transitions, the Critic explains the result."
								]
							].map(([step, title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[1.2rem] border border-border/70 bg-background/60 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow",
										children: step
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-medium text-foreground",
										children: title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: copy
									})
								]
							}, step))
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-4 lg:grid-cols-4",
				children: [
					{
						title: "Host / MC",
						copy: "Introduces rounds, bridges results, and closes the session with a recap.",
						icon: MicVocal
					},
					{
						title: "Critic",
						copy: "Explains why the winner worked and what the other models missed.",
						icon: MessageSquareHeart
					},
					{
						title: "Realtime Crowd",
						copy: "Guests join with a link or code and watch votes update live through Convex.",
						icon: UsersRound
					},
					{
						title: "Fair Reveal",
						copy: "Responses stay anonymous until the round closes and the winner is locked.",
						icon: Trophy
					}
				].map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "arena-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(feature.icon, { className: "size-5 text-[var(--arena-cobalt)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-serif text-2xl",
						children: feature.title
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "text-sm leading-7 text-muted-foreground",
						children: feature.copy
					})]
				}, feature.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-[1.15fr_0.85fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "arena-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-serif text-3xl",
						children: "Battle roster"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "The initial base ships with five providers and model snapshots saved at session creation time." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "grid gap-3 md:grid-cols-2",
						children: AVAILABLE_MODELS.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[1.2rem] border border-border/70 bg-background/65 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-foreground",
										children: model.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-3 rounded-full",
										style: { backgroundColor: model.accent }
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: model.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground",
									children: model.tagline
								})
							]
						}, model.key))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "arena-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-serif text-3xl",
						children: "Theme presets"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Each preset tunes Host tone, Critic framing, and the quality bar for judging." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-3",
						children: Object.entries(THEME_COPY).map(([key, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[1.2rem] border border-border/70 bg-background/65 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-foreground",
									children: copy.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: ["Host tone: ", copy.hostTone]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: ["Critic angle: ", copy.criticAngle]
								})
							]
						}, key))
					})]
				})]
			})
		]
	});
}
//#endregion
export { HomePage as component };
