/**
 * notify.ts — Unified notification module via make.com webhooks
 *
 * Instead of sending email/SMS directly from the server, we POST a structured
 * payload to a make.com webhook URL. make.com then routes it to:
 *   - Email (via any provider configured in make.com)
 *   - SMS (via UniSMS, configured in make.com)
 *
 * Payload shape is consistent so make.com scenarios can branch on `channel` and `type`.
 */

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

if (!env.MAKE_WEBHOOK_URL && !building) {
	console.warn('[notify] MAKE_WEBHOOK_URL is not set — notifications will be skipped.');
}

export type NotifyChannel = 'email' | 'sms' | 'both';
export type NotifyType =
	| 'visit_notification'
	| 'emergency_alert'
	| 'appointment_reminder'
	| 'follow_up'
	| 'referral_notification'
	| 'inventory_alert'
	| 'general';

export interface NotifyPayload {
	/** Which channel(s) to use */
	channel: NotifyChannel;
	/** Type of notification — used by make.com to select the right scenario/template */
	type: NotifyType;
	/** Recipient email address (required when channel is 'email' or 'both') */
	email?: string;
	/** Recipient phone number in E.164 format e.g. +639171234567 (required when channel is 'sms' or 'both') */
	phone?: string;
	/** Recipient name for personalisation */
	recipientName?: string;
	/** Subject line (email only) */
	subject?: string;
	/** Plain-text message body — used for email fallback */
	message: string;
	/** SMS-optimized message (max 160 chars, no HTML). Falls back to message if not provided. */
	smsMessage?: string;
	/** Optional HTML body for email (make.com can use this if provided) */
	htmlMessage?: string;
	/** Arbitrary extra data make.com scenarios can use */
	meta?: Record<string, unknown>;
}

/**
 * Normalize a Philippine phone number to E.164 format.
 * 09xxxxxxxxx → +639xxxxxxxxx
 * +639xxxxxxxxx → unchanged
 */
function normalizePhone(phone: string): string {
	const cleaned = phone.replace(/\s+/g, '');
	if (cleaned.startsWith('09')) return '+63' + cleaned.slice(1);
	if (cleaned.startsWith('9') && cleaned.length === 10) return '+63' + cleaned;
	return cleaned;
}

/**
 * Send a notification via make.com webhook.
 * Fires and returns — does not throw on webhook errors so a failed notification
 * never breaks the main request flow. Errors are logged server-side.
 */
export async function sendNotification(payload: NotifyPayload): Promise<void> {
	const webhookUrl = env.MAKE_WEBHOOK_URL;

	if (!webhookUrl) {
		console.warn('[notify] Skipped — MAKE_WEBHOOK_URL not configured.', {
			type: payload.type,
			channel: payload.channel,
			recipient: payload.email ?? payload.phone
		});
		return;
	}

	try {
		// Build clean SMS message — strip HTML, normalize whitespace
		const smsContent = payload.smsMessage
			?? payload.message
				.replace(/<[^>]*>/g, '')           // strip HTML tags
				.replace(/&nbsp;/g, ' ')            // decode entities
				.replace(/&amp;/g, '&')
				.replace(/\s{2,}/g, ' ')            // collapse multiple spaces
				.trim()
				.slice(0, 160);                     // SMS max length

		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...payload,
				phone: payload.phone ? normalizePhone(payload.phone) : undefined,
				smsMessage: smsContent,
				sentAt: new Date().toISOString(),
				source: 'carelog'
			})
		});

		if (!response.ok) {
			console.error('[notify] Webhook responded with error', {
				status: response.status,
				statusText: response.statusText,
				type: payload.type
			});
		} else {
			console.log('[notify] Webhook delivered', {
				type: payload.type,
				channel: payload.channel,
				recipient: payload.email ?? payload.phone
			});
		}
	} catch (error) {
		console.error('[notify] Failed to reach make.com webhook', error);
	}
}

/**
 * Convenience — send an email-only notification.
 */
export async function sendEmail(
	email: string,
	subject: string,
	message: string,
	options?: {
		htmlMessage?: string;
		recipientName?: string;
		type?: NotifyType;
		meta?: Record<string, unknown>;
	}
): Promise<void> {
	return sendNotification({
		channel: 'email',
		type: options?.type ?? 'general',
		email,
		subject,
		message,
		htmlMessage: options?.htmlMessage,
		recipientName: options?.recipientName,
		meta: options?.meta
	});
}

/**
 * Convenience — send an SMS-only notification.
 */
export async function sendSMS(
	phone: string,
	message: string,
	options?: {
		recipientName?: string;
		type?: NotifyType;
		meta?: Record<string, unknown>;
	}
): Promise<void> {
	return sendNotification({
		channel: 'sms',
		type: options?.type ?? 'general',
		phone,
		message,
		recipientName: options?.recipientName,
		meta: options?.meta
	});
}

/**
 * Convenience — send both email and SMS together.
 */
export async function sendEmailAndSMS(
	email: string,
	phone: string,
	subject: string,
	message: string,
	options?: {
		htmlMessage?: string;
		recipientName?: string;
		type?: NotifyType;
		meta?: Record<string, unknown>;
	}
): Promise<void> {
	return sendNotification({
		channel: 'both',
		type: options?.type ?? 'general',
		email,
		phone,
		subject,
		message,
		htmlMessage: options?.htmlMessage,
		recipientName: options?.recipientName,
		meta: options?.meta
	});
}
