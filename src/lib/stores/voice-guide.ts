/**
 * voice-guide.ts — Audio guide system for CliniqueAI
 *
 * Drop MP3 files in /static/audio/ with these exact names:
 *
 * welcome.mp3         — plays on first app load (landing/login page)
 * dashboard.mp3       — Dashboard page
 * students.mp3        — Students list page
 * student-profile.mp3 — Individual student profile page
 * visits.mp3          — Visits list page
 * visit-detail.mp3    — Individual visit detail page
 * inventory.mp3       — Inventory page
 * staffs.mp3          — Staffs page
 * settings.mp3        — Settings page
 */

// Map of route patterns to audio file names
const ROUTE_AUDIO_MAP: Record<string, string> = {
	'/dashboard': '/audio/dashboard.mp3',
	'/students': '/audio/students.mp3',
	'/visits': '/audio/visits.mp3',
	'/inventory': '/audio/inventory.mp3',
	'/staffs': '/audio/staffs.mp3',
	'/settings': '/audio/settings.mp3'
};

// Routes with dynamic segments
const DYNAMIC_ROUTE_AUDIO: Array<{ pattern: RegExp; file: string }> = [
	{ pattern: /^\/students\/[^/]+$/, file: '/audio/student-profile.mp3' },
	{ pattern: /^\/visits\/[^/]+$/, file: '/audio/visit-detail.mp3' }
];

/**
 * Get the audio file for a given pathname.
 * Returns null if no audio is mapped to that route.
 */
export function getAudioForRoute(pathname: string): string | null {
	// Check exact matches first
	for (const [route, file] of Object.entries(ROUTE_AUDIO_MAP)) {
		if (pathname === route || pathname.startsWith(route + '/') && !isDeepPath(pathname, route)) {
			return file;
		}
	}

	// Check dynamic routes
	for (const { pattern, file } of DYNAMIC_ROUTE_AUDIO) {
		if (pattern.test(pathname)) {
			return file;
		}
	}

	return null;
}

function isDeepPath(pathname: string, base: string): boolean {
	const rest = pathname.slice(base.length + 1);
	return rest.includes('/');
}

/**
 * VoiceGuide — singleton audio controller
 * Manages a single <audio> element and stops/starts on route changes.
 */
class VoiceGuide {
	private audio: HTMLAudioElement | null = null;
	private currentSrc: string | null = null;
	private enabled = true;

	init() {
		if (typeof window === 'undefined') return;
		// Check user preference
		const pref = localStorage.getItem('voiceGuideEnabled');
		this.enabled = pref === null ? true : pref === 'true';
	}

	get isEnabled() {
		return this.enabled;
	}

	setEnabled(val: boolean) {
		this.enabled = val;
		if (typeof window !== 'undefined') {
			localStorage.setItem('voiceGuideEnabled', String(val));
		}
		if (!val) this.stop();
	}

	play(src: string) {
		if (!this.enabled || typeof window === 'undefined') return;
		if (this.currentSrc === src && this.audio && !this.audio.paused) return;

		this.stop();

		this.audio = new Audio(src);
		this.audio.volume = 0.85;
		this.currentSrc = src;

		this.audio.play().catch(() => {
			// Autoplay blocked — silently ignore
		});
	}

	stop() {
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
			this.audio = null;
			this.currentSrc = null;
		}
	}

	playForRoute(pathname: string) {
		const src = getAudioForRoute(pathname);
		if (src) {
			this.play(src);
		} else {
			this.stop();
		}
	}

	playWelcome() {
		this.play('/audio/welcome.mp3');
	}
}

export const voiceGuide = new VoiceGuide();
