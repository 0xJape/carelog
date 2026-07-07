<script lang="ts">
	import { onMount } from 'svelte';
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Activity,
		ArrowRight,
		Brain,
		Calendar,
		CheckCircle2,
		ClipboardList,
		ChevronDown,
		HeartPulse,
		Lock,
		Monitor,
		QrCode,
		Shield,
		Users,
		Bell,
		Sparkles,
		Zap,
		Stethoscope,
		Database,
		Server,
		ShieldCheck,
		Cpu,
		AlertTriangle,
		Package,
		Mail,
		FileText,
		UserPlus,
		Search,
		ChevronRight
	} from '@lucide/svelte';

	const features = [
		{
			icon: ClipboardList,
			title: 'Medical Logging',
			desc: 'Comprehensive patient records with consultation history, vital signs tracking, and secure medical history storage.',
			items: ['Patient registration & profiles', 'Vital signs recording', 'Consultation records', 'Medical history storage']
		},
		{
			icon: Brain,
			title: 'AI Pre-Diagnosis',
			desc: 'Rule-based expert system for symptom assessment with severity indication and possible illness suggestions.',
			items: ['Symptom input form', 'AI symptom analysis', 'Illness suggestions', 'Severity levels: Low / Moderate / High']
		},
		{
			icon: HeartPulse,
			title: 'First Aid Guidance',
			desc: 'Automated first-aid recommendation engine with step-by-step emergency instructions and warning messages.',
			items: ['Symptom-based recommendations', 'Step-by-step instructions', 'Emergency warnings', 'Critical alerts']
		},
		{
			icon: Users,
			title: 'Referral Management',
			desc: 'Generate referral forms, recommend hospitals or clinics, and maintain complete referral record history.',
			items: ['Referral form generation', 'Hospital recommendations', 'Referral record storage', 'Tracking & follow-up']
		},
		{
			icon: Package,
			title: 'Inventory Management',
			desc: 'Real-time medicine stock monitoring, expiration date tracking, and automated low-stock alerts.',
			items: ['Medicine inventory list', 'Stock quantity monitoring', 'Low-stock alerts', 'Expiration date tracking']
		},
		{
			icon: Bell,
			title: 'Smart Notifications',
			desc: 'Appointment reminders, follow-up alerts, restocking notifications, and referral status updates.',
			items: ['Appointment reminders', 'Follow-up reminders', 'Restocking alerts', 'Referral notifications']
		}
	];

	const workflowSteps = [
		{ step: '01', title: 'Register Patient', desc: 'Quick registration via form or QR code scan for instant profile creation.', icon: UserPlus },
		{ step: '02', title: 'Check-In & Vitals', desc: 'Record vital signs and chief complaint during clinic visit.', icon: Activity },
		{ step: '03', title: 'AI Assessment', desc: 'System analyzes symptoms and suggests possible diagnoses with severity levels.', icon: Brain },
		{ step: '04', title: 'Treatment & Referral', desc: 'Administer first aid, prescribe medication, or generate referral forms.', icon: FileText },
		{ step: '05', title: 'Notify & Follow-Up', desc: 'Automated notifications sent to parents, staff, and follow-up scheduling.', icon: Bell }
	];

	const techStack = [
		{ name: 'SvelteKit', desc: 'Framework', icon: Cpu },
		{ name: 'TypeScript', desc: 'Language', icon: ShieldCheck },
		{ name: 'PostgreSQL', desc: 'Database', icon: Database },
		{ name: 'Drizzle ORM', desc: 'Query Builder', icon: Server },
		{ name: 'Tailwind CSS', desc: 'Styling', icon: Monitor },
		{ name: 'Vercel', desc: 'Hosting', icon: Zap }
	];

	const faqs = [
		{
			q: 'What is CLINIQAI?',
			a: 'CLINIQAI is an AI-integrated clinic management system designed for medical logging, first aid guidance, pre-diagnosis, referral management, inventory tracking, and automated notifications.'
		},
		{
			q: 'Who can use the system?',
			a: 'Three user roles are supported: Clinic Administrators (full system oversight), Nurses/Clinic Staff (patient care & daily operations), and Patients (access records & receive updates).'
		},
		{
			q: 'How does the AI pre-diagnosis work?',
			a: 'The system uses a rule-based expert system combined with machine learning models to analyze symptoms, suggest possible illnesses, and indicate severity levels (Low, Moderate, High).'
		},
		{
			q: 'Can it send notifications automatically?',
			a: 'Yes. The system automatically sends appointment reminders, follow-up reminders, medicine restocking alerts, and referral notifications via email.'
		},
		{
			q: 'Is patient data secure?',
			a: 'All data is stored securely in PostgreSQL with role-based access control. Session management uses secure HTTP-only cookies with Argon2 password hashing.'
		},
		{
			q: 'Does it support QR codes?',
			a: 'Yes. Patients can be identified instantly via QR code scanning, enabling quick check-in and instant access to their medical records.'
		}
	];

	let openFaq = $state<number | null>(null);

	const stats = [
		{ label: 'Modules', value: '6+' },
		{ label: 'User Roles', value: '3' },
		{ label: 'AI Components', value: '3' },
		{ label: 'Uptime', value: '99.9%' }
	];

	const benefits = [
		'Secure role-based access for admins, nurses, and patients',
		'Real-time dashboards with analytics and insights',
		'QR code integration for instant patient identification',
		'Automated email and notification system',
		'Fully responsive design across all devices'
	];

	onMount(() => {
		// Play homepage voice guide
		const audio = new Audio('/audio/homepage.mp3');
		audio.volume = 0.85;
		audio.play().catch(() => {});

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
				y: 60,
				opacity: 0,
				rotateX: 8,
				transformOrigin: 'center bottom',
				duration: 1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: '[data-anim="mockup"]',
					start: 'top 85%'
				}
			});

			// Generic section headers fade up
			gsap.utils.toArray<HTMLElement>('[data-anim="section-head"]').forEach((el) => {
				gsap.from(el, {
					y: 28,
					opacity: 0,
					duration: 0.7,
					ease: 'power2.out',
					scrollTrigger: { trigger: el, start: 'top 88%' }
				});
			});

			// Stats count-up
			gsap.utils.toArray<HTMLElement>('[data-anim="stat-value"]').forEach((el) => {
				const raw = el.dataset.value ?? el.textContent ?? '';
				const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
				if (Number.isNaN(num)) return;
				const suffix = raw.replace(/[0-9.]/g, '');
				const obj = { val: 0 };
				gsap.to(obj, {
					val: num,
					duration: 1.6,
					ease: 'power2.out',
					scrollTrigger: { trigger: el, start: 'top 90%' },
					onUpdate: () => {
						const isFloat = raw.includes('.');
						el.textContent = (isFloat ? obj.val.toFixed(1) : Math.round(obj.val).toString()) + suffix;
					}
				});
			});

			// Batched card / item reveals with stagger per group
			const groups: string[] = [
				'[data-anim="feature-card"]',
				'[data-anim="inv-mockup"]',
				'[data-anim="inv-item"]',
				'[data-anim="workflow-step"]',
				'[data-anim="benefit"]',
				'[data-anim="role"]',
				'[data-anim="ai-card"]',
				'[data-anim="tech-card"]',
				'[data-anim="faq-item"]'
			];
			groups.forEach((sel) => {
				const items = gsap.utils.toArray<HTMLElement>(sel);
				if (!items.length) return;
				gsap.from(items, {
					y: 36,
					opacity: 0,
					duration: 0.6,
					ease: 'power2.out',
					stagger: 0.1,
					scrollTrigger: { trigger: items[0], start: 'top 88%' }
				});
			});

			// CTA pops in
			gsap.from('[data-anim="cta"]', {
				scale: 0.94,
				opacity: 0,
				duration: 0.7,
				ease: 'back.out(1.4)',
				scrollTrigger: { trigger: '[data-anim="cta"]', start: 'top 85%' }
			});
		});
		})();

		return () => ctx?.revert();
	});</script>

