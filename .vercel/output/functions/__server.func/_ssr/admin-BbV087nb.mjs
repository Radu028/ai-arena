import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as cn, i as CardDescription, n as Card, o as CardHeader, r as CardContent, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { a as useQuery } from "../_libs/convex.mjs";
import { t as api } from "./api-BYwlqCnN.mjs";
import { f as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AdminGuard } from "./AdminGuard-D8w_UCoS.mjs";
import { n as formatDateTime } from "./format-B9WmLYsI.mjs";
require_react();
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
function Table({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
			"data-slot": "table",
			className: cn("w-full caption-bottom text-sm", className),
			...props
		})
	});
}
function TableHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
		"data-slot": "table-header",
		className: cn("[&_tr]:border-b", className),
		...props
	});
}
function TableBody({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
		"data-slot": "table-body",
		className: cn("[&_tr:last-child]:border-0", className),
		...props
	});
}
function TableRow({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
		"data-slot": "table-row",
		className: cn("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", className),
		...props
	});
}
function TableHead({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		"data-slot": "table-head",
		className: cn("h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0", className),
		...props
	});
}
function TableCell({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		"data-slot": "table-cell",
		className: cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className),
		...props
	});
}
function AdminDashboard() {
	const data = useQuery(api.sessions.listAdminSessions, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-frame space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminGuard, {
			title: "Admin console",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Admin console"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-5xl text-foreground",
						children: "Sessions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-base leading-7 text-muted-foreground",
						children: "Create waiting rooms, start battles manually, and stop sessions when you want to cut off provider spend."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin/sessions/new",
						children: "Create Session"
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "arena-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-3xl",
					children: "Recent sessions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Sessions appear here once you are authenticated through Clerk." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: data && data.sessions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Title" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Theme" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Rounds" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Join code" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Created" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin/sessions/$sessionId",
						params: { sessionId: session.id },
						className: "font-medium text-[var(--arena-cobalt)] no-underline",
						children: session.title
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "capitalize",
						children: session.status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "capitalize",
						children: session.theme
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: session.roundCount }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: session.joinCode }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDateTime(session.createdAt) })
				] }, session.id)) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-[1.2rem] border border-dashed border-border/80 bg-muted/40 px-4 py-8 text-center text-muted-foreground",
					children: "No admin sessions yet."
				}) })]
			})]
		})
	});
}
//#endregion
export { AdminDashboard as component };
