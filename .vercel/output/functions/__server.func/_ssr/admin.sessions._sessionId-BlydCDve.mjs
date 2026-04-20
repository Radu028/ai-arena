import { i as __toESM } from "../_runtime.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as CardDescription, n as Card, o as CardHeader, r as CardContent, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { a as useQuery, i as useMutation } from "../_libs/convex.mjs";
import { t as api } from "./api-BYwlqCnN.mjs";
import { f as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AdminGuard } from "./AdminGuard-D8w_UCoS.mjs";
import { n as formatDateTime } from "./format-B9WmLYsI.mjs";
import { t as Badge } from "./badge-BqpRPnfu.mjs";
import { t as Route } from "./admin.sessions._sessionId-B2PhtKB8.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.sessions._sessionId-BlydCDve.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
function AdminSessionDetailPage() {
	const { sessionId } = Route.useParams();
	const session = useQuery(api.sessions.getAdminSession, { sessionId });
	const publicView = useQuery(api.sessions.getPublicSessionView, session ? {
		slug: session.slug,
		participantToken: null
	} : "skip");
	const startSession = useMutation(api.sessions.start);
	const stopSession = useMutation(api.sessions.stop);
	const endVotingEarly = useMutation(api.rounds.endVotingEarly);
	async function handleStart() {
		if (!session) return;
		try {
			await startSession({ sessionId: session.id });
			toast.success("Session started.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not start the session.");
		}
	}
	async function handleStop() {
		if (!session) return;
		try {
			await stopSession({ sessionId: session.id });
			toast.success("Session stopped.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not stop the session.");
		}
	}
	async function handleEndVoting() {
		if (!session) return;
		try {
			await endVotingEarly({ sessionId: session.id });
			toast.success("Voting closed early.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not close voting early.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-frame space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminGuard, {
			title: "Session controls",
			children: session ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-4 lg:grid-cols-[1fr_0.9fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "arena-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-serif text-4xl",
							children: session.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Admin controls for the live room, round state, and share links." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "capitalize",
											children: session.status
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: session.themeLabel
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											children: ["Join code: ", session.joinCode]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 text-sm text-muted-foreground md:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Created: ", formatDateTime(session.createdAt)] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Started: ", formatDateTime(session.startedAt)] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Stopped: ", formatDateTime(session.stoppedAt)] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Ended: ", formatDateTime(session.endedAt)] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: handleStart,
											disabled: session.status !== "waiting",
											children: "Start Session"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											onClick: handleEndVoting,
											disabled: session.currentRoundStatus !== "voting",
											children: "End Voting Early"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "destructive",
											onClick: handleStop,
											disabled: session.status === "stopped" || session.status === "ended",
											children: "Stop Session"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "outline",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/sessions/$slug",
												params: { slug: session.slug },
												children: "Open Public Room"
											})
										})
									]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "arena-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-serif text-3xl",
							children: "Lineup"
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "space-y-3",
							children: session.selectedModels.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[1.2rem] border border-border/70 bg-background/65 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-foreground",
									children: model.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: model.description
								})]
							}, model.key))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "arena-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-serif text-3xl",
						children: "Scoreboard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Live summary across all completed rounds." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "grid gap-3 md:grid-cols-3",
						children: session.scoreboard.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[1.2rem] border border-border/70 bg-background/65 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-foreground",
								children: entry.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: [
									entry.wins,
									" wins · ",
									entry.totalVotes,
									" votes"
								]
							})]
						}, entry.modelKey))
					})]
				}),
				publicView ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "arena-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-serif text-3xl",
						children: "Public snapshot"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Participants: ",
								publicView.session.participantCount,
								" /",
								" ",
								publicView.session.maxParticipants
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Current round:",
								" ",
								publicView.session.currentRoundNumber || "Not started"
							] }),
							publicView.currentRound?.topic ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Topic: ", publicView.currentRound.topic] }) : null
						]
					})]
				}) : null
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "arena-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-3xl",
					children: "Session unavailable"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "This session either does not exist or belongs to a different admin identity." })] })
			})
		})
	});
}
//#endregion
export { AdminSessionDetailPage as component };