<svelte:head>
	<title>CLINIQAI — AI-Integrated Clinic Management System</title>
	<meta name="description" content="Smart clinic management with AI pre-diagnosis, first aid guidance, inventory tracking, referral management and more." />
</svelte:head>

<div class="relative min-h-screen bg-background text-foreground">
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
				<a href="#tech" class="transition-colors hover:text-foreground">Tech Stack</a>
				<a href="#faq" class="transition-colors hover:text-foreground">FAQ</a>
			</div>
			<div class="flex items-center gap-3">
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
	<section class="relative overflow-hidden px-6 pt-28 pb-20 md:pt-36 md:pb-28">
		<div data-anim="hero-glow" class="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-cyan-500/20 blur-3xl dark:from-blue-600/15 dark:via-indigo-600/10 dark:to-cyan-600/15"></div>

		<div class="relative mx-auto max-w-4xl text-center">
			<div data-anim="hero" class="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-medium shadow-sm">
				<Sparkles class="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
				Powered by AI & Rule-Based Expert Systems
			</div>

			<h1 data-anim="hero" class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
				Smart Clinic
				<span class="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
					Management
				</span>
			</h1>

			<p data-anim="hero" class="mx-auto mb-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
				A comprehensive AI-integrated platform for medical logging, pre-diagnosis, first aid guidance, referrals, inventory, and notifications.
			</p>

			<p data-anim="hero" class="mx-auto mb-10 max-w-xl text-sm text-muted-foreground/80">
				Designed for clinic administrators, nurses, and patients — streamlining healthcare operations with intelligent automation.
			</p>

			<div data-anim="hero" class="flex flex-col items-center justify-center gap-3 sm:flex-row">
				<a href="/login">
					<Button class="h-12 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-base font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30">
						Get Started
						<ArrowRight class="h-4 w-4" />
					</Button>
				</a>
				<a href="#features">
					<Button variant="outline" class="h-12 gap-2 px-8">
						Explore Features
						<ChevronDown class="h-4 w-4" />
					</Button>
				</a>
			</div>
		</div>
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
							<div class="h-6 w-6 rounded bg-blue-600"></div>
							<div class="h-3 w-16 rounded bg-muted-foreground/20"></div>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-950/40">
								<div class="h-4 w-4 rounded bg-blue-500"></div>
								<div class="h-2 w-12 rounded bg-muted-foreground/20"></div>
							</div>
							<div class="flex items-center gap-2 rounded-md px-3 py-2">
								<div class="h-4 w-4 rounded bg-muted-foreground/15"></div>
								<div class="h-2 w-12 rounded bg-muted-foreground/15"></div>
							</div>
							<div class="flex items-center gap-2 rounded-md px-3 py-2">
								<div class="h-4 w-4 rounded bg-muted-foreground/15"></div>
								<div class="h-2 w-12 rounded bg-muted-foreground/15"></div>
							</div>
							<div class="flex items-center gap-2 rounded-md px-3 py-2">
								<div class="h-4 w-4 rounded bg-muted-foreground/15"></div>
								<div class="h-2 w-12 rounded bg-muted-foreground/15"></div>
							</div>
						</div>
					</div>
					<!-- Main content mockup -->
					<div class="col-span-4 p-6">
						<div class="mb-6 flex items-center justify-between">
							<div>
								<div class="mb-2 h-5 w-32 rounded bg-foreground/15"></div>
								<div class="h-3 w-48 rounded bg-muted-foreground/15"></div>
							</div>
							<div class="h-9 w-28 rounded-md bg-blue-600"></div>
						</div>
						<!-- Stats cards -->
						<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
							{#each [
								{ color: 'bg-blue-500', label: 'Total Patients', value: '248' },
								{ color: 'bg-emerald-500', label: "Today's Visits", value: '18' },
								{ color: 'bg-amber-500', label: 'Low Stock Items', value: '5' },
								{ color: 'bg-red-500', label: 'Pending Referrals', value: '3' }
							] as card}
								<div class="rounded-lg border border-border/40 bg-card/50 p-3">
									<div class="mb-2 h-2 w-16 rounded bg-muted-foreground/20"></div>
									<div class="flex items-center gap-2">
										<div class="h-3 w-3 rounded-full {card.color}"></div>
										<div class="text-lg font-bold">{card.value}</div>
									</div>
									<div class="mt-1 text-[10px] text-muted-foreground">{card.label}</div>
								</div>
							{/each}
						</div>
						<!-- Table mockup -->
						<div class="space-y-2">
							<div class="h-3 w-24 rounded bg-muted-foreground/20"></div>
							{#each [1, 2, 3, 4] as _}
								<div class="grid grid-cols-4 gap-3 rounded-md border border-border/20 px-3 py-2">
									<div class="h-2 rounded bg-muted-foreground/10"></div>
									<div class="h-2 rounded bg-muted-foreground/10"></div>
									<div class="h-2 w-12 rounded bg-muted-foreground/10"></div>
									<div class="h-2 w-16 rounded bg-muted-foreground/10"></div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats bar -->
	<section class="px-6 pb-16 md:pb-24">
		<div class="mx-auto max-w-3xl rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm">
			<div class="grid grid-cols-2 gap-6 md:grid-cols-4">
				{#each stats as stat}
					<div class="text-center">
						<div data-anim="stat-value" data-value={stat.value} class="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</div>
						<div class="text-xs text-muted-foreground">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="scroll-mt-20 px-6 py-20 md:py-28">
		<div class="mx-auto max-w-6xl">
			<div data-anim="section-head" class="mx-auto mb-14 max-w-2xl text-center">
				<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Core Modules</p>
				<h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					Everything your clinic needs
				</h2>
				<p class="mt-3 text-muted-foreground">
					Six essential modules designed for modern healthcare operations
				</p>
			</div>

			<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#each features as feature}
					<div data-anim="feature-card" class="group relative rounded-xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-md">
						<div class="mb-4 inline-flex rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 dark:from-blue-950/50 dark:to-indigo-950/50">
							<feature.icon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<h3 class="mb-1.5 text-base font-semibold text-foreground">
							{feature.title}
						</h3>
						<p class="mb-4 text-sm leading-relaxed text-muted-foreground">
							{feature.desc}
						</p>
						<ul class="space-y-1.5">
							{#each feature.items as item}
								<li class="flex items-center gap-2 text-xs text-muted-foreground">
									<ChevronRight class="h-3 w-3 flex-shrink-0 text-blue-500" />
									{item}
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Inventory Management Showcase -->
	<section class="px-6 py-20 md:py-28">
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
								<p class="text-sm text-muted-foreground">Automatic tracking of expiration dates with alerts for items nearing expiry. Maintain compliance and patient safety.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section id="how-it-works" class="scroll-mt-20 px-6 py-20 md:py-28">
		<div class="mx-auto max-w-4xl">
			<div class="mx-auto mb-14 max-w-2xl text-center">
				<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Workflow</p>
				<h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					How it works
				</h2>
				<p class="mt-3 text-muted-foreground">
					From patient check-in to automated follow-up in five simple steps
				</p>
			</div>

			<div class="space-y-6">
				{#each workflowSteps as step, i}
					<div data-anim="workflow-step" class="flex items-start gap-6">
						<div class="flex flex-col items-center">
							<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
								<step.icon class="h-5 w-5 text-white" />
							</div>
							{#if i < workflowSteps.length - 1}
								<div class="mt-2 h-12 w-px bg-gradient-to-b from-border to-transparent"></div>
							{/if}
						</div>
						<div class="pt-1">
							<div class="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
								Step {step.step}
							</div>
							<h3 class="mb-1 text-lg font-semibold text-foreground">{step.title}</h3>
							<p class="text-sm text-muted-foreground">{step.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Benefits + Users -->
	<section class="px-6 py-20 md:py-28">
		<div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
			<!-- Benefits -->
			<div>
				<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Why CLINIQAI</p>
				<h2 class="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
					Built for efficiency
				</h2>

				<div class="space-y-4">
					{#each benefits as benefit}
						<div data-anim="benefit" class="flex items-start gap-3">
							<CheckCircle2 class="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
							<p class="text-sm text-muted-foreground">{benefit}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- User roles -->
			<div class="rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm">
				<h3 class="mb-6 text-lg font-semibold text-foreground">
					Designed for
				</h3>

				<div class="space-y-4">
					<div data-anim="role" class="flex items-center gap-4 rounded-lg border border-border/40 p-4 transition-colors hover:bg-accent/50">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
							<Shield class="h-5 w-5 text-white" />
						</div>
						<div>
							<p class="text-sm font-semibold text-foreground">Clinic Administrator</p>
							<p class="text-xs text-muted-foreground">Full system oversight & staff management</p>
						</div>
					</div>

					<div data-anim="role" class="flex items-center gap-4 rounded-lg border border-border/40 p-4 transition-colors hover:bg-accent/50">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
							<Stethoscope class="h-5 w-5 text-white" />
						</div>
						<div>
							<p class="text-sm font-semibold text-foreground">Nurse / Clinic Staff</p>
							<p class="text-xs text-muted-foreground">Patient care, vitals & daily operations</p>
						</div>
					</div>

					<div data-anim="role" class="flex items-center gap-4 rounded-lg border border-border/40 p-4 transition-colors hover:bg-accent/50">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
							<HeartPulse class="h-5 w-5 text-white" />
						</div>
						<div>
							<p class="text-sm font-semibold text-foreground">Patient</p>
							<p class="text-xs text-muted-foreground">Access records, view history & receive updates</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- AI Engine -->
	<section class="px-6 py-20 md:py-28">
		<div class="mx-auto max-w-4xl">
			<div class="rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-cyan-50/80 p-8 backdrop-blur-sm dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-cyan-950/30 md:p-12">
				<div class="text-center">
					<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">AI Engine</p>
					<h2 class="mb-8 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
						Intelligent automation
					</h2>

					<div class="grid gap-4 sm:grid-cols-3">
						<div data-anim="ai-card" class="rounded-xl bg-white/70 p-5 shadow-sm dark:bg-slate-800/60">
							<Brain class="mx-auto mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
							<h3 class="mb-1 text-sm font-semibold text-foreground">Rule-Based Expert System</h3>
							<p class="text-xs text-muted-foreground">Symptom assessment & analysis</p>
						</div>
						<div data-anim="ai-card" class="rounded-xl bg-white/70 p-5 shadow-sm dark:bg-slate-800/60">
							<Zap class="mx-auto mb-3 h-6 w-6 text-amber-600 dark:text-amber-400" />
							<h3 class="mb-1 text-sm font-semibold text-foreground">Machine Learning</h3>
							<p class="text-xs text-muted-foreground">Pre-diagnosis pattern recognition</p>
						</div>
						<div data-anim="ai-card" class="rounded-xl bg-white/70 p-5 shadow-sm dark:bg-slate-800/60">
							<Activity class="mx-auto mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
							<h3 class="mb-1 text-sm font-semibold text-foreground">Recommendation Engine</h3>
							<p class="text-xs text-muted-foreground">Automated first-aid suggestions</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Tech Stack -->
	<section id="tech" class="scroll-mt-20 px-6 py-20 md:py-28">
		<div class="mx-auto max-w-4xl">
			<div class="mx-auto mb-14 max-w-2xl text-center">
				<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Technology</p>
				<h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					Built with modern tools
				</h2>
			</div>

			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
				{#each techStack as tech}
					<div data-anim="tech-card" class="rounded-xl border border-border/60 bg-card/50 p-4 text-center backdrop-blur-sm transition-colors hover:bg-accent/50">
						<tech.icon class="mx-auto mb-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
						<p class="text-sm font-semibold text-foreground">{tech.name}</p>
						<p class="text-xs text-muted-foreground">{tech.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section id="faq" class="scroll-mt-20 px-6 py-20 md:py-28">
		<div class="mx-auto max-w-3xl">
			<div class="mx-auto mb-14 max-w-2xl text-center">
				<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">FAQ</p>
				<h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					Common questions
				</h2>
			</div>

			<div class="space-y-3">
				{#each faqs as faq, i}
					<div data-anim="faq-item" class="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm">
						<button
							class="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-accent/50"
							onclick={() => openFaq = openFaq === i ? null : i}
						>
							<span class="text-sm font-semibold text-foreground">{faq.q}</span>
							<ChevronDown class="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 {openFaq === i ? 'rotate-180' : ''}" />
						</button>
						{#if openFaq === i}
							<div class="border-t border-border/40 px-5 pb-5">
								<p class="pt-4 text-sm text-muted-foreground">{faq.a}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="px-6 pb-20 text-center md:pb-32">
		<div data-anim="cta" class="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-cyan-50/80 p-8 backdrop-blur-sm dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-cyan-950/30 md:p-12">
			<h2 class="mb-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
				Ready to streamline your clinic?
			</h2>
			<p class="mx-auto mb-8 max-w-md text-sm text-muted-foreground">
				Start managing patient records, AI pre-diagnosis, inventory, and more — all in one platform.
			</p>
			<a href="/login">
				<Button class="h-11 gap-2 px-8">
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
						AI-Integrated Clinic Management System for medical logging, pre-diagnosis, and healthcare operations.
					</p>
				</div>

				<!-- Product -->
				<div>
					<h4 class="mb-3 text-sm font-semibold text-foreground">Product</h4>
					<ul class="space-y-2 text-xs text-muted-foreground">
						<li><a href="#features" class="transition-colors hover:text-foreground">Features</a></li>
						<li><a href="#how-it-works" class="transition-colors hover:text-foreground">How It Works</a></li>
						<li><a href="#tech" class="transition-colors hover:text-foreground">Tech Stack</a></li>
						<li><a href="#faq" class="transition-colors hover:text-foreground">FAQ</a></li>
					</ul>
				</div>

				<!-- Modules -->
				<div>
					<h4 class="mb-3 text-sm font-semibold text-foreground">Modules</h4>
					<ul class="space-y-2 text-xs text-muted-foreground">
						<li><span>Medical Logging</span></li>
						<li><span>AI Pre-Diagnosis</span></li>
						<li><span>First Aid Guidance</span></li>
						<li><span>Referral Management</span></li>
						<li><span>Inventory</span></li>
						<li><span>Notifications</span></li>
					</ul>
				</div>

				<!-- Access -->
				<div>
					<h4 class="mb-3 text-sm font-semibold text-foreground">Access</h4>
					<ul class="space-y-2 text-xs text-muted-foreground">
						<li><a href="/login" class="transition-colors hover:text-foreground">Sign In</a></li>
						<li><span>Clinic Administrator</span></li>
						<li><span>Nurse / Staff</span></li>
						<li><span>Patient Portal</span></li>
					</ul>
				</div>
			</div>

			<div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
				<p class="text-xs text-muted-foreground">
					&copy; 2025 CLINIQAI. All rights reserved.
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
