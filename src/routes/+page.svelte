<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import SplashScreen from '$lib/components/splash-screen.svelte';
	import FirstAidChat from '$lib/components/first-aid-chat.svelte';
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import VoiceGuideButton from '$lib/components/voice-guide-button.svelte';
	import { voiceGuide } from '$lib/stores/voice-guide';
	import { Button } from '$lib/components/ui/button';
	import {
		Activity,
		ArrowRight,
		Brain,
		Calendar,
		ClipboardList,
		ChevronDown,
		HeartPulse,
		Lock,
		QrCode,
		Users,
		Bell,
		Sparkles,
		Stethoscope,
		ShieldCheck,
		AlertTriangle,
		Package,
		FileText
	} from '@lucide/svelte';

	const features = [
		{
			icon: ClipboardList,
			title: 'Student Health Records',
			desc: 'Complete student clinic records with visit history, vital signs, allergies, and medical conditions — all in one secure profile.',
			items: ['Student registration & profiles', 'Allergies & condition flags', 'Clinic visit history', 'Emergency contact details']
		},
		{
			icon: Brain,
			title: 'AI Pre-Diagnosis',
			desc: 'Rule-based expert system that helps the school nurse assess a student\u2019s symptoms and gauge how urgent the case is.',
			items: ['Symptom input form', 'AI symptom analysis', 'Possible illness suggestions', 'Severity: Low / Moderate / High']
		},
		{
			icon: HeartPulse,
			title: 'First Aid Guidance',
			desc: 'Step-by-step first-aid instructions for common school injuries and emergencies, with clear warnings on when to escalate.',
			items: ['Symptom-based first aid steps', 'Emergency escalation alerts', 'Common injury protocols', 'When-to-call-parents guidance']
		},
		{
			icon: Users,
			title: 'Referral Management',
			desc: 'Generate referral forms to nearby hospitals or health centers when a student needs care beyond the school clinic.',
			items: ['Referral form generation', 'Hospital / health-center info', 'Referral record history', 'Follow-up tracking']
		},
		{
			icon: Package,
			title: 'Medicine Inventory',
			desc: 'Track the school clinic\u2019s medicine supply, monitor stock levels, and get alerted before items run low or expire.',
			items: ['Clinic medicine list', 'Stock quantity monitoring', 'Low-stock alerts', 'Expiration date tracking']
		},
		{
			icon: Bell,
			title: 'Parent Notifications',
			desc: 'Automatically notify parents and guardians when their child visits the clinic, with the reason and current status.',
			items: ['Instant parent SMS & email', 'Visit reason & status', 'Pickup requests', 'Follow-up reminders']
		}
	];

	const workflowSteps = [
		{ step: '01', title: 'Scan Student ID', desc: 'Student, teacher, or nurse scans the QR code on the ID card to instantly load the student profile.', icon: QrCode },
		{ step: '02', title: 'Record Symptoms & Vitals', desc: 'Nurse logs the chief complaint and vital signs during the clinic visit.', icon: Activity },
		{ step: '03', title: 'AI Assessment', desc: 'System analyzes symptoms, suggests possible illnesses, and flags the severity level.', icon: Brain },
		{ step: '04', title: 'Treat or Refer', desc: 'Administer first aid, give medicine from inventory, or generate a referral form if needed.', icon: FileText },
		{ step: '05', title: 'Notify Parents', desc: 'Parents and guardians are automatically alerted with the visit details and current status.', icon: Bell }
	];

	const faqs = [
		{
			q: 'What is CLINIQAI?',
			a: 'CLINIQAI is an AI-integrated school clinic management system. It helps the school nurse log student clinic visits, get AI-assisted pre-diagnosis and first aid guidance, manage referrals and medicine inventory, and automatically notify parents.'
		},
		{
			q: 'Who uses the system?',
			a: 'Three roles are supported: Clinic Administrators (full oversight of the school clinic), the School Nurse / clinic staff (daily student care and records), and Students / Parents (access records and receive visit updates).'
		},
		{
			q: 'How does the AI pre-diagnosis help the nurse?',
			a: 'It uses a rule-based expert system to analyze a student\u2019s reported symptoms, suggest possible illnesses, and indicate a severity level (Low, Moderate, High) so the nurse can triage quickly. It assists — it never replaces — the nurse\u2019s judgment.'
		},
		{
			q: 'How are parents notified?',
			a: 'When a student visits the clinic, the system automatically sends the parent or guardian an SMS and email with the reason for the visit, the care being given, and the current status — so families are informed right away.'
		},
		{
			q: 'Is student health data secure?',
			a: 'Yes. All records are stored securely in PostgreSQL with role-based access control. Sessions use secure HTTP-only cookies and passwords are hashed with Argon2.'
		},
		{
			q: 'How do QR codes work for students?',
			a: 'Each student ID card carries a unique QR code. Scanning it instantly loads that student\u2019s clinic profile — allergies, conditions, and emergency contacts — with no login needed, which is critical during emergencies.'
		}
	];

	let openFaq = $state<number | null>(null);
	let splashDone = $state(false);

	onDestroy(() => voiceGuide.stop());

	function onSplashEnter() {
		splashDone = true;
	}

	onMount(() => {
		// Respect users who prefer reduced motion
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		let ctx: ReturnType<typeof import('gsap').gsap.context> | undefined;

		(async () => {
			const { gsap } = await import('gsap');
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			gsap.registerPlugin(ScrollTrigger);

			ctx = gsap.context(() => {
			// Hero entrance — staggered reveal on load
			gsap.from('[data-anim="hero"]', {
				y: 32,
				opacity: 0,
				duration: 0.9,
				ease: 'power3.out',
				stagger: 0.12
			});

			// Floating glow behind hero
			gsap.to('[data-anim="hero-glow"]', {
				y: 24,
				scale: 1.08,
				duration: 6,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1
			});

			// Dashboard mockup — rise + subtle 3D tilt as it enters
			gsap.from('[data-anim="mockup"]', {
				y: 32,
				opacity: 0,
				rotateX: 3,
				transformOrigin: 'center bottom',
				duration: 0.8,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: '[data-anim="mockup"]',
					start: 'top 82%',
					once: true
				}
			});

			// Generic section headers fade up
			gsap.utils.toArray<HTMLElement>('[data-anim="section-head"]').forEach((el) => {
				gsap.from(el, {
					y: 20,
					opacity: 0,
					duration: 0.55,
					ease: 'power2.out',
					scrollTrigger: { trigger: el, start: 'top 82%', once: true }
				});
			});

			// Batched card / item reveals with stagger per group
			const groups: string[] = [
				'[data-anim="feature-card"]',
				'[data-anim="inv-mockup"]',
				'[data-anim="inv-item"]',
				'[data-anim="workflow-step"]',
				'[data-anim="faq-item"]'
			];
			groups.forEach((sel) => {
				const items = gsap.utils.toArray<HTMLElement>(sel);
				if (!items.length) return;
				gsap.fromTo(items, {
					y: 24,
					opacity: 0
				}, {
					y: 0,
					opacity: 1,
					duration: 0.55,
					ease: 'power2.out',
					stagger: 0.1,
					immediateRender: false,
					scrollTrigger: { trigger: items[0], start: 'top 82%', once: true }
				});
			});

			// CTA pops in
			gsap.from('[data-anim="cta"]', {
				scale: 0.97,
				opacity: 0,
				duration: 0.55,
				ease: 'power2.out',
				scrollTrigger: { trigger: '[data-anim="cta"]', start: 'top 82%', once: true }
			});
		});
		})();

		return () => ctx?.revert();
	});</script>

