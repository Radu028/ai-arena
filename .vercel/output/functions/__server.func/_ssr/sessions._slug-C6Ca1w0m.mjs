import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as Root, t as Fallback } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root$1, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { a as CardFooter, c as cn, i as CardDescription, n as Card, o as CardHeader, r as CardContent, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { a as useQuery, i as useMutation } from "../_libs/convex.mjs";
import { t as api } from "./api-BYwlqCnN.mjs";
import { n as Trophy } from "../_libs/lucide-react.mjs";
import { i as initials, r as formatDurationMs, t as formatClock } from "./format-B9WmLYsI.mjs";
import { t as Badge } from "./badge-BqpRPnfu.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as joinSessionSchema, n as Label$1, o as normalizeOptionalEmail, s as topicSchema, t as Input } from "./label-Dl3dzCU8.mjs";
import { t as Route } from "./sessions._slug-CmTFvXGG.mjs";
import { a as CartesianGrid, c as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
import { n as prepare, t as layout } from "../_libs/chenglou__pretext.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sessions._slug-C6Ca1w0m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
var STORAGE_PREFIX = "ai-arena.participant";
function readToken(slug) {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(`${STORAGE_PREFIX}.${slug}`);
}
function useParticipantToken(slug) {
	const [token, setTokenState] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setTokenState(readToken(slug));
	}, [slug]);
	function setToken(nextToken) {
		setTokenState(nextToken);
		if (typeof window === "undefined") return;
		const key = `${STORAGE_PREFIX}.${slug}`;
		if (nextToken) {
			window.localStorage.setItem(key, nextToken);
			return;
		}
		window.localStorage.removeItem(key);
	}
	return [token, setToken];
}
function Tabs$1({ className, orientation = "horizontal", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		"data-slot": "tabs",
		"data-orientation": orientation,
		className: cn("group/tabs flex gap-2 data-horizontal:flex-col", className),
		...props
	});
}
var tabsListVariants = cva("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none", {
	variants: { variant: {
		default: "bg-muted",
		line: "gap-1 bg-transparent"
	} },
	defaultVariants: { variant: "default" }
});
function TabsList({ className, variant = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		"data-slot": "tabs-list",
		"data-variant": variant,
		className: cn(tabsListVariants({ variant }), className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		"data-slot": "tabs-trigger",
		className: cn("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent", "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100", className),
		...props
	});
}
function TabsContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		"data-slot": "tabs-content",
		className: cn("flex-1 text-sm outline-none", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		"data-slot": "textarea",
		className: cn("flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
function ScrollArea$1({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$1, {
		"data-slot": "scroll-area",
		className: cn("relative", className),
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
				"data-slot": "scroll-area-viewport",
				className: "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
		]
	});
}
function ScrollBar({ className, orientation = "vertical", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
		"data-slot": "scroll-area-scrollbar",
		"data-orientation": orientation,
		orientation,
		className: cn("flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, {
			"data-slot": "scroll-area-thumb",
			className: "relative flex-1 rounded-full bg-border"
		})
	});
}
function Avatar$1({ className, size = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "avatar",
		"data-size": size,
		className: cn("group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten", className),
		...props
	});
}
function AvatarFallback({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fallback, {
		"data-slot": "avatar-fallback",
		className: cn("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs", className),
		...props
	});
}
var THEMES = {
	light: "",
	dark: ".dark"
};
var INITIAL_DIMENSION = {
	width: 320,
	height: 200
};
var ChartContext = import_react.createContext(null);
function useChart() {
	const context = import_react.useContext(ChartContext);
	if (!context) throw new Error("useChart must be used within a <ChartContainer />");
	return context;
}
function ChartContainer({ id, className, children, config, initialDimension = INITIAL_DIMENSION, ...props }) {
	const uniqueId = import_react.useId();
	const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContext.Provider, {
		value: { config },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-slot": "chart",
			"data-chart": chartId,
			className: cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden", className),
			...props,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartStyle, {
				id: chartId,
				config
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				initialDimension,
				children
			})]
		})
	});
}
var ChartStyle = ({ id, config }) => {
	const colorConfig = Object.entries(config).filter(([, config]) => config.theme ?? config.color);
	if (!colorConfig.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { dangerouslySetInnerHTML: { __html: Object.entries(THEMES).map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
		const color = itemConfig.theme?.[theme] ?? itemConfig.color;
		return color ? `  --color-${key}: ${color};` : null;
	}).join("\n")}
}
`).join("\n") } });
};
var ChartTooltip = Tooltip;
function ChartTooltipContent({ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey }) {
	const { config } = useChart();
	const tooltipLabel = import_react.useMemo(() => {
		if (hideLabel || !payload?.length) return null;
		const [item] = payload;
		const itemConfig = getPayloadConfigFromPayload(config, item, `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`);
		const value = !labelKey && typeof label === "string" ? config[label]?.label ?? label : itemConfig?.label;
		if (labelFormatter) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("font-medium", labelClassName),
			children: labelFormatter(value, payload)
		});
		if (!value) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("font-medium", labelClassName),
			children: value
		});
	}, [
		label,
		labelFormatter,
		payload,
		hideLabel,
		labelClassName,
		config,
		labelKey
	]);
	if (!active || !payload?.length) return null;
	const nestLabel = payload.length === 1 && indicator !== "dot";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className),
		children: [!nestLabel ? tooltipLabel : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-1.5",
			children: payload.filter((item) => item.type !== "none").map((item, index) => {
				const itemConfig = getPayloadConfigFromPayload(config, item, `${nameKey ?? item.name ?? item.dataKey ?? "value"}`);
				const indicatorColor = color ?? item.payload?.fill ?? item.color;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center"),
					children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [itemConfig?.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
							"h-2.5 w-2.5": indicator === "dot",
							"w-1": indicator === "line",
							"w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
							"my-0.5": nestLabel && indicator === "dashed"
						}),
						style: {
							"--color-bg": indicatorColor,
							"--color-border": indicatorColor
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [nestLabel ? tooltipLabel : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: itemConfig?.label ?? item.name
							})]
						}), item.value != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono font-medium text-foreground tabular-nums",
							children: typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)
						})]
					})] })
				}, index);
			})
		})]
	});
}
function getPayloadConfigFromPayload(config, payload, key) {
	if (typeof payload !== "object" || payload === null) return;
	const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
	let configLabelKey = key;
	if (key in payload && typeof payload[key] === "string") configLabelKey = payload[key];
	else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") configLabelKey = payloadPayload[key];
	return configLabelKey in config ? config[configLabelKey] : config[key];
}
function LiveVoteChart({ responses }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
		config: { votes: {
			label: "Votes",
			color: "var(--arena-cobalt)"
		} },
		className: "h-72 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data: responses.map((response) => ({
				slot: response.slot,
				votes: response.votes
			})),
			margin: {
				left: 0,
				right: 10,
				top: 10,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, { vertical: false }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "slot",
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					allowDecimals: false,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "votes",
					fill: "var(--color-votes)",
					radius: [
						12,
						12,
						0,
						0
					]
				})
			]
		})
	});
}
var preparedCache = /* @__PURE__ */ new Map();
function getPrepared(text, font) {
	const cacheKey = `${font}::${text}`;
	const cached = preparedCache.get(cacheKey);
	if (cached) return cached;
	const preparedText = prepare(text, font);
	preparedCache.set(cacheKey, preparedText);
	return preparedText;
}
function usePretextBlock(text, font, lineHeight) {
	const ref = (0, import_react.useRef)(null);
	const deferredText = (0, import_react.useDeferredValue)(text);
	const [metrics, setMetrics] = (0, import_react.useState)(null);
	const measure = (0, import_react.useEffectEvent)(async () => {
		if (!ref.current || !deferredText) {
			setMetrics(null);
			return;
		}
		await document.fonts.ready;
		const width = ref.current.clientWidth;
		if (!width) return;
		setMetrics(layout(getPrepared(deferredText, font), width, lineHeight));
	});
	(0, import_react.useEffect)(() => {
		measure();
		if (!ref.current) return;
		const observer = new ResizeObserver(() => {
			measure();
		});
		observer.observe(ref.current);
		return () => {
			observer.disconnect();
		};
	}, [
		deferredText,
		font,
		lineHeight,
		measure
	]);
	return {
		ref,
		metrics
	};
}
function MeasuredEditorialText({ text, className, fallback = "No copy available yet." }) {
	const { ref, metrics } = usePretextBlock(text, "600 18px \"Source Serif 4\"", 28);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: cn("rounded-[1.4rem] border border-border/70 bg-card px-5 py-4", className),
		style: metrics?.height ? { minHeight: `${metrics.height + 32}px` } : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-serif text-[1.05rem] leading-7 text-foreground",
			children: text ?? fallback
		}), metrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground",
			children: [
				metrics.lineCount,
				" measured line",
				metrics.lineCount === 1 ? "" : "s"
			]
		}) : null]
	});
}
function RoundResponseCard({ response, revealed, disabled, onVote, showVoteButton }) {
	const failed = response.status !== "success";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn("arena-panel flex h-full flex-col", response.isWinner && revealed && "border-[var(--arena-win)] shadow-[0_20px_40px_rgba(214,118,21,0.14)]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "rounded-full px-3 py-1 text-xs tracking-[0.18em]",
						children: ["Slot ", response.slot]
					}), response.isWinner && revealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						className: "rounded-full bg-[var(--arena-win)] text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mr-1 size-3.5" }), "Winner"]
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-2xl",
					children: revealed ? response.label ?? `Response ${response.slot}` : `Anonymous ${response.slot}`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex-1 space-y-4",
				children: failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-[1.2rem] border border-dashed border-border/80 bg-muted/60 px-4 py-5 text-sm text-muted-foreground",
					children: response.errorMessage ?? "This model did not return a valid answer in time."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-pretty text-[0.98rem] leading-7 text-foreground",
					children: response.text
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm text-muted-foreground",
					children: [revealed ? `${response.votes} vote${response.votes === 1 ? "" : "s"}` : "Anonymous until reveal", response.latencyMs ? ` · ${formatDurationMs(response.latencyMs)}` : ""]
				}), showVoteButton ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: disabled || failed,
					onClick: () => onVote?.(response.id),
					children: "Vote"
				}) : null]
			})
		]
	});
}
function SessionPage() {
	const { slug } = Route.useParams();
	const [participantToken, setParticipantToken] = useParticipantToken(slug);
	const sessionView = useQuery(api.sessions.getPublicSessionView, {
		slug,
		participantToken
	});
	const joinSession = useMutation(api.sessions.joinBySlug);
	const submitTopic = useMutation(api.rounds.submitTopic);
	const castVote = useMutation(api.votes.castHumanVote);
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [pendingJoin, setPendingJoin] = (0, import_react.useState)(false);
	const [pendingTopic, setPendingTopic] = (0, import_react.useState)(false);
	const [pendingVoteId, setPendingVoteId] = (0, import_react.useState)(null);
	async function handleJoin(event) {
		event.preventDefault();
		const parsed = joinSessionSchema.safeParse({
			displayName,
			email
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Join details are invalid.");
			return;
		}
		setPendingJoin(true);
		try {
			setParticipantToken((await joinSession({
				slug,
				displayName: parsed.data.displayName,
				email: normalizeOptionalEmail(parsed.data.email),
				existingToken: participantToken
			})).accessToken);
			toast.success("Joined the live room.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not join the session.");
		} finally {
			setPendingJoin(false);
		}
	}
	async function handleTopicSubmit(event) {
		event.preventDefault();
		if (!participantToken) {
			toast.error("Join the session before submitting a topic.");
			return;
		}
		const parsed = topicSchema.safeParse({ topic });
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Topic is invalid.");
			return;
		}
		setPendingTopic(true);
		try {
			await submitTopic({
				slug,
				participantToken,
				topic: parsed.data.topic
			});
			setTopic("");
			toast.success("Topic locked for the round.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not submit topic.");
		} finally {
			setPendingTopic(false);
		}
	}
	async function handleVote(responseId) {
		if (!participantToken) {
			toast.error("Join the session before voting.");
			return;
		}
		setPendingVoteId(responseId);
		try {
			const result = await castVote({
				slug,
				participantToken,
				responseId
			});
			toast.success(result.accepted ? "Vote locked in." : "Your vote was already counted.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Vote failed.");
		} finally {
			setPendingVoteId(null);
		}
	}
	if (!sessionView) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-frame",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "arena-panel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "font-serif text-4xl",
				children: "Session not found"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "This share link does not match an active AI Arena session." })] })
		})
	});
	const liveRound = sessionView.currentRound;
	const latestFinishedRound = sessionView.latestFinishedRound;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-frame space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "hero-shell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "rounded-full bg-[var(--arena-signal)] text-white",
								children: sessionView.session.statusLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: sessionView.session.themeLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								children: ["Code ", sessionView.session.joinCode]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-serif text-5xl",
						children: sessionView.session.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
						className: "max-w-2xl text-base leading-7",
						children: [
							sessionView.session.participantCount,
							" of",
							" ",
							sessionView.session.maxParticipants,
							" seats filled. The room stays anonymous during voting and reveals identities only after the round closes."
						]
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "arena-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "font-serif text-3xl",
					children: "Lobby"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: sessionView.viewer ? `You joined as ${sessionView.viewer.displayName}.` : "Join the room to submit topics and vote." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [!sessionView.viewer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-4",
						onSubmit: handleJoin,
						children: [
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
								disabled: pendingJoin,
								children: pendingJoin ? "Joining…" : "Join Session"
							})
						]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: sessionView.participants.slice(0, 10).map((participant) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar$1, {
								className: "size-7 border border-border/70",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: initials(participant.displayName) })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-foreground",
								children: participant.displayName
							})]
						}, participant.id))
					})]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs$1, {
			defaultValue: "live",
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full max-w-md grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "live",
							children: "Live"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "history",
							children: "History"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "log",
							children: "Arena Log"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "live",
					className: "space-y-4",
					children: [latestFinishedRound && liveRound?.status === "collecting_topic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "arena-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "font-serif text-3xl",
							children: [
								"Round ",
								latestFinishedRound.roundNumber,
								" just closed"
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-4",
							children: [latestFinishedRound.artifacts.criticAnalysis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeasuredEditorialText, { text: latestFinishedRound.artifacts.criticAnalysis }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-4 md:grid-cols-3",
								children: latestFinishedRound.responses.map((response) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundResponseCard, {
									response,
									revealed: true
								}, response.id))
							})]
						})]
					}) : null, liveRound ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "arena-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										children: ["Round ", liveRound.roundNumber]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "capitalize",
										children: liveRound.status.replaceAll("_", " ")
									}),
									liveRound.votingEndsAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										children: ["Voting ends ", formatClock(liveRound.votingEndsAt)]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "font-serif text-4xl",
								children: liveRound.topic ?? "Waiting for a topic"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: liveRound.artifacts.hostTransition ?? liveRound.artifacts.hostIntro ?? "The room is live." })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-6",
							children: [
								liveRound.artifacts.hostIntro ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeasuredEditorialText, { text: liveRound.artifacts.hostIntro }) : null,
								sessionView.viewer?.canSubmitTopic ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "space-y-3",
									onSubmit: handleTopicSubmit,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
											htmlFor: "topic",
											children: "Pitch the next prompt"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											id: "topic",
											value: topic,
											onChange: (event) => setTopic(event.target.value),
											placeholder: "Example: Make a joke about debugging a smart toaster."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											disabled: pendingTopic,
											children: pendingTopic ? "Locking topic…" : "Submit Topic"
										})
									]
								}) : null,
								liveRound.status === "generating" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-[1.3rem] border border-border/70 bg-background/65 px-4 py-5 text-muted-foreground",
									children: "Models are generating now. Any provider that misses the 15 second window is marked with a timeout notice and the round continues."
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
									children: liveRound.responses.map((response) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundResponseCard, {
										response,
										revealed: liveRound.status === "scored",
										showVoteButton: liveRound.status === "voting" && sessionView.viewer?.canVote,
										disabled: pendingVoteId !== null,
										onVote: handleVote
									}, response.id))
								}),
								liveRound.status === "voting" && (sessionView.viewer?.hasVotedCurrentRound || !sessionView.viewer?.canVote) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "rounded-[1.5rem] border border-border/70 bg-background/70",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "font-serif text-3xl",
										children: "Live vote split"
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveVoteChart, { responses: liveRound.responses.map((response) => ({
										slot: response.slot,
										votes: response.votes
									})) }) })]
								}) : null,
								liveRound.status === "scored" && liveRound.artifacts.criticAnalysis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeasuredEditorialText, { text: liveRound.artifacts.criticAnalysis }) : null,
								liveRound.status === "scored" && liveRound.artifacts.hostRecap ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeasuredEditorialText, { text: liveRound.artifacts.hostRecap }) : null
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "arena-panel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-serif text-4xl",
							children: "Waiting for the admin"
						}) })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "history",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: sessionView.rounds.map((round) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "arena-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									children: ["Round ", round.roundNumber]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "capitalize",
									children: round.status.replaceAll("_", " ")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "font-serif text-3xl",
								children: round.topic ?? "No topic submitted"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-4",
								children: [
									round.artifacts.hostIntro ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeasuredEditorialText, { text: round.artifacts.hostIntro }) : null,
									round.artifacts.criticAnalysis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeasuredEditorialText, { text: round.artifacts.criticAnalysis }) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
										children: round.responses.map((response) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundResponseCard, {
											response,
											revealed: round.status === "scored"
										}, response.id))
									})
								]
							})]
						}, round.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "log",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "arena-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-serif text-3xl",
							children: "Live event log"
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea$1, {
							className: "h-[32rem] pr-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: sessionView.events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-[1.2rem] border border-border/70 bg-background/65 px-4 py-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "eyebrow",
											children: formatClock(event.createdAt)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-medium text-foreground",
											children: event.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: event.description
										})
									]
								}, event._id))
							})
						}) })]
					})
				})
			]
		})]
	});
}
//#endregion
export { SessionPage as component };
