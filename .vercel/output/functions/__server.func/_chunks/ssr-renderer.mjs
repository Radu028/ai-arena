import { i as toRequest, n as HTTPError } from "../_libs/h3+rou3+srvx.mjs";
//#region node_modules/.pnpm/nitro-nightly@3.0.1-20260409-145609-ab30376e_dotenv@17.4.1_jiti@2.6.1_lru-cache@11.3.3__fbf8d694407e552530f3e592ed6cb56d/node_modules/nitro-nightly/dist/runtime/vite.mjs
function fetchViteEnv(viteEnvName, input, init) {
	const viteEnv = (globalThis.__nitro_vite_envs__ || {})[viteEnvName];
	if (!viteEnv) throw HTTPError.status(404);
	return Promise.resolve(viteEnv.fetch(toRequest(input, init)));
}
//#endregion
//#region node_modules/.pnpm/nitro-nightly@3.0.1-20260409-145609-ab30376e_dotenv@17.4.1_jiti@2.6.1_lru-cache@11.3.3__fbf8d694407e552530f3e592ed6cb56d/node_modules/nitro-nightly/dist/runtime/internal/vite/ssr-renderer.mjs
/** @param {{ req: Request }} HTTPEvent */
function ssrRenderer({ req }) {
	return fetchViteEnv("ssr", req);
}
//#endregion
export { ssrRenderer as default };