<svelte:head>
	<title>CLINIQAI — AI-Integrated Clinic Management System</title>
	<meta name="description" content="Smart clinic management with AI pre-diagnosis, first aid guidance, inventory tracking, referral management and more." />
</svelte:head>

{#if !splashDone}
	<SplashScreen onEnter={onSplashEnter} />
{/if}

<div class="relative min-h-screen bg-background text-foreground transition-opacity duration-700" class:opacity-0={!splashDone} class:pointer-events-none={!splashDone}>
	<!-- Dot pattern -->
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div class="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]" style="background-image: radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px); background-size: 24px 24px;"></div>
	</div>

	<!-- Nav -->
	<nav class="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
			<a href="/" class="flex items-center gap-3">
				<img src="/logo.png" alt="CLINIQAI" class="h-8 w-8 rounded-lg" />
				<span class="text-lg font-bold tracking-tight">CLINIQAI</span>
			</a>
			<div class="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
				<a href="#features" class="transition-colors hover:text-foreground">Features</a>
				<a href="#how-it-works" class="transition-colors hover:text-foreground">How It Works</a>
				<a href="#faq" class="transition-colors hover:text-foreground">FAQ</a>
			</div>
			<div class="flex items-center gap-3">
				<VoiceGuideButton />
				<ThemeSwitcher />
				<a href="/login">
					<Button variant="default" size="sm" class="gap-1.5">
						Sign In
						<ArrowRight class="h-3.5 w-3.5" />
					</Button>
				</a>
			</div>
		</div>
	</nav>

	<!-- Hero -->
	<section class="relative isolate flex min-h-screen items-center overflow-hidden bg-slate-950 text-white">
		<!-- Background image -->
		<img
			src="/images/Tupi-Municipal-Hall-Gradient-ForHeroPage.jpg"
			alt="Tupi Municipal Hall"
			class="absolute inset-0 z-0 h-full w-full object-cover opacity-60"
		/>

		<!-- Gradient overlays for readable text -->
		<div class="absolute inset-0 z-[1] bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/35"></div>
		<div class="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80"></div>
		<div data-anim="hero-glow" class="absolute top-1/4 -left-20 z-[1] h-[500px] w-[600px] rounded-full bg-cyan-400/10 blur-3xl"></div>

		<div class="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-32 md:pt-40">
			<div class="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
				<!-- Left: Text -->
				<div class="flex flex-col justify-center text-center lg:col-span-7 lg:pt-8 lg:text-left">
					<div data-anim="hero" class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md">
						<Sparkles class="h-3.5 w-3.5 text-cyan-300" />
						AI-powered school healthcare
					</div>

					<h1 data-anim="hero" class="mb-7 text-5xl font-medium leading-[0.92] tracking-[-0.055em] text-white drop-shadow-lg sm:text-6xl lg:text-7xl xl:text-8xl">
						Smarter care.<br />
						<span class="bg-gradient-to-br from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">Faster response.</span><br />
						Better outcomes.
					</h1>

					<p data-anim="hero" class="mx-auto mb-9 max-w-xl text-lg leading-relaxed text-slate-300 drop-shadow lg:mx-0">
						One secure platform for instant student identification, AI-assisted triage, medical records, clinic inventory, and parent updates.
					</p>

					<div data-anim="hero" class="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
						<a href="/login">
							<Button class="h-12 rounded-full bg-white px-8 text-sm font-semibold text-slate-950 shadow-xl transition-transform hover:scale-[1.02] hover:bg-slate-100 hover:text-slate-950">
								Get Started
								<ArrowRight class="h-4 w-4" />
							</Button>
						</a>
						<a href="#features">
							<Button variant="outline" class="h-12 rounded-full border-white/15 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:text-white">
								Explore Features
								<ChevronDown class="h-4 w-4" />
							</Button>
						</a>
					</div>
				</div>

				<!-- Right: glass trust cards -->
				<div data-anim="hero" class="relative mx-auto w-full max-w-md space-y-5 lg:col-span-5 lg:mx-0 lg:ml-auto lg:mt-12">
					<div class="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
						<div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl"></div>
						<div class="mb-4 flex items-center gap-2 text-white">
							<div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
								<QrCode class="h-5 w-5 text-white" />
							</div>
							<div>
								<p class="text-2xl font-bold">Under 5 seconds</p>
								<p class="text-xs text-slate-300">to access critical student data</p>
							</div>
							<div class="ml-auto flex h-6 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 text-[10px] font-semibold text-emerald-300">
								<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
								READY
							</div>
						</div>

						<div class="overflow-hidden rounded-2xl border border-white/15 bg-white">
							<img
								src="/images/Juan_Dela_Cruz_QR_Scan.png"
								alt="Student QR code example"
								class="aspect-[16/10] w-full object-contain"
							/>
						</div>

						<div class="mt-6 grid grid-cols-3 divide-x divide-white/10 text-center">
							<div><p class="text-lg font-bold">6+</p><p class="text-[10px] uppercase tracking-wider text-slate-400">Modules</p></div>
							<div><p class="text-lg font-bold">24/7</p><p class="text-[10px] uppercase tracking-wider text-slate-400">Access</p></div>
							<div><p class="text-lg font-bold">100%</p><p class="text-[10px] uppercase tracking-wider text-slate-400">Secure</p></div>
						</div>
					</div>

					<div class="overflow-hidden rounded-3xl border border-white/15 bg-white/10 px-7 py-5 shadow-xl backdrop-blur-xl">
						<p class="mb-4 text-xs font-medium text-slate-400">Built for every care moment</p>
						<div class="grid grid-cols-3 gap-3">
							<div class="flex items-center gap-2 text-xs font-semibold"><HeartPulse class="h-4 w-4 text-rose-300" />Triage</div>
							<div class="flex items-center gap-2 text-xs font-semibold"><Bell class="h-4 w-4 text-amber-300" />Notify</div>
							<div class="flex items-center gap-2 text-xs font-semibold"><ShieldCheck class="h-4 w-4 text-cyan-300" />Protect</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom fade into page background -->
		<div class="absolute bottom-0 left-0 right-0 z-[2] h-24 bg-gradient-to-t from-background to-transparent"></div>
	</section>

	<!-- Dashboard Mockup Preview -->
	<section class="px-6 pb-16 md:pb-24" style="perspective: 1200px;">
		<div class="mx-auto max-w-5xl">
			<div data-anim="mockup" class="overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-2xl backdrop-blur-sm">
				<!-- Browser chrome -->
				<div class="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
					<div class="flex gap-1.5">
						<div class="h-3 w-3 rounded-full bg-red-400"></div>
						<div class="h-3 w-3 rounded-full bg-yellow-400"></div>
						<div class="h-3 w-3 rounded-full bg-green-400"></div>
					</div>
					<div class="mx-auto flex-1 max-w-md rounded-md bg-muted/50 px-3 py-1 text-center text-xs text-muted-foreground">
						cliniqai.app/dashboard
					</div>
				</div>
				<!-- Mockup content -->
				<div class="grid min-h-[320px] md:min-h-[400px] lg:grid-cols-5">
					<!-- Sidebar mockup -->
					<div class="hidden border-r border-border/40 bg-muted/30 p-4 lg:col-span-1 lg:flex lg:flex-col lg:gap-3">
						<div class="mb-2 flex items-center gap-2">
							<div class="flex size-7 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white">C</div>
							<span class="text-xs font-bold text-foreground">CLINIQAI</span>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-950/40">
								<span class="size-1.5 rounded-full bg-blue-500"></span>
								<span class="text-[10px] font-semibold text-blue-700 dark:text-blue-300">Dashboard</span>
							</div>
							<div class="flex items-center gap-2 rounded-md px-3 py-2">
								<span class="size-1.5 rounded-full bg-muted-foreground/40"></span>
								<span class="text-[10px] text-muted-foreground">Students</span>
							</div>
							<div class="flex items-center gap-2 rounded-md px-3 py-2">
								<span class="size-1.5 rounded-full bg-muted-foreground/40"></span>
								<span class="text-[10px] text-muted-foreground">Visits</span>
							</div>
							<div class="flex items-center gap-2 rounded-md px-3 py-2">
								<span class="size-1.5 rounded-full bg-muted-foreground/40"></span>
								<span class="text-[10px] text-muted-foreground">Inventory</span>
							</div>
						</div>
					</div>
					<!-- Main content mockup -->
					<div class="col-span-4 p-6">
						<div class="mb-6 flex items-center justify-between">
							<div>
								<p class="text-sm font-semibold text-foreground">Good morning, Nurse Maria</p>
								<p class="text-xs text-muted-foreground">Tuesday, July 28 · Clinic overview</p>
							</div>
							<div class="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white">+ New Visit</div>
						</div>
						<!-- Stats cards -->
						<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
							{#each [
								{ color: 'bg-blue-500', label: 'Total Students', value: '248' },
								{ color: 'bg-emerald-500', label: "Today's Visits", value: '18' },
								{ color: 'bg-amber-500', label: 'Low Stock Items', value: '5' },
								{ color: 'bg-red-500', label: 'Pending Referrals', value: '3' }
							] as card}
								<div class="rounded-lg border border-border/40 bg-card/50 p-3">
									<div class="mb-2 text-[10px] font-medium text-muted-foreground">{card.label}</div>
									<div class="flex items-center gap-2">
										<div class="h-3 w-3 rounded-full {card.color}"></div>
										<div class="text-lg font-bold">{card.value}</div>
									</div>
									<div class="mt-1 text-[10px] text-muted-foreground">Updated now</div>
								</div>
							{/each}
						</div>
						<!-- Table mockup -->
						<div class="overflow-hidden rounded-lg border border-border/40">
							<div class="grid grid-cols-4 gap-3 bg-muted/40 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Student</span><span>Concern</span><span>Time</span><span>Status</span></div>
							{#each [
								{ student: 'Juan Dela Cruz', concern: 'Headache', time: '10:42 AM', status: 'In care' },
								{ student: 'Mia Santos', concern: 'Minor injury', time: '10:18 AM', status: 'Complete' },
								{ student: 'John Reyes', concern: 'Fever check', time: '9:56 AM', status: 'Monitoring' }
							] as visit}
								<div class="grid grid-cols-4 gap-3 border-t border-border/30 px-3 py-2.5 text-[10px] text-foreground"><span class="font-medium">{visit.student}</span><span class="text-muted-foreground">{visit.concern}</span><span class="text-muted-foreground">{visit.time}</span><span class="text-emerald-600 dark:text-emerald-400">{visit.status}</span></div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="scroll-mt-20 px-6 py-24 md:py-32">
		<div class="mx-auto max-w-6xl">
			<div data-anim="section-head" class="mx-auto mb-16 max-w-2xl text-center">
				<span class="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-500">Core Modules</span>
				<h2 class="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					Everything the school clinic needs
				</h2>
				<p class="mt-4 text-muted-foreground">Six essential modules built for fast, reliable student care</p>
			</div>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each features as feature, i}
					{@const accents = ['from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-600', 'from-cyan-500 to-blue-500']}
					<div data-anim="feature-card" class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg">
						<!-- accent top bar -->
						<div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r {accents[i % accents.length]} opacity-60 group-hover:opacity-100 transition-opacity"></div>
						<div class="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br {accents[i % accents.length]} shadow-lg">
							<feature.icon class="size-5 text-white" />
						</div>
						<h3 class="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
						<p class="mb-4 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
						<ul class="space-y-1.5 border-t border-border/40 pt-4">
							{#each feature.items as item}
								<li class="flex items-center gap-2 text-xs text-muted-foreground">
									<span class="size-1.5 shrink-0 rounded-full bg-blue-500/60"></span>
									{item}
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section id="how-it-works" class="scroll-mt-20 bg-muted/20 px-6 py-24 md:py-32">
		<div class="mx-auto max-w-5xl">
			<div class="mx-auto mb-16 max-w-2xl text-center">
				<span class="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-500">Workflow</span>
				<h2 class="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">How it works</h2>
				<p class="mt-4 text-muted-foreground">From QR scan to parent notification in five simple steps</p>
			</div>

			<div class="grid gap-4 md:grid-cols-5">
				{#each workflowSteps as step, i}
					<div data-anim="workflow-step" class="relative flex flex-col items-center text-center">
						<!-- connector line -->
						{#if i < workflowSteps.length - 1}
							<div class="absolute left-[calc(50%+28px)] top-6 hidden h-px w-[calc(100%-56px)] bg-gradient-to-r from-blue-500/40 to-transparent md:block"></div>
						{/if}
						<div class="relative mb-4 flex size-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
							<step.icon class="size-5 text-white" />
							<span class="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-background text-[9px] font-bold text-blue-500 ring-1 ring-border">{step.step}</span>
						</div>
						<h3 class="mb-1 text-sm font-semibold text-foreground">{step.title}</h3>
						<p class="text-xs text-muted-foreground">{step.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section id="faq" class="scroll-mt-20 bg-muted/20 px-6 py-24 md:py-32">
		<div class="mx-auto max-w-3xl">
			<div class="mx-auto mb-16 max-w-2xl text-center">
				<span class="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-500">FAQ</span>
				<h2 class="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Common questions</h2>
			</div>
			<div class="space-y-2">
				{#each faqs as faq, i}
					<div data-anim="faq-item" class="overflow-hidden rounded-xl border border-border/50 bg-card">
						<button
							class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/40"
							onclick={() => openFaq = openFaq === i ? null : i}
						>
							<span class="text-sm font-semibold text-foreground">{faq.q}</span>
							<ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 {openFaq === i ? 'rotate-180' : ''}" />
						</button>
						{#if openFaq === i}
							<div class="border-t border-border/40 px-5 pb-5 pt-4">
								<p class="text-sm text-muted-foreground">{faq.a}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Inventory Management Showcase -->
	<section class="bg-muted/20 px-6 py-24 md:py-32">
		<div class="mx-auto max-w-6xl">
			<div class="grid gap-12 items-center lg:grid-cols-2 lg:gap-16">
				<!-- Left: Mockup -->
				<div data-anim="inv-mockup" class="rounded-2xl border border-border/60 bg-card/50 shadow-2xl backdrop-blur-sm overflow-hidden">
					<div class="flex items-center gap-2 border-b border-border/40 px-4 py-2.5 bg-muted/30">
						<div class="flex gap-1.5">
							<div class="h-3 w-3 rounded-full bg-red-400"></div>
							<div class="h-3 w-3 rounded-full bg-yellow-400"></div>
							<div class="h-3 w-3 rounded-full bg-green-400"></div>
						</div>
						<div class="mx-auto text-xs text-muted-foreground">Inventory Dashboard</div>
					</div>
					<div class="p-6 space-y-4">
						<!-- Header -->
						<div class="flex items-center justify-between">
							<div>
								<div class="h-5 w-32 rounded bg-foreground/15 mb-2"></div>
								<div class="h-3 w-48 rounded bg-muted-foreground/15"></div>
							</div>
							<div class="h-9 w-28 rounded-md bg-orange-600"></div>
						</div>
						<!-- Inventory Stats -->
						<div class="grid grid-cols-2 gap-3">
							<div class="rounded-lg border border-border/40 bg-muted/30 p-3">
								<div class="h-2 w-16 rounded bg-muted-foreground/20 mb-2"></div>
								<div class="text-sm font-bold">1,247</div>
								<div class="text-xs text-muted-foreground">Total Items</div>
							</div>
							<div class="rounded-lg border border-border/40 bg-muted/30 p-3">
								<div class="h-2 w-16 rounded bg-muted-foreground/20 mb-2"></div>
								<div class="text-sm font-bold text-red-600">12</div>
								<div class="text-xs text-muted-foreground">Low Stock</div>
							</div>
						</div>
						<!-- Inventory Table -->
						<div class="space-y-2">
							<div class="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground px-2 py-1">
								<div>Medicine</div>
								<div>Stock</div>
								<div>Exp. Date</div>
								<div>Status</div>
							</div>
							{#each [
								{ med: 'Paracetamol', stock: '500', exp: '2026-12-15', status: '✓' },
								{ med: 'Amoxicillin', stock: '12', exp: '2026-06-30', status: '⚠' },
								{ med: 'Ibuprofen', stock: '340', exp: '2027-03-20', status: '✓' },
								{ med: 'Cough Syrup', stock: '5', exp: '2026-11-10', status: '⚠' }
							] as row}
								<div class="grid grid-cols-4 gap-2 text-xs rounded px-2 py-2 bg-muted/20 hover:bg-muted/40 border border-border/20">
									<div class="font-medium">{row.med}</div>
									<div>{row.stock}</div>
									<div class="text-muted-foreground">{row.exp}</div>
									<div class="font-semibold {row.status === '✓' ? 'text-green-600' : 'text-orange-600'}">{row.status}</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Right: Features -->
				<div>
					<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">Inventory Management</p>
					<h2 class="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						Real-time stock control
					</h2>
					<p class="mb-8 text-muted-foreground">
						Comprehensive medicine inventory management with automatic alerts and expiration tracking.
					</p>

					<div class="space-y-4">
						<div data-anim="inv-item" class="flex gap-4">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-sm flex-shrink-0">
								<ClipboardList class="h-5 w-5 text-white" />
							</div>
							<div>
								<h4 class="font-semibold text-foreground mb-1">Medicine Inventory List</h4>
								<p class="text-sm text-muted-foreground">Complete catalog of all medicines with detailed information including batch numbers, supplier details, and purchase dates.</p>
							</div>
						</div>

						<div data-anim="inv-item" class="flex gap-4">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm flex-shrink-0">
								<Activity class="h-5 w-5 text-white" />
							</div>
							<div>
								<h4 class="font-semibold text-foreground mb-1">Stock Quantity Monitoring</h4>
								<p class="text-sm text-muted-foreground">Real-time tracking of medicine quantities with visual indicators. Instantly see which items are running low or overstocked.</p>
							</div>
						</div>

						<div data-anim="inv-item" class="flex gap-4">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-pink-600 shadow-sm flex-shrink-0">
								<AlertTriangle class="h-5 w-5 text-white" />
							</div>
							<div>
								<h4 class="font-semibold text-foreground mb-1">Low-Stock Alerts</h4>
								<p class="text-sm text-muted-foreground">Automatic notifications when medicine quantities fall below minimum thresholds. Never run out of critical supplies.</p>
							</div>
						</div>

						<div data-anim="inv-item" class="flex gap-4">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm flex-shrink-0">
								<Calendar class="h-5 w-5 text-white" />
							</div>
							<div>
								<h4 class="font-semibold text-foreground mb-1">Expiration Date Tracking</h4>
								<p class="text-sm text-muted-foreground">Automatic tracking of expiration dates with alerts for items nearing expiry — so the clinic never gives out expired medicine to a student.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="px-6 pb-20 text-center md:pb-32">
		<div data-anim="cta" class="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 p-8 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-xl md:p-12">
			<div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/8 blur-3xl"></div>
			<div class="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
			<h2 class="relative mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
				Ready to modernize your school clinic?
			</h2>
			<p class="relative mx-auto mb-8 max-w-md text-sm text-slate-300">
				Log student visits, get AI-assisted triage, track medicine, and keep parents informed — all in one platform.
			</p>
			<a href="/login" class="relative inline-block">
				<Button class="h-11 gap-2 bg-white px-8 text-slate-950 hover:bg-slate-100">
					<Lock class="h-4 w-4" />
					Sign In
					<ArrowRight class="h-4 w-4" />
				</Button>
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-border/60 px-6 py-12">
		<div class="mx-auto max-w-6xl">
			<div class="grid gap-8 md:grid-cols-4">
				<!-- Brand -->
				<div class="md:col-span-1">
					<div class="mb-3 flex items-center gap-2">
						<img src="/logo.png" alt="CLINIQAI" class="h-7 w-7 rounded" />
						<span class="text-base font-bold">CLINIQAI</span>
					</div>
					<p class="text-xs text-muted-foreground">
						AI-Integrated School Clinic Management System for student health records, pre-diagnosis, first aid, and parent notifications.
					</p>
				</div>

				<!-- Product -->
				<div>
					<h4 class="mb-3 text-sm font-semibold text-foreground">Product</h4>
					<ul class="space-y-2 text-xs text-muted-foreground">
						<li><a href="#features" class="transition-colors hover:text-foreground">Features</a></li>
						<li><a href="#how-it-works" class="transition-colors hover:text-foreground">How It Works</a></li>
						<li><a href="#faq" class="transition-colors hover:text-foreground">FAQ</a></li>
					</ul>
				</div>

				<!-- Modules -->
				<div>
					<h4 class="mb-3 text-sm font-semibold text-foreground">Modules</h4>
					<ul class="space-y-2 text-xs text-muted-foreground">
						<li><span>Student Health Records</span></li>
						<li><span>AI Pre-Diagnosis</span></li>
						<li><span>First Aid Guidance</span></li>
						<li><span>Referral Management</span></li>
						<li><span>Medicine Inventory</span></li>
						<li><span>Parent Notifications</span></li>
					</ul>
				</div>

				<!-- Access -->
				<div>
					<h4 class="mb-3 text-sm font-semibold text-foreground">Access</h4>
					<ul class="space-y-2 text-xs text-muted-foreground">
						<li><a href="/login" class="transition-colors hover:text-foreground">Sign In</a></li>
						<li><span>Clinic Administrator</span></li>
						<li><span>School Nurse / Staff</span></li>
						<li><span>Student / Parent</span></li>
					</ul>
				</div>
			</div>

			<div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
				<p class="text-xs text-muted-foreground">
					&copy; 2026 CLINIQAI. All rights reserved.
				</p>
				<div class="flex items-center gap-4 text-xs text-muted-foreground">
					<span class="flex items-center gap-1.5">
						<ShieldCheck class="h-3 w-3 text-emerald-500" />
						Secure & Encrypted
					</span>
					<span class="flex items-center gap-1.5">
						<QrCode class="h-3 w-3 text-blue-500" />
						QR Enabled
					</span>
				</div>
			</div>
		</div>
	</footer>
</div>

<FirstAidChat />
