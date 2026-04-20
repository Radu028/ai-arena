import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as ItemText, c as ScrollDownButton, d as Value, f as Viewport, i as ItemIndicator, l as ScrollUpButton, n as Icon, o as Portal, r as Item, s as Root2, t as Content2, u as Trigger } from "../_libs/@radix-ui/react-select+[...].mjs";
import { n as CheckboxIndicator, t as Checkbox } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { c as cn, i as CardDescription, n as Card, o as CardHeader, r as CardContent, s as CardTitle, t as Button } from "./card-CtI9zUkN.mjs";
import { i as useMutation } from "../_libs/convex.mjs";
import { t as api } from "./api-BYwlqCnN.mjs";
import { p as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ChevronDown, g as ChevronUp, v as Check } from "../_libs/lucide-react.mjs";
import { t as AdminGuard } from "./AdminGuard-D8w_UCoS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as THEME_COPY, t as AVAILABLE_MODELS } from "./arena-COEnf_2-.mjs";
import { n as Label$1, r as createSessionSchema, t as Input } from "./label-Dl3dzCU8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.sessions.new-CqMggVC0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
function Checkbox$1({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
		"data-slot": "checkbox",
		className: cn("peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none [&>svg]:size-3.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {})
		})
	});
}
function Select$1({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		"data-slot": "select",
		...props
	});
}
function SelectValue({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Value, {
		"data-slot": "select-value",
		...props
	});
}
function SelectTrigger({ className, size = "default", children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
		"data-slot": "select-trigger",
		"data-size": size,
		className: cn("flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none size-4 text-muted-foreground" })
		})]
	});
}
function SelectContent({ className, children, position = "item-aligned", align = "center", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content2, {
		"data-slot": "select-content",
		"data-align-trigger": position === "item-aligned",
		className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
		position,
		align,
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
				"data-position": position,
				className: cn("data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)", position === "popper" && ""),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
		]
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
		"data-slot": "select-item",
		className: cn("relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "pointer-events-none" }) })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemText, { children })]
	});
}
function SelectScrollUpButton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollUpButton, {
		"data-slot": "select-scroll-up-button",
		className: cn("z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {})
	});
}
function SelectScrollDownButton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollDownButton, {
		"data-slot": "select-scroll-down-button",
		className: cn("z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {})
	});
}
function CreateSessionForm() {
	const navigate = useNavigate();
	const createSession = useMutation(api.sessions.create);
	const [title, setTitle] = (0, import_react.useState)("Friday Night Arena");
	const [theme, setTheme] = (0, import_react.useState)("comedy");
	const [roundCount, setRoundCount] = (0, import_react.useState)(3);
	const [maxParticipants, setMaxParticipants] = (0, import_react.useState)(200);
	const [selectedModels, setSelectedModels] = (0, import_react.useState)(AVAILABLE_MODELS.slice(0, 4).map((model) => model.key));
	const [pending, setPending] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		const parsed = createSessionSchema.safeParse({
			title,
			theme,
			roundCount,
			modelKeys: selectedModels,
			maxParticipants
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Session settings are invalid.");
			return;
		}
		setPending(true);
		try {
			const result = await createSession(parsed.data);
			toast.success("Session created.");
			(0, import_react.startTransition)(() => {
				navigate({
					to: "/admin/sessions/$sessionId",
					params: { sessionId: result.sessionId }
				});
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create session.");
		} finally {
			setPending(false);
		}
	}
	function toggleModel(modelKey) {
		setSelectedModels((current) => current.includes(modelKey) ? current.filter((item) => item !== modelKey) : [...current, modelKey]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "arena-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "font-serif text-3xl",
			children: "Create a live battle"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose the model lineup, rounds, theme, and room size. Sessions are created in a waiting state until you start them manually." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-8",
			onSubmit: handleSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
								htmlFor: "title",
								children: "Session title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "title",
								value: title,
								onChange: (event) => setTitle(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, { children: "Theme" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select$1, {
								value: theme,
								onValueChange: (value) => setTheme(value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a theme" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(THEME_COPY).map(([key, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: key,
									children: copy.label
								}, key)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
								htmlFor: "roundCount",
								children: "Rounds"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "roundCount",
								type: "number",
								min: 1,
								max: 10,
								value: roundCount,
								onChange: (event) => setRoundCount(Number(event.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
								htmlFor: "maxParticipants",
								children: "Participant cap"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "maxParticipants",
								type: "number",
								min: 2,
								max: 1e3,
								value: maxParticipants,
								onChange: (event) => setMaxParticipants(Number(event.target.value))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, { children: "Model lineup" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 md:grid-cols-2",
						children: AVAILABLE_MODELS.map((model) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex cursor-pointer items-start gap-3 rounded-[1.3rem] border border-border/70 bg-background/70 px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
									checked: selectedModels.includes(model.key),
									onCheckedChange: () => toggleModel(model.key)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-foreground",
										children: model.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: model.description
									})]
								})]
							}, model.key);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						disabled: pending,
						children: pending ? "Creating…" : "Create Session"
					})
				})
			]
		}) })]
	});
}
function NewSessionPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-frame space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminGuard, {
			title: "Create a new arena session",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Session setup"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-5xl text-foreground",
					children: "Configure the battle"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateSessionForm, {})]
		})
	});
}
//#endregion
export { NewSessionPage as component };
