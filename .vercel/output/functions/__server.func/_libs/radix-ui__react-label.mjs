import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { n as Primitive, s as require_jsx_runtime } from "./@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.pnpm/@radix-ui+react-label@2.1.7_@types+react-dom@19.2.2_@types+react@19.2.2__@types+react@1_1d2e172fc38b87ae008c121694d7ef57/node_modules/@radix-ui/react-label/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var NAME = "Label";
var Label = import_react.forwardRef((props, forwardedRef) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.label, {
		...props,
		ref: forwardedRef,
		onMouseDown: (event) => {
			if (event.target.closest("button, input, select, textarea")) return;
			props.onMouseDown?.(event);
			if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
		}
	});
});
Label.displayName = NAME;
var Root = Label;
//#endregion
export { Root as t };
