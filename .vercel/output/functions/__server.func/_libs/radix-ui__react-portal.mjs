import { i as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { n as Primitive, s as require_jsx_runtime } from "./@radix-ui/react-arrow+[...].mjs";
import { a as useLayoutEffect2 } from "./@radix-ui/react-avatar+[...].mjs";
//#region node_modules/.pnpm/@radix-ui+react-portal@1.1.9_@types+react-dom@19.2.2_@types+react@19.2.2__@types+react@_5bd56948439447ae994129801538f75d/node_modules/@radix-ui/react-portal/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var PORTAL_NAME = "Portal";
var Portal = import_react.forwardRef((props, forwardedRef) => {
	const { container: containerProp, ...portalProps } = props;
	const [mounted, setMounted] = import_react.useState(false);
	useLayoutEffect2(() => setMounted(true), []);
	const container = containerProp || mounted && globalThis?.document?.body;
	return container ? import_react_dom.createPortal(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
		...portalProps,
		ref: forwardedRef
	}), container) : null;
});
Portal.displayName = PORTAL_NAME;
//#endregion
export { Portal as t };
