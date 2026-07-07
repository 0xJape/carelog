<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import TransitionOverlay from '$lib/components/transition-overlay.svelte';
	import '../app.css';

	let { children } = $props();

	// Version-skew handling: after a new deploy the hashed JS chunks change.
	// If an old tab tries to client-side navigate to a chunk that no longer
	// exists (404), force a full-page load so it fetches the new build.
	beforeNavigate((navigation) => {
		if (updated.current && navigation.to?.url) {
			location.href = navigation.to.url.href;
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="" />
	<title>CliniqueAI - School Clinic Management</title>
	<meta
		name="description"
		content="Modern school clinic management system with QR code technology for emergency healthcare access."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<!-- Chunk 404 / version-skew recovery -->
	<!-- If a dynamically imported JS chunk returns 404 (stale tab after a new
	     deploy), catch the unhandled rejection and hard-reload the same URL.
	     A sessionStorage flag stops infinite reload loops. -->
	<script>
		(function () {
			window.addEventListener('unhandledrejection', function (e) {
				var msg = e && e.reason && (e.reason.message || String(e.reason));
				if (
					msg &&
					(msg.includes('Failed to fetch dynamically imported module') ||
						msg.includes('Importing a module script failed') ||
						msg.includes('error loading dynamically imported module'))
				) {
					var key = 'chunk404_reload';
					if (!sessionStorage.getItem(key)) {
						sessionStorage.setItem(key, '1');
						location.reload();
					}
				}
			});
			// Clear the reload flag on successful navigation so future errors still recover
			window.addEventListener('load', function () {
				sessionStorage.removeItem('chunk404_reload');
			});
		})();
	</script>

	<!-- Theme initialization script to prevent flash of incorrect theme -->
	<script>
		// This script runs immediately to prevent FOUC (Flash of Unstyled Content)
		(function () {
			// Check if we already have a theme class set by the server
			const htmlElement = document.documentElement;
			if (
				htmlElement.classList.contains('dark') ||
				htmlElement.getAttribute('data-theme') === 'dark'
			) {
				return; // Server already set the theme correctly
			}

			// Fallback: check localStorage and system preference
			const savedTheme = localStorage.getItem('theme');
			const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

			if (shouldUseDark) {
				htmlElement.classList.add('dark');
				htmlElement.setAttribute('data-theme', 'dark');
			}
		})();
	</script>

	<!-- Fallback for no-JavaScript users -->
	<noscript>
		<style>
			/* Default to light theme when JavaScript is disabled */
			html {
				color-scheme: light;
			}
			/* Use system preference if supported */
			@media (prefers-color-scheme: dark) {
				html {
					color-scheme: dark;
				}
				html:not([data-theme='light']) {
					filter: invert(1) hue-rotate(180deg);
				}
			}
		</style>
	</noscript>
</svelte:head>

<TransitionOverlay />

{@render children()}
