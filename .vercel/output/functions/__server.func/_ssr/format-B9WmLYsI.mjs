//#region node_modules/.nitro/vite/services/ssr/assets/format-B9WmLYsI.js
function formatDateTime(value) {
	if (!value) return "Not available";
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(value);
}
function formatClock(value) {
	if (!value) return "TBD";
	return new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit"
	}).format(value);
}
function formatDurationMs(value) {
	if (!value) return "n/a";
	if (value < 1e3) return `${value} ms`;
	return `${(value / 1e3).toFixed(1)} s`;
}
function initials(name) {
	return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}
//#endregion
export { initials as i, formatDateTime as n, formatDurationMs as r, formatClock as t };
