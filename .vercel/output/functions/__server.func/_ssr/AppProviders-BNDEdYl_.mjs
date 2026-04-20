import { i as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as ConvexProvider, r as ConvexReactClient, t as ConvexProviderWithClerk } from "../_libs/convex.mjs";
import { t as getStartContext } from "./async-local-storage-Bgyd8gHc.mjs";
import { c as ScriptOnce, i as useLocation, p as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as require_client } from "../_libs/react-dom+scheduler.mjs";
import { t as J } from "../_libs/next-themes.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppProviders-BNDEdYl_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime());
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var import_client = /* @__PURE__ */ __toESM(require_client());
var getGlobalStartContext = () => {
	const context = getStartContext().contextAfterGlobalMiddlewares;
	if (!context) throw new Error(`Global context not set yet, you are calling getGlobalStartContext() before the global middlewares are applied.`);
	return context;
};
/**
* Creates a type guard function for any error class.
* The returned function can be called as a standalone function or as a method on an error object.
*
* @example
* ```typescript
* class MyError extends Error {}
* const isMyError = createErrorTypeGuard(MyError);
*
* // As a standalone function
* if (isMyError(error)) { ... }
*
* // As a method (when attached to error object)
* if (error.isMyError()) { ... }
* ```
*/
function createErrorTypeGuard(ErrorClass) {
	function typeGuard(error) {
		const target = error ?? this;
		if (!target) throw new TypeError(`${ErrorClass.kind || ErrorClass.name} type guard requires an error object`);
		if (ErrorClass.kind && typeof target === "object" && target !== null && "constructor" in target) {
			if (target.constructor?.kind === ErrorClass.kind) return true;
		}
		return target instanceof ErrorClass;
	}
	return typeGuard;
}
var ClerkError = class ClerkError extends Error {
	static kind = "ClerkError";
	clerkError = true;
	code;
	longMessage;
	docsUrl;
	cause;
	get name() {
		return this.constructor.name;
	}
	constructor(opts) {
		super(new.target.formatMessage(new.target.kind, opts.message, opts.code, opts.docsUrl), { cause: opts.cause });
		Object.setPrototypeOf(this, ClerkError.prototype);
		this.code = opts.code;
		this.docsUrl = opts.docsUrl;
		this.longMessage = opts.longMessage;
		this.cause = opts.cause;
	}
	toString() {
		return `[${this.name}]\nMessage:${this.message}`;
	}
	static formatMessage(name, msg, code, docsUrl) {
		const prefix = "Clerk:";
		const regex = new RegExp(prefix.replace(" ", "\\s*"), "i");
		msg = msg.replace(regex, "");
		msg = `${prefix} ${msg.trim()}\n\n(code="${code}")\n\n`;
		if (docsUrl) msg += `\n\nDocs: ${docsUrl}`;
		return msg;
	}
};
/**
* Custom error class for representing Clerk runtime errors.
*
* @class ClerkRuntimeError
*
* @example
*   throw new ClerkRuntimeError('An error occurred', { code: 'password_invalid' });
*/
var ClerkRuntimeError = class ClerkRuntimeError extends ClerkError {
	static kind = "ClerkRuntimeError";
	/**
	* @deprecated Use `clerkError` property instead. This property is maintained for backward compatibility.
	*/
	clerkRuntimeError = true;
	constructor(message, options) {
		super({
			...options,
			message
		});
		Object.setPrototypeOf(this, ClerkRuntimeError.prototype);
	}
};
createErrorTypeGuard(ClerkRuntimeError);
/**
* This error contains the specific error message, code, and any additional metadata that was returned by the Clerk API.
*/
var ClerkAPIError = class {
	static kind = "ClerkAPIError";
	code;
	message;
	longMessage;
	meta;
	constructor(json) {
		const parsedError = {
			code: json.code,
			message: json.message,
			longMessage: json.long_message,
			meta: {
				paramName: json.meta?.param_name,
				sessionId: json.meta?.session_id,
				emailAddresses: json.meta?.email_addresses,
				identifiers: json.meta?.identifiers,
				zxcvbn: json.meta?.zxcvbn,
				plan: json.meta?.plan,
				isPlanUpgradePossible: json.meta?.is_plan_upgrade_possible
			}
		};
		this.code = parsedError.code;
		this.message = parsedError.message;
		this.longMessage = parsedError.longMessage;
		this.meta = parsedError.meta;
	}
};
createErrorTypeGuard(ClerkAPIError);
createErrorTypeGuard(class ClerkAPIResponseError extends ClerkError {
	static kind = "ClerkAPIResponseError";
	status;
	clerkTraceId;
	retryAfter;
	errors;
	constructor(message, options) {
		const { data: errorsJson, status, clerkTraceId, retryAfter } = options;
		super({
			...options,
			message,
			code: "api_response_error"
		});
		Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);
		this.status = status;
		this.clerkTraceId = clerkTraceId;
		this.retryAfter = retryAfter;
		this.errors = (errorsJson || []).map((e) => new ClerkAPIError(e));
	}
	toString() {
		let message = `[${this.name}]\nMessage:${this.message}\nStatus:${this.status}\nSerialized errors: ${this.errors.map((e) => JSON.stringify(e))}`;
		if (this.clerkTraceId) message += `\nClerk Trace ID: ${this.clerkTraceId}`;
		return message;
	}
	static formatMessage(name, msg, _, __) {
		return msg;
	}
});
var DefaultMessages = Object.freeze({
	InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
	InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
	MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
	MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
	MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
});
/**
* Builds an error thrower.
*
* @internal
*/
function buildErrorThrower({ packageName, customMessages }) {
	let pkg = packageName;
	/**
	* Builds a message from a raw message and replacements.
	*
	* @internal
	*/
	function buildMessage(rawMessage, replacements) {
		if (!replacements) return `${pkg}: ${rawMessage}`;
		let msg = rawMessage;
		const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
		for (const match of matches) {
			const replacement = (replacements[match[1]] || "").toString();
			msg = msg.replace(`{{${match[1]}}}`, replacement);
		}
		return `${pkg}: ${msg}`;
	}
	const messages = {
		...DefaultMessages,
		...customMessages
	};
	return {
		setPackageName({ packageName: packageName$1 }) {
			if (typeof packageName$1 === "string") pkg = packageName$1;
			return this;
		},
		setMessages({ customMessages: customMessages$1 }) {
			Object.assign(messages, customMessages$1 || {});
			return this;
		},
		throwInvalidPublishableKeyError(params) {
			throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
		},
		throwInvalidProxyUrl(params) {
			throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
		},
		throwMissingPublishableKeyError() {
			throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
		},
		throwMissingSecretKeyError() {
			throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
		},
		throwMissingClerkProviderError(params) {
			throw new Error(buildMessage(messages.MissingClerkProvider, params));
		},
		throw(message) {
			throw new Error(buildMessage(message));
		}
	};
}
var DEV_OR_STAGING_SUFFIXES = [
	".lcl.dev",
	".stg.dev",
	".lclstage.dev",
	".stgstage.dev",
	".dev.lclclerk.com",
	".stg.lclclerk.com",
	".accounts.lclclerk.com",
	"accountsstage.dev",
	"accounts.dev"
];
/**
* A function that decodes a string of data which has been encoded using base-64 encoding.
* Uses `atob` if available, otherwise uses `Buffer` from `globalThis`. If neither are available, returns the data as-is.
*/
var isomorphicAtob = (data) => {
	if (typeof atob !== "undefined" && typeof atob === "function") return atob(data);
	else if (typeof globalThis.Buffer !== "undefined") return globalThis.Buffer.from(data, "base64").toString();
	return data;
};
/** Prefix used for production publishable keys */
var PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
/** Prefix used for development publishable keys */
var PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
/**
* Validates that a decoded publishable key has the correct format.
* The decoded value should be a frontend API followed by exactly one '$' at the end.
*
* @param decoded - The decoded publishable key string to validate.
* @returns `true` if the decoded key has valid format, `false` otherwise.
*/
function isValidDecodedPublishableKey(decoded) {
	if (!decoded.endsWith("$")) return false;
	const withoutTrailing = decoded.slice(0, -1);
	if (withoutTrailing.includes("$")) return false;
	return withoutTrailing.includes(".");
}
/**
* Parses and validates a publishable key, extracting the frontend API and instance type.
*
* @param key - The publishable key to parse.
* @param options - Configuration options for parsing.
* @param options.fatal
* @param options.domain
* @param options.proxyUrl
* @param options.isSatellite
* @returns Parsed publishable key object with instanceType and frontendApi, or null if invalid.
*
* @throws {Error} When options.fatal is true and key is missing or invalid.
*/
function parsePublishableKey(key, options = {}) {
	key = key || "";
	if (!key || !isPublishableKey(key)) {
		if (options.fatal && !key) throw new Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");
		if (options.fatal && !isPublishableKey(key)) throw new Error("Publishable key not valid.");
		return null;
	}
	const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
	let decodedFrontendApi;
	try {
		decodedFrontendApi = isomorphicAtob(key.split("_")[2]);
	} catch {
		if (options.fatal) throw new Error("Publishable key not valid: Failed to decode key.");
		return null;
	}
	if (!isValidDecodedPublishableKey(decodedFrontendApi)) {
		if (options.fatal) throw new Error("Publishable key not valid: Decoded key has invalid format.");
		return null;
	}
	let frontendApi = decodedFrontendApi.slice(0, -1);
	if (options.proxyUrl) frontendApi = options.proxyUrl;
	else if (instanceType !== "development" && options.domain && options.isSatellite) frontendApi = `clerk.${options.domain}`;
	return {
		instanceType,
		frontendApi
	};
}
/**
* Checks if the provided key is a valid publishable key.
*
* @param key - The key to be checked. Defaults to an empty string if not provided.
* @returns `true` if 'key' is a valid publishable key, `false` otherwise.
*/
function isPublishableKey(key = "") {
	try {
		if (!(key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX))) return false;
		const parts = key.split("_");
		if (parts.length !== 3) return false;
		const encodedPart = parts[2];
		if (!encodedPart) return false;
		return isValidDecodedPublishableKey(isomorphicAtob(encodedPart));
	} catch {
		return false;
	}
}
/**
* Creates a memoized cache for checking if URLs are development or staging environments.
* Uses a Map to cache results for better performance on repeated checks.
*
* @returns An object with an isDevOrStagingUrl method that checks if a URL is dev/staging.
*/
function createDevOrStagingUrlCache() {
	const devOrStagingUrlCache = /* @__PURE__ */ new Map();
	return { isDevOrStagingUrl: (url) => {
		if (!url) return false;
		const hostname = typeof url === "string" ? url : url.hostname;
		let res = devOrStagingUrlCache.get(hostname);
		if (res === void 0) {
			res = DEV_OR_STAGING_SUFFIXES.some((s) => hostname.endsWith(s));
			devOrStagingUrlCache.set(hostname, res);
		}
		return res;
	} };
}
var TYPES_TO_OBJECTS = {
	strict_mfa: {
		afterMinutes: 10,
		level: "multi_factor"
	},
	strict: {
		afterMinutes: 10,
		level: "second_factor"
	},
	moderate: {
		afterMinutes: 60,
		level: "second_factor"
	},
	lax: {
		afterMinutes: 1440,
		level: "second_factor"
	}
};
var ALLOWED_LEVELS = new Set([
	"first_factor",
	"second_factor",
	"multi_factor"
]);
var ALLOWED_TYPES = new Set([
	"strict_mfa",
	"strict",
	"moderate",
	"lax"
]);
var ORG_SCOPES = new Set([
	"o",
	"org",
	"organization"
]);
var USER_SCOPES = new Set(["u", "user"]);
var isValidMaxAge = (maxAge) => typeof maxAge === "number" && maxAge > 0;
var isValidLevel = (level) => ALLOWED_LEVELS.has(level);
var isValidVerificationType = (type) => ALLOWED_TYPES.has(type);
var prefixWithOrg = (value) => value.replace(/^(org:)*/, "org:");
/**
* Checks if a user has the required organization-level authorization.
* Verifies if the user has the specified role or permission within their organization.
*
* @returns null, if unable to determine due to missing data or unspecified role/permission.
*/
var checkOrgAuthorization = (params, options) => {
	const { orgId, orgRole, orgPermissions } = options;
	if (!params.role && !params.permission) return null;
	if (!orgId || !orgRole || !orgPermissions) return null;
	if (params.permission) return orgPermissions.includes(prefixWithOrg(params.permission));
	if (params.role) return prefixWithOrg(orgRole) === prefixWithOrg(params.role);
	return null;
};
var checkForFeatureOrPlan = (claim, featureOrPlan) => {
	const { org: orgFeatures, user: userFeatures } = splitByScope(claim);
	const [rawScope, rawId] = featureOrPlan.split(":");
	const hasExplicitScope = rawId !== void 0;
	const scope = rawScope;
	const id = rawId || rawScope;
	if (hasExplicitScope && !ORG_SCOPES.has(scope) && !USER_SCOPES.has(scope)) throw new Error(`Invalid scope: ${scope}`);
	if (hasExplicitScope) {
		if (ORG_SCOPES.has(scope)) return orgFeatures.includes(id);
		if (USER_SCOPES.has(scope)) return userFeatures.includes(id);
	}
	return [...orgFeatures, ...userFeatures].includes(id);
};
var checkBillingAuthorization = (params, options) => {
	const { features, plans } = options;
	if (params.feature && features) return checkForFeatureOrPlan(features, params.feature);
	if (params.plan && plans) return checkForFeatureOrPlan(plans, params.plan);
	return null;
};
var splitByScope = (fea) => {
	const org = [];
	const user = [];
	if (!fea) return {
		org,
		user
	};
	const parts = fea.split(",");
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i].trim();
		const colonIndex = part.indexOf(":");
		if (colonIndex === -1) throw new Error(`Invalid claim element (missing colon): ${part}`);
		const scope = part.slice(0, colonIndex);
		const value = part.slice(colonIndex + 1);
		if (scope === "o") org.push(value);
		else if (scope === "u") user.push(value);
		else if (scope === "ou" || scope === "uo") {
			org.push(value);
			user.push(value);
		}
	}
	return {
		org,
		user
	};
};
var validateReverificationConfig = (config) => {
	if (!config) return false;
	const convertConfigToObject = (config$1) => {
		if (typeof config$1 === "string") return TYPES_TO_OBJECTS[config$1];
		return config$1;
	};
	const isValidStringValue = typeof config === "string" && isValidVerificationType(config);
	const isValidObjectValue = typeof config === "object" && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);
	if (isValidStringValue || isValidObjectValue) return convertConfigToObject.bind(null, config);
	return false;
};
/**
* Evaluates if the user meets re-verification authentication requirements.
* Compares the user's factor verification ages against the specified maxAge.
* Handles different verification levels (first factor, second factor, multi-factor).
*
* @returns null, if requirements or verification data are missing.
*/
var checkReverificationAuthorization = (params, { factorVerificationAge }) => {
	if (!params.reverification || !factorVerificationAge) return null;
	const isValidReverification = validateReverificationConfig(params.reverification);
	if (!isValidReverification) return null;
	const { level, afterMinutes } = isValidReverification();
	const [factor1Age, factor2Age] = factorVerificationAge;
	const isValidFactor1 = factor1Age !== -1 ? afterMinutes > factor1Age : null;
	const isValidFactor2 = factor2Age !== -1 ? afterMinutes > factor2Age : null;
	switch (level) {
		case "first_factor": return isValidFactor1;
		case "second_factor": return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
		case "multi_factor": return factor2Age === -1 ? isValidFactor1 : isValidFactor1 && isValidFactor2;
	}
};
/**
* Creates a function for comprehensive user authorization checks.
* Combines organization-level and reverification authentication checks.
* The returned function authorizes if both checks pass, or if at least one passes
* when the other is indeterminate. Fails if userId is missing.
*/
var createCheckAuthorization = (options) => {
	return (params) => {
		if (!options.userId) return false;
		const billingAuthorization = checkBillingAuthorization(params, options);
		const orgAuthorization = checkOrgAuthorization(params, options);
		const reverificationAuthorization = checkReverificationAuthorization(params, options);
		if ([billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === null)) return [billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === true);
		return [billingAuthorization || orgAuthorization, reverificationAuthorization].every((a) => a === true);
	};
};
/**
* Shared utility function that centralizes auth state resolution logic,
* preventing duplication across different packages.
*
* @internal
*/
var resolveAuthState = ({ authObject: { sessionId, sessionStatus, userId, actor, orgId, orgRole, orgSlug, signOut, getToken, has, sessionClaims }, options: { treatPendingAsSignedOut = true } }) => {
	if (sessionId === void 0 && userId === void 0) return {
		actor: void 0,
		getToken,
		has: () => false,
		isLoaded: false,
		isSignedIn: void 0,
		orgId: void 0,
		orgRole: void 0,
		orgSlug: void 0,
		sessionClaims: void 0,
		sessionId,
		signOut,
		userId
	};
	if (sessionId === null && userId === null) return {
		actor: null,
		getToken,
		has: () => false,
		isLoaded: true,
		isSignedIn: false,
		orgId: null,
		orgRole: null,
		orgSlug: null,
		sessionClaims: null,
		sessionId,
		signOut,
		userId
	};
	if (treatPendingAsSignedOut && sessionStatus === "pending") return {
		actor: null,
		getToken,
		has: () => false,
		isLoaded: true,
		isSignedIn: false,
		orgId: null,
		orgRole: null,
		orgSlug: null,
		sessionClaims: null,
		sessionId: null,
		signOut,
		userId: null
	};
	if (!!sessionId && !!sessionClaims && !!userId && !!orgId && !!orgRole) return {
		actor: actor || null,
		getToken,
		has,
		isLoaded: true,
		isSignedIn: true,
		orgId,
		orgRole,
		orgSlug: orgSlug || null,
		sessionClaims,
		sessionId,
		signOut,
		userId
	};
	if (!!sessionId && !!sessionClaims && !!userId && !orgId) return {
		actor: actor || null,
		getToken,
		has,
		isLoaded: true,
		isSignedIn: true,
		orgId: null,
		orgRole: null,
		orgSlug: null,
		sessionClaims,
		sessionId,
		signOut,
		userId
	};
};
/**
* Derives authentication state based on the current rendering context (SSR or client-side).
*/
var deriveState = (clerkOperational, state, initialState) => {
	if (!clerkOperational && initialState) return deriveFromSsrInitialState(initialState);
	return deriveFromClientSideState(state);
};
var deriveFromSsrInitialState = (initialState) => {
	const userId = initialState.userId;
	const user = initialState.user;
	const sessionId = initialState.sessionId;
	const sessionStatus = initialState.sessionStatus;
	const sessionClaims = initialState.sessionClaims;
	return {
		userId,
		user,
		sessionId,
		session: initialState.session,
		sessionStatus,
		sessionClaims,
		organization: initialState.organization,
		orgId: initialState.orgId,
		orgRole: initialState.orgRole,
		orgPermissions: initialState.orgPermissions,
		orgSlug: initialState.orgSlug,
		actor: initialState.actor,
		factorVerificationAge: initialState.factorVerificationAge
	};
};
var deriveFromClientSideState = (state) => {
	const userId = state.user ? state.user.id : state.user;
	const user = state.user;
	const sessionId = state.session ? state.session.id : state.session;
	const session = state.session;
	const sessionStatus = state.session?.status;
	const sessionClaims = state.session ? state.session.lastActiveToken?.jwt?.claims : null;
	const factorVerificationAge = state.session ? state.session.factorVerificationAge : null;
	const actor = session?.actor;
	const organization = state.organization;
	const orgId = state.organization ? state.organization.id : state.organization;
	const orgSlug = organization?.slug;
	const membership = organization ? user?.organizationMemberships?.find((om) => om.organization.id === orgId) : organization;
	const orgPermissions = membership ? membership.permissions : membership;
	return {
		userId,
		user,
		sessionId,
		session,
		sessionStatus,
		sessionClaims,
		organization,
		orgId,
		orgRole: membership ? membership.role : membership,
		orgSlug,
		orgPermissions,
		actor,
		factorVerificationAge
	};
};
/**
* Converts a string from snake_case to camelCase.
*/
function snakeToCamel(str) {
	return str ? str.replace(/([-_][a-z])/g, (match) => match.toUpperCase().replace(/-|_/, "")) : "";
}
/**
* Converts a string from camelCase to snake_case.
*/
function camelToSnake(str) {
	return str ? str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : "";
}
var createDeepObjectTransformer = (transform) => {
	const deepTransform = (obj) => {
		if (!obj) return obj;
		if (Array.isArray(obj)) return obj.map((el) => {
			if (typeof el === "object" || Array.isArray(el)) return deepTransform(el);
			return el;
		});
		const copy = { ...obj };
		const keys = Object.keys(copy);
		for (const oldName of keys) {
			const newName = transform(oldName.toString());
			if (newName !== oldName) {
				copy[newName] = copy[oldName];
				delete copy[oldName];
			}
			if (typeof copy[newName] === "object") copy[newName] = deepTransform(copy[newName]);
		}
		return copy;
	};
	return deepTransform;
};
createDeepObjectTransformer(camelToSnake);
createDeepObjectTransformer(snakeToCamel);
/**
* A function to determine if a value is truthy.
*
* @returns True for `true`, true, positive numbers. False for `false`, false, 0, negative integers and anything else.
*/
function isTruthy(value) {
	if (typeof value === `boolean`) return value;
	if (value === void 0 || value === null) return false;
	if (typeof value === `string`) {
		if (value.toLowerCase() === `true`) return true;
		if (value.toLowerCase() === `false`) return false;
	}
	const number = parseInt(value, 10);
	if (isNaN(number)) return false;
	if (number > 0) return true;
	return false;
}
var EVENT_METHOD_CALLED = "METHOD_CALLED";
var EVENT_SAMPLING_RATE$2 = .1;
/**
* Fired when a helper method is called from a Clerk SDK.
*/
function eventMethodCalled(method, payload) {
	return {
		event: EVENT_METHOD_CALLED,
		eventSamplingRate: EVENT_SAMPLING_RATE$2,
		payload: {
			method,
			...payload
		}
	};
}
var errorPrefix = "ClerkJS:";
/**
*
*/
function clerkCoreErrorNoClerkSingleton() {
	throw new Error(`${errorPrefix} Clerk instance not found. Make sure Clerk is initialized before using any Clerk components.`);
}
var Subscribable = class {
	constructor() {
		this.listeners = /* @__PURE__ */ new Set();
		this.subscribe = this.subscribe.bind(this);
	}
	subscribe(listener) {
		this.listeners.add(listener);
		this.onSubscribe();
		return () => {
			this.listeners.delete(listener);
			this.onUnsubscribe();
		};
	}
	hasListeners() {
		return this.listeners.size > 0;
	}
	onSubscribe() {}
	onUnsubscribe() {}
};
var defaultTimeoutProvider = {
	setTimeout: (callback, delay) => setTimeout(callback, delay),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId),
	setInterval: (callback, delay) => setInterval(callback, delay),
	clearInterval: (intervalId) => clearInterval(intervalId)
};
var TimeoutManager = class {
	#provider = defaultTimeoutProvider;
	#providerCalled = false;
	setTimeoutProvider(provider) {
		this.#provider = provider;
	}
	setTimeout(callback, delay) {
		return this.#provider.setTimeout(callback, delay);
	}
	clearTimeout(timeoutId) {
		this.#provider.clearTimeout(timeoutId);
	}
	setInterval(callback, delay) {
		return this.#provider.setInterval(callback, delay);
	}
	clearInterval(intervalId) {
		this.#provider.clearInterval(intervalId);
	}
};
var timeoutManager = new TimeoutManager();
function systemSetTimeoutZero(callback) {
	setTimeout(callback, 0);
}
var isServer = typeof window === "undefined" || "Deno" in globalThis;
function noop() {}
function isValidTimeout(value) {
	return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
	return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function resolveStaleTime(staleTime, query) {
	return typeof staleTime === "function" ? staleTime(query) : staleTime;
}
function resolveEnabled(enabled, query) {
	return typeof enabled === "function" ? enabled(query) : enabled;
}
var hasOwn = Object.prototype.hasOwnProperty;
function replaceEqualDeep(a, b) {
	if (a === b) return a;
	const array = isPlainArray(a) && isPlainArray(b);
	if (!array && !(isPlainObject(a) && isPlainObject(b))) return b;
	const aSize = (array ? a : Object.keys(a)).length;
	const bItems = array ? b : Object.keys(b);
	const bSize = bItems.length;
	const copy = array ? new Array(bSize) : {};
	let equalItems = 0;
	for (let i = 0; i < bSize; i++) {
		const key = array ? i : bItems[i];
		const aItem = a[key];
		const bItem = b[key];
		if (aItem === bItem) {
			copy[key] = aItem;
			if (array ? i < aSize : hasOwn.call(a, key)) equalItems++;
			continue;
		}
		if (aItem === null || bItem === null || typeof aItem !== "object" || typeof bItem !== "object") {
			copy[key] = bItem;
			continue;
		}
		const v = replaceEqualDeep(aItem, bItem);
		copy[key] = v;
		if (v === aItem) equalItems++;
	}
	return aSize === bSize && equalItems === aSize ? a : copy;
}
function shallowEqualObjects(a, b) {
	if (!b || Object.keys(a).length !== Object.keys(b).length) return false;
	for (const key in a) if (a[key] !== b[key]) return false;
	return true;
}
function isPlainArray(value) {
	return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o) {
	if (!hasObjectPrototype(o)) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	const prot = ctor.prototype;
	if (!hasObjectPrototype(prot)) return false;
	if (!prot.hasOwnProperty("isPrototypeOf")) return false;
	if (Object.getPrototypeOf(o) !== Object.prototype) return false;
	return true;
}
function hasObjectPrototype(o) {
	return Object.prototype.toString.call(o) === "[object Object]";
}
function replaceData(prevData, data, options) {
	if (typeof options.structuralSharing === "function") return options.structuralSharing(prevData, data);
	else if (options.structuralSharing !== false) return replaceEqualDeep(prevData, data);
	return data;
}
function addToEnd(items, item, max = 0) {
	const newItems = [...items, item];
	return max && newItems.length > max ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max = 0) {
	const newItems = [item, ...items];
	return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
}
var skipToken = Symbol();
function ensureQueryFn(options, fetchOptions) {
	if (!options.queryFn && fetchOptions?.initialPromise) return () => fetchOptions.initialPromise;
	if (!options.queryFn || options.queryFn === skipToken) return () => Promise.reject(/* @__PURE__ */ new Error(`Missing queryFn: '${options.queryHash}'`));
	return options.queryFn;
}
function addConsumeAwareSignal(object, getSignal, onCancelled) {
	let consumed = false;
	let signal;
	Object.defineProperty(object, "signal", {
		enumerable: true,
		get: () => {
			signal ??= getSignal();
			if (consumed) return signal;
			consumed = true;
			if (signal.aborted) onCancelled();
			else signal.addEventListener("abort", onCancelled, { once: true });
			return signal;
		}
	});
	return object;
}
var FocusManager = class extends Subscribable {
	#focused;
	#cleanup;
	#setup;
	constructor() {
		super();
		this.#setup = (onFocus) => {
			if (!isServer && window.addEventListener) {
				const listener = () => onFocus();
				window.addEventListener("visibilitychange", listener, false);
				return () => {
					window.removeEventListener("visibilitychange", listener);
				};
			}
		};
	}
	onSubscribe() {
		if (!this.#cleanup) this.setEventListener(this.#setup);
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			this.#cleanup?.();
			this.#cleanup = void 0;
		}
	}
	setEventListener(setup) {
		this.#setup = setup;
		this.#cleanup?.();
		this.#cleanup = setup((focused) => {
			if (typeof focused === "boolean") this.setFocused(focused);
			else this.onFocus();
		});
	}
	setFocused(focused) {
		if (this.#focused !== focused) {
			this.#focused = focused;
			this.onFocus();
		}
	}
	onFocus() {
		const isFocused = this.isFocused();
		this.listeners.forEach((listener) => {
			listener(isFocused);
		});
	}
	isFocused() {
		if (typeof this.#focused === "boolean") return this.#focused;
		return globalThis.document?.visibilityState !== "hidden";
	}
};
var focusManager = new FocusManager();
function pendingThenable() {
	let resolve;
	let reject;
	const thenable = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	thenable.status = "pending";
	thenable.catch(() => {});
	function finalize(data) {
		Object.assign(thenable, data);
		delete thenable.resolve;
		delete thenable.reject;
	}
	thenable.resolve = (value) => {
		finalize({
			status: "fulfilled",
			value
		});
		resolve(value);
	};
	thenable.reject = (reason) => {
		finalize({
			status: "rejected",
			reason
		});
		reject(reason);
	};
	return thenable;
}
var defaultScheduler = systemSetTimeoutZero;
function createNotifyManager() {
	let queue = [];
	let transactions = 0;
	let notifyFn = (callback) => {
		callback();
	};
	let batchNotifyFn = (callback) => {
		callback();
	};
	let scheduleFn = defaultScheduler;
	const schedule = (callback) => {
		if (transactions) queue.push(callback);
		else scheduleFn(() => {
			notifyFn(callback);
		});
	};
	const flush = () => {
		const originalQueue = queue;
		queue = [];
		if (originalQueue.length) scheduleFn(() => {
			batchNotifyFn(() => {
				originalQueue.forEach((callback) => {
					notifyFn(callback);
				});
			});
		});
	};
	return {
		batch: (callback) => {
			let result;
			transactions++;
			try {
				result = callback();
			} finally {
				transactions--;
				if (!transactions) flush();
			}
			return result;
		},
		batchCalls: (callback) => {
			return (...args) => {
				schedule(() => {
					callback(...args);
				});
			};
		},
		schedule,
		setNotifyFunction: (fn) => {
			notifyFn = fn;
		},
		setBatchNotifyFunction: (fn) => {
			batchNotifyFn = fn;
		},
		setScheduler: (fn) => {
			scheduleFn = fn;
		}
	};
}
var notifyManager = createNotifyManager();
var OnlineManager = class extends Subscribable {
	#online = true;
	#cleanup;
	#setup;
	constructor() {
		super();
		this.#setup = (onOnline) => {
			if (!isServer && window.addEventListener) {
				const onlineListener = () => onOnline(true);
				const offlineListener = () => onOnline(false);
				window.addEventListener("online", onlineListener, false);
				window.addEventListener("offline", offlineListener, false);
				return () => {
					window.removeEventListener("online", onlineListener);
					window.removeEventListener("offline", offlineListener);
				};
			}
		};
	}
	onSubscribe() {
		if (!this.#cleanup) this.setEventListener(this.#setup);
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			this.#cleanup?.();
			this.#cleanup = void 0;
		}
	}
	setEventListener(setup) {
		this.#setup = setup;
		this.#cleanup?.();
		this.#cleanup = setup(this.setOnline.bind(this));
	}
	setOnline(online) {
		if (this.#online !== online) {
			this.#online = online;
			this.listeners.forEach((listener) => {
				listener(online);
			});
		}
	}
	isOnline() {
		return this.#online;
	}
};
var onlineManager = new OnlineManager();
function canFetch(networkMode) {
	return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
function fetchState(data, options) {
	return {
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
		...data === void 0 && {
			error: null,
			status: "pending"
		}
	};
}
var QueryObserver = class extends Subscribable {
	constructor(client, options) {
		super();
		this.options = options;
		this.#client = client;
		this.#selectError = null;
		this.#currentThenable = pendingThenable();
		this.bindMethods();
		this.setOptions(options);
	}
	#client;
	#currentQuery = void 0;
	#currentQueryInitialState = void 0;
	#currentResult = void 0;
	#currentResultState;
	#currentResultOptions;
	#currentThenable;
	#selectError;
	#selectFn;
	#selectResult;
	#lastQueryWithDefinedData;
	#staleTimeoutId;
	#refetchIntervalId;
	#currentRefetchInterval;
	#trackedProps = /* @__PURE__ */ new Set();
	bindMethods() {
		this.refetch = this.refetch.bind(this);
	}
	onSubscribe() {
		if (this.listeners.size === 1) {
			this.#currentQuery.addObserver(this);
			if (shouldFetchOnMount(this.#currentQuery, this.options)) this.#executeFetch();
			else this.updateResult();
			this.#updateTimers();
		}
	}
	onUnsubscribe() {
		if (!this.hasListeners()) this.destroy();
	}
	shouldFetchOnReconnect() {
		return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnReconnect);
	}
	shouldFetchOnWindowFocus() {
		return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnWindowFocus);
	}
	destroy() {
		this.listeners = /* @__PURE__ */ new Set();
		this.#clearStaleTimeout();
		this.#clearRefetchInterval();
		this.#currentQuery.removeObserver(this);
	}
	setOptions(options) {
		const prevOptions = this.options;
		const prevQuery = this.#currentQuery;
		this.options = this.#client.defaultQueryOptions(options);
		if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, this.#currentQuery) !== "boolean") throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
		this.#updateQuery();
		this.#currentQuery.setOptions(this.options);
		if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) this.#client.getQueryCache().notify({
			type: "observerOptionsUpdated",
			query: this.#currentQuery,
			observer: this
		});
		const mounted = this.hasListeners();
		if (mounted && shouldFetchOptionally(this.#currentQuery, prevQuery, this.options, prevOptions)) this.#executeFetch();
		this.updateResult();
		if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || resolveStaleTime(this.options.staleTime, this.#currentQuery) !== resolveStaleTime(prevOptions.staleTime, this.#currentQuery))) this.#updateStaleTimeout();
		const nextRefetchInterval = this.#computeRefetchInterval();
		if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) this.#updateRefetchInterval(nextRefetchInterval);
	}
	getOptimisticResult(options) {
		const query = this.#client.getQueryCache().build(this.#client, options);
		const result = this.createResult(query, options);
		if (shouldAssignObserverCurrentProperties(this, result)) {
			this.#currentResult = result;
			this.#currentResultOptions = this.options;
			this.#currentResultState = this.#currentQuery.state;
		}
		return result;
	}
	getCurrentResult() {
		return this.#currentResult;
	}
	trackResult(result, onPropTracked) {
		return new Proxy(result, { get: (target, key) => {
			this.trackProp(key);
			onPropTracked?.(key);
			if (key === "promise") {
				this.trackProp("data");
				if (!this.options.experimental_prefetchInRender && this.#currentThenable.status === "pending") this.#currentThenable.reject(/* @__PURE__ */ new Error("experimental_prefetchInRender feature flag is not enabled"));
			}
			return Reflect.get(target, key);
		} });
	}
	trackProp(key) {
		this.#trackedProps.add(key);
	}
	getCurrentQuery() {
		return this.#currentQuery;
	}
	refetch({ ...options } = {}) {
		return this.fetch({ ...options });
	}
	fetchOptimistic(options) {
		const defaultedOptions = this.#client.defaultQueryOptions(options);
		const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
		return query.fetch().then(() => this.createResult(query, defaultedOptions));
	}
	fetch(fetchOptions) {
		return this.#executeFetch({
			...fetchOptions,
			cancelRefetch: fetchOptions.cancelRefetch ?? true
		}).then(() => {
			this.updateResult();
			return this.#currentResult;
		});
	}
	#executeFetch(fetchOptions) {
		this.#updateQuery();
		let promise = this.#currentQuery.fetch(this.options, fetchOptions);
		if (!fetchOptions?.throwOnError) promise = promise.catch(noop);
		return promise;
	}
	#updateStaleTimeout() {
		this.#clearStaleTimeout();
		const staleTime = resolveStaleTime(this.options.staleTime, this.#currentQuery);
		if (isServer || this.#currentResult.isStale || !isValidTimeout(staleTime)) return;
		const timeout = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime) + 1;
		this.#staleTimeoutId = timeoutManager.setTimeout(() => {
			if (!this.#currentResult.isStale) this.updateResult();
		}, timeout);
	}
	#computeRefetchInterval() {
		return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
	}
	#updateRefetchInterval(nextInterval) {
		this.#clearRefetchInterval();
		this.#currentRefetchInterval = nextInterval;
		if (isServer || resolveEnabled(this.options.enabled, this.#currentQuery) === false || !isValidTimeout(this.#currentRefetchInterval) || this.#currentRefetchInterval === 0) return;
		this.#refetchIntervalId = timeoutManager.setInterval(() => {
			if (this.options.refetchIntervalInBackground || focusManager.isFocused()) this.#executeFetch();
		}, this.#currentRefetchInterval);
	}
	#updateTimers() {
		this.#updateStaleTimeout();
		this.#updateRefetchInterval(this.#computeRefetchInterval());
	}
	#clearStaleTimeout() {
		if (this.#staleTimeoutId) {
			timeoutManager.clearTimeout(this.#staleTimeoutId);
			this.#staleTimeoutId = void 0;
		}
	}
	#clearRefetchInterval() {
		if (this.#refetchIntervalId) {
			timeoutManager.clearInterval(this.#refetchIntervalId);
			this.#refetchIntervalId = void 0;
		}
	}
	createResult(query, options) {
		const prevQuery = this.#currentQuery;
		const prevOptions = this.options;
		const prevResult = this.#currentResult;
		const prevResultState = this.#currentResultState;
		const prevResultOptions = this.#currentResultOptions;
		const queryInitialState = query !== prevQuery ? query.state : this.#currentQueryInitialState;
		const { state } = query;
		let newState = { ...state };
		let isPlaceholderData = false;
		let data;
		if (options._optimisticResults) {
			const mounted = this.hasListeners();
			const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
			const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
			if (fetchOnMount || fetchOptionally) newState = {
				...newState,
				...fetchState(state.data, query.options)
			};
			if (options._optimisticResults === "isRestoring") newState.fetchStatus = "idle";
		}
		let { error, errorUpdatedAt, status } = newState;
		data = newState.data;
		let skipSelect = false;
		if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
			let placeholderData;
			if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
				placeholderData = prevResult.data;
				skipSelect = true;
			} else placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(this.#lastQueryWithDefinedData?.state.data, this.#lastQueryWithDefinedData) : options.placeholderData;
			if (placeholderData !== void 0) {
				status = "success";
				data = replaceData(prevResult?.data, placeholderData, options);
				isPlaceholderData = true;
			}
		}
		if (options.select && data !== void 0 && !skipSelect) if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) data = this.#selectResult;
		else try {
			this.#selectFn = options.select;
			data = options.select(data);
			data = replaceData(prevResult?.data, data, options);
			this.#selectResult = data;
			this.#selectError = null;
		} catch (selectError) {
			this.#selectError = selectError;
		}
		if (this.#selectError) {
			error = this.#selectError;
			data = this.#selectResult;
			errorUpdatedAt = Date.now();
			status = "error";
		}
		const isFetching = newState.fetchStatus === "fetching";
		const isPending = status === "pending";
		const isError = status === "error";
		const isLoading = isPending && isFetching;
		const hasData = data !== void 0;
		const nextResult = {
			status,
			fetchStatus: newState.fetchStatus,
			isPending,
			isSuccess: status === "success",
			isError,
			isInitialLoading: isLoading,
			isLoading,
			data,
			dataUpdatedAt: newState.dataUpdatedAt,
			error,
			errorUpdatedAt,
			failureCount: newState.fetchFailureCount,
			failureReason: newState.fetchFailureReason,
			errorUpdateCount: newState.errorUpdateCount,
			isFetched: newState.dataUpdateCount > 0 || newState.errorUpdateCount > 0,
			isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
			isFetching,
			isRefetching: isFetching && !isPending,
			isLoadingError: isError && !hasData,
			isPaused: newState.fetchStatus === "paused",
			isPlaceholderData,
			isRefetchError: isError && hasData,
			isStale: isStale(query, options),
			refetch: this.refetch,
			promise: this.#currentThenable,
			isEnabled: resolveEnabled(options.enabled, query) !== false
		};
		if (this.options.experimental_prefetchInRender) {
			const finalizeThenableIfPossible = (thenable) => {
				if (nextResult.status === "error") thenable.reject(nextResult.error);
				else if (nextResult.data !== void 0) thenable.resolve(nextResult.data);
			};
			const recreateThenable = () => {
				finalizeThenableIfPossible(this.#currentThenable = nextResult.promise = pendingThenable());
			};
			const prevThenable = this.#currentThenable;
			switch (prevThenable.status) {
				case "pending":
					if (query.queryHash === prevQuery.queryHash) finalizeThenableIfPossible(prevThenable);
					break;
				case "fulfilled":
					if (nextResult.status === "error" || nextResult.data !== prevThenable.value) recreateThenable();
					break;
				case "rejected":
					if (nextResult.status !== "error" || nextResult.error !== prevThenable.reason) recreateThenable();
					break;
			}
		}
		return nextResult;
	}
	updateResult() {
		const prevResult = this.#currentResult;
		const nextResult = this.createResult(this.#currentQuery, this.options);
		this.#currentResultState = this.#currentQuery.state;
		this.#currentResultOptions = this.options;
		if (this.#currentResultState.data !== void 0) this.#lastQueryWithDefinedData = this.#currentQuery;
		if (shallowEqualObjects(nextResult, prevResult)) return;
		this.#currentResult = nextResult;
		const shouldNotifyListeners = () => {
			if (!prevResult) return true;
			const { notifyOnChangeProps } = this.options;
			const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
			if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) return true;
			const includedProps = new Set(notifyOnChangePropsValue ?? this.#trackedProps);
			if (this.options.throwOnError) includedProps.add("error");
			return Object.keys(this.#currentResult).some((key) => {
				const typedKey = key;
				return this.#currentResult[typedKey] !== prevResult[typedKey] && includedProps.has(typedKey);
			});
		};
		this.#notify({ listeners: shouldNotifyListeners() });
	}
	#updateQuery() {
		const query = this.#client.getQueryCache().build(this.#client, this.options);
		if (query === this.#currentQuery) return;
		const prevQuery = this.#currentQuery;
		this.#currentQuery = query;
		this.#currentQueryInitialState = query.state;
		if (this.hasListeners()) {
			prevQuery?.removeObserver(this);
			query.addObserver(this);
		}
	}
	onQueryUpdate() {
		this.updateResult();
		if (this.hasListeners()) this.#updateTimers();
	}
	#notify(notifyOptions) {
		notifyManager.batch(() => {
			if (notifyOptions.listeners) this.listeners.forEach((listener) => {
				listener(this.#currentResult);
			});
			this.#client.getQueryCache().notify({
				query: this.#currentQuery,
				type: "observerResultsUpdated"
			});
		});
	}
};
function shouldLoadOnMount(query, options) {
	return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
	return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
	if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
		const value = typeof field === "function" ? field(query) : field;
		return value === "always" || value !== false && isStale(query, options);
	}
	return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
	return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
	return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
	if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) return true;
	return false;
}
function infiniteQueryBehavior(pages) {
	return { onFetch: (context, query) => {
		const options = context.options;
		const direction = context.fetchOptions?.meta?.fetchMore?.direction;
		const oldPages = context.state.data?.pages || [];
		const oldPageParams = context.state.data?.pageParams || [];
		let result = {
			pages: [],
			pageParams: []
		};
		let currentPage = 0;
		const fetchFn = async () => {
			let cancelled = false;
			const addSignalProperty = (object) => {
				addConsumeAwareSignal(object, () => context.signal, () => cancelled = true);
			};
			const queryFn = ensureQueryFn(context.options, context.fetchOptions);
			const fetchPage = async (data, param, previous) => {
				if (cancelled) return Promise.reject();
				if (param == null && data.pages.length) return Promise.resolve(data);
				const createQueryFnContext = () => {
					const queryFnContext2 = {
						client: context.client,
						queryKey: context.queryKey,
						pageParam: param,
						direction: previous ? "backward" : "forward",
						meta: context.options.meta
					};
					addSignalProperty(queryFnContext2);
					return queryFnContext2;
				};
				const page = await queryFn(createQueryFnContext());
				const { maxPages } = context.options;
				const addTo = previous ? addToStart : addToEnd;
				return {
					pages: addTo(data.pages, page, maxPages),
					pageParams: addTo(data.pageParams, param, maxPages)
				};
			};
			if (direction && oldPages.length) {
				const previous = direction === "backward";
				const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
				const oldData = {
					pages: oldPages,
					pageParams: oldPageParams
				};
				result = await fetchPage(oldData, pageParamFn(options, oldData), previous);
			} else {
				const remainingPages = pages ?? oldPages.length;
				do {
					const param = currentPage === 0 ? oldPageParams[0] ?? options.initialPageParam : getNextPageParam(options, result);
					if (currentPage > 0 && param == null) break;
					result = await fetchPage(result, param);
					currentPage++;
				} while (currentPage < remainingPages);
			}
			return result;
		};
		if (context.options.persister) context.fetchFn = () => {
			return context.options.persister?.(fetchFn, {
				client: context.client,
				queryKey: context.queryKey,
				meta: context.options.meta,
				signal: context.signal
			}, query);
		};
		else context.fetchFn = fetchFn;
	} };
}
function getNextPageParam(options, { pages, pageParams }) {
	const lastIndex = pages.length - 1;
	return pages.length > 0 ? options.getNextPageParam(pages[lastIndex], pages, pageParams[lastIndex], pageParams) : void 0;
}
function getPreviousPageParam(options, { pages, pageParams }) {
	return pages.length > 0 ? options.getPreviousPageParam?.(pages[0], pages, pageParams[0], pageParams) : void 0;
}
function hasNextPage(options, data) {
	if (!data) return false;
	return getNextPageParam(options, data) != null;
}
function hasPreviousPage(options, data) {
	if (!data || !options.getPreviousPageParam) return false;
	return getPreviousPageParam(options, data) != null;
}
var InfiniteQueryObserver = class extends QueryObserver {
	constructor(client, options) {
		super(client, options);
	}
	bindMethods() {
		super.bindMethods();
		this.fetchNextPage = this.fetchNextPage.bind(this);
		this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
	}
	setOptions(options) {
		super.setOptions({
			...options,
			behavior: infiniteQueryBehavior()
		});
	}
	getOptimisticResult(options) {
		options.behavior = infiniteQueryBehavior();
		return super.getOptimisticResult(options);
	}
	fetchNextPage(options) {
		return this.fetch({
			...options,
			meta: { fetchMore: { direction: "forward" } }
		});
	}
	fetchPreviousPage(options) {
		return this.fetch({
			...options,
			meta: { fetchMore: { direction: "backward" } }
		});
	}
	createResult(query, options) {
		const { state } = query;
		const parentResult = super.createResult(query, options);
		const { isFetching, isRefetching, isError, isRefetchError } = parentResult;
		const fetchDirection = state.fetchMeta?.fetchMore?.direction;
		const isFetchNextPageError = isError && fetchDirection === "forward";
		const isFetchingNextPage = isFetching && fetchDirection === "forward";
		const isFetchPreviousPageError = isError && fetchDirection === "backward";
		const isFetchingPreviousPage = isFetching && fetchDirection === "backward";
		return {
			...parentResult,
			fetchNextPage: this.fetchNextPage,
			fetchPreviousPage: this.fetchPreviousPage,
			hasNextPage: hasNextPage(options, state.data),
			hasPreviousPage: hasPreviousPage(options, state.data),
			isFetchNextPageError,
			isFetchingNextPage,
			isFetchPreviousPageError,
			isFetchingPreviousPage,
			isRefetchError: isRefetchError && !isFetchNextPageError && !isFetchPreviousPageError,
			isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
		};
	}
};
var has = Object.prototype.hasOwnProperty;
function find(iter, tar, key) {
	for (key of iter.keys()) if (dequal(key, tar)) return key;
}
function dequal(foo, bar) {
	var ctor, len, tmp;
	if (foo === bar) return true;
	if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
		if (ctor === Date) return foo.getTime() === bar.getTime();
		if (ctor === RegExp) return foo.toString() === bar.toString();
		if (ctor === Array) {
			if ((len = foo.length) === bar.length) while (len-- && dequal(foo[len], bar[len]));
			return len === -1;
		}
		if (ctor === Set) {
			if (foo.size !== bar.size) return false;
			for (len of foo) {
				tmp = len;
				if (tmp && typeof tmp === "object") {
					tmp = find(bar, tmp);
					if (!tmp) return false;
				}
				if (!bar.has(tmp)) return false;
			}
			return true;
		}
		if (ctor === Map) {
			if (foo.size !== bar.size) return false;
			for (len of foo) {
				tmp = len[0];
				if (tmp && typeof tmp === "object") {
					tmp = find(bar, tmp);
					if (!tmp) return false;
				}
				if (!dequal(len[1], bar.get(tmp))) return false;
			}
			return true;
		}
		if (ctor === ArrayBuffer) {
			foo = new Uint8Array(foo);
			bar = new Uint8Array(bar);
		} else if (ctor === DataView) {
			if ((len = foo.byteLength) === bar.byteLength) while (len-- && foo.getInt8(len) === bar.getInt8(len));
			return len === -1;
		}
		if (ArrayBuffer.isView(foo)) {
			if ((len = foo.byteLength) === bar.byteLength) while (len-- && foo[len] === bar[len]);
			return len === -1;
		}
		if (!ctor || typeof foo === "object") {
			len = 0;
			for (ctor in foo) {
				if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
				if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
			}
			return Object.keys(bar).length === len;
		}
	}
	return foo !== foo && bar !== bar;
}
/**
* Assert that the context value exists, otherwise throw an error.
*
* @internal
*/
function assertContextExists(contextVal, msgOrCtx) {
	if (!contextVal) throw typeof msgOrCtx === "string" ? new Error(msgOrCtx) : /* @__PURE__ */ new Error(`${msgOrCtx.displayName} not found`);
}
/**
* Create and return a Context and two hooks that return the context value.
* The Context type is derived from the type passed in by the user.
*
* The first hook returned guarantees that the context exists so the returned value is always `CtxValue`
* The second hook makes no guarantees, so the returned value can be `CtxValue | undefined`
*
* @internal
*/
var createContextAndHook = (displayName, options) => {
	const { assertCtxFn = assertContextExists } = options || {};
	const Ctx = import_react.createContext(void 0);
	Ctx.displayName = displayName;
	const useCtx = () => {
		const ctx = import_react.useContext(Ctx);
		assertCtxFn(ctx, `${displayName} not found`);
		return ctx.value;
	};
	const useCtxWithoutGuarantee = () => {
		const ctx = import_react.useContext(Ctx);
		return ctx ? ctx.value : {};
	};
	return [
		Ctx,
		useCtx,
		useCtxWithoutGuarantee
	];
};
var [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook("ClerkInstanceContext");
var [InitialStateContext, _useInitialStateContext] = createContextAndHook("InitialStateContext");
/**
* Provides initial Clerk state (session, user, organization data) from server-side rendering
* to child components via React context.
*
* Passing in a promise is only supported for React >= 19.
*
* The initialState is snapshotted on mount and cannot change during the component lifecycle.
*
* Note that different parts of the React tree can use separate InitialStateProvider instances
* with different initialState values if needed.
*/
function InitialStateProvider({ children, initialState }) {
	const [initialStateSnapshot] = (0, import_react.useState)(initialState);
	const initialStateCtx = import_react.useMemo(() => ({ value: initialStateSnapshot }), [initialStateSnapshot]);
	return /* @__PURE__ */ import_react.createElement(InitialStateContext.Provider, { value: initialStateCtx }, children);
}
function useInitialStateContext() {
	const initialState = _useInitialStateContext();
	if (initialState instanceof Promise) if ("use" in import_react.default && typeof import_react.use === "function") return import_react.use(initialState);
	else throw new Error("initialState cannot be a promise if React version is less than 19");
	return initialState;
}
import_react.createContext({});
var [CheckoutContext, useCheckoutContext] = createContextAndHook("CheckoutContext");
var __experimental_CheckoutProvider = ({ children, ...rest }) => {
	return /* @__PURE__ */ import_react.createElement(CheckoutContext.Provider, { value: { value: rest } }, children);
};
/**
* @internal
*/
function useAssertWrappedByClerkProvider$1(displayNameOrFn) {
	if (!import_react.useContext(ClerkInstanceContext)) {
		if (typeof displayNameOrFn === "function") {
			displayNameOrFn();
			return;
		}
		throw new Error(`${displayNameOrFn} can only be used within the <ClerkProvider /> component.

Possible fixes:
1. Ensure that the <ClerkProvider /> is correctly wrapping your application where this component is used.
2. Check for multiple versions of the \`@clerk/shared\` package in your project. Use a tool like \`npm ls @clerk/shared\` to identify multiple versions, and update your dependencies to only rely on one.

Learn more: https://clerk.com/docs/components/clerk-provider`.trim());
	}
}
var STABLE_KEYS = {
	USER_MEMBERSHIPS_KEY: "userMemberships",
	USER_INVITATIONS_KEY: "userInvitations",
	USER_SUGGESTIONS_KEY: "userSuggestions",
	DOMAINS_KEY: "domains",
	MEMBERSHIP_REQUESTS_KEY: "membershipRequests",
	MEMBERSHIPS_KEY: "memberships",
	INVITATIONS_KEY: "invitations",
	PLANS_KEY: "billing-plans",
	SUBSCRIPTION_KEY: "billing-subscription",
	PAYMENT_METHODS_KEY: "billing-payment-methods",
	PAYMENT_ATTEMPTS_KEY: "billing-payment-attempts",
	STATEMENTS_KEY: "billing-statements",
	API_KEYS_KEY: "apiKeys",
	ORGANIZATION_CREATION_DEFAULTS_KEY: "organizationCreationDefaults"
};
/**
* @internal
*/
function createCacheKeys(params) {
	return {
		queryKey: [
			params.stablePrefix,
			params.authenticated,
			params.tracked,
			params.untracked
		],
		invalidationKey: [
			params.stablePrefix,
			params.authenticated,
			params.tracked
		],
		stableKey: params.stablePrefix,
		authenticated: params.authenticated
	};
}
/**
* @internal
*/
function defineKeepPreviousDataFn(enabled) {
	if (enabled) return function KeepPreviousDataFn(previousData) {
		return previousData;
	};
}
/**
* Creates a recursively self-referential Proxy that safely handles:
* - Arbitrary property access (e.g., obj.any.prop.path)
* - Function calls at any level (e.g., obj.a().b.c())
* - Construction (e.g., new obj.a.b())
*
* Always returns itself to allow infinite chaining without throwing.
*/
function createRecursiveProxy(label) {
	const callableTarget = function noop$1() {};
	let self;
	self = new Proxy(callableTarget, {
		get(_target, prop) {
			if (prop === "then") return;
			if (prop === "toString") return () => `[${label}]`;
			if (prop === Symbol.toPrimitive) return () => 0;
			return self;
		},
		apply() {
			return self;
		},
		construct() {
			return self;
		},
		has() {
			return false;
		},
		set() {
			return false;
		}
	});
	return self;
}
var mockQueryClient = createRecursiveProxy("ClerkMockQueryClient");
var useClerkQueryClient = () => {
	const clerk = useClerkInstanceContext();
	const queryClient = clerk.__internal_queryClient;
	const [, setQueryClientLoaded] = (0, import_react.useState)(typeof queryClient === "object" && "__tag" in queryClient && queryClient.__tag === "clerk-rq-client");
	(0, import_react.useEffect)(() => {
		const _setQueryClientLoaded = () => setQueryClientLoaded(true);
		clerk.on("queryClientStatus", _setQueryClientLoaded);
		return () => {
			clerk.off("queryClientStatus", _setQueryClientLoaded);
		};
	}, [clerk, setQueryClientLoaded]);
	const isLoaded = typeof queryClient === "object" && "__tag" in queryClient && queryClient.__tag === "clerk-rq-client";
	return [queryClient?.client || mockQueryClient, isLoaded];
};
/**
* Stripped down version of useBaseQuery from @tanstack/query-core.
* This implementation allows for an observer to be created every time a query client changes.
*/
/**
* An alternative `useBaseQuery` implementation that allows for an observer to be created every time a query client changes.
*
* @internal
*/
function useBaseQuery(options, Observer) {
	const [client, isQueryClientLoaded] = useClerkQueryClient();
	const defaultedOptions = isQueryClientLoaded ? client.defaultQueryOptions(options) : options;
	defaultedOptions._optimisticResults = "optimistic";
	const observer = import_react.useMemo(() => {
		return new Observer(client, defaultedOptions);
	}, [client]);
	const result = observer.getOptimisticResult(defaultedOptions);
	const shouldSubscribe = options.subscribed !== false;
	import_react.useSyncExternalStore(import_react.useCallback((onStoreChange) => {
		const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
		observer.updateResult();
		return unsubscribe;
	}, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	import_react.useEffect(() => {
		observer.setOptions(defaultedOptions);
	}, [defaultedOptions, observer]);
	if (!isQueryClientLoaded) return {
		data: void 0,
		error: null,
		isLoading: false,
		isFetching: false,
		status: "pending"
	};
	return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
/**
*
*/
function useClerkInfiniteQuery(options) {
	return useBaseQuery(options, InfiniteQueryObserver);
}
/**
*
*/
function useClerkQuery(options) {
	return useBaseQuery(options, QueryObserver);
}
/**
* A hook that retains the previous value of a primitive type.
* It uses a ref to prevent causing unnecessary re-renders.
*
* @internal
*
* @example
* ```
* Render 1: value = 'A' → returns null
* Render 2: value = 'B' → returns 'A'
* Render 3: value = 'B' → returns 'A'
* Render 4: value = 'B' → returns 'A'
* Render 5: value = 'C' → returns 'B'
* ```
*/
function usePreviousValue(value) {
	const currentRef = (0, import_react.useRef)(value);
	const previousRef = (0, import_react.useRef)(null);
	if (currentRef.current !== value) {
		previousRef.current = currentRef.current;
		currentRef.current = value;
	}
	return previousRef.current;
}
var withInfiniteKey = (key) => [key, `${key}-inf`];
/**
* Clears React Query caches associated with the given stable prefixes when
* the authenticated state transitions from signed-in to signed-out.
*
* @internal
*/
function useClearQueriesOnSignOut(options) {
	const { isSignedOut, stableKeys, authenticated = true, onCleanup } = options;
	const stableKeysRef = (0, import_react.useRef)(stableKeys);
	const [queryClient] = useClerkQueryClient();
	const previousIsSignedIn = usePreviousValue(!isSignedOut);
	(0, import_react.useEffect)(() => {
		if (authenticated !== true) return;
		if (previousIsSignedIn && isSignedOut === true) {
			queryClient.removeQueries({ predicate: (query) => {
				const [cachedStableKey, queryAuthenticated] = query.queryKey;
				return queryAuthenticated === true && typeof cachedStableKey === "string" && (Array.isArray(stableKeysRef.current) ? stableKeysRef.current.includes(cachedStableKey) : stableKeysRef.current === cachedStableKey);
			} });
			onCleanup?.();
		}
	}, [
		authenticated,
		isSignedOut,
		previousIsSignedIn,
		queryClient
	]);
}
/**
* A hook that safely merges user-provided pagination options with default values.
* It caches initial pagination values (page and size) until component unmount to prevent unwanted rerenders.
*
* @internal
*
* @example
* ```typescript
* // Example 1: With user-provided options
* const userOptions = { initialPage: 2, pageSize: 20, infinite: true };
* const defaults = { initialPage: 1, pageSize: 10, infinite: false };
* useWithSafeValues(userOptions, defaults);
* // Returns { initialPage: 2, pageSize: 20, infinite: true }
*
* // Example 2: With boolean true (use defaults)
* const params = true;
* const defaults = { initialPage: 1, pageSize: 10, infinite: false };
* useWithSafeValues(params, defaults);
* // Returns { initialPage: 1, pageSize: 10, infinite: false }
*
* // Example 3: With undefined options (fallback to defaults)
* const params = undefined;
* const defaults = { initialPage: 1, pageSize: 10, infinite: false };
* useWithSafeValues(params, defaults);
* // Returns { initialPage: 1, pageSize: 10, infinite: false }
* ```
*/
var useWithSafeValues = (params, defaultValues) => {
	const shouldUseDefaults = typeof params === "boolean" && params;
	const initialPageRef = (0, import_react.useRef)(shouldUseDefaults ? defaultValues.initialPage : params?.initialPage ?? defaultValues.initialPage);
	const pageSizeRef = (0, import_react.useRef)(shouldUseDefaults ? defaultValues.pageSize : params?.pageSize ?? defaultValues.pageSize);
	const newObj = {};
	for (const key of Object.keys(defaultValues)) newObj[key] = shouldUseDefaults ? defaultValues[key] : params?.[key] ?? defaultValues[key];
	return {
		...newObj,
		initialPage: initialPageRef.current,
		pageSize: pageSizeRef.current
	};
};
/**
* Calculates the offset count for pagination based on initial page and page size.
* This represents the number of items to skip before the first page.
*
* @param initialPage - The starting page number (1-based)
* @param pageSize - The number of items per page
* @returns The number of items to offset
*
* @example
* ```typescript
* calculateOffsetCount(1, 10); // Returns 0 (no offset for first page)
* calculateOffsetCount(2, 10); // Returns 10 (skip first 10 items)
* calculateOffsetCount(3, 20); // Returns 40 (skip first 40 items)
* ```
*/
function calculateOffsetCount(initialPage, pageSize) {
	return (initialPage - 1) * pageSize;
}
/**
* Calculates the total number of pages based on total count, offset, and page size.
*
* @param totalCount - The total number of items
* @param offsetCount - The number of items to offset (from calculateOffsetCount)
* @param pageSize - The number of items per page
* @returns The total number of pages
*
* @example
* ```typescript
* calculatePageCount(100, 0, 10);  // Returns 10
* calculatePageCount(95, 0, 10);   // Returns 10 (rounds up)
* calculatePageCount(100, 20, 10); // Returns 8 (100 - 20 = 80 items, 8 pages)
* ```
*/
function calculatePageCount(totalCount, offsetCount, pageSize) {
	return Math.ceil((totalCount - offsetCount) / pageSize);
}
/**
* Determines if there is a next page available in non-infinite pagination mode.
*
* @param totalCount - The total number of items
* @param offsetCount - The number of items to offset
* @param currentPage - The current page number (1-based)
* @param pageSize - The number of items per page
* @returns True if there are more items beyond the current page
*
* @example
* ```typescript
* calculateHasNextPage(100, 0, 1, 10);  // Returns true (page 1 of 10)
* calculateHasNextPage(100, 0, 10, 10); // Returns false (last page)
* calculateHasNextPage(25, 0, 2, 10);   // Returns true (page 2, 5 more items)
* calculateHasNextPage(20, 0, 2, 10);   // Returns false (exactly 2 pages)
* ```
*/
function calculateHasNextPage(totalCount, offsetCount, currentPage, pageSize) {
	return totalCount - offsetCount > currentPage * pageSize;
}
/**
* Determines if there is a previous page available in non-infinite pagination mode.
*
* @param currentPage - The current page number (1-based)
* @param pageSize - The number of items per page
* @param offsetCount - The number of items to offset
* @returns True if there are pages before the current page
*
* @example
* ```typescript
* calculateHasPreviousPage(1, 10, 0);  // Returns false (first page)
* calculateHasPreviousPage(2, 10, 0);  // Returns true (can go back to page 1)
* calculateHasPreviousPage(1, 10, 10); // Returns false (first page with offset)
* ```
*/
function calculateHasPreviousPage(currentPage, pageSize, offsetCount) {
	return (currentPage - 1) * pageSize > offsetCount;
}
var usePagesOrInfinite = (params) => {
	const { fetcher, config, keys } = params;
	const [paginatedPage, setPaginatedPage] = (0, import_react.useState)(config.initialPage ?? 1);
	const initialPageRef = (0, import_react.useRef)(config.initialPage ?? 1);
	const pageSizeRef = (0, import_react.useRef)(config.pageSize ?? 10);
	const enabled = config.enabled ?? true;
	const isSignedIn = config.isSignedIn;
	const triggerInfinite = config.infinite ?? false;
	const cacheMode = config.__experimental_mode === "cache";
	const keepPreviousData = config.keepPreviousData ?? false;
	const [queryClient] = useClerkQueryClient();
	const queriesEnabled = enabled && Boolean(fetcher) && !cacheMode && isSignedIn !== false;
	const [forceUpdateCounter, setForceUpdateCounter] = (0, import_react.useState)(0);
	const forceUpdate = (0, import_react.useCallback)((updater) => {
		setForceUpdateCounter(updater);
	}, []);
	const pagesQueryKey = (0, import_react.useMemo)(() => {
		const [stablePrefix, authenticated, tracked, untracked] = keys.queryKey;
		return [
			stablePrefix,
			authenticated,
			tracked,
			{
				...untracked,
				args: {
					...untracked.args,
					initialPage: paginatedPage,
					pageSize: pageSizeRef.current
				}
			}
		];
	}, [keys.queryKey, paginatedPage]);
	const singlePageQuery = useClerkQuery({
		queryKey: pagesQueryKey,
		queryFn: ({ queryKey }) => {
			const { args } = queryKey[3];
			if (!fetcher) return;
			return fetcher(args);
		},
		staleTime: 6e4,
		enabled: queriesEnabled && !triggerInfinite,
		placeholderData: defineKeepPreviousDataFn(keepPreviousData)
	});
	const infiniteQueryKey = (0, import_react.useMemo)(() => {
		const [stablePrefix, authenticated, tracked, untracked] = keys.queryKey;
		return [
			stablePrefix + "-inf",
			authenticated,
			tracked,
			untracked
		];
	}, [keys.queryKey]);
	const infiniteQuery = useClerkInfiniteQuery({
		queryKey: infiniteQueryKey,
		initialPageParam: config.initialPage ?? 1,
		getNextPageParam: (lastPage, allPages, lastPageParam) => {
			const total = lastPage?.total_count ?? 0;
			return (allPages.length + (config.initialPage ? config.initialPage - 1 : 0)) * (config.pageSize ?? 10) < total ? lastPageParam + 1 : void 0;
		},
		queryFn: ({ pageParam, queryKey }) => {
			const { args } = queryKey[3];
			if (!fetcher) return;
			return fetcher({
				...args,
				initialPage: pageParam,
				pageSize: pageSizeRef.current
			});
		},
		staleTime: 6e4,
		enabled: queriesEnabled && triggerInfinite
	});
	useClearQueriesOnSignOut({
		isSignedOut: isSignedIn === false,
		authenticated: keys.authenticated,
		stableKeys: withInfiniteKey(keys.stableKey),
		onCleanup: () => {
			setPaginatedPage(initialPageRef.current);
			Promise.resolve().then(() => forceUpdate((n) => n + 1));
		}
	});
	const { data, count, page } = (0, import_react.useMemo)(() => {
		if (triggerInfinite) {
			const cachedData = queryClient.getQueryData(infiniteQueryKey);
			const pages = queriesEnabled ? infiniteQuery.data?.pages ?? cachedData?.pages ?? [] : cachedData?.pages ?? [];
			const validPages = Array.isArray(pages) ? pages.filter(Boolean) : [];
			return {
				data: validPages.map((a) => a?.data).flat().filter(Boolean) ?? [],
				count: validPages[validPages.length - 1]?.total_count ?? 0,
				page: validPages.length > 0 ? validPages.length : initialPageRef.current
			};
		}
		const pageData = queriesEnabled ? singlePageQuery.data ?? queryClient.getQueryData(pagesQueryKey) : queryClient.getQueryData(pagesQueryKey);
		return {
			data: Array.isArray(pageData?.data) ? pageData.data : [],
			count: typeof pageData?.total_count === "number" ? pageData.total_count : 0,
			page: paginatedPage
		};
	}, [
		queriesEnabled,
		forceUpdateCounter,
		triggerInfinite,
		infiniteQuery.data?.pages,
		singlePageQuery.data,
		queryClient,
		infiniteQueryKey,
		pagesQueryKey,
		paginatedPage
	]);
	const fetchPage = (0, import_react.useCallback)((numberOrgFn) => {
		if (triggerInfinite) {
			const next = typeof numberOrgFn === "function" ? numberOrgFn(page) : numberOrgFn;
			const targetCount = Math.max(0, next);
			const cachedData = queryClient.getQueryData(infiniteQueryKey);
			if (targetCount - (infiniteQuery.data?.pages ?? cachedData?.pages ?? []).length > 0) infiniteQuery.fetchNextPage({ cancelRefetch: false });
			return;
		}
		return setPaginatedPage(numberOrgFn);
	}, [
		infiniteQuery,
		page,
		triggerInfinite,
		queryClient,
		infiniteQueryKey
	]);
	const isLoading = triggerInfinite ? infiniteQuery.isLoading : singlePageQuery.isLoading;
	const isFetching = triggerInfinite ? infiniteQuery.isFetching : singlePageQuery.isFetching;
	const error = (triggerInfinite ? infiniteQuery.error : singlePageQuery.error) ?? null;
	const isError = !!error;
	const fetchNext = (0, import_react.useCallback)(() => {
		if (triggerInfinite) {
			infiniteQuery.fetchNextPage({ cancelRefetch: false });
			return;
		}
		setPaginatedPage((n) => Math.max(0, n + 1));
	}, [infiniteQuery, triggerInfinite]);
	const fetchPrevious = (0, import_react.useCallback)(() => {
		if (triggerInfinite) return;
		setPaginatedPage((n) => Math.max(0, n - 1));
	}, [triggerInfinite]);
	const offsetCount = calculateOffsetCount(initialPageRef.current, pageSizeRef.current);
	const pageCount = calculatePageCount(count, offsetCount, pageSizeRef.current);
	const hasNextPage = triggerInfinite ? Boolean(infiniteQuery.hasNextPage) : calculateHasNextPage(count, offsetCount, page, pageSizeRef.current);
	const hasPreviousPage = triggerInfinite ? Boolean(infiniteQuery.hasPreviousPage) : calculateHasPreviousPage(page, pageSizeRef.current, offsetCount);
	const setData = (value) => {
		if (triggerInfinite) {
			queryClient.setQueryData(infiniteQueryKey, (prevValue = {}) => {
				const prevPages = Array.isArray(prevValue?.pages) ? prevValue.pages : [];
				const nextPages = typeof value === "function" ? value(prevPages) : value;
				return {
					...prevValue,
					pages: nextPages
				};
			});
			forceUpdate((n) => n + 1);
			return Promise.resolve();
		}
		queryClient.setQueryData(pagesQueryKey, (prevValue = {
			data: [],
			total_count: 0
		}) => {
			return typeof value === "function" ? value(prevValue) : value;
		});
		forceUpdate((n) => n + 1);
		return Promise.resolve();
	};
	const revalidate = async () => {
		await queryClient.invalidateQueries({ queryKey: keys.invalidationKey });
		const [stablePrefix, ...rest] = keys.invalidationKey;
		return queryClient.invalidateQueries({ queryKey: [stablePrefix + "-inf", ...rest] });
	};
	return {
		data,
		count,
		error,
		isLoading,
		isFetching,
		isError,
		page,
		pageCount,
		fetchPage,
		fetchNext,
		fetchPrevious,
		hasNextPage,
		hasPreviousPage,
		revalidate,
		setData
	};
};
function useOrganizationBase() {
	const clerk = useClerkInstanceContext();
	const initialState = useInitialStateContext();
	const getInitialState = (0, import_react.useCallback)(() => initialState?.organization, [initialState?.organization]);
	return (0, import_react.useSyncExternalStore)((0, import_react.useCallback)((callback) => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]), (0, import_react.useCallback)(() => {
		if (!clerk.loaded || !clerk.__internal_lastEmittedResources) return getInitialState();
		return clerk.__internal_lastEmittedResources.organization;
	}, [clerk, getInitialState]), getInitialState);
}
function useUserBase() {
	const clerk = useClerkInstanceContext();
	const initialState = useInitialStateContext();
	const getInitialState = (0, import_react.useCallback)(() => initialState?.user, [initialState?.user]);
	return (0, import_react.useSyncExternalStore)((0, import_react.useCallback)((callback) => {
		return clerk.addListener(callback, { skipInitialEmit: true });
	}, [clerk]), (0, import_react.useCallback)(() => {
		if (!clerk.loaded || !clerk.__internal_lastEmittedResources) return getInitialState();
		return clerk.__internal_lastEmittedResources.user;
	}, [clerk, getInitialState]), getInitialState);
}
typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
/**
* @internal
*/
var isDeeplyEqual = dequal;
/**
* @internal
*/
function useBillingIsEnabled(params) {
	const clerk = useClerkInstanceContext();
	const enabledFromParam = params?.enabled ?? true;
	const environment = clerk.__internal_environment;
	const user = useUserBase();
	const organization = useOrganizationBase();
	const userBillingEnabled = environment?.commerceSettings.billing.user.enabled;
	const orgBillingEnabled = environment?.commerceSettings.billing.organization.enabled;
	const billingEnabled = params?.for === "organization" ? orgBillingEnabled : params?.for === "user" ? userBillingEnabled : userBillingEnabled || orgBillingEnabled;
	const isOrganization = params?.for === "organization";
	const requireUserAndOrganizationWhenAuthenticated = params?.authenticated ?? true ? (isOrganization ? Boolean(organization?.id) : true) && Boolean(user?.id) : true;
	return billingEnabled && enabledFromParam && clerk.loaded && requireUserAndOrganizationWhenAuthenticated;
}
/**
* A hook factory that creates paginated data fetching hooks for commerce-related resources.
* It provides a standardized way to create hooks that can fetch either user or Organization resources
* with built-in pagination support.
*
* The generated hooks handle:
* - Clerk authentication context
* - Resource-specific data fetching
* - Pagination (both traditional and infinite scroll)
* - Telemetry tracking
* - Type safety for the specific resource.
*
* @internal
*/
function createBillingPaginatedHook({ hookName: hookName$3, resourceType, useFetcher, options }) {
	return function useBillingHook(params) {
		const { for: _for, enabled: externalEnabled, ...paginationParams } = params || {};
		const safeFor = _for || "user";
		useAssertWrappedByClerkProvider$1(hookName$3);
		const fetchFn = useFetcher(safeFor);
		const safeValues = useWithSafeValues(paginationParams, {
			initialPage: 1,
			pageSize: 10,
			keepPreviousData: false,
			infinite: false,
			__experimental_mode: void 0
		});
		const clerk = useClerkInstanceContext();
		const user = useUserBase();
		const organization = useOrganizationBase();
		clerk.telemetry?.record(eventMethodCalled(hookName$3));
		const isForOrganization = safeFor === "organization";
		const billingEnabled = useBillingIsEnabled({
			for: safeFor,
			enabled: externalEnabled,
			authenticated: !options?.unauthenticated
		});
		const hookParams = typeof paginationParams === "undefined" ? void 0 : {
			initialPage: safeValues.initialPage,
			pageSize: safeValues.pageSize,
			...options?.unauthenticated ? {} : isForOrganization ? { orgId: organization?.id } : {}
		};
		const isEnabled = !!hookParams && clerk.loaded && !!billingEnabled;
		return usePagesOrInfinite({
			fetcher: fetchFn,
			config: {
				keepPreviousData: safeValues.keepPreviousData,
				infinite: safeValues.infinite,
				enabled: isEnabled,
				...options?.unauthenticated ? {} : { isSignedIn: user !== null },
				__experimental_mode: safeValues.__experimental_mode,
				initialPage: safeValues.initialPage,
				pageSize: safeValues.pageSize
			},
			keys: createCacheKeys({
				stablePrefix: resourceType,
				authenticated: !options?.unauthenticated,
				tracked: options?.unauthenticated ? { for: safeFor } : {
					userId: user?.id,
					...isForOrganization ? { orgId: organization?.id } : {}
				},
				untracked: { args: hookParams }
			})
		});
	};
}
createBillingPaginatedHook({
	hookName: "useStatements",
	resourceType: STABLE_KEYS.STATEMENTS_KEY,
	useFetcher: () => {
		const clerk = useClerkInstanceContext();
		if (clerk.loaded) return clerk.billing.getStatements;
	}
});
createBillingPaginatedHook({
	hookName: "usePaymentAttempts",
	resourceType: STABLE_KEYS.PAYMENT_ATTEMPTS_KEY,
	useFetcher: () => {
		const clerk = useClerkInstanceContext();
		if (clerk.loaded) return clerk.billing.getPaymentAttempts;
	}
});
createBillingPaginatedHook({
	hookName: "usePaymentMethods",
	resourceType: STABLE_KEYS.PAYMENT_METHODS_KEY,
	useFetcher: (resource) => {
		const organization = useOrganizationBase();
		const user = useUserBase();
		if (resource === "organization") return organization?.getPaymentMethods;
		return user?.getPaymentMethods;
	}
});
createBillingPaginatedHook({
	hookName: "usePlans",
	resourceType: STABLE_KEYS.PLANS_KEY,
	useFetcher: (_for) => {
		const clerk = useClerkInstanceContext();
		if (!clerk.loaded) return;
		return (params) => clerk.billing.getPlans({
			...params,
			for: _for
		});
	},
	options: { unauthenticated: true }
});
function assertClerkSingletonExists(clerk) {
	if (!clerk) clerkCoreErrorNoClerkSingleton();
}
function ClerkContextProvider(props) {
	const clerk = props.clerk;
	assertClerkSingletonExists(clerk);
	if (props.initialState instanceof Promise && !("use" in import_react.default && typeof import_react.use === "function")) throw new Error("initialState cannot be a promise if React version is less than 19");
	const clerkCtx = import_react.useMemo(() => ({ value: clerk }), [props.clerkStatus]);
	return /* @__PURE__ */ import_react.createElement(InitialStateProvider, { initialState: props.initialState }, /* @__PURE__ */ import_react.createElement(ClerkInstanceContext.Provider, { value: clerkCtx }, /* @__PURE__ */ import_react.createElement(__experimental_CheckoutProvider, { value: void 0 }, props.children)));
}
var usePrevious = (value) => {
	const ref = (0, import_react.useRef)(value);
	(0, import_react.useEffect)(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
};
var useAttachEvent = (element, event, cb) => {
	const cbDefined = !!cb;
	const cbRef = (0, import_react.useRef)(cb);
	(0, import_react.useEffect)(() => {
		cbRef.current = cb;
	}, [cb]);
	(0, import_react.useEffect)(() => {
		if (!cbDefined || !element) return () => {};
		const decoratedCb = (...args) => {
			if (cbRef.current) cbRef.current(...args);
		};
		element.on(event, decoratedCb);
		return () => {
			element.off(event, decoratedCb);
		};
	}, [
		cbDefined,
		event,
		element,
		cbRef
	]);
};
var ElementsContext = import_react.createContext(null);
ElementsContext.displayName = "ElementsContext";
var parseElementsContext = (ctx, useCase) => {
	if (!ctx) throw new Error(`Could not find Elements context; You need to wrap the part of your app that ${useCase} in an <Elements> provider.`);
	return ctx;
};
var isUnknownObject = (raw) => {
	return raw !== null && typeof raw === "object";
};
var extractAllowedOptionsUpdates = (options, prevOptions, immutableKeys) => {
	if (!isUnknownObject(options)) return null;
	return Object.keys(options).reduce((newOptions, key) => {
		const isUpdated = !isUnknownObject(prevOptions) || !isEqual(options[key], prevOptions[key]);
		if (immutableKeys.includes(key)) {
			if (isUpdated) console.warn(`Unsupported prop change: options.${key} is not a mutable property.`);
			return newOptions;
		}
		if (!isUpdated) return newOptions;
		return {
			...newOptions || {},
			[key]: options[key]
		};
	}, null);
};
var PLAIN_OBJECT_STR = "[object Object]";
var isEqual = (left, right) => {
	if (!isUnknownObject(left) || !isUnknownObject(right)) return left === right;
	const leftArray = Array.isArray(left);
	if (leftArray !== Array.isArray(right)) return false;
	const leftPlainObject = Object.prototype.toString.call(left) === PLAIN_OBJECT_STR;
	if (leftPlainObject !== (Object.prototype.toString.call(right) === PLAIN_OBJECT_STR)) return false;
	if (!leftPlainObject && !leftArray) return left === right;
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) return false;
	const keySet = {};
	for (let i = 0; i < leftKeys.length; i += 1) keySet[leftKeys[i]] = true;
	for (let i = 0; i < rightKeys.length; i += 1) keySet[rightKeys[i]] = true;
	const allKeys = Object.keys(keySet);
	if (allKeys.length !== leftKeys.length) return false;
	const l = left;
	const r = right;
	const pred = (key) => {
		return isEqual(l[key], r[key]);
	};
	return allKeys.every(pred);
};
var useElementsOrCheckoutSdkContextWithUseCase = (useCaseString) => {
	return parseElementsContext(import_react.useContext(ElementsContext), useCaseString);
};
var capitalized = (str) => str.charAt(0).toUpperCase() + str.slice(1);
var createElementComponent = (type, isServer) => {
	const displayName = `${capitalized(type)}Element`;
	const ClientElement = ({ id, className, fallback, options = {}, onBlur, onFocus, onReady, onChange, onEscape, onClick, onLoadError, onLoaderStart, onNetworksChange, onConfirm, onCancel, onShippingAddressChange, onShippingRateChange }) => {
		const ctx = useElementsOrCheckoutSdkContextWithUseCase(`mounts <${displayName}>`);
		const elements = "elements" in ctx ? ctx.elements : null;
		const [element, setElement] = import_react.useState(null);
		const elementRef = import_react.useRef(null);
		const domNode = import_react.useRef(null);
		const [isReady, setReady] = (0, import_react.useState)(false);
		useAttachEvent(element, "blur", onBlur);
		useAttachEvent(element, "focus", onFocus);
		useAttachEvent(element, "escape", onEscape);
		useAttachEvent(element, "click", onClick);
		useAttachEvent(element, "loaderror", onLoadError);
		useAttachEvent(element, "loaderstart", onLoaderStart);
		useAttachEvent(element, "networkschange", onNetworksChange);
		useAttachEvent(element, "confirm", onConfirm);
		useAttachEvent(element, "cancel", onCancel);
		useAttachEvent(element, "shippingaddresschange", onShippingAddressChange);
		useAttachEvent(element, "shippingratechange", onShippingRateChange);
		useAttachEvent(element, "change", onChange);
		let readyCallback;
		if (onReady) readyCallback = () => {
			setReady(true);
			onReady(element);
		};
		useAttachEvent(element, "ready", readyCallback);
		import_react.useLayoutEffect(() => {
			if (elementRef.current === null && domNode.current !== null && elements) {
				let newElement = null;
				if (elements) newElement = elements.create(type, options);
				elementRef.current = newElement;
				setElement(newElement);
				if (newElement) newElement.mount(domNode.current);
			}
		}, [elements, options]);
		const prevOptions = usePrevious(options);
		import_react.useEffect(() => {
			if (!elementRef.current) return;
			const updates = extractAllowedOptionsUpdates(options, prevOptions, ["paymentRequest"]);
			if (updates && "update" in elementRef.current) elementRef.current.update(updates);
		}, [options, prevOptions]);
		import_react.useLayoutEffect(() => {
			return () => {
				if (elementRef.current && typeof elementRef.current.destroy === "function") try {
					elementRef.current.destroy();
					elementRef.current = null;
				} catch {}
			};
		}, []);
		return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, !isReady && fallback, /* @__PURE__ */ import_react.createElement("div", {
			id,
			style: {
				height: isReady ? "unset" : "0px",
				visibility: isReady ? "visible" : "hidden"
			},
			className,
			ref: domNode
		}));
	};
	const ServerElement = (props) => {
		useElementsOrCheckoutSdkContextWithUseCase(`mounts <${displayName}>`);
		const { id, className } = props;
		return /* @__PURE__ */ import_react.createElement("div", {
			id,
			className
		});
	};
	const Element = isServer ? ServerElement : ClientElement;
	Element.displayName = displayName;
	Element.__elementType = type;
	return Element;
};
createElementComponent("payment", typeof window === "undefined");
var [PaymentElementContext, usePaymentElementContext] = createContextAndHook("PaymentElementContext");
var [StripeUtilsContext, useStripeUtilsContext] = createContextAndHook("StripeUtilsContext");
var [PortalContext, , usePortalContextWithoutGuarantee] = createContextAndHook("PortalProvider");
/**
* UNSAFE_PortalProvider allows you to specify a custom container for Clerk floating UI elements
* (popovers, modals, tooltips, etc.) that use portals.
*
* Only components within this provider will be affected. Components outside the provider
* will continue to use the default document.body for portals.
*
* This is particularly useful when using Clerk components inside external UI libraries
* like Radix Dialog or React Aria Components, where portaled elements need to render
* within the dialog's container to remain interactable.
*
* @example
* ```tsx
* function Example() {
*   const containerRef = useRef(null);
*   return (
*     <RadixDialog ref={containerRef}>
*       <UNSAFE_PortalProvider getContainer={() => containerRef.current}>
*         <UserButton />
*       </UNSAFE_PortalProvider>
*     </RadixDialog>
*   );
* }
* ```
*/
var UNSAFE_PortalProvider = ({ children, getContainer }) => {
	const contextValue = import_react.useMemo(() => ({ value: { getContainer } }), [getContainer]);
	return /* @__PURE__ */ import_react.createElement(PortalContext.Provider, { value: contextValue }, children);
};
UNSAFE_PortalProvider.displayName = "UNSAFE_PortalProvider";
/**
* Hook to get the current portal root container.
* Returns the getContainer function from context if inside a PortalProvider,
* otherwise returns a function that returns null (default behavior).
*/
var usePortalRoot = () => {
	const contextValue = usePortalContextWithoutGuarantee();
	if (contextValue && "getContainer" in contextValue && contextValue.getContainer) return contextValue.getContainer;
	return () => null;
};
var errorThrower$2 = buildErrorThrower({ packageName: "@clerk/react" });
function setErrorThrowerOptions(options) {
	errorThrower$2.setMessages(options).setPackageName(options);
}
var useIsomorphicClerkContext = useClerkInstanceContext;
var useAssertWrappedByClerkProvider = (source) => {
	useAssertWrappedByClerkProvider$1(() => {
		errorThrower$2.throwMissingClerkProviderError({ source });
	});
};
var isDevelopmentEnvironment = () => {
	try {
		return false;
	} catch {}
	return false;
};
var isTestEnvironment = () => {
	try {
		return false;
	} catch {}
	return false;
};
var isProductionEnvironment = () => {
	try {
		return true;
	} catch {}
	return false;
};
/**
*
*/
function handleValueOrFn(value, url, defaultValue) {
	if (typeof value === "function") return value(url);
	if (typeof value !== "undefined") return value;
	if (typeof defaultValue !== "undefined") return defaultValue;
}
var logErrorInDevMode = (message) => {
	if (isDevelopmentEnvironment()) console.error(`Clerk: ${message}`);
};
var hasCloudflareProxyContext = (context) => {
	return !!context?.cloudflare?.env;
};
var hasCloudflareContext = (context) => {
	return !!context?.env;
};
/**
* Retrieves an environment variable across runtime environments.
*
* @param name - The environment variable name to retrieve.
* @param context - Optional context object that may contain environment values.
* @returns The environment variable value or empty string if not found.
*/
var getEnvVariable = (name, context) => {
	if (typeof process !== "undefined" && process.env && typeof process.env[name] === "string") return process.env[name];
	if (typeof import.meta !== "undefined" && typeof {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_CONVEX_SITE_URL": "https://wary-puma-83.eu-west-1.convex.site",
		"VITE_CONVEX_URL": "https://wary-puma-83.eu-west-1.convex.cloud"
	}[name] === "string") return {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_CONVEX_SITE_URL": "https://wary-puma-83.eu-west-1.convex.site",
		"VITE_CONVEX_URL": "https://wary-puma-83.eu-west-1.convex.cloud"
	}[name];
	if (hasCloudflareProxyContext(context)) return context.cloudflare.env[name] || "";
	if (hasCloudflareContext(context)) return context.env[name] || "";
	if (context && typeof context[name] === "string") return context[name];
	try {
		return globalThis[name];
	} catch {}
	return "";
};
var without = (obj, ...props) => {
	const copy = { ...obj };
	for (const prop of props) delete copy[prop];
	return copy;
};
/**
* Checks if the window object is defined. You can also use this to check if something is happening on the client side.
*
* @returns
*/
function inBrowser() {
	return typeof window !== "undefined";
}
new RegExp([
	"bot",
	"spider",
	"crawl",
	"APIs-Google",
	"AdsBot",
	"Googlebot",
	"mediapartners",
	"Google Favicon",
	"FeedFetcher",
	"Google-Read-Aloud",
	"DuplexWeb-Google",
	"googleweblight",
	"bing",
	"yandex",
	"baidu",
	"duckduck",
	"yahoo",
	"ecosia",
	"ia_archiver",
	"facebook",
	"instagram",
	"pinterest",
	"reddit",
	"slack",
	"twitter",
	"whatsapp",
	"youtube",
	"semrush"
].join("|"), "i");
var multipleClerkProvidersError = "You've added multiple <ClerkProvider> components in your React component tree. Wrap your components in a single <ClerkProvider>.";
var multipleChildrenInButtonComponent = (name) => `You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;
var invalidStateError = "Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support";
var unsupportedNonBrowserDomainOrProxyUrlFunction = "Unsupported usage of isSatellite, domain or proxyUrl. The usage of isSatellite, domain or proxyUrl as function is not supported in non-browser environments.";
var userProfilePageRenderedError = "<UserProfile.Page /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.";
var userProfileLinkRenderedError = "<UserProfile.Link /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.";
var organizationProfilePageRenderedError = "<OrganizationProfile.Page /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.";
var organizationProfileLinkRenderedError = "<OrganizationProfile.Link /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.";
var customPagesIgnoredComponent = (componentName) => `<${componentName} /> can only accept <${componentName}.Page /> and <${componentName}.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;
var customPageWrongProps = (componentName) => `Missing props. <${componentName}.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.`;
var customLinkWrongProps = (componentName) => `Missing props. <${componentName}.Link /> component requires the following props: url, label and labelIcon.`;
var userButtonIgnoredComponent = `<UserButton /> can only accept <UserButton.UserProfilePage />, <UserButton.UserProfileLink /> and <UserButton.MenuItems /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;
var customMenuItemsIgnoredComponent = "<UserButton.MenuItems /> component can only accept <UserButton.Action /> and <UserButton.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.";
var userButtonMenuItemsRenderedError = "<UserButton.MenuItems /> component needs to be a direct child of `<UserButton />`.";
var userButtonMenuActionRenderedError = "<UserButton.Action /> component needs to be a direct child of `<UserButton.MenuItems />`.";
var userButtonMenuLinkRenderedError = "<UserButton.Link /> component needs to be a direct child of `<UserButton.MenuItems />`.";
var userButtonMenuItemLinkWrongProps = "Missing props. <UserButton.Link /> component requires the following props: href, label and labelIcon.";
var userButtonMenuItemsActionWrongsProps = "Missing props. <UserButton.Action /> component requires the following props: label.";
var assertSingleChild = (children) => (name) => {
	try {
		return import_react.Children.only(children);
	} catch {
		return errorThrower$2.throw(multipleChildrenInButtonComponent(name));
	}
};
var normalizeWithDefaultValue = (children, defaultText) => {
	if (!children) children = defaultText;
	if (typeof children === "string") children = /* @__PURE__ */ import_react.createElement("button", null, children);
	return children;
};
var safeExecute = (cb) => (...args) => {
	if (cb && typeof cb === "function") return cb(...args);
};
var getEnvVar = (name) => {
	return getEnvVariable(`VITE_${name}`) || getEnvVariable(name);
};
var withEnvFallback = (value, envVarName) => {
	if (value !== void 0) return value;
	return getEnvVar(envVarName) || void 0;
};
var mergeWithEnv = (options) => {
	const publishableKey = withEnvFallback(options.publishableKey, "CLERK_PUBLISHABLE_KEY");
	return {
		...options,
		...publishableKey !== void 0 && { publishableKey }
	};
};
function isConstructor(f) {
	return typeof f === "function";
}
var counts = /* @__PURE__ */ new Map();
function useMaxAllowedInstancesGuard(name, error, maxCount = 1) {
	import_react.useEffect(() => {
		const count = counts.get(name) || 0;
		if (count == maxCount) return errorThrower$2.throw(error);
		counts.set(name, count + 1);
		return () => {
			counts.set(name, (counts.get(name) || 1) - 1);
		};
	}, []);
}
function withMaxAllowedInstancesGuard(WrappedComponent, name, error) {
	const displayName = WrappedComponent.displayName || WrappedComponent.name || name || "Component";
	const Hoc = (props) => {
		useMaxAllowedInstancesGuard(name, error);
		return /* @__PURE__ */ import_react.createElement(WrappedComponent, { ...props });
	};
	Hoc.displayName = `withMaxAllowedInstancesGuard(${displayName})`;
	return Hoc;
}
var useCustomElementPortal = (elements) => {
	const [nodeMap, setNodeMap] = (0, import_react.useState)(/* @__PURE__ */ new Map());
	return elements.map((el) => ({
		id: el.id,
		mount: (node) => setNodeMap((prev) => new Map(prev).set(String(el.id), node)),
		unmount: () => setNodeMap((prev) => {
			const newMap = new Map(prev);
			newMap.set(String(el.id), null);
			return newMap;
		}),
		portal: () => {
			const node = nodeMap.get(String(el.id));
			return node ? (0, import_react_dom.createPortal)(el.component, node) : null;
		}
	}));
};
var isThatComponent = (v, component) => {
	return !!v && import_react.isValidElement(v) && (v == null ? void 0 : v.type) === component;
};
var useUserProfileCustomPages = (children, options) => {
	return useCustomPages({
		children,
		reorderItemsLabels: [
			"account",
			"security",
			"billing",
			"apiKeys"
		],
		LinkComponent: UserProfileLink,
		PageComponent: UserProfilePage,
		MenuItemsComponent: MenuItems,
		componentName: "UserProfile"
	}, options);
};
var useOrganizationProfileCustomPages = (children, options) => {
	return useCustomPages({
		children,
		reorderItemsLabels: [
			"general",
			"members",
			"billing",
			"apiKeys"
		],
		LinkComponent: OrganizationProfileLink,
		PageComponent: OrganizationProfilePage,
		componentName: "OrganizationProfile"
	}, options);
};
var useSanitizedChildren = (children) => {
	const sanitizedChildren = [];
	const excludedComponents = [
		OrganizationProfileLink,
		OrganizationProfilePage,
		MenuItems,
		UserProfilePage,
		UserProfileLink
	];
	import_react.Children.forEach(children, (child) => {
		if (!excludedComponents.some((component) => isThatComponent(child, component))) sanitizedChildren.push(child);
	});
	return sanitizedChildren;
};
var useCustomPages = (params, options) => {
	const { children, LinkComponent, PageComponent, MenuItemsComponent, reorderItemsLabels, componentName } = params;
	const { allowForAnyChildren = false } = options || {};
	const validChildren = [];
	import_react.Children.forEach(children, (child) => {
		if (!isThatComponent(child, PageComponent) && !isThatComponent(child, LinkComponent) && !isThatComponent(child, MenuItemsComponent)) {
			if (child && !allowForAnyChildren) logErrorInDevMode(customPagesIgnoredComponent(componentName));
			return;
		}
		const { props } = child;
		const { children: children2, label, url, labelIcon } = props;
		if (isThatComponent(child, PageComponent)) if (isReorderItem(props, reorderItemsLabels)) validChildren.push({ label });
		else if (isCustomPage(props)) validChildren.push({
			label,
			labelIcon,
			children: children2,
			url
		});
		else {
			logErrorInDevMode(customPageWrongProps(componentName));
			return;
		}
		if (isThatComponent(child, LinkComponent)) if (isExternalLink(props)) validChildren.push({
			label,
			labelIcon,
			url
		});
		else {
			logErrorInDevMode(customLinkWrongProps(componentName));
			return;
		}
	});
	const customPageContents = [];
	const customPageLabelIcons = [];
	const customLinkLabelIcons = [];
	validChildren.forEach((cp, index) => {
		if (isCustomPage(cp)) {
			customPageContents.push({
				component: cp.children,
				id: index
			});
			customPageLabelIcons.push({
				component: cp.labelIcon,
				id: index
			});
			return;
		}
		if (isExternalLink(cp)) customLinkLabelIcons.push({
			component: cp.labelIcon,
			id: index
		});
	});
	const customPageContentsPortals = useCustomElementPortal(customPageContents);
	const customPageLabelIconsPortals = useCustomElementPortal(customPageLabelIcons);
	const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);
	const customPages = [];
	const customPagesPortals = [];
	validChildren.forEach((cp, index) => {
		if (isReorderItem(cp, reorderItemsLabels)) {
			customPages.push({ label: cp.label });
			return;
		}
		if (isCustomPage(cp)) {
			const { portal: contentPortal, mount, unmount } = customPageContentsPortals.find((p) => p.id === index);
			const { portal: labelPortal, mount: mountIcon, unmount: unmountIcon } = customPageLabelIconsPortals.find((p) => p.id === index);
			customPages.push({
				label: cp.label,
				url: cp.url,
				mount,
				unmount,
				mountIcon,
				unmountIcon
			});
			customPagesPortals.push(contentPortal);
			customPagesPortals.push(labelPortal);
			return;
		}
		if (isExternalLink(cp)) {
			const { portal: labelPortal, mount: mountIcon, unmount: unmountIcon } = customLinkLabelIconsPortals.find((p) => p.id === index);
			customPages.push({
				label: cp.label,
				url: cp.url,
				mountIcon,
				unmountIcon
			});
			customPagesPortals.push(labelPortal);
			return;
		}
	});
	return {
		customPages,
		customPagesPortals
	};
};
var isReorderItem = (childProps, validItems) => {
	const { children, label, url, labelIcon } = childProps;
	return !children && !url && !labelIcon && validItems.some((v) => v === label);
};
var isCustomPage = (childProps) => {
	const { children, label, url, labelIcon } = childProps;
	return !!children && !!url && !!labelIcon && !!label;
};
var isExternalLink = (childProps) => {
	const { children, label, url, labelIcon } = childProps;
	return !children && !!url && !!labelIcon && !!label;
};
var useUserButtonCustomMenuItems = (children, options) => {
	var _a;
	return useCustomMenuItems({
		children,
		reorderItemsLabels: ["manageAccount", "signOut"],
		MenuItemsComponent: MenuItems,
		MenuActionComponent: MenuAction,
		MenuLinkComponent: MenuLink,
		UserProfileLinkComponent: UserProfileLink,
		UserProfilePageComponent: UserProfilePage,
		allowForAnyChildren: (_a = options == null ? void 0 : options.allowForAnyChildren) != null ? _a : false
	});
};
var useCustomMenuItems = ({ children, MenuItemsComponent, MenuActionComponent, MenuLinkComponent, UserProfileLinkComponent, UserProfilePageComponent, reorderItemsLabels, allowForAnyChildren = false }) => {
	const validChildren = [];
	const customMenuItems = [];
	const customMenuItemsPortals = [];
	import_react.Children.forEach(children, (child) => {
		if (!isThatComponent(child, MenuItemsComponent) && !isThatComponent(child, UserProfileLinkComponent) && !isThatComponent(child, UserProfilePageComponent)) {
			if (child && !allowForAnyChildren) logErrorInDevMode(userButtonIgnoredComponent);
			return;
		}
		if (isThatComponent(child, UserProfileLinkComponent) || isThatComponent(child, UserProfilePageComponent)) return;
		const { props } = child;
		import_react.Children.forEach(props.children, (child2) => {
			if (!isThatComponent(child2, MenuActionComponent) && !isThatComponent(child2, MenuLinkComponent)) {
				if (child2) logErrorInDevMode(customMenuItemsIgnoredComponent);
				return;
			}
			const { props: props2 } = child2;
			const { label, labelIcon, href, onClick, open } = props2;
			if (isThatComponent(child2, MenuActionComponent)) if (isReorderItem2(props2, reorderItemsLabels)) validChildren.push({ label });
			else if (isCustomMenuItem(props2)) {
				const baseItem = {
					label,
					labelIcon
				};
				if (onClick !== void 0) validChildren.push({
					...baseItem,
					onClick
				});
				else if (open !== void 0) validChildren.push({
					...baseItem,
					open: open.startsWith("/") ? open : `/${open}`
				});
				else {
					logErrorInDevMode("Custom menu item must have either onClick or open property");
					return;
				}
			} else {
				logErrorInDevMode(userButtonMenuItemsActionWrongsProps);
				return;
			}
			if (isThatComponent(child2, MenuLinkComponent)) if (isExternalLink2(props2)) validChildren.push({
				label,
				labelIcon,
				href
			});
			else {
				logErrorInDevMode(userButtonMenuItemLinkWrongProps);
				return;
			}
		});
	});
	const customMenuItemLabelIcons = [];
	const customLinkLabelIcons = [];
	validChildren.forEach((mi, index) => {
		if (isCustomMenuItem(mi)) customMenuItemLabelIcons.push({
			component: mi.labelIcon,
			id: index
		});
		if (isExternalLink2(mi)) customLinkLabelIcons.push({
			component: mi.labelIcon,
			id: index
		});
	});
	const customMenuItemLabelIconsPortals = useCustomElementPortal(customMenuItemLabelIcons);
	const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);
	validChildren.forEach((mi, index) => {
		if (isReorderItem2(mi, reorderItemsLabels)) customMenuItems.push({ label: mi.label });
		if (isCustomMenuItem(mi)) {
			const { portal: iconPortal, mount: mountIcon, unmount: unmountIcon } = customMenuItemLabelIconsPortals.find((p) => p.id === index);
			const menuItem = {
				label: mi.label,
				mountIcon,
				unmountIcon
			};
			if ("onClick" in mi) menuItem.onClick = mi.onClick;
			else if ("open" in mi) menuItem.open = mi.open;
			customMenuItems.push(menuItem);
			customMenuItemsPortals.push(iconPortal);
		}
		if (isExternalLink2(mi)) {
			const { portal: iconPortal, mount: mountIcon, unmount: unmountIcon } = customLinkLabelIconsPortals.find((p) => p.id === index);
			customMenuItems.push({
				label: mi.label,
				href: mi.href,
				mountIcon,
				unmountIcon
			});
			customMenuItemsPortals.push(iconPortal);
		}
	});
	return {
		customMenuItems,
		customMenuItemsPortals
	};
};
var isReorderItem2 = (childProps, validItems) => {
	const { children, label, onClick, labelIcon } = childProps;
	return !children && !onClick && !labelIcon && validItems.some((v) => v === label);
};
var isCustomMenuItem = (childProps) => {
	const { label, labelIcon, onClick, open } = childProps;
	return !!labelIcon && !!label && (typeof onClick === "function" || typeof open === "string");
};
var isExternalLink2 = (childProps) => {
	const { label, href, labelIcon } = childProps;
	return !!href && !!labelIcon && !!label;
};
var createAwaitableMutationObserver = (globalOptions) => {
	const isReady = globalOptions == null ? void 0 : globalOptions.isReady;
	return (options) => new Promise((resolve, reject) => {
		const { root = document == null ? void 0 : document.body, selector, timeout = 0 } = options;
		if (!root) {
			reject(/* @__PURE__ */ new Error("No root element provided"));
			return;
		}
		let elementToWatch = root;
		if (selector) elementToWatch = root == null ? void 0 : root.querySelector(selector);
		if (isReady(elementToWatch, selector)) {
			resolve();
			return;
		}
		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (!elementToWatch && selector) elementToWatch = root == null ? void 0 : root.querySelector(selector);
				if (globalOptions.childList && mutation.type === "childList" || globalOptions.attributes && mutation.type === "attributes") {
					if (isReady(elementToWatch, selector)) {
						observer.disconnect();
						resolve();
						return;
					}
				}
			}
		});
		observer.observe(root, globalOptions);
		if (timeout > 0) setTimeout(() => {
			observer.disconnect();
			reject(/* @__PURE__ */ new Error(`Timeout waiting for ${selector}`));
		}, timeout);
	});
};
var waitForElementChildren = createAwaitableMutationObserver({
	childList: true,
	subtree: true,
	isReady: (el, selector) => {
		var _a;
		return !!(el == null ? void 0 : el.childElementCount) && ((_a = el == null ? void 0 : el.matches) == null ? void 0 : _a.call(el, selector)) && el.childElementCount > 0;
	}
});
function useWaitForComponentMount(component, options) {
	const watcherRef = (0, import_react.useRef)();
	const [status, setStatus] = (0, import_react.useState)("rendering");
	(0, import_react.useEffect)(() => {
		if (!component) throw new Error("Clerk: no component name provided, unable to detect mount.");
		if (typeof window !== "undefined" && !watcherRef.current) {
			const defaultSelector = `[data-clerk-component="${component}"]`;
			const selector = options == null ? void 0 : options.selector;
			watcherRef.current = waitForElementChildren({ selector: selector ? defaultSelector + selector : defaultSelector }).then(() => {
				setStatus("rendered");
			}).catch(() => {
				setStatus("error");
			});
		}
	}, [component, options == null ? void 0 : options.selector]);
	return status;
}
var isMountProps = (props) => {
	return "mount" in props;
};
var isOpenProps = (props) => {
	return "open" in props;
};
var stripMenuItemIconHandlers = (menuItems) => {
	return menuItems == null ? void 0 : menuItems.map(({ mountIcon, unmountIcon, ...rest }) => rest);
};
var ClerkHostRenderer = class extends import_react.PureComponent {
	constructor() {
		super(...arguments);
		this.rootRef = import_react.createRef();
	}
	componentDidUpdate(_prevProps) {
		var _a, _b, _c, _d;
		if (!isMountProps(_prevProps) || !isMountProps(this.props)) return;
		const prevProps = without(_prevProps.props, "customPages", "customMenuItems", "children");
		const newProps = without(this.props.props, "customPages", "customMenuItems", "children");
		const customPagesChanged = ((_a = prevProps.customPages) == null ? void 0 : _a.length) !== ((_b = newProps.customPages) == null ? void 0 : _b.length);
		const customMenuItemsChanged = ((_c = prevProps.customMenuItems) == null ? void 0 : _c.length) !== ((_d = newProps.customMenuItems) == null ? void 0 : _d.length);
		const prevMenuItemsWithoutHandlers = stripMenuItemIconHandlers(_prevProps.props.customMenuItems);
		const newMenuItemsWithoutHandlers = stripMenuItemIconHandlers(this.props.props.customMenuItems);
		if (!isDeeplyEqual(prevProps, newProps) || !isDeeplyEqual(prevMenuItemsWithoutHandlers, newMenuItemsWithoutHandlers) || customPagesChanged || customMenuItemsChanged) {
			if (this.rootRef.current) this.props.updateProps({
				node: this.rootRef.current,
				props: this.props.props
			});
		}
	}
	componentDidMount() {
		if (this.rootRef.current) {
			if (isMountProps(this.props)) this.props.mount(this.rootRef.current, this.props.props);
			if (isOpenProps(this.props)) this.props.open(this.props.props);
		}
	}
	componentWillUnmount() {
		if (this.rootRef.current) {
			if (isMountProps(this.props)) this.props.unmount(this.rootRef.current);
			if (isOpenProps(this.props)) this.props.close();
		}
	}
	render() {
		const { hideRootHtmlElement = false } = this.props;
		const rootAttributes = {
			ref: this.rootRef,
			...this.props.rootProps,
			...this.props.component && { "data-clerk-component": this.props.component }
		};
		return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, !hideRootHtmlElement && /* @__PURE__ */ import_react.createElement("div", { ...rootAttributes }), this.props.children);
	}
};
var withClerk = (Component, displayNameOrOptions) => {
	const displayName = (typeof displayNameOrOptions === "string" ? displayNameOrOptions : displayNameOrOptions == null ? void 0 : displayNameOrOptions.component) || Component.displayName || Component.name || "Component";
	Component.displayName = displayName;
	const options = typeof displayNameOrOptions === "string" ? void 0 : displayNameOrOptions;
	const HOC = (props) => {
		useAssertWrappedByClerkProvider(displayName || "withClerk");
		const clerk = useIsomorphicClerkContext();
		const getContainer = usePortalRoot();
		if (!clerk.loaded && !(options == null ? void 0 : options.renderWhileLoading)) return null;
		return /* @__PURE__ */ import_react.createElement(Component, {
			getContainer,
			...props,
			component: displayName,
			clerk
		});
	};
	HOC.displayName = `withClerk(${displayName})`;
	return HOC;
};
var CustomPortalsRenderer = (props) => {
	var _a, _b;
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, (_a = props == null ? void 0 : props.customPagesPortals) == null ? void 0 : _a.map((portal, index) => (0, import_react.createElement)(portal, { key: index })), (_b = props == null ? void 0 : props.customMenuItemsPortals) == null ? void 0 : _b.map((portal, index) => (0, import_react.createElement)(portal, { key: index })));
};
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountSignIn,
		unmount: clerk.unmountSignIn,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "SignIn",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountSignUp,
		unmount: clerk.unmountSignUp,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "SignUp",
	renderWhileLoading: true
});
function UserProfilePage({ children }) {
	logErrorInDevMode(userProfilePageRenderedError);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, children);
}
function UserProfileLink({ children }) {
	logErrorInDevMode(userProfileLinkRenderedError);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, children);
}
var _UserProfile = withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountUserProfile,
		unmount: clerk.unmountUserProfile,
		updateProps: clerk.__internal_updateProps,
		props: {
			...props,
			customPages
		},
		rootProps: rendererRootProps
	}, /* @__PURE__ */ import_react.createElement(CustomPortalsRenderer, { customPagesPortals })));
}, {
	component: "UserProfile",
	renderWhileLoading: true
});
Object.assign(_UserProfile, {
	Page: UserProfilePage,
	Link: UserProfileLink
});
var UserButtonContext = (0, import_react.createContext)({
	mount: () => {},
	unmount: () => {},
	updateProps: () => {}
});
var _UserButton = withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children, { allowForAnyChildren: !!props.__experimental_asProvider });
	const userProfileProps = {
		...props.userProfileProps,
		customPages
	};
	const { customMenuItems, customMenuItemsPortals } = useUserButtonCustomMenuItems(props.children, { allowForAnyChildren: !!props.__experimental_asProvider });
	const sanitizedChildren = useSanitizedChildren(props.children);
	const passableProps = {
		mount: clerk.mountUserButton,
		unmount: clerk.unmountUserButton,
		updateProps: clerk.__internal_updateProps,
		props: {
			...props,
			userProfileProps,
			customMenuItems
		}
	};
	const portalProps = {
		customPagesPortals,
		customMenuItemsPortals
	};
	return /* @__PURE__ */ import_react.createElement(UserButtonContext.Provider, { value: passableProps }, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		...passableProps,
		hideRootHtmlElement: !!props.__experimental_asProvider,
		rootProps: rendererRootProps
	}, props.__experimental_asProvider ? sanitizedChildren : null, /* @__PURE__ */ import_react.createElement(CustomPortalsRenderer, { ...portalProps })));
}, {
	component: "UserButton",
	renderWhileLoading: true
});
function MenuItems({ children }) {
	logErrorInDevMode(userButtonMenuItemsRenderedError);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, children);
}
function MenuAction({ children }) {
	logErrorInDevMode(userButtonMenuActionRenderedError);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, children);
}
function MenuLink({ children }) {
	logErrorInDevMode(userButtonMenuLinkRenderedError);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, children);
}
function UserButtonOutlet(outletProps) {
	const providerProps = (0, import_react.useContext)(UserButtonContext);
	const portalProps = {
		...providerProps,
		props: {
			...providerProps.props,
			...outletProps
		}
	};
	return /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, { ...portalProps });
}
var UserButton = Object.assign(_UserButton, {
	UserProfilePage,
	UserProfileLink,
	MenuItems,
	Action: MenuAction,
	Link: MenuLink,
	__experimental_Outlet: UserButtonOutlet
});
function OrganizationProfilePage({ children }) {
	logErrorInDevMode(organizationProfilePageRenderedError);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, children);
}
function OrganizationProfileLink({ children }) {
	logErrorInDevMode(organizationProfileLinkRenderedError);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, children);
}
var _OrganizationProfile = withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountOrganizationProfile,
		unmount: clerk.unmountOrganizationProfile,
		updateProps: clerk.__internal_updateProps,
		props: {
			...props,
			customPages
		},
		rootProps: rendererRootProps
	}, /* @__PURE__ */ import_react.createElement(CustomPortalsRenderer, { customPagesPortals })));
}, {
	component: "OrganizationProfile",
	renderWhileLoading: true
});
Object.assign(_OrganizationProfile, {
	Page: OrganizationProfilePage,
	Link: OrganizationProfileLink
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountCreateOrganization,
		unmount: clerk.unmountCreateOrganization,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "CreateOrganization",
	renderWhileLoading: true
});
var OrganizationSwitcherContext = (0, import_react.createContext)({
	mount: () => {},
	unmount: () => {},
	updateProps: () => {}
});
var _OrganizationSwitcher = withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children, { allowForAnyChildren: !!props.__experimental_asProvider });
	const organizationProfileProps = {
		...props.organizationProfileProps,
		customPages
	};
	const sanitizedChildren = useSanitizedChildren(props.children);
	const passableProps = {
		mount: clerk.mountOrganizationSwitcher,
		unmount: clerk.unmountOrganizationSwitcher,
		updateProps: clerk.__internal_updateProps,
		props: {
			...props,
			organizationProfileProps
		},
		rootProps: rendererRootProps,
		component
	};
	clerk.__experimental_prefetchOrganizationSwitcher();
	return /* @__PURE__ */ import_react.createElement(OrganizationSwitcherContext.Provider, { value: passableProps }, /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		...passableProps,
		hideRootHtmlElement: !!props.__experimental_asProvider
	}, props.__experimental_asProvider ? sanitizedChildren : null, /* @__PURE__ */ import_react.createElement(CustomPortalsRenderer, { customPagesPortals }))));
}, {
	component: "OrganizationSwitcher",
	renderWhileLoading: true
});
function OrganizationSwitcherOutlet(outletProps) {
	const providerProps = (0, import_react.useContext)(OrganizationSwitcherContext);
	const portalProps = {
		...providerProps,
		props: {
			...providerProps.props,
			...outletProps
		}
	};
	return /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, { ...portalProps });
}
Object.assign(_OrganizationSwitcher, {
	OrganizationProfilePage,
	OrganizationProfileLink,
	__experimental_Outlet: OrganizationSwitcherOutlet
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountOrganizationList,
		unmount: clerk.unmountOrganizationList,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "OrganizationList",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		open: clerk.openGoogleOneTap,
		close: clerk.closeGoogleOneTap,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "GoogleOneTap",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountWaitlist,
		unmount: clerk.unmountWaitlist,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "Waitlist",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component, { selector: "[data-component-status=\"ready\"]" }) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountPricingTable,
		unmount: clerk.unmountPricingTable,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "PricingTable",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountAPIKeys,
		unmount: clerk.unmountAPIKeys,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "ApiKeys",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountUserAvatar,
		unmount: clerk.unmountUserAvatar,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "UserAvatar",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountTaskChooseOrganization,
		unmount: clerk.unmountTaskChooseOrganization,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "TaskChooseOrganization",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountTaskResetPassword,
		unmount: clerk.unmountTaskResetPassword,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "TaskResetPassword",
	renderWhileLoading: true
});
withClerk(({ clerk, component, fallback, ...props }) => {
	const shouldShowFallback = useWaitForComponentMount(component) === "rendering" || !clerk.loaded;
	const rendererRootProps = { ...shouldShowFallback && fallback && { style: { display: "none" } } };
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react.createElement(ClerkHostRenderer, {
		component,
		mount: clerk.mountTaskSetupMFA,
		unmount: clerk.unmountTaskSetupMFA,
		updateProps: clerk.__internal_updateProps,
		props,
		rootProps: rendererRootProps
	}));
}, {
	component: "TaskSetupMFA",
	renderWhileLoading: true
});
var defaultDerivedInitialState = {
	actor: void 0,
	factorVerificationAge: null,
	orgId: void 0,
	orgPermissions: void 0,
	orgRole: void 0,
	orgSlug: void 0,
	sessionClaims: void 0,
	sessionId: void 0,
	sessionStatus: void 0,
	userId: void 0
};
function useAuthBase() {
	const clerk = useClerkInstanceContext();
	const initialState = useInitialStateContext();
	const getInitialState = (0, import_react.useCallback)(() => initialState, [initialState]);
	const state = (0, import_react.useSyncExternalStore)((0, import_react.useCallback)((callback) => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]), (0, import_react.useCallback)(() => {
		if (!clerk.loaded || !clerk.__internal_lastEmittedResources) return getInitialState();
		return clerk.__internal_lastEmittedResources;
	}, [clerk, getInitialState]), getInitialState);
	return (0, import_react.useMemo)(() => {
		if (!state) return defaultDerivedInitialState;
		return authStateFromFull(isInitialState(state) ? deriveState(false, {}, state) : deriveState(true, state, void 0));
	}, [state]);
}
function authStateFromFull(derivedState) {
	return {
		sessionId: derivedState.sessionId,
		sessionStatus: derivedState.sessionStatus,
		sessionClaims: derivedState.sessionClaims,
		userId: derivedState.userId,
		actor: derivedState.actor,
		orgId: derivedState.orgId,
		orgRole: derivedState.orgRole,
		orgSlug: derivedState.orgSlug,
		orgPermissions: derivedState.orgPermissions,
		factorVerificationAge: derivedState.factorVerificationAge
	};
}
function isInitialState(state) {
	return !("client" in state);
}
var clerkLoaded = (isomorphicClerk) => {
	return new Promise((resolve) => {
		const handler = (status) => {
			if (["ready", "degraded"].includes(status)) {
				resolve();
				isomorphicClerk.off("status", handler);
			}
		};
		isomorphicClerk.on("status", handler, { notify: true });
	});
};
var createGetToken = (isomorphicClerk) => {
	return async (options) => {
		if (!inBrowser()) throw new ClerkRuntimeError("useAuth().getToken() can only be used in browser environments. To access auth data server-side, see the Auth object reference doc: https://clerk.com/docs/reference/backend/types/auth-object", { code: "clerk_runtime_not_browser" });
		await clerkLoaded(isomorphicClerk);
		if (!isomorphicClerk.session) return null;
		return isomorphicClerk.session.getToken(options);
	};
};
var createSignOut = (isomorphicClerk) => {
	return async (...args) => {
		await clerkLoaded(isomorphicClerk);
		return isomorphicClerk.signOut(...args);
	};
};
var useAuth = (options = {}) => {
	var _a;
	useAssertWrappedByClerkProvider("useAuth");
	const { treatPendingAsSignedOut } = options != null ? options : {};
	const authState = useAuthBase();
	const isomorphicClerk = useIsomorphicClerkContext();
	const getToken = (0, import_react.useCallback)(createGetToken(isomorphicClerk), [isomorphicClerk]);
	const signOut = (0, import_react.useCallback)(createSignOut(isomorphicClerk), [isomorphicClerk]);
	(_a = isomorphicClerk.telemetry) == null || _a.record(eventMethodCalled("useAuth", { treatPendingAsSignedOut }));
	return useDerivedAuth({
		...authState,
		getToken,
		signOut
	}, { treatPendingAsSignedOut });
};
function useDerivedAuth(authObject, { treatPendingAsSignedOut = true } = {}) {
	const { userId, orgId, orgRole, has, signOut, getToken, orgPermissions, factorVerificationAge, sessionClaims } = authObject != null ? authObject : {};
	const derivedHas = (0, import_react.useCallback)((params) => {
		if (has) return has(params);
		return createCheckAuthorization({
			userId,
			orgId,
			orgRole,
			orgPermissions,
			factorVerificationAge,
			features: (sessionClaims == null ? void 0 : sessionClaims.fea) || "",
			plans: (sessionClaims == null ? void 0 : sessionClaims.pla) || ""
		})(params);
	}, [
		has,
		userId,
		orgId,
		orgRole,
		orgPermissions,
		factorVerificationAge,
		sessionClaims
	]);
	const payload = resolveAuthState({
		authObject: {
			...authObject,
			getToken,
			signOut,
			has: derivedHas
		},
		options: { treatPendingAsSignedOut }
	});
	if (!payload) return errorThrower$2.throw(invalidStateError);
	return payload;
}
var __typeError = (msg) => {
	throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var define_CLERK_UI_SUPPORTED_REACT_BOUNDS_default = [
	[
		18,
		0,
		-1,
		0
	],
	[
		19,
		0,
		0,
		3
	],
	[
		19,
		1,
		1,
		4
	],
	[
		19,
		2,
		2,
		3
	],
	[
		19,
		3,
		3,
		0
	]
];
/**
* Mark class method / function as deprecated.
*
* A console WARNING will be displayed when class method / function is invoked.
*
* Examples
* 1. Deprecate class method
* class Example {
*   getSomething = (arg1, arg2) => {
*       deprecated('Example.getSomething', 'Use `getSomethingElse` instead.');
*       return `getSomethingValue:${arg1 || '-'}:${arg2 || '-'}`;
*   };
* }
*
* 2. Deprecate function
* const getSomething = () => {
*   deprecated('getSomething', 'Use `getSomethingElse` instead.');
*   return 'getSomethingValue';
* };
*/
var displayedWarnings = /* @__PURE__ */ new Set();
var deprecated = (fnName, warning, key) => {
	const hideWarning = isTestEnvironment() || isProductionEnvironment();
	const messageId = key ?? fnName;
	if (displayedWarnings.has(messageId) || hideWarning) return;
	displayedWarnings.add(messageId);
	console.warn(`Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.\n${warning}`);
};
/**
* Parses a version string into major, minor, and patch numbers.
* Returns null if the version string cannot be parsed.
*
* @example
* parseVersion("18.3.1") // { major: 18, minor: 3, patch: 1 }
* parseVersion("19.0.0-rc.1") // { major: 19, minor: 0, patch: 0 }
* parseVersion("invalid") // null
*/
function parseVersion(version) {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
	if (!match) return null;
	const [, majorStr, minorStr, patchStr] = match;
	return {
		major: parseInt(majorStr, 10),
		minor: parseInt(minorStr, 10),
		patch: parseInt(patchStr, 10)
	};
}
/**
* Checks if a parsed version satisfies the given version bounds.
*
* @param version - The parsed version to check
* @param version.major
* @param bounds - Array of version bounds to check against
* @param version.minor
* @param version.patch
* @returns true if the version satisfies any of the bounds
*/
function checkVersionAgainstBounds(version, bounds) {
	const { major, minor, patch } = version;
	return bounds.some(([bMajor, minMinor, maxMinor, minPatch]) => {
		if (major !== bMajor) return false;
		if (maxMinor === -1) return minor > minMinor || minor === minMinor && patch >= minPatch;
		return minor === maxMinor && patch >= minPatch;
	});
}
/**
* Checks if a version string is compatible with the given bounds.
* This is a convenience function that combines parsing and checking.
*
* @param version - The version string to check (e.g., "18.3.1")
* @param bounds - Array of version bounds to check against
* @returns true if the version is compatible, false otherwise
*/
function isVersionCompatible(version, bounds) {
	const parsed = parseVersion(version);
	if (!parsed) return false;
	return checkVersionAgainstBounds(parsed, bounds);
}
/**
* @internal
*/
var _on = (eventToHandlersMap, latestPayloadMap, event, handler, opts) => {
	const { notify } = opts || {};
	let handlers = eventToHandlersMap.get(event);
	if (!handlers) {
		handlers = [];
		eventToHandlersMap.set(event, handlers);
	}
	handlers.push(handler);
	if (notify && latestPayloadMap.has(event)) handler(latestPayloadMap.get(event));
};
/**
* @internal
*/
var _dispatch = (eventToHandlersMap, event, payload) => (eventToHandlersMap.get(event) || []).map((h) => h(payload));
/**
* @internal
*/
var _off = (eventToHandlersMap, event, handler) => {
	const handlers = eventToHandlersMap.get(event);
	if (handlers) if (handler) handlers.splice(handlers.indexOf(handler) >>> 0, 1);
	else eventToHandlersMap.set(event, []);
};
/**
* A ES6/2015 compatible 300 byte event bus
*
* Creates a strongly-typed event bus that enables publish/subscribe communication between components.
*
* @template Events - A record type that maps event names to their payload types
*
* @returns An EventBus instance with the following methods:
* - `on`: Subscribe to an event
* - `onPreDispatch`: Subscribe to an event, triggered before regular subscribers
* - `emit`: Publish an event with payload
* - `off`: Unsubscribe from an event
* - `offPreDispatch`: Unsubscribe from a pre-dispatch event
*
* @example
* // Define event types
* const eventBus = createEventBus<{
*   'user-login': { userId: string; timestamp: number };
*   'data-updated': { records: any[] };
*   'error': Error;
* }>();
*
* // Subscribe to events
* eventBus.on('user-login', ({ userId, timestamp }) => {
*   console.log(`User ${userId} logged in at ${timestamp}`);
* });
*
* // Subscribe with immediate notification if event was already dispatched
* eventBus.on('user-login', (payload) => {
*   // This will be called immediately if 'user-login' was previously dispatched
* }, { notify: true });
*
* // Publish an event
* eventBus.emit('user-login', { userId: 'abc123', timestamp: Date.now() });
*
* // Unsubscribe from event
* const handler = (payload) => console.log(payload);
* eventBus.on('error', handler);
* // Later...
* eventBus.off('error', handler);
*
* // Unsubscribe all handlers for an event
* eventBus.off('data-updated');
*/
var createEventBus = () => {
	const eventToHandlersMap = /* @__PURE__ */ new Map();
	const latestPayloadMap = /* @__PURE__ */ new Map();
	const eventToPredispatchHandlersMap = /* @__PURE__ */ new Map();
	const emit = (event, payload) => {
		latestPayloadMap.set(event, payload);
		_dispatch(eventToPredispatchHandlersMap, event, payload);
		_dispatch(eventToHandlersMap, event, payload);
	};
	return {
		on: (...args) => _on(eventToHandlersMap, latestPayloadMap, ...args),
		prioritizedOn: (...args) => _on(eventToPredispatchHandlersMap, latestPayloadMap, ...args),
		emit,
		off: (...args) => _off(eventToHandlersMap, ...args),
		prioritizedOff: (...args) => _off(eventToPredispatchHandlersMap, ...args),
		internal: { retrieveListeners: (event) => eventToHandlersMap.get(event) || [] }
	};
};
var clerkEvents = { Status: "status" };
var createClerkEventBus = () => {
	return createEventBus();
};
var defaultOptions = {
	initialDelay: 125,
	maxDelayBetweenRetries: 0,
	factor: 2,
	shouldRetry: (_, iteration) => iteration < 5,
	retryImmediately: false,
	jitter: true
};
var RETRY_IMMEDIATELY_DELAY = 100;
var sleep = async (ms) => new Promise((s) => setTimeout(s, ms));
var applyJitter = (delay, jitter) => {
	return jitter ? delay * (1 + Math.random()) : delay;
};
var createExponentialDelayAsyncFn = (opts) => {
	let timesCalled = 0;
	const calculateDelayInMs = () => {
		const constant = opts.initialDelay;
		const base = opts.factor;
		let delay = constant * Math.pow(base, timesCalled);
		delay = applyJitter(delay, opts.jitter);
		return Math.min(opts.maxDelayBetweenRetries || delay, delay);
	};
	return async () => {
		await sleep(calculateDelayInMs());
		timesCalled++;
	};
};
/**
* Retries a callback until it succeeds or the shouldRetry function returns false.
* See {@link RetryOptions} for the available options.
*/
var retry = async (callback, options = {}) => {
	let iterations = 0;
	const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter, onBeforeRetry } = {
		...defaultOptions,
		...options
	};
	const delay = createExponentialDelayAsyncFn({
		initialDelay,
		maxDelayBetweenRetries,
		factor,
		jitter
	});
	while (true) try {
		return await callback();
	} catch (e) {
		iterations++;
		if (!shouldRetry(e, iterations)) throw e;
		if (onBeforeRetry) await onBeforeRetry(iterations);
		if (retryImmediately && iterations === 1) await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
		else await delay();
	}
};
var NO_DOCUMENT_ERROR = "loadScript cannot be called when document does not exist";
var NO_SRC_ERROR = "loadScript cannot be called without a src";
/**
*
*/
async function loadScript(src = "", opts) {
	const { async, defer, beforeLoad, crossOrigin, nonce } = opts || {};
	const load = () => {
		return new Promise((resolve, reject) => {
			if (!src) reject(new Error(NO_SRC_ERROR));
			if (!document || !document.body) reject(new Error(NO_DOCUMENT_ERROR));
			const script = document.createElement("script");
			if (crossOrigin) script.setAttribute("crossorigin", crossOrigin);
			script.async = async || false;
			script.defer = defer || false;
			script.addEventListener("load", () => {
				script.remove();
				resolve(script);
			});
			script.addEventListener("error", (event) => {
				script.remove();
				reject(event.error ?? /* @__PURE__ */ new Error(`failed to load script: ${src}`));
			});
			script.src = src;
			script.nonce = nonce;
			beforeLoad?.(script);
			document.body.appendChild(script);
		});
	};
	return retry(load, { shouldRetry: (_, iterations) => {
		return iterations <= 5;
	} });
}
/**
*
*/
function isValidProxyUrl(key) {
	if (!key) return true;
	return isHttpOrHttps(key) || isProxyUrlRelative(key);
}
/**
*
*/
function isHttpOrHttps(key) {
	return /^http(s)?:\/\//.test(key || "");
}
/**
*
*/
function isProxyUrlRelative(key) {
	return key.startsWith("/");
}
/**
*
*/
function proxyUrlToAbsoluteURL(url) {
	if (!url) return "";
	return isProxyUrlRelative(url) ? new URL(url, window.location.origin).toString() : url;
}
/**
*
*/
function addClerkPrefix(str) {
	if (!str) return "";
	let regex;
	if (str.match(/^(clerk\.)+\w*$/)) regex = /(clerk\.)*(?=clerk\.)/;
	else if (str.match(/\.clerk.accounts/)) return str;
	else regex = /^(clerk\.)*/gi;
	return `clerk.${str.replace(regex, "")}`;
}
/**
* This version selector is a bit complicated, so here is the flow:
* 1. Use the clerkJSVersion prop on the provider
* 2. Use the exact `@clerk/clerk-js` version if it is a `@snapshot` prerelease
* 3. Use the prerelease tag of `@clerk/clerk-js` or the packageVersion provided
* 4. Fallback to the major version of `@clerk/clerk-js` or the packageVersion provided
*
* @param clerkJSVersion - The optional clerkJSVersion prop on the provider
* @param packageVersion - The version of `@clerk/clerk-js` that will be used if an explicit version is not provided
* @returns The npm tag, version or major version to use
*/
var versionSelector = (clerkJSVersion, packageVersion = "6.6.0") => {
	if (clerkJSVersion) return clerkJSVersion;
	const prereleaseTag = getPrereleaseTag(packageVersion);
	if (prereleaseTag) {
		if (prereleaseTag === "snapshot") return packageVersion;
		return prereleaseTag;
	}
	return getMajorVersion(packageVersion);
};
var getPrereleaseTag = (packageVersion) => packageVersion.trim().replace(/^v/, "").match(/-(.+?)(\.|$)/)?.[1];
var getMajorVersion = (packageVersion) => packageVersion.trim().replace(/^v/, "").split(".")[0];
var { isDevOrStagingUrl } = createDevOrStagingUrlCache();
var errorThrower$1 = buildErrorThrower({ packageName: "@clerk/shared" });
/**
* Validates that window.Clerk exists and is properly initialized.
* This ensures we don't have false positives where the script loads but Clerk is malformed.
*
* @returns `true` if window.Clerk exists and has the expected structure with a load method.
*/
function isClerkGlobalProperlyLoaded(prop) {
	if (typeof window === "undefined" || !window[prop]) return false;
	return !!window[prop];
}
var isClerkProperlyLoaded = () => isClerkGlobalProperlyLoaded("Clerk");
var isClerkUIProperlyLoaded = () => isClerkGlobalProperlyLoaded("__internal_ClerkUICtor");
/**
* Checks if an existing script has a request error using Performance API.
*
* @param scriptUrl - The URL of the script to check.
* @returns True if the script has failed to load due to a network/HTTP error.
*/
function hasScriptRequestError(scriptUrl) {
	if (typeof window === "undefined" || !window.performance) return false;
	const entries = performance.getEntriesByName(scriptUrl, "resource");
	if (entries.length === 0) return false;
	const scriptEntry = entries[entries.length - 1];
	if (scriptEntry.transferSize === 0 && scriptEntry.decodedBodySize === 0) {
		if (scriptEntry.responseEnd === 0) return true;
		if (scriptEntry.responseEnd > 0 && scriptEntry.responseStart > 0) return true;
		if ("responseStatus" in scriptEntry) {
			if (scriptEntry.responseStatus >= 400) return true;
			if (scriptEntry.responseStatus === 0) return true;
		}
	}
	return false;
}
/**
* Hotloads the Clerk JS script with robust failure detection.
*
* Uses a timeout-based approach to ensure absolute certainty about load success/failure.
* If the script fails to load within the timeout period, or loads but doesn't create
* a proper Clerk instance, the promise rejects with an error.
*
* @param opts - The options used to build the Clerk JS script URL and load the script.
*               Must include a `publishableKey` if no existing script is found.
* @returns Promise that resolves with null if Clerk loads successfully, or rejects with an error.
*
* @example
* ```typescript
* try {
*   await loadClerkJsScript({ publishableKey: 'pk_test_...' });
*   console.log('Clerk loaded successfully');
* } catch (error) {
*   console.error('Failed to load Clerk:', error.message);
* }
* ```
*/
var loadClerkJSScript = async (opts) => {
	const timeout = opts?.scriptLoadTimeout ?? 15e3;
	const rejectWith = (error) => new ClerkRuntimeError("Failed to load Clerk JS" + (error?.message ? `, ${error.message}` : ""), {
		code: "failed_to_load_clerk_js",
		cause: error
	});
	if (isClerkProperlyLoaded()) return null;
	if (!opts?.publishableKey) {
		errorThrower$1.throwMissingPublishableKeyError();
		return null;
	}
	const scriptUrl = clerkJSScriptUrl(opts);
	const existingScript = document.querySelector("script[data-clerk-js-script]");
	if (existingScript) if (hasScriptRequestError(scriptUrl)) existingScript.remove();
	else try {
		await waitForPredicateWithTimeout(timeout, isClerkProperlyLoaded, rejectWith(), existingScript);
		return null;
	} catch {
		existingScript.remove();
	}
	const loadPromise = waitForPredicateWithTimeout(timeout, isClerkProperlyLoaded, rejectWith());
	loadScript(scriptUrl, {
		async: true,
		crossOrigin: "anonymous",
		nonce: opts.nonce,
		beforeLoad: applyAttributesToScript(buildClerkJSScriptAttributes(opts))
	}).catch((error) => {
		throw rejectWith(error);
	});
	return loadPromise;
};
var loadClerkUIScript = async (opts) => {
	const timeout = opts?.scriptLoadTimeout ?? 15e3;
	const rejectWith = (error) => new ClerkRuntimeError("Failed to load Clerk UI" + (error?.message ? `, ${error.message}` : ""), {
		code: "failed_to_load_clerk_ui",
		cause: error
	});
	if (isClerkUIProperlyLoaded()) return null;
	if (!opts?.publishableKey) {
		errorThrower$1.throwMissingPublishableKeyError();
		return null;
	}
	const scriptUrl = clerkUIScriptUrl(opts);
	const existingScript = document.querySelector("script[data-clerk-ui-script]");
	if (existingScript) if (hasScriptRequestError(scriptUrl)) existingScript.remove();
	else try {
		await waitForPredicateWithTimeout(timeout, isClerkUIProperlyLoaded, rejectWith(), existingScript);
		return null;
	} catch {
		existingScript.remove();
	}
	const loadPromise = waitForPredicateWithTimeout(timeout, isClerkUIProperlyLoaded, rejectWith());
	loadScript(scriptUrl, {
		async: true,
		crossOrigin: "anonymous",
		nonce: opts.nonce,
		beforeLoad: applyAttributesToScript(buildClerkUIScriptAttributes(opts))
	}).catch((error) => {
		throw rejectWith(error);
	});
	return loadPromise;
};
var clerkJSScriptUrl = (opts) => {
	const { __internal_clerkJSUrl, __internal_clerkJSVersion, proxyUrl, domain, publishableKey } = opts;
	if (__internal_clerkJSUrl) return __internal_clerkJSUrl;
	return `https://${buildScriptHost({
		publishableKey,
		proxyUrl,
		domain
	})}/npm/@clerk/clerk-js@${versionSelector(__internal_clerkJSVersion)}/dist/clerk.browser.js`;
};
var clerkUIScriptUrl = (opts) => {
	const { __internal_clerkUIUrl, __internal_clerkUIVersion, proxyUrl, domain, publishableKey } = opts;
	if (__internal_clerkUIUrl) return __internal_clerkUIUrl;
	return `https://${buildScriptHost({
		publishableKey,
		proxyUrl,
		domain
	})}/npm/@clerk/ui@${versionSelector(__internal_clerkUIVersion, "1.5.0")}/dist/ui.browser.js`;
};
var buildClerkJSScriptAttributes = (options) => {
	const obj = {};
	if (options.publishableKey) obj["data-clerk-publishable-key"] = options.publishableKey;
	if (options.proxyUrl) obj["data-clerk-proxy-url"] = options.proxyUrl;
	if (options.domain) obj["data-clerk-domain"] = options.domain;
	if (options.nonce) obj.nonce = options.nonce;
	return obj;
};
var buildClerkUIScriptAttributes = (options) => {
	return buildClerkJSScriptAttributes(options);
};
var applyAttributesToScript = (attributes) => (script) => {
	for (const attribute in attributes) script.setAttribute(attribute, attributes[attribute]);
};
var buildScriptHost = (opts) => {
	const { proxyUrl, domain, publishableKey } = opts;
	if (!!proxyUrl && isValidProxyUrl(proxyUrl)) return proxyUrlToAbsoluteURL(proxyUrl).replace(/http(s)?:\/\//, "");
	else if (domain && !isDevOrStagingUrl(parsePublishableKey(publishableKey)?.frontendApi || "")) return addClerkPrefix(domain);
	else return parsePublishableKey(publishableKey)?.frontendApi || "";
};
function waitForPredicateWithTimeout(timeoutMs, predicate, rejectWith, existingScript) {
	return new Promise((resolve, reject) => {
		let resolved = false;
		const cleanup = (timeoutId$1, pollInterval$1) => {
			clearTimeout(timeoutId$1);
			clearInterval(pollInterval$1);
		};
		existingScript?.addEventListener("error", () => {
			cleanup(timeoutId, pollInterval);
			reject(rejectWith);
		});
		const checkAndResolve = () => {
			if (resolved) return;
			if (predicate()) {
				resolved = true;
				cleanup(timeoutId, pollInterval);
				resolve(null);
			}
		};
		const handleTimeout = () => {
			if (resolved) return;
			resolved = true;
			cleanup(timeoutId, pollInterval);
			if (!predicate()) reject(rejectWith);
			else resolve(null);
		};
		const timeoutId = setTimeout(handleTimeout, timeoutMs);
		checkAndResolve();
		const pollInterval = setInterval(() => {
			if (resolved) {
				clearInterval(pollInterval);
				return;
			}
			checkAndResolve();
		}, 100);
	});
}
function setClerkJSLoadingErrorPackageName(packageName) {
	errorThrower$1.setPackageName({ packageName });
}
withClerk(({ clerk, ...props }) => {
	var _a, _b;
	const { client, session } = clerk;
	const hasSignedInSessions = ((_b = (_a = client.signedInSessions) == null ? void 0 : _a.length) != null ? _b : 0) > 0;
	import_react.useEffect(() => {
		if (session === null && hasSignedInSessions) clerk.redirectToAfterSignOut();
		else clerk.redirectToSignIn(props);
	}, []);
	return null;
}, "RedirectToSignIn");
withClerk(({ clerk, ...props }) => {
	import_react.useEffect(() => {
		clerk.redirectToSignUp(props);
	}, []);
	return null;
}, "RedirectToSignUp");
withClerk(({ clerk, ...props }) => {
	import_react.useEffect(() => {
		clerk.redirectToTasks(props);
	}, []);
	return null;
}, "RedirectToTasks");
withClerk(({ clerk }) => {
	import_react.useEffect(() => {
		deprecated("RedirectToUserProfile", "Use the `redirectToUserProfile()` method instead.");
		clerk.redirectToUserProfile();
	}, []);
	return null;
}, "RedirectToUserProfile");
withClerk(({ clerk }) => {
	import_react.useEffect(() => {
		deprecated("RedirectToOrganizationProfile", "Use the `redirectToOrganizationProfile()` method instead.");
		clerk.redirectToOrganizationProfile();
	}, []);
	return null;
}, "RedirectToOrganizationProfile");
withClerk(({ clerk }) => {
	import_react.useEffect(() => {
		deprecated("RedirectToCreateOrganization", "Use the `redirectToCreateOrganization()` method instead.");
		clerk.redirectToCreateOrganization();
	}, []);
	return null;
}, "RedirectToCreateOrganization");
withClerk(({ clerk, ...handleRedirectCallbackParams }) => {
	import_react.useEffect(() => {
		clerk.handleRedirectCallback(handleRedirectCallbackParams);
	}, []);
	return null;
}, "AuthenticateWithRedirectCallback");
function computeReactVersionCompatibility() {
	try {
		return isVersionCompatible("19.2.5", define_CLERK_UI_SUPPORTED_REACT_BOUNDS_default);
	} catch {
		return false;
	}
}
var IS_REACT_SHARED_VARIANT_COMPATIBLE = computeReactVersionCompatibility();
var defaultSignInErrors = () => ({
	fields: {
		identifier: null,
		password: null,
		code: null
	},
	raw: null,
	global: null
});
var defaultSignUpErrors = () => ({
	fields: {
		firstName: null,
		lastName: null,
		emailAddress: null,
		phoneNumber: null,
		password: null,
		username: null,
		code: null,
		captcha: null,
		legalAccepted: null
	},
	raw: null,
	global: null
});
var defaultWaitlistErrors = () => ({
	fields: { emailAddress: null },
	raw: null,
	global: null
});
var defaultVerificationResource = () => ({
	pathRoot: "",
	attempts: null,
	error: null,
	expireAt: null,
	externalVerificationRedirectURL: null,
	nonce: null,
	message: null,
	status: null,
	strategy: null,
	verifiedAtClient: null,
	verifiedFromTheSameClient() {
		return false;
	},
	reload() {
		throw new Error("reload() called before Clerk is loaded");
	},
	__internal_toSnapshot() {
		return {
			object: "verification",
			id: "",
			attempts: null,
			error: {
				code: "",
				message: ""
			},
			expire_at: null,
			externalVerificationRedirectURL: null,
			nonce: null,
			message: null,
			status: null,
			strategy: null,
			verified_at_client: null
		};
	}
});
var defaultSignUpVerificationResource = () => ({
	...defaultVerificationResource(),
	supportedStrategies: [],
	nextAction: "",
	reload() {
		throw new Error("reload() called before Clerk is loaded");
	},
	__internal_toSnapshot() {
		return {
			...defaultVerificationResource().__internal_toSnapshot(),
			next_action: this.nextAction,
			supported_strategies: this.supportedStrategies
		};
	}
});
var StateProxy = class {
	constructor(isomorphicClerk) {
		this.isomorphicClerk = isomorphicClerk;
		this.signInSignalProxy = this.buildSignInProxy();
		this.signUpSignalProxy = this.buildSignUpProxy();
		this.waitlistSignalProxy = this.buildWaitlistProxy();
	}
	signInSignal() {
		return this.signInSignalProxy;
	}
	signUpSignal() {
		return this.signUpSignalProxy;
	}
	waitlistSignal() {
		return this.waitlistSignalProxy;
	}
	get __internal_waitlist() {
		return this.state.__internal_waitlist;
	}
	checkoutSignal(params) {
		return this.buildCheckoutProxy(params);
	}
	buildSignInProxy() {
		const gateProperty = this.gateProperty.bind(this);
		const target = () => this.client.signIn.__internal_future;
		return {
			errors: defaultSignInErrors(),
			fetchStatus: "idle",
			signIn: {
				status: "needs_identifier",
				availableStrategies: [],
				get isTransferable() {
					return gateProperty(target, "isTransferable", false);
				},
				get id() {
					return gateProperty(target, "id", void 0);
				},
				get supportedFirstFactors() {
					return gateProperty(target, "supportedFirstFactors", []);
				},
				get supportedSecondFactors() {
					return gateProperty(target, "supportedSecondFactors", []);
				},
				get secondFactorVerification() {
					return gateProperty(target, "secondFactorVerification", {
						status: null,
						error: null,
						expireAt: null,
						externalVerificationRedirectURL: null,
						nonce: null,
						attempts: null,
						message: null,
						strategy: null,
						verifiedAtClient: null,
						verifiedFromTheSameClient: () => false,
						__internal_toSnapshot: () => {
							throw new Error("__internal_toSnapshot called before Clerk is loaded");
						},
						pathRoot: "",
						reload: () => {
							throw new Error("__internal_toSnapshot called before Clerk is loaded");
						}
					});
				},
				get identifier() {
					return gateProperty(target, "identifier", null);
				},
				get createdSessionId() {
					return gateProperty(target, "createdSessionId", null);
				},
				get userData() {
					return gateProperty(target, "userData", {});
				},
				get firstFactorVerification() {
					return gateProperty(target, "firstFactorVerification", {
						status: null,
						error: null,
						expireAt: null,
						externalVerificationRedirectURL: null,
						nonce: null,
						attempts: null,
						message: null,
						strategy: null,
						verifiedAtClient: null,
						verifiedFromTheSameClient: () => false,
						__internal_toSnapshot: () => {
							throw new Error("__internal_toSnapshot called before Clerk is loaded");
						},
						pathRoot: "",
						reload: () => {
							throw new Error("__internal_toSnapshot called before Clerk is loaded");
						}
					});
				},
				get canBeDiscarded() {
					return gateProperty(target, "canBeDiscarded", false);
				},
				create: this.gateMethod(target, "create"),
				password: this.gateMethod(target, "password"),
				sso: this.gateMethod(target, "sso"),
				finalize: this.gateMethod(target, "finalize"),
				reset: this.gateMethod(target, "reset"),
				emailCode: this.wrapMethods(() => target().emailCode, ["sendCode", "verifyCode"]),
				emailLink: this.wrapStruct(() => target().emailLink, ["sendLink", "waitForVerification"], ["verification"], { verification: null }),
				resetPasswordEmailCode: this.wrapMethods(() => target().resetPasswordEmailCode, [
					"sendCode",
					"verifyCode",
					"submitPassword"
				]),
				resetPasswordPhoneCode: this.wrapMethods(() => target().resetPasswordPhoneCode, [
					"sendCode",
					"verifyCode",
					"submitPassword"
				]),
				phoneCode: this.wrapMethods(() => target().phoneCode, ["sendCode", "verifyCode"]),
				mfa: this.wrapMethods(() => target().mfa, [
					"sendPhoneCode",
					"verifyPhoneCode",
					"sendEmailCode",
					"verifyEmailCode",
					"verifyTOTP",
					"verifyBackupCode"
				]),
				ticket: this.gateMethod(target, "ticket"),
				passkey: this.gateMethod(target, "passkey"),
				web3: this.gateMethod(target, "web3")
			}
		};
	}
	buildSignUpProxy() {
		const gateProperty = this.gateProperty.bind(this);
		const gateMethod = this.gateMethod.bind(this);
		const target = () => this.client.signUp.__internal_future;
		return {
			errors: defaultSignUpErrors(),
			fetchStatus: "idle",
			signUp: {
				get id() {
					return gateProperty(target, "id", void 0);
				},
				get requiredFields() {
					return gateProperty(target, "requiredFields", []);
				},
				get optionalFields() {
					return gateProperty(target, "optionalFields", []);
				},
				get missingFields() {
					return gateProperty(target, "missingFields", []);
				},
				get username() {
					return gateProperty(target, "username", null);
				},
				get firstName() {
					return gateProperty(target, "firstName", null);
				},
				get lastName() {
					return gateProperty(target, "lastName", null);
				},
				get emailAddress() {
					return gateProperty(target, "emailAddress", null);
				},
				get phoneNumber() {
					return gateProperty(target, "phoneNumber", null);
				},
				get web3Wallet() {
					return gateProperty(target, "web3Wallet", null);
				},
				get hasPassword() {
					return gateProperty(target, "hasPassword", false);
				},
				get unsafeMetadata() {
					return gateProperty(target, "unsafeMetadata", {});
				},
				get createdSessionId() {
					return gateProperty(target, "createdSessionId", null);
				},
				get createdUserId() {
					return gateProperty(target, "createdUserId", null);
				},
				get abandonAt() {
					return gateProperty(target, "abandonAt", null);
				},
				get legalAcceptedAt() {
					return gateProperty(target, "legalAcceptedAt", null);
				},
				get locale() {
					return gateProperty(target, "locale", null);
				},
				get status() {
					return gateProperty(target, "status", "missing_requirements");
				},
				get unverifiedFields() {
					return gateProperty(target, "unverifiedFields", []);
				},
				get isTransferable() {
					return gateProperty(target, "isTransferable", false);
				},
				get canBeDiscarded() {
					return gateProperty(target, "canBeDiscarded", false);
				},
				create: gateMethod(target, "create"),
				update: gateMethod(target, "update"),
				sso: gateMethod(target, "sso"),
				password: gateMethod(target, "password"),
				ticket: gateMethod(target, "ticket"),
				web3: gateMethod(target, "web3"),
				finalize: gateMethod(target, "finalize"),
				reset: gateMethod(target, "reset"),
				verifications: this.wrapStruct(() => target().verifications, [
					"sendEmailCode",
					"verifyEmailCode",
					"sendEmailLink",
					"waitForEmailLinkVerification",
					"sendPhoneCode",
					"verifyPhoneCode"
				], [
					"emailAddress",
					"phoneNumber",
					"web3Wallet",
					"externalAccount",
					"emailLinkVerification"
				], {
					emailAddress: defaultSignUpVerificationResource(),
					phoneNumber: defaultSignUpVerificationResource(),
					web3Wallet: defaultSignUpVerificationResource(),
					externalAccount: defaultSignUpVerificationResource(),
					emailLinkVerification: null
				})
			}
		};
	}
	buildWaitlistProxy() {
		const gateProperty = this.gateProperty.bind(this);
		const gateMethod = this.gateMethod.bind(this);
		const target = () => {
			return this.state.__internal_waitlist;
		};
		return {
			errors: defaultWaitlistErrors(),
			fetchStatus: "idle",
			waitlist: {
				pathRoot: "/waitlist",
				get id() {
					return gateProperty(target, "id", "");
				},
				get createdAt() {
					return gateProperty(target, "createdAt", null);
				},
				get updatedAt() {
					return gateProperty(target, "updatedAt", null);
				},
				join: gateMethod(target, "join"),
				reload: gateMethod(target, "reload")
			}
		};
	}
	buildCheckoutProxy(params) {
		const gateProperty = this.gateProperty.bind(this);
		const targetCheckout = () => this.checkout(params);
		const target = () => targetCheckout().checkout;
		return {
			errors: {
				raw: null,
				global: null
			},
			fetchStatus: "idle",
			checkout: {
				get status() {
					return gateProperty(target, "status", "needs_initialization");
				},
				get externalClientSecret() {
					return gateProperty(target, "externalClientSecret", null);
				},
				get externalGatewayId() {
					return gateProperty(target, "externalGatewayId", null);
				},
				get paymentMethod() {
					return gateProperty(target, "paymentMethod", null);
				},
				get plan() {
					return gateProperty(target, "plan", null);
				},
				get planPeriod() {
					return gateProperty(target, "planPeriod", null);
				},
				get totals() {
					return gateProperty(target, "totals", null);
				},
				get isImmediatePlanChange() {
					return gateProperty(target, "isImmediatePlanChange", false);
				},
				get freeTrialEndsAt() {
					return gateProperty(target, "freeTrialEndsAt", null);
				},
				get payer() {
					return gateProperty(target, "payer", null);
				},
				get planPeriodStart() {
					return gateProperty(target, "planPeriodStart", null);
				},
				get needsPaymentMethod() {
					return gateProperty(target, "needsPaymentMethod", null);
				},
				start: this.gateMethod(target, "start"),
				confirm: this.gateMethod(target, "confirm"),
				finalize: this.gateMethod(target, "finalize")
			}
		};
	}
	__internal_effect(_) {
		throw new Error("__internal_effect called before Clerk is loaded");
	}
	__internal_computed(_) {
		throw new Error("__internal_computed called before Clerk is loaded");
	}
	get state() {
		const s = this.isomorphicClerk.__internal_state;
		if (!s) throw new Error("Clerk state not ready");
		return s;
	}
	get client() {
		const c = this.isomorphicClerk.client;
		if (!c) throw new Error("Clerk client not ready");
		return c;
	}
	get checkout() {
		const c = this.isomorphicClerk.__experimental_checkout;
		if (!c) throw new Error("Clerk checkout not ready");
		return c;
	}
	gateProperty(getTarget, key, defaultValue) {
		return (() => {
			if (!inBrowser() || !this.isomorphicClerk.loaded) return defaultValue;
			return getTarget()[key];
		})();
	}
	gateMethod(getTarget, key) {
		return (async (...args) => {
			if (!inBrowser()) return errorThrower$2.throw(`Attempted to call a method (${key}) that is not supported on the server.`);
			if (!this.isomorphicClerk.loaded) await new Promise((resolve) => this.isomorphicClerk.addOnLoaded(resolve));
			const t = getTarget();
			return t[key].apply(t, args);
		});
	}
	wrapMethods(getTarget, keys) {
		return Object.fromEntries(keys.map((k) => [k, this.gateMethod(getTarget, k)]));
	}
	wrapStruct(getTarget, methods, getters, fallbacks) {
		const out = {};
		for (const m of methods) out[m] = this.gateMethod(getTarget, m);
		for (const g of getters) Object.defineProperty(out, g, {
			get: () => this.gateProperty(getTarget, g, fallbacks[g]),
			enumerable: true
		});
		return out;
	}
};
if (typeof globalThis.__BUILD_DISABLE_RHC__ === "undefined") globalThis.__BUILD_DISABLE_RHC__ = false;
var SDK_METADATA$1 = {
	name: "@clerk/react",
	version: "6.2.1",
	environment: "production"
};
var _status, _domain, _proxyUrl, _publishableKey, _eventBus, _stateProxy, _instance, _IsomorphicClerk_instances, waitForClerkJS_fn;
var _IsomorphicClerk = class _IsomorphicClerk {
	constructor(options) {
		__privateAdd(this, _IsomorphicClerk_instances);
		this.clerkjs = null;
		this.preopenOneTap = null;
		this.preopenUserVerification = null;
		this.preopenEnableOrganizationsPrompt = null;
		this.preopenSignIn = null;
		this.preopenCheckout = null;
		this.preopenPlanDetails = null;
		this.preopenSubscriptionDetails = null;
		this.preopenSignUp = null;
		this.preopenUserProfile = null;
		this.preopenOrganizationProfile = null;
		this.preopenCreateOrganization = null;
		this.preOpenWaitlist = null;
		this.premountSignInNodes = /* @__PURE__ */ new Map();
		this.premountSignUpNodes = /* @__PURE__ */ new Map();
		this.premountUserAvatarNodes = /* @__PURE__ */ new Map();
		this.premountUserProfileNodes = /* @__PURE__ */ new Map();
		this.premountUserButtonNodes = /* @__PURE__ */ new Map();
		this.premountOrganizationProfileNodes = /* @__PURE__ */ new Map();
		this.premountCreateOrganizationNodes = /* @__PURE__ */ new Map();
		this.premountOrganizationSwitcherNodes = /* @__PURE__ */ new Map();
		this.premountOrganizationListNodes = /* @__PURE__ */ new Map();
		this.premountMethodCalls = /* @__PURE__ */ new Map();
		this.premountWaitlistNodes = /* @__PURE__ */ new Map();
		this.premountPricingTableNodes = /* @__PURE__ */ new Map();
		this.premountAPIKeysNodes = /* @__PURE__ */ new Map();
		this.premountOAuthConsentNodes = /* @__PURE__ */ new Map();
		this.premountTaskChooseOrganizationNodes = /* @__PURE__ */ new Map();
		this.premountTaskResetPasswordNodes = /* @__PURE__ */ new Map();
		this.premountTaskSetupMFANodes = /* @__PURE__ */ new Map();
		this.premountAddListenerCalls = /* @__PURE__ */ new Map();
		this.loadedListeners = [];
		__privateAdd(this, _status, "loading");
		__privateAdd(this, _domain);
		__privateAdd(this, _proxyUrl);
		__privateAdd(this, _publishableKey);
		__privateAdd(this, _eventBus, createClerkEventBus());
		__privateAdd(this, _stateProxy);
		this.buildSignInUrl = (opts) => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildSignInUrl(opts)) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildSignInUrl", callback);
		};
		this.buildSignUpUrl = (opts) => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildSignUpUrl(opts)) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildSignUpUrl", callback);
		};
		this.buildAfterSignInUrl = (...args) => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignInUrl(...args)) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildAfterSignInUrl", callback);
		};
		this.buildAfterSignUpUrl = (...args) => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignUpUrl(...args)) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildAfterSignUpUrl", callback);
		};
		this.buildAfterSignOutUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignOutUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildAfterSignOutUrl", callback);
		};
		this.buildNewSubscriptionRedirectUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildNewSubscriptionRedirectUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildNewSubscriptionRedirectUrl", callback);
		};
		this.buildAfterMultiSessionSingleSignOutUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterMultiSessionSingleSignOutUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildAfterMultiSessionSingleSignOutUrl", callback);
		};
		this.buildUserProfileUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildUserProfileUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildUserProfileUrl", callback);
		};
		this.buildCreateOrganizationUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildCreateOrganizationUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildCreateOrganizationUrl", callback);
		};
		this.buildOrganizationProfileUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildOrganizationProfileUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildOrganizationProfileUrl", callback);
		};
		this.buildWaitlistUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildWaitlistUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildWaitlistUrl", callback);
		};
		this.buildTasksUrl = () => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildTasksUrl()) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildTasksUrl", callback);
		};
		this.buildUrlWithAuth = (to) => {
			const callback = () => {
				var _a;
				return ((_a = this.clerkjs) == null ? void 0 : _a.buildUrlWithAuth(to)) || "";
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("buildUrlWithAuth", callback);
		};
		this.handleUnauthenticated = async () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.handleUnauthenticated();
			};
			if (this.clerkjs && this.loaded) callback();
			else this.premountMethodCalls.set("handleUnauthenticated", callback);
		};
		this.on = (...args) => {
			var _a;
			if ((_a = this.clerkjs) == null ? void 0 : _a.on) return this.clerkjs.on(...args);
			else __privateGet(this, _eventBus).on(...args);
		};
		this.off = (...args) => {
			var _a;
			if ((_a = this.clerkjs) == null ? void 0 : _a.off) return this.clerkjs.off(...args);
			else __privateGet(this, _eventBus).off(...args);
		};
		/**
		* @deprecated Please use `addStatusListener`. This api will be removed in the next major.
		*/
		this.addOnLoaded = (cb) => {
			this.loadedListeners.push(cb);
			if (this.loaded) this.emitLoaded();
		};
		/**
		* @deprecated Please use `__internal_setStatus`. This api will be removed in the next major.
		*/
		this.emitLoaded = () => {
			this.loadedListeners.forEach((cb) => cb());
			this.loadedListeners = [];
		};
		this.beforeLoad = (clerkjs) => {
			if (!clerkjs) throw new Error("Failed to hydrate latest Clerk JS");
		};
		this.replayInterceptedInvocations = (clerkjs) => {
			var _a, _b;
			if (!clerkjs) throw new Error("Failed to hydrate latest Clerk JS");
			this.clerkjs = clerkjs;
			this.premountMethodCalls.forEach((cb) => cb());
			this.premountAddListenerCalls.forEach((listenerExtras, listener) => {
				listenerExtras.handlers.nativeUnsubscribe = clerkjs.addListener(listener, listenerExtras.options);
			});
			(_a = __privateGet(this, _eventBus).internal.retrieveListeners("status")) == null || _a.forEach((listener) => {
				this.on("status", listener, { notify: true });
			});
			(_b = __privateGet(this, _eventBus).internal.retrieveListeners("queryClientStatus")) == null || _b.forEach((listener) => {
				this.on("queryClientStatus", listener, { notify: true });
			});
			if (this.preopenSignIn !== null) clerkjs.openSignIn(this.preopenSignIn);
			if (this.preopenCheckout !== null) clerkjs.__internal_openCheckout(this.preopenCheckout);
			if (this.preopenPlanDetails !== null) clerkjs.__internal_openPlanDetails(this.preopenPlanDetails);
			if (this.preopenSubscriptionDetails !== null) clerkjs.__internal_openSubscriptionDetails(this.preopenSubscriptionDetails);
			if (this.preopenSignUp !== null) clerkjs.openSignUp(this.preopenSignUp);
			if (this.preopenUserProfile !== null) clerkjs.openUserProfile(this.preopenUserProfile);
			if (this.preopenUserVerification !== null) clerkjs.__internal_openReverification(this.preopenUserVerification);
			if (this.preopenOneTap !== null) clerkjs.openGoogleOneTap(this.preopenOneTap);
			if (this.preopenOrganizationProfile !== null) clerkjs.openOrganizationProfile(this.preopenOrganizationProfile);
			if (this.preopenCreateOrganization !== null) clerkjs.openCreateOrganization(this.preopenCreateOrganization);
			if (this.preOpenWaitlist !== null) clerkjs.openWaitlist(this.preOpenWaitlist);
			if (this.preopenEnableOrganizationsPrompt) clerkjs.__internal_openEnableOrganizationsPrompt(this.preopenEnableOrganizationsPrompt);
			this.premountSignInNodes.forEach((props, node) => {
				clerkjs.mountSignIn(node, props);
			});
			this.premountSignUpNodes.forEach((props, node) => {
				clerkjs.mountSignUp(node, props);
			});
			this.premountUserProfileNodes.forEach((props, node) => {
				clerkjs.mountUserProfile(node, props);
			});
			this.premountUserAvatarNodes.forEach((props, node) => {
				clerkjs.mountUserAvatar(node, props);
			});
			this.premountUserButtonNodes.forEach((props, node) => {
				clerkjs.mountUserButton(node, props);
			});
			this.premountOrganizationListNodes.forEach((props, node) => {
				clerkjs.mountOrganizationList(node, props);
			});
			this.premountWaitlistNodes.forEach((props, node) => {
				clerkjs.mountWaitlist(node, props);
			});
			this.premountPricingTableNodes.forEach((props, node) => {
				clerkjs.mountPricingTable(node, props);
			});
			this.premountAPIKeysNodes.forEach((props, node) => {
				clerkjs.mountAPIKeys(node, props);
			});
			this.premountOAuthConsentNodes.forEach((props, node) => {
				clerkjs.__internal_mountOAuthConsent(node, props);
			});
			this.premountTaskChooseOrganizationNodes.forEach((props, node) => {
				clerkjs.mountTaskChooseOrganization(node, props);
			});
			this.premountTaskResetPasswordNodes.forEach((props, node) => {
				clerkjs.mountTaskResetPassword(node, props);
			});
			this.premountTaskSetupMFANodes.forEach((props, node) => {
				clerkjs.mountTaskSetupMFA(node, props);
			});
			if (typeof this.clerkjs.status === "undefined") __privateGet(this, _eventBus).emit(clerkEvents.Status, "ready");
			this.emitLoaded();
			return this.clerkjs;
		};
		this.__experimental_checkout = (...args) => {
			return this.loaded && this.clerkjs ? this.clerkjs.__experimental_checkout(...args) : __privateGet(this, _stateProxy).checkoutSignal(...args);
		};
		this.__internal_updateProps = async (props) => {
			const clerkjs = await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this);
			if (clerkjs && "__internal_updateProps" in clerkjs) return clerkjs.__internal_updateProps(props);
		};
		/**
		* `setActive` can be used to set the active session and/or organization.
		*/
		this.setActive = (params) => {
			if (this.clerkjs) return this.clerkjs.setActive(params);
			else return Promise.reject();
		};
		this.openSignIn = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.openSignIn(props);
			else this.preopenSignIn = props;
		};
		this.closeSignIn = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.closeSignIn();
			else this.preopenSignIn = null;
		};
		this.__internal_openCheckout = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_openCheckout(props);
			else this.preopenCheckout = props;
		};
		this.__internal_closeCheckout = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_closeCheckout();
			else this.preopenCheckout = null;
		};
		this.__internal_openPlanDetails = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_openPlanDetails(props);
			else this.preopenPlanDetails = props;
		};
		this.__internal_closePlanDetails = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_closePlanDetails();
			else this.preopenPlanDetails = null;
		};
		this.__internal_openSubscriptionDetails = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_openSubscriptionDetails(props);
			else this.preopenSubscriptionDetails = props != null ? props : null;
		};
		this.__internal_closeSubscriptionDetails = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_closeSubscriptionDetails();
			else this.preopenSubscriptionDetails = null;
		};
		this.__internal_openReverification = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_openReverification(props);
			else this.preopenUserVerification = props;
		};
		this.__internal_closeReverification = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_closeReverification();
			else this.preopenUserVerification = null;
		};
		this.__internal_openEnableOrganizationsPrompt = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_openEnableOrganizationsPrompt(props);
			else this.preopenEnableOrganizationsPrompt = props;
		};
		this.__internal_closeEnableOrganizationsPrompt = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_closeEnableOrganizationsPrompt();
			else this.preopenEnableOrganizationsPrompt = null;
		};
		this.openGoogleOneTap = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.openGoogleOneTap(props);
			else this.preopenOneTap = props;
		};
		this.closeGoogleOneTap = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.closeGoogleOneTap();
			else this.preopenOneTap = null;
		};
		this.openUserProfile = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.openUserProfile(props);
			else this.preopenUserProfile = props;
		};
		this.closeUserProfile = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.closeUserProfile();
			else this.preopenUserProfile = null;
		};
		this.openOrganizationProfile = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.openOrganizationProfile(props);
			else this.preopenOrganizationProfile = props;
		};
		this.closeOrganizationProfile = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.closeOrganizationProfile();
			else this.preopenOrganizationProfile = null;
		};
		this.openCreateOrganization = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.openCreateOrganization(props);
			else this.preopenCreateOrganization = props;
		};
		this.closeCreateOrganization = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.closeCreateOrganization();
			else this.preopenCreateOrganization = null;
		};
		this.openWaitlist = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.openWaitlist(props);
			else this.preOpenWaitlist = props;
		};
		this.closeWaitlist = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.closeWaitlist();
			else this.preOpenWaitlist = null;
		};
		this.openSignUp = (props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.openSignUp(props);
			else this.preopenSignUp = props;
		};
		this.closeSignUp = () => {
			if (this.clerkjs && this.loaded) this.clerkjs.closeSignUp();
			else this.preopenSignUp = null;
		};
		this.mountSignIn = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountSignIn(node, props);
			else this.premountSignInNodes.set(node, props);
		};
		this.unmountSignIn = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountSignIn(node);
			else this.premountSignInNodes.delete(node);
		};
		this.mountSignUp = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountSignUp(node, props);
			else this.premountSignUpNodes.set(node, props);
		};
		this.unmountSignUp = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountSignUp(node);
			else this.premountSignUpNodes.delete(node);
		};
		this.mountUserAvatar = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountUserAvatar(node, props);
			else this.premountUserAvatarNodes.set(node, props);
		};
		this.unmountUserAvatar = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountUserAvatar(node);
			else this.premountUserAvatarNodes.delete(node);
		};
		this.mountUserProfile = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountUserProfile(node, props);
			else this.premountUserProfileNodes.set(node, props);
		};
		this.unmountUserProfile = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountUserProfile(node);
			else this.premountUserProfileNodes.delete(node);
		};
		this.mountOrganizationProfile = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountOrganizationProfile(node, props);
			else this.premountOrganizationProfileNodes.set(node, props);
		};
		this.unmountOrganizationProfile = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountOrganizationProfile(node);
			else this.premountOrganizationProfileNodes.delete(node);
		};
		this.mountCreateOrganization = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountCreateOrganization(node, props);
			else this.premountCreateOrganizationNodes.set(node, props);
		};
		this.unmountCreateOrganization = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountCreateOrganization(node);
			else this.premountCreateOrganizationNodes.delete(node);
		};
		this.mountOrganizationSwitcher = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountOrganizationSwitcher(node, props);
			else this.premountOrganizationSwitcherNodes.set(node, props);
		};
		this.unmountOrganizationSwitcher = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountOrganizationSwitcher(node);
			else this.premountOrganizationSwitcherNodes.delete(node);
		};
		this.__experimental_prefetchOrganizationSwitcher = () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.__experimental_prefetchOrganizationSwitcher();
			};
			if (this.clerkjs && this.loaded) callback();
			else this.premountMethodCalls.set("__experimental_prefetchOrganizationSwitcher", callback);
		};
		this.mountOrganizationList = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountOrganizationList(node, props);
			else this.premountOrganizationListNodes.set(node, props);
		};
		this.unmountOrganizationList = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountOrganizationList(node);
			else this.premountOrganizationListNodes.delete(node);
		};
		this.mountUserButton = (node, userButtonProps) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountUserButton(node, userButtonProps);
			else this.premountUserButtonNodes.set(node, userButtonProps);
		};
		this.unmountUserButton = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountUserButton(node);
			else this.premountUserButtonNodes.delete(node);
		};
		this.mountWaitlist = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountWaitlist(node, props);
			else this.premountWaitlistNodes.set(node, props);
		};
		this.unmountWaitlist = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountWaitlist(node);
			else this.premountWaitlistNodes.delete(node);
		};
		this.mountPricingTable = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountPricingTable(node, props);
			else this.premountPricingTableNodes.set(node, props);
		};
		this.unmountPricingTable = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountPricingTable(node);
			else this.premountPricingTableNodes.delete(node);
		};
		this.mountAPIKeys = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountAPIKeys(node, props);
			else this.premountAPIKeysNodes.set(node, props);
		};
		this.unmountAPIKeys = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountAPIKeys(node);
			else this.premountAPIKeysNodes.delete(node);
		};
		this.__internal_mountOAuthConsent = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_mountOAuthConsent(node, props);
			else this.premountOAuthConsentNodes.set(node, props);
		};
		this.__internal_unmountOAuthConsent = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.__internal_unmountOAuthConsent(node);
			else this.premountOAuthConsentNodes.delete(node);
		};
		this.mountTaskChooseOrganization = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountTaskChooseOrganization(node, props);
			else this.premountTaskChooseOrganizationNodes.set(node, props);
		};
		this.unmountTaskChooseOrganization = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountTaskChooseOrganization(node);
			else this.premountTaskChooseOrganizationNodes.delete(node);
		};
		this.mountTaskResetPassword = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountTaskResetPassword(node, props);
			else this.premountTaskResetPasswordNodes.set(node, props);
		};
		this.unmountTaskResetPassword = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountTaskResetPassword(node);
			else this.premountTaskResetPasswordNodes.delete(node);
		};
		this.mountTaskSetupMFA = (node, props) => {
			if (this.clerkjs && this.loaded) this.clerkjs.mountTaskSetupMFA(node, props);
			else this.premountTaskSetupMFANodes.set(node, props);
		};
		this.unmountTaskSetupMFA = (node) => {
			if (this.clerkjs && this.loaded) this.clerkjs.unmountTaskSetupMFA(node);
			else this.premountTaskSetupMFANodes.delete(node);
		};
		this.addListener = (listener, options) => {
			if (this.clerkjs) return this.clerkjs.addListener(listener, options);
			else {
				const unsubscribe = () => {
					var _a, _b;
					const listenerExtras = this.premountAddListenerCalls.get(listener);
					if (listenerExtras == null ? void 0 : listenerExtras.handlers) {
						(_b = listenerExtras == null ? void 0 : (_a = listenerExtras.handlers).nativeUnsubscribe) == null || _b.call(_a);
						this.premountAddListenerCalls.delete(listener);
					}
				};
				this.premountAddListenerCalls.set(listener, {
					options,
					handlers: {
						unsubscribe,
						nativeUnsubscribe: void 0
					}
				});
				return unsubscribe;
			}
		};
		this.navigate = (to) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.navigate(to);
			};
			if (this.clerkjs && this.loaded) callback();
			else this.premountMethodCalls.set("navigate", callback);
		};
		this.redirectWithAuth = async (...args) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectWithAuth(...args);
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectWithAuth", callback);
				return;
			}
		};
		this.redirectToSignIn = async (opts) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToSignIn(opts);
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectToSignIn", callback);
				return;
			}
		};
		this.redirectToSignUp = async (opts) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToSignUp(opts);
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectToSignUp", callback);
				return;
			}
		};
		this.redirectToUserProfile = async () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToUserProfile();
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectToUserProfile", callback);
				return;
			}
		};
		this.redirectToAfterSignUp = () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignUp();
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("redirectToAfterSignUp", callback);
		};
		this.redirectToAfterSignIn = () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignIn();
			};
			if (this.clerkjs && this.loaded) callback();
			else this.premountMethodCalls.set("redirectToAfterSignIn", callback);
		};
		this.redirectToAfterSignOut = () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignOut();
			};
			if (this.clerkjs && this.loaded) callback();
			else this.premountMethodCalls.set("redirectToAfterSignOut", callback);
		};
		this.redirectToOrganizationProfile = async () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToOrganizationProfile();
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectToOrganizationProfile", callback);
				return;
			}
		};
		this.redirectToCreateOrganization = async () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToCreateOrganization();
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectToCreateOrganization", callback);
				return;
			}
		};
		this.redirectToWaitlist = async () => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToWaitlist();
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectToWaitlist", callback);
				return;
			}
		};
		this.redirectToTasks = async (opts) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.redirectToTasks(opts);
			};
			if (this.clerkjs && this.loaded) return callback();
			else {
				this.premountMethodCalls.set("redirectToTasks", callback);
				return;
			}
		};
		this.handleRedirectCallback = async (params) => {
			var _a;
			const callback = () => {
				var _a2;
				return (_a2 = this.clerkjs) == null ? void 0 : _a2.handleRedirectCallback(params);
			};
			if (this.clerkjs && this.loaded) (_a = callback()) == null || _a.catch(() => {});
			else this.premountMethodCalls.set("handleRedirectCallback", callback);
		};
		this.handleGoogleOneTapCallback = async (signInOrUp, params) => {
			var _a;
			const callback = () => {
				var _a2;
				return (_a2 = this.clerkjs) == null ? void 0 : _a2.handleGoogleOneTapCallback(signInOrUp, params);
			};
			if (this.clerkjs && this.loaded) (_a = callback()) == null || _a.catch(() => {});
			else this.premountMethodCalls.set("handleGoogleOneTapCallback", callback);
		};
		this.handleEmailLinkVerification = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.handleEmailLinkVerification(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("handleEmailLinkVerification", callback);
		};
		this.authenticateWithMetamask = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithMetamask(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("authenticateWithMetamask", callback);
		};
		this.authenticateWithCoinbaseWallet = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithCoinbaseWallet(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("authenticateWithCoinbaseWallet", callback);
		};
		this.authenticateWithBase = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithBase(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("authenticateWithBase", callback);
		};
		this.authenticateWithOKXWallet = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithOKXWallet(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("authenticateWithOKXWallet", callback);
		};
		this.authenticateWithSolana = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithSolana(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("authenticateWithSolana", callback);
		};
		this.authenticateWithWeb3 = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithWeb3(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("authenticateWithWeb3", callback);
		};
		this.authenticateWithGoogleOneTap = async (params) => {
			return (await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this)).authenticateWithGoogleOneTap(params);
		};
		this.__internal_loadStripeJs = async () => {
			return (await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this)).__internal_loadStripeJs();
		};
		this.createOrganization = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.createOrganization(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("createOrganization", callback);
		};
		this.getOrganization = async (organizationId) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.getOrganization(organizationId);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("getOrganization", callback);
		};
		this.joinWaitlist = async (params) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.joinWaitlist(params);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("joinWaitlist", callback);
		};
		this.signOut = async (...args) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.signOut(...args);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("signOut", callback);
		};
		this.__internal_attemptToEnableEnvironmentSetting = (options) => {
			const callback = () => {
				var _a;
				return (_a = this.clerkjs) == null ? void 0 : _a.__internal_attemptToEnableEnvironmentSetting(options);
			};
			if (this.clerkjs && this.loaded) return callback();
			else this.premountMethodCalls.set("__internal_attemptToEnableEnvironmentSetting", callback);
		};
		var _a;
		__privateSet(this, _publishableKey, options == null ? void 0 : options.publishableKey);
		__privateSet(this, _proxyUrl, options == null ? void 0 : options.proxyUrl);
		__privateSet(this, _domain, options == null ? void 0 : options.domain);
		this.options = options;
		this.Clerk = (options == null ? void 0 : options.Clerk) || null;
		this.mode = inBrowser() ? "browser" : "server";
		__privateSet(this, _stateProxy, new StateProxy(this));
		if (!this.options.sdkMetadata) this.options.sdkMetadata = SDK_METADATA$1;
		__privateGet(this, _eventBus).emit(clerkEvents.Status, "loading");
		__privateGet(this, _eventBus).prioritizedOn(clerkEvents.Status, (status) => __privateSet(this, _status, status));
		if (__privateGet(this, _publishableKey) && ((_a = this.options.experimental) == null ? void 0 : _a.runtimeEnvironment) === "headless" && this.options.Clerk) this.loadHeadlessClerk();
		else if (__privateGet(this, _publishableKey)) this.getEntryChunks();
	}
	get publishableKey() {
		return __privateGet(this, _publishableKey);
	}
	get loaded() {
		var _a;
		return ((_a = this.clerkjs) == null ? void 0 : _a.loaded) || false;
	}
	get status() {
		var _a;
		if (!this.clerkjs) return __privateGet(this, _status);
		return ((_a = this.clerkjs) == null ? void 0 : _a.status) || (this.clerkjs.loaded ? "ready" : "loading");
	}
	static getOrCreateInstance(options) {
		if (!inBrowser() || !__privateGet(this, _instance) || options.Clerk && __privateGet(this, _instance).Clerk !== options.Clerk || __privateGet(this, _instance).publishableKey !== options.publishableKey) __privateSet(this, _instance, new _IsomorphicClerk(options));
		return __privateGet(this, _instance);
	}
	static clearInstance() {
		__privateSet(this, _instance, null);
	}
	get domain() {
		if (typeof window !== "undefined" && window.location) return handleValueOrFn(__privateGet(this, _domain), new URL(window.location.href), "");
		if (typeof __privateGet(this, _domain) === "function") return errorThrower$2.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
		return __privateGet(this, _domain) || "";
	}
	get proxyUrl() {
		if (typeof window !== "undefined" && window.location) return handleValueOrFn(__privateGet(this, _proxyUrl), new URL(window.location.href), "");
		if (typeof __privateGet(this, _proxyUrl) === "function") return errorThrower$2.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
		return __privateGet(this, _proxyUrl) || "";
	}
	/**
	* Accesses private options from the `Clerk` instance and defaults to
	* `IsomorphicClerk` options when in SSR context.
	*  @internal
	*/
	__internal_getOption(key) {
		var _a, _b;
		return ((_a = this.clerkjs) == null ? void 0 : _a.__internal_getOption) ? (_b = this.clerkjs) == null ? void 0 : _b.__internal_getOption(key) : this.options[key];
	}
	/**
	* Initialize Clerk for headless/React Native environments where a Clerk instance is provided directly.
	* Only handles Clerk construction and loading — post-load wiring is shared via replayInterceptedInvocations.
	*/
	loadHeadlessClerk() {
		const clerk = isConstructor(this.options.Clerk) ? new this.options.Clerk(__privateGet(this, _publishableKey), {
			proxyUrl: this.proxyUrl,
			domain: this.domain
		}) : this.options.Clerk;
		if (!clerk) {
			__privateGet(this, _eventBus).emit(clerkEvents.Status, "error");
			return;
		}
		const onLoaded = () => {
			this.replayInterceptedInvocations(clerk);
		};
		if (!clerk.loaded) clerk.load(this.options).then(() => onLoaded()).catch((err) => {
			__privateGet(this, _eventBus).emit(clerkEvents.Status, "error");
			this.emitLoaded();
		});
		else onLoaded();
	}
	get sdkMetadata() {
		var _a;
		return ((_a = this.clerkjs) == null ? void 0 : _a.sdkMetadata) || this.options.sdkMetadata || void 0;
	}
	get instanceType() {
		var _a;
		return (_a = this.clerkjs) == null ? void 0 : _a.instanceType;
	}
	get frontendApi() {
		var _a;
		return ((_a = this.clerkjs) == null ? void 0 : _a.frontendApi) || "";
	}
	get isStandardBrowser() {
		var _a;
		return ((_a = this.clerkjs) == null ? void 0 : _a.isStandardBrowser) || this.options.standardBrowser || false;
	}
	get __internal_queryClient() {
		var _a;
		return (_a = this.clerkjs) == null ? void 0 : _a.__internal_queryClient;
	}
	get isSatellite() {
		if (typeof window !== "undefined" && window.location) return handleValueOrFn(this.options.isSatellite, new URL(window.location.href), false);
		if (typeof this.options.isSatellite === "function") return errorThrower$2.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
		return false;
	}
	async getEntryChunks() {
		var _a;
		if (this.mode !== "browser" || this.loaded) return;
		if (typeof window !== "undefined") {
			window.__clerk_publishable_key = __privateGet(this, _publishableKey);
			window.__clerk_proxy_url = this.proxyUrl;
			window.__clerk_domain = this.domain;
		}
		try {
			const clerk = await this.getClerkJsEntryChunk();
			if (!clerk.loaded) {
				this.beforeLoad(clerk);
				const ClerkUI = this.options.standardBrowser !== false && !this.options.Clerk || !!((_a = this.options.ui) == null ? void 0 : _a.ClerkUI) ? await this.getClerkUIEntryChunk() : void 0;
				await clerk.load({
					...this.options,
					ui: {
						...this.options.ui,
						ClerkUI
					}
				});
			}
			if (clerk.loaded) this.replayInterceptedInvocations(clerk);
		} catch (err) {
			const error = err;
			__privateGet(this, _eventBus).emit(clerkEvents.Status, "error");
			console.error(error.stack || error.message || error);
			return;
		}
	}
	async getClerkJsEntryChunk() {
		if ((!this.options.Clerk || this.options.__internal_clerkJSUrl) && !__BUILD_DISABLE_RHC__) await loadClerkJSScript({
			...this.options,
			publishableKey: __privateGet(this, _publishableKey),
			proxyUrl: this.proxyUrl,
			domain: this.domain,
			nonce: this.options.nonce
		});
		if (this.options.Clerk && !this.options.__internal_clerkJSUrl) global.Clerk = isConstructor(this.options.Clerk) ? new this.options.Clerk(__privateGet(this, _publishableKey), {
			proxyUrl: this.proxyUrl,
			domain: this.domain
		}) : this.options.Clerk;
		if (!global.Clerk) throw new Error("Failed to download latest ClerkJS. Contact support@clerk.com.");
		return global.Clerk;
	}
	async getClerkUIEntryChunk() {
		const uiProp = this.options.ui;
		const hasInternalUrl = !!this.options.__internal_clerkUIUrl;
		if ((uiProp == null ? void 0 : uiProp.ClerkUI) && !hasInternalUrl) return uiProp.ClerkUI;
		if ((uiProp || this.options.prefetchUI === false) && !hasInternalUrl) return;
		await loadClerkUIScript({
			...this.options,
			publishableKey: __privateGet(this, _publishableKey),
			proxyUrl: this.proxyUrl,
			domain: this.domain,
			nonce: this.options.nonce
		});
		if (!global.__internal_ClerkUICtor) throw new Error("Failed to download latest Clerk UI. Contact support@clerk.com.");
		return global.__internal_ClerkUICtor;
	}
	get version() {
		var _a;
		return (_a = this.clerkjs) == null ? void 0 : _a.version;
	}
	get client() {
		if (this.clerkjs) return this.clerkjs.client;
		else return;
	}
	get session() {
		if (this.clerkjs) return this.clerkjs.session;
		else return;
	}
	get user() {
		if (this.clerkjs) return this.clerkjs.user;
		else return;
	}
	get organization() {
		if (this.clerkjs) return this.clerkjs.organization;
		else return;
	}
	get telemetry() {
		if (this.clerkjs) return this.clerkjs.telemetry;
		else return;
	}
	get __internal_environment() {
		if (this.clerkjs) return this.clerkjs.__internal_environment;
		else return;
	}
	get isSignedIn() {
		if (this.clerkjs) return this.clerkjs.isSignedIn;
		else return false;
	}
	get billing() {
		var _a;
		return (_a = this.clerkjs) == null ? void 0 : _a.billing;
	}
	get __internal_state() {
		return this.loaded && this.clerkjs ? this.clerkjs.__internal_state : __privateGet(this, _stateProxy);
	}
	get apiKeys() {
		var _a;
		return (_a = this.clerkjs) == null ? void 0 : _a.apiKeys;
	}
	__internal_setEnvironment(...args) {
		if (this.clerkjs && "__internal_setEnvironment" in this.clerkjs) this.clerkjs.__internal_setEnvironment(args);
		else return;
	}
	get __internal_lastEmittedResources() {
		var _a;
		return (_a = this.clerkjs) == null ? void 0 : _a.__internal_lastEmittedResources;
	}
};
_status = /* @__PURE__ */ new WeakMap();
_domain = /* @__PURE__ */ new WeakMap();
_proxyUrl = /* @__PURE__ */ new WeakMap();
_publishableKey = /* @__PURE__ */ new WeakMap();
_eventBus = /* @__PURE__ */ new WeakMap();
_stateProxy = /* @__PURE__ */ new WeakMap();
_instance = /* @__PURE__ */ new WeakMap();
_IsomorphicClerk_instances = /* @__PURE__ */ new WeakSet();
waitForClerkJS_fn = function() {
	return new Promise((resolve) => {
		this.addOnLoaded(() => resolve(this.clerkjs));
	});
};
__privateAdd(_IsomorphicClerk, _instance);
var IsomorphicClerk = _IsomorphicClerk;
function ClerkProviderBase(props) {
	const { initialState, children, ...restIsomorphicClerkOptions } = props;
	const { isomorphicClerk, clerkStatus } = useLoadedIsomorphicClerk(mergeWithEnv(restIsomorphicClerkOptions));
	return /* @__PURE__ */ import_react.createElement(ClerkContextProvider, {
		initialState,
		clerk: isomorphicClerk,
		clerkStatus
	}, children);
}
var ClerkProvider$1 = withMaxAllowedInstancesGuard(ClerkProviderBase, "ClerkProvider", multipleClerkProvidersError);
ClerkProvider$1.displayName = "ClerkProvider";
var DEFAULT_CLERK_UI_VARIANT = IS_REACT_SHARED_VARIANT_COMPATIBLE ? "shared" : "";
var useLoadedIsomorphicClerk = (mergedOptions) => {
	const optionsWithDefaults = import_react.useMemo(() => ({
		clerkUIVariant: DEFAULT_CLERK_UI_VARIANT,
		...mergedOptions
	}), [mergedOptions]);
	const isomorphicClerkRef = import_react.useRef(IsomorphicClerk.getOrCreateInstance(optionsWithDefaults));
	const [clerkStatus, setClerkStatus] = import_react.useState(isomorphicClerkRef.current.status);
	import_react.useEffect(() => {
		isomorphicClerkRef.current.__internal_updateProps({ appearance: mergedOptions.appearance });
	}, [mergedOptions.appearance]);
	import_react.useEffect(() => {
		isomorphicClerkRef.current.__internal_updateProps({ options: mergedOptions });
	}, [mergedOptions.localization]);
	import_react.useEffect(() => {
		isomorphicClerkRef.current.on("status", setClerkStatus);
		return () => {
			if (isomorphicClerkRef.current) isomorphicClerkRef.current.off("status", setClerkStatus);
			IsomorphicClerk.clearInstance();
		};
	}, []);
	return {
		isomorphicClerk: isomorphicClerkRef.current,
		clerkStatus
	};
};
var InternalClerkProvider = ClerkProvider$1;
var isClient = () => typeof window !== "undefined";
buildErrorThrower({ packageName: "@clerk/tanstack-react-start" });
var ClerkOptionsCtx = import_react.createContext(void 0);
ClerkOptionsCtx.displayName = "ClerkOptionsCtx";
var ClerkOptionsProvider = (props) => {
	const { children, options } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClerkOptionsCtx.Provider, {
		value: { value: options },
		children
	});
};
var useAwaitableNavigate = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const resolveFunctionsRef = import_react.useRef([]);
	const resolveAll = () => {
		resolveFunctionsRef.current.forEach((resolve) => resolve());
		resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
	};
	const [_, startTransition] = (0, import_react.useTransition)();
	import_react.useEffect(() => {
		resolveAll();
	}, [location]);
	return (options) => {
		return new Promise((res) => {
			startTransition(() => {
				resolveFunctionsRef.current.push(res);
				res(navigate(options));
			});
		});
	};
};
var getPublicEnvVariables = () => {
	const getValue = (name) => {
		return getEnvVariable(`VITE_${name}`) || getEnvVariable(name);
	};
	return {
		publishableKey: getValue("CLERK_PUBLISHABLE_KEY"),
		domain: getValue("CLERK_DOMAIN"),
		isSatellite: isTruthy(getValue("CLERK_IS_SATELLITE")),
		proxyUrl: getValue("CLERK_PROXY_URL"),
		signInUrl: getValue("CLERK_SIGN_IN_URL"),
		signUpUrl: getValue("CLERK_SIGN_UP_URL"),
		clerkJsUrl: getValue("CLERK_JS_URL") || getValue("CLERK_JS"),
		clerkJsVersion: getValue("CLERK_JS_VERSION"),
		clerkUIUrl: getValue("CLERK_UI_URL"),
		clerkUIVersion: getValue("CLERK_UI_VERSION"),
		prefetchUI: getValue("CLERK_PREFETCH_UI") === "false" ? false : void 0,
		telemetryDisabled: isTruthy(getValue("CLERK_TELEMETRY_DISABLED")),
		telemetryDebug: isTruthy(getValue("CLERK_TELEMETRY_DEBUG")),
		afterSignInUrl: getValue("CLERK_AFTER_SIGN_IN_URL"),
		afterSignUpUrl: getValue("CLERK_AFTER_SIGN_UP_URL"),
		newSubscriptionRedirectUrl: getValue("CLERK_CHECKOUT_CONTINUE_URL")
	};
};
var pickFromClerkInitState = (clerkInitState) => {
	const { __clerk_ssr_state, __publishableKey, __proxyUrl, __domain, __isSatellite, __signInUrl, __signUpUrl, __clerkJSUrl, __clerkJSVersion, __clerkUIUrl, __clerkUIVersion, __telemetryDisabled, __telemetryDebug, __signInForceRedirectUrl, __signUpForceRedirectUrl, __signInFallbackRedirectUrl, __signUpFallbackRedirectUrl, __keylessClaimUrl, __keylessApiKeysUrl, __prefetchUI } = clerkInitState || {};
	return {
		clerkSsrState: __clerk_ssr_state,
		publishableKey: __publishableKey,
		proxyUrl: __proxyUrl,
		domain: __domain,
		isSatellite: !!__isSatellite,
		signInUrl: __signInUrl,
		signUpUrl: __signUpUrl,
		__internal_clerkJSUrl: __clerkJSUrl,
		__internal_clerkJSVersion: __clerkJSVersion,
		__internal_clerkUIUrl: __clerkUIUrl,
		__internal_clerkUIVersion: __clerkUIVersion,
		prefetchUI: __prefetchUI,
		telemetry: {
			disabled: __telemetryDisabled,
			debug: __telemetryDebug
		},
		signInForceRedirectUrl: __signInForceRedirectUrl,
		signUpForceRedirectUrl: __signUpForceRedirectUrl,
		signInFallbackRedirectUrl: __signInFallbackRedirectUrl,
		signUpFallbackRedirectUrl: __signUpFallbackRedirectUrl,
		__keylessClaimUrl,
		__keylessApiKeysUrl
	};
};
var mergeWithPublicEnvs = (restInitState) => {
	const envVars = getPublicEnvVariables();
	return {
		...restInitState,
		publishableKey: restInitState.publishableKey || envVars.publishableKey,
		domain: restInitState.domain || envVars.domain,
		isSatellite: restInitState.isSatellite || envVars.isSatellite,
		signInUrl: restInitState.signInUrl || envVars.signInUrl,
		signUpUrl: restInitState.signUpUrl || envVars.signUpUrl,
		__internal_clerkJSUrl: restInitState.__internal_clerkJSUrl || envVars.clerkJsUrl,
		__internal_clerkJSVersion: restInitState.__internal_clerkJSVersion || envVars.clerkJsVersion,
		__internal_clerkUIUrl: restInitState.__internal_clerkUIUrl || envVars.clerkUIUrl,
		__internal_clerkUIVersion: restInitState.__internal_clerkUIVersion || envVars.clerkUIVersion,
		signInForceRedirectUrl: restInitState.signInForceRedirectUrl,
		prefetchUI: restInitState.prefetchUI ?? envVars.prefetchUI
	};
};
function parseUrlForNavigation(to, baseUrl) {
	const url = new URL(to, baseUrl);
	const searchParams = Object.fromEntries(url.searchParams);
	return {
		to: url.pathname,
		search: Object.keys(searchParams).length > 0 ? searchParams : void 0,
		hash: url.hash ? url.hash.slice(1) : void 0
	};
}
if (typeof window !== "undefined" && !window.global) window.global = typeof global === "undefined" ? window : global;
var _a;
if (globalThis.__clerkSharedModules) {
	const existingVersion = (_a = globalThis.__clerkSharedModules.react) == null ? void 0 : _a.version;
	if (existingVersion && existingVersion !== "19.2.5") console.warn(`[@clerk/ui/register] React version mismatch detected. Already registered: ${existingVersion}, current import: 19.2.5. This may cause issues with the shared @clerk/ui variant.`);
} else globalThis.__clerkSharedModules = {
	react: import_react,
	"react-dom": import_react_dom,
	"react-dom/client": import_client,
	"react/jsx-runtime": import_jsx_runtime
};
var SignInButton = withClerk(({ clerk, children, ...props }) => {
	const { appearance, getContainer, component, signUpFallbackRedirectUrl, forceRedirectUrl, fallbackRedirectUrl, signUpForceRedirectUrl, mode, initialValues, withSignUp, oauthFlow, ...rest } = props;
	children = normalizeWithDefaultValue(children, "Sign in");
	const child = assertSingleChild(children)("SignInButton");
	const clickHandler = () => {
		const opts = {
			forceRedirectUrl,
			fallbackRedirectUrl,
			signUpFallbackRedirectUrl,
			signUpForceRedirectUrl,
			initialValues,
			withSignUp,
			oauthFlow
		};
		if (mode === "modal") return clerk.openSignIn({
			...opts,
			appearance,
			getContainer
		});
		return clerk.redirectToSignIn({
			...opts,
			signInFallbackRedirectUrl: fallbackRedirectUrl,
			signInForceRedirectUrl: forceRedirectUrl
		});
	};
	const wrappedChildClickHandler = async (e) => {
		if (child && typeof child === "object" && "props" in child) await safeExecute(child.props.onClick)(e);
		return clickHandler();
	};
	const childProps = {
		...rest,
		onClick: wrappedChildClickHandler
	};
	return import_react.cloneElement(child, childProps);
}, {
	component: "SignInButton",
	renderWhileLoading: true
});
withClerk(({ clerk, children, ...props }) => {
	const { redirectUrl, getContainer, component, ...rest } = props;
	children = normalizeWithDefaultValue(children, "Sign in with Metamask");
	const child = assertSingleChild(children)("SignInWithMetamaskButton");
	const clickHandler = async () => {
		async function authenticate() {
			await clerk.authenticateWithMetamask({ redirectUrl: redirectUrl || void 0 });
		}
		authenticate();
	};
	const wrappedChildClickHandler = async (e) => {
		await safeExecute(child.props.onClick)(e);
		return clickHandler();
	};
	const childProps = {
		...rest,
		onClick: wrappedChildClickHandler
	};
	return import_react.cloneElement(child, childProps);
}, {
	component: "SignInWithMetamask",
	renderWhileLoading: true
});
withClerk(({ clerk, children, ...props }) => {
	const { redirectUrl = "/", sessionId, signOutOptions, getContainer, component, ...rest } = props;
	if (signOutOptions) deprecated("SignOutButton `signOutOptions`", "Use the `redirectUrl` and `sessionId` props directly instead.");
	children = normalizeWithDefaultValue(children, "Sign out");
	const child = assertSingleChild(children)("SignOutButton");
	const clickHandler = () => clerk.signOut({
		redirectUrl,
		...sessionId !== void 0 && { sessionId },
		...signOutOptions
	});
	const wrappedChildClickHandler = async (e) => {
		await safeExecute(child.props.onClick)(e);
		return clickHandler();
	};
	const childProps = {
		...rest,
		onClick: wrappedChildClickHandler
	};
	return import_react.cloneElement(child, childProps);
}, {
	component: "SignOutButton",
	renderWhileLoading: true
});
withClerk(({ clerk, children, ...props }) => {
	const { appearance, unsafeMetadata, getContainer, component, fallbackRedirectUrl, forceRedirectUrl, signInFallbackRedirectUrl, signInForceRedirectUrl, mode, initialValues, oauthFlow, ...rest } = props;
	children = normalizeWithDefaultValue(children, "Sign up");
	const child = assertSingleChild(children)("SignUpButton");
	const clickHandler = () => {
		const opts = {
			fallbackRedirectUrl,
			forceRedirectUrl,
			signInFallbackRedirectUrl,
			signInForceRedirectUrl,
			initialValues,
			oauthFlow
		};
		if (mode === "modal") return clerk.openSignUp({
			...opts,
			appearance,
			unsafeMetadata,
			getContainer
		});
		return clerk.redirectToSignUp({
			...opts,
			signUpFallbackRedirectUrl: fallbackRedirectUrl,
			signUpForceRedirectUrl: forceRedirectUrl
		});
	};
	const wrappedChildClickHandler = async (e) => {
		if (child && typeof child === "object" && "props" in child) await safeExecute(child.props.onClick)(e);
		return clickHandler();
	};
	const childProps = {
		...rest,
		onClick: wrappedChildClickHandler
	};
	return import_react.cloneElement(child, childProps);
}, {
	component: "SignUpButton",
	renderWhileLoading: true
});
setErrorThrowerOptions({ packageName: "@clerk/react" });
setClerkJSLoadingErrorPackageName("@clerk/react");
var SDK_METADATA = {
	name: "@clerk/tanstack-react-start",
	version: "1.0.12"
};
var awaitableNavigateRef = { current: void 0 };
function ClerkProvider({ children, ...providerProps }) {
	const awaitableNavigate = useAwaitableNavigate();
	const clerkInitialState = getGlobalStartContext()?.clerkInitialState ?? {};
	(0, import_react.useEffect)(() => {
		awaitableNavigateRef.current = awaitableNavigate;
	}, [awaitableNavigate]);
	const { clerkSsrState, __keylessClaimUrl, __keylessApiKeysUrl, ...restInitState } = pickFromClerkInitState((isClient() ? window.__clerk_init_state : clerkInitialState)?.__internal_clerk_state);
	const mergedProps = {
		...mergeWithPublicEnvs(restInitState),
		...providerProps
	};
	const keylessProps = __keylessClaimUrl ? {
		__internal_keyless_claimKeylessApplicationUrl: __keylessClaimUrl,
		__internal_keyless_copyInstanceKeysUrl: __keylessApiKeysUrl
	} : {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScriptOnce, { children: `window.__clerk_init_state = ${JSON.stringify(clerkInitialState)};` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClerkOptionsProvider, {
		options: mergedProps,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InternalClerkProvider, {
			initialState: clerkSsrState,
			sdkMetadata: SDK_METADATA,
			routerPush: (to) => {
				const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
				return awaitableNavigateRef.current?.({
					...rest,
					search,
					hash,
					replace: false
				});
			},
			routerReplace: (to) => {
				const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
				return awaitableNavigateRef.current?.({
					...rest,
					search,
					hash,
					replace: true
				});
			},
			...mergedProps,
			...keylessProps,
			children
		})
	})] });
}
ClerkProvider.displayName = "ClerkProvider";
var runtimeConfig = {
	convexUrl: "https://wary-puma-83.eu-west-1.convex.cloud",
	clerkPublishableKey: ""
};
var runtimeFlags = {
	hasConvex: runtimeConfig.convexUrl.length > 0,
	hasClerk: runtimeConfig.clerkPublishableKey.length > 0
};
var convexClient = runtimeFlags.hasConvex ? new ConvexReactClient(runtimeConfig.convexUrl) : null;
var RuntimeContext = (0, import_react.createContext)({
	...runtimeConfig,
	...runtimeFlags
});
var clerkAppearance = { elements: {
	card: "border border-border/70 bg-card shadow-[0_18px_40px_rgba(20,28,44,0.08)]",
	headerTitle: "font-serif text-2xl text-foreground",
	headerSubtitle: "text-muted-foreground",
	formButtonPrimary: "bg-[var(--arena-signal)] text-white hover:bg-[color-mix(in_oklab,var(--arena-signal),black_10%)] shadow-none",
	socialButtonsBlockButton: "border-border bg-background text-foreground hover:bg-muted",
	formFieldInput: "border-border bg-background text-foreground shadow-none focus:border-ring focus:ring-2 focus:ring-ring/20",
	footerActionLink: "text-[var(--arena-cobalt)] hover:text-[color-mix(in_oklab,var(--arena-cobalt),black_14%)]",
	formFieldLabel: "text-foreground",
	dividerLine: "bg-border",
	dividerText: "text-muted-foreground"
} };
function ConvexLayer({ children }) {
	if (!convexClient) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	if (!runtimeFlags.hasClerk) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvexProvider, {
		client: convexClient,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClerkProvider, {
		publishableKey: runtimeConfig.clerkPublishableKey,
		appearance: clerkAppearance,
		afterSignOutUrl: "/",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvexProviderWithClerk, {
			client: convexClient,
			useAuth,
			children
		})
	});
}
function AppProviders({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuntimeContext.Provider, {
		value: {
			...runtimeConfig,
			...runtimeFlags
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(J, {
			attribute: "class",
			defaultTheme: "system",
			enableSystem: true,
			disableTransitionOnChange: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvexLayer, { children })
		})
	});
}
function useRuntimeConfig() {
	return (0, import_react.useContext)(RuntimeContext);
}
//#endregion
export { useRuntimeConfig as a, useAuth as i, SignInButton as n, UserButton as r, AppProviders as t };
