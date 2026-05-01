import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { generateSessionToken } from './auth';
import { writeFileSync } from 'fs';
import nodemailer from 'nodemailer';

export const MAIL_VERIFICATION_KEY = env.MAIL_VERIFICATION_KEY || generateSessionToken();

if ((!env.SMTP2GO_USERNAME || !env.SMTP2GO_PASSWORD || !env.SMTP2GO_SENDER_EMAIL) && !building) {
	throw 'SMTP2GO USERNAME, PASSWORD and SENDER EMAIL needed';
}

// Create nodemailer transporter for SMTP2GO
let transporter: any = null;

function getMailTransporter() {
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: 'mail.smtp2go.com',
			port: 2525, // or 8025, 587, 80
			secure: false, // true for 465, false for other ports
			auth: {
				user: env.SMTP2GO_USERNAME || '',
				pass: env.SMTP2GO_PASSWORD || ''
			}
		});
	}
	return transporter;
}

export async function sendMailMessage(
	email: string,
	message: string,
	subject: string = 'Important Notification from CareLog'
) {
	try {
		const logData = {
			timestamp: new Date().toISOString(),
			recipient: email,
			subject: subject,
			hasApiKey: !!env.SMTP2GO_API_KEY,
			senderEmail: env.SMTP2GO_SENDER_EMAIL
		};
		writeFileSync('email-debug.log', JSON.stringify(logData, null, 2) + '\n', { flag: 'a' });
		
		console.log('=== Starting email send process ===');
		console.log('Recipient:', email);
		console.log('Subject:', subject);
		console.log('SMTP2GO_API_KEY exists:', !!env.SMTP2GO_API_KEY);
		console.log('SMTP2GO_SENDER_EMAIL:', env.SMTP2GO_SENDER_EMAIL);

		const transport = getMailTransporter();
		console.log('Nodemailer transporter initialized');

		const mailOptions = {
			from: `"CareLog Health Office" <${env.SMTP2GO_SENDER_EMAIL}>`,
			to: email,
			subject: subject,
			html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #dee2e6;">
					<h2 style="color: #2c3e50; margin: 0;">CareLog Health Office</h2>
				</div>
				<div style="padding: 30px 20px;">
					<div style="white-space: pre-wrap; line-height: 1.6; color: #333;">${message}</div>
				</div>
				<div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
					<p style="margin: 0;">This message was sent from CareLog School Health Management System.</p>
					<p style="margin: 5px 0 0 0;">Please contact the school if you have any questions or concerns.</p>
				</div>
			</div>
		`
		};

		console.log('Email options created, attempting to send...');
		const result = await transport.sendMail(mailOptions);
		console.log('Email send result:', result);
		console.log('Email sent successfully to', email);
		console.log('=== Email send process completed ===');
		
		writeFileSync('email-debug.log', 'SUCCESS: Email sent\n', { flag: 'a' });
	} catch (error) {
		const errorData = {
			timestamp: new Date().toISOString(),
			errorType: (error as any)?.constructor?.name,
			errorMessage: (error as any)?.message,
			errorString: String(error),
			errorStack: (error as any)?.stack
		};
		writeFileSync('email-debug.log', 'ERROR: ' + JSON.stringify(errorData, null, 2) + '\n', { flag: 'a' });
		
		console.error('=== Email send error ===');
		console.error('Error type:', (error as any)?.constructor?.name);
		console.error('Error message:', (error as any)?.message);
		console.error('Full error:', error);
		console.error('=== End email send error ===');
		throw error;
	}
}
