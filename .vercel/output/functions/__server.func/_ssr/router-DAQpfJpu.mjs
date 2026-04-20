import { i as __toESM } from "../_runtime.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as CardDescription, n as Card, o as CardHeader, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { d as createRootRoute, f as Link, l as lazyRouteComponent, n as Scripts, o as createRouter, r as HeadContent, s as Outlet, u as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as z } from "../_libs/next-themes.mjs";
import { a as useRuntimeConfig, i as useAuth, n as SignInButton, r as UserButton, t as AppProviders } from "./AppProviders-BNDEdYl_.mjs";
import { a as SunMoon, c as RadioTower, h as CircleCheck, i as Sun, l as OctagonX, m as Info, p as LoaderCircle, r as TriangleAlert, u as MoonStar } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BqpRPnfu.mjs";
import { t as Route$5 } from "./admin.sessions._sessionId-B2PhtKB8.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$6 } from "./sessions._slug-CmTFvXGG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DAQpfJpu.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
var ORDER = [
	"light",
	"dark",
	"system"
];
function ThemeToggle() {
	const { theme, setTheme } = z();
	const currentTheme = theme ?? "system";
	const nextTheme = ORDER[(ORDER.indexOf(currentTheme) + 1) % ORDER.length];
	const icon = currentTheme === "light" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : currentTheme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoonStar, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SunMoon, { className: "size-4" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "outline",
		size: "icon-sm",
		suppressHydrationWarning: true,
		className: "rounded-full border-border/70 bg-background/70 backdrop-blur-sm",
		onClick: () => setTheme(nextTheme),
		title: `Theme: ${currentTheme}`,
		"aria-label": `Theme: ${currentTheme}`,
		children: icon
	});
}
function Header() {
	const runtime = useRuntimeConfig();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "page-frame flex flex-wrap items-center gap-3 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-3 rounded-full border border-border/70 bg-card px-4 py-2 no-underline shadow-[0_12px_28px_rgba(20,28,44,0.08)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,white,var(--arena-signal))] text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioTower, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-serif text-lg leading-none text-foreground",
						children: "AI Arena"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground",
						children: "Live model battles"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden items-center gap-2 md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "nav-pill",
							activeProps: { className: "nav-pill is-active" },
							children: "Home"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/join",
							className: "nav-pill",
							activeProps: { className: "nav-pill is-active" },
							children: "Join"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							className: "nav-pill",
							activeProps: { className: "nav-pill is-active" },
							children: "Admin"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "hidden rounded-full border-border/70 px-3 py-1 sm:inline-flex",
							children: runtime.hasClerk ? "Clerk admin auth" : "Guest mode only"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
						runtime.hasClerk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderAuth, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin",
								children: "Admin"
							})
						})
					]
				})
			]
		})
	});
}
function HeaderAuth() {
	const { isLoaded, isSignedIn } = useAuth();
	if (!isLoaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "outline",
		size: "sm",
		disabled: true,
		children: "Loading"
	});
	if (!isSignedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInButton, {
		mode: "modal",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			children: "Admin Sign In"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, { appearance: { elements: { userButtonAvatarBox: "size-9" } } });
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border/70 bg-card/40 px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "page-frame flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-serif text-xl text-foreground",
				children: "AI Arena"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xl text-sm text-muted-foreground",
				children: "TanStack Start, Convex, Clerk, shadcn/ui, Tailwind v4, Vite, and a two-agent live battle format built for fast iteration."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Host Agent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Critic Agent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Realtime Voting"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Anonymous Cards"
					})
				]
			})]
		})
	});
}
var Toaster$1 = ({ ...props }) => {
	const { theme = "system" } = z();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme,
		className: "toaster group",
		icons: {
			success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }),
			info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4" }),
			warning: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
			error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OctagonX, { className: "size-4" }),
			loading: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" })
		},
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)",
			"--border-radius": "var(--radius)"
		},
		toastOptions: { classNames: { toast: "cn-toast" } },
		...props
	});
};
var styles_default = "/assets/styles-B6VeFEqN.css";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "AI Arena" },
			{
				name: "description",
				content: "Run live battles between major AI models, with Host and Critic agents, public voting, and realtime results."
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootDocument,
	component: RootLayout
});
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-screen bg-background text-foreground antialiased",
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})]
		})]
	});
}
function RootLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootFrame, {}) });
}
function RootFrame() {
	const runtime = useRuntimeConfig();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 py-8",
				children: runtime.hasConvex ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "page-frame",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "arena-panel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-serif text-3xl",
							children: "Convex is not configured yet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Add `VITE_CONVEX_URL` to the environment before rendering the live app." })] })
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				richColors: true,
				position: "top-right"
			})
		]
	});
}
var $$splitComponentImporter$3 = () => import("./join-B11CrMh0.mjs");
var Route$3 = createFileRoute("/join")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./admin-BbV087nb.mjs");
var Route$2 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./routes-VwhsHeh6.mjs");
var Route$1 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./admin.sessions.new-CqMggVC0.mjs");
var Route = createFileRoute("/admin/sessions/new")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var JoinRoute = Route$3.update({
	id: "/join",
	path: "/join",
	getParentRoute: () => Route$4
});
var AdminRoute = Route$2.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$4
});
var IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$4
});
var SessionsSlugRoute = Route$6.update({
	id: "/sessions/$slug",
	path: "/sessions/$slug",
	getParentRoute: () => Route$4
});
var AdminSessionsNewRoute = Route.update({
	id: "/sessions/new",
	path: "/sessions/new",
	getParentRoute: () => AdminRoute
});
var AdminRouteChildren = {
	AdminSessionsSessionIdRoute: Route$5.update({
		id: "/sessions/$sessionId",
		path: "/sessions/$sessionId",
		getParentRoute: () => AdminRoute
	}),
	AdminSessionsNewRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren),
	JoinRoute,
	SessionsSlugRoute
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
//#endregion
export { getRouter };
