import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { a as useLayoutEffect2 } from "./@radix-ui/react-avatar+[...].mjs";
//#region node_modules/.pnpm/@radix-ui+react-id@1.1.1_@types+react@19.2.2_react@19.2.5/node_modules/@radix-ui/react-id/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var useReactId = import_react[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
	const [id, setId] = import_react.useState(useReactId());
	useLayoutEffect2(() => {
		if (!deterministicId) setId((reactId) => reactId ?? String(count++));
	}, [deterministicId]);
	return deterministicId || (id ? `radix-${id}` : "");
}
//#endregion
export { useId as t };
