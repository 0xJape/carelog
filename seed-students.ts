import { db } from './src/lib/server/db';
import { students, emergencyContacts, clinicVisits, users } from './src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Get a doctor/nurse from the users table to assign to students
async function getDoctorId() {
	const doctor = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
	return doctor[0]?.id || null;
}

async function seedStudents() {
	console.log('🌱 Starting to seed students...');

	const doctorId = await getDoctorId();
	console.log('👨‍⚕️ Using doctor ID:', doctorId);

	// 12 Filipino students with consistent ID format: 2023-XXXX
	const studentsData = [
		{
			studentId: '2023-1001',
			qrCodeId: 'QR-2023-1001',
			firstName: 'Maria',
			lastName: 'Santos',
			middleName: 'Cruz',
			email: 'maria.santos@tnhs.com',
			dateOfBirth: new Date('2008-03-15'),
			gender: 'female' as const,
			grade: 'Grade 11',
			section: 'STEM-A',
			address: '123 Rizal Street, Barangay San Jose, General Santos City',
			chronicHealthConditions: ['Asthma'],
			currentMedications: ['Salbutamol Inhaler 100mcg'],
			healthHistory: 'Diagnosed with asthma at age 7. Experiences occasional shortness of breath during physical activities.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Roberto Santos',
					relationship: 'parent' as const,
					phoneNumber: '09171234567',
					alternatePhone: '09281234567',
					email: 'roberto.santos@gmail.com',
					address: '123 Rizal Street, Barangay San Jose, General Santos City',
					isPrimary: true,
					priority: 1
				},
				{
					name: 'Elena Santos',
					relationship: 'parent' as const,
					phoneNumber: '09171234568',
					email: 'elena.santos@gmail.com',
					address: '123 Rizal Street, Barangay San Jose, General Santos City',
					isPrimary: false,
					priority: 2
				}
			]
		},
		{
			studentId: '2023-1002',
			qrCodeId: 'QR-2023-1002',
			firstName: 'Juan',
			lastName: 'Dela Cruz',
			middleName: 'Reyes',
			email: 'juan.delacruz@tnhs.com',
			dateOfBirth: new Date('2007-07-22'),
			gender: 'male' as const,
			grade: 'Grade 12',
			section: 'ABM-B',
			address: '456 Bonifacio Avenue, Barangay Fatima, General Santos City',
			chronicHealthConditions: ['Type 1 Diabetes'],
			currentMedications: ['Insulin Glargine 10 units', 'Metformin 500mg'],
			healthHistory: 'Type 1 Diabetes diagnosed at age 10. Requires regular blood sugar monitoring and insulin injections.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Carmen Dela Cruz',
					relationship: 'parent' as const,
					phoneNumber: '09182345678',
					alternatePhone: '09292345678',
					email: 'carmen.delacruz@yahoo.com',
					address: '456 Bonifacio Avenue, Barangay Fatima, General Santos City',
					isPrimary: true,
					priority: 1
				}
			]
		},
		{
			studentId: '2023-1003',
			qrCodeId: 'QR-2023-1003',
			firstName: 'Sofia',
			lastName: 'Garcia',
			middleName: 'Mendoza',
			email: 'sofia.garcia@tnhs.com',
			dateOfBirth: new Date('2008-11-08'),
			gender: 'female' as const,
			grade: 'Grade 11',
			section: 'HUMSS-A',
			address: '789 Mabini Street, Barangay Calumpang, General Santos City',
			chronicHealthConditions: ['Allergic Rhinitis'],
			currentMedications: ['Cetirizine 10mg', 'Nasal Spray'],
			healthHistory: 'Allergic to dust, pollen, and pet dander. Experiences frequent sneezing and nasal congestion.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Miguel Garcia',
					relationship: 'parent' as const,
					phoneNumber: '09193456789',
					email: 'miguel.garcia@gmail.com',
					address: '789 Mabini Street, Barangay Calumpang, General Santos City',
					isPrimary: true,
					priority: 1
				},
				{
					name: 'Luz Garcia',
					relationship: 'parent' as const,
					phoneNumber: '09193456790',
					email: 'luz.garcia@gmail.com',
					address: '789 Mabini Street, Barangay Calumpang, General Santos City',
					isPrimary: false,
					priority: 2
				}
			]
		},
		{
			studentId: '2023-1004',
			qrCodeId: 'QR-2023-1004',
			firstName: 'Miguel',
			lastName: 'Ramos',
			middleName: 'Torres',
			email: 'miguel.ramos@tnhs.com',
			dateOfBirth: new Date('2008-05-30'),
			gender: 'male' as const,
			grade: 'Grade 11',
			section: 'STEM-B',
			address: '321 Luna Street, Barangay Dadiangas North, General Santos City',
			chronicHealthConditions: [],
			currentMedications: [],
			healthHistory: 'No known chronic conditions. Generally healthy with regular checkups.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Angelica Ramos',
					relationship: 'parent' as const,
					phoneNumber: '09204567890',
					alternatePhone: '09314567890',
					email: 'angelica.ramos@yahoo.com',
					address: '321 Luna Street, Barangay Dadiangas North, General Santos City',
					isPrimary: true,
					priority: 1
				}
			]
		},
		{
			studentId: '2023-1005',
			qrCodeId: 'QR-2023-1005',
			firstName: 'Isabella',
			lastName: 'Fernandez',
			middleName: 'Aquino',
			email: 'isabella.fernandez@tnhs.com',
			dateOfBirth: new Date('2007-09-12'),
			gender: 'female' as const,
			grade: 'Grade 12',
			section: 'GAS-A',
			address: '654 Del Pilar Street, Barangay Lagao, General Santos City',
			chronicHealthConditions: ['Migraine', 'Anxiety'],
			currentMedications: ['Sumatriptan 50mg as needed', 'Escitalopram 10mg'],
			healthHistory: 'Experiences frequent migraines triggered by stress and bright lights. Also managing anxiety disorder.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Fernando Fernandez',
					relationship: 'parent' as const,
					phoneNumber: '09215678901',
					email: 'fernando.fernandez@gmail.com',
					address: '654 Del Pilar Street, Barangay Lagao, General Santos City',
					isPrimary: true,
					priority: 1
				},
				{
					name: 'Rosa Fernandez',
					relationship: 'parent' as const,
					phoneNumber: '09215678902',
					email: 'rosa.fernandez@gmail.com',
					address: '654 Del Pilar Street, Barangay Lagao, General Santos City',
					isPrimary: false,
					priority: 2
				}
			]
		},
		{
			studentId: '2023-1006',
			qrCodeId: 'QR-2023-1006',
			firstName: 'Gabriel',
			lastName: 'Villanueva',
			middleName: 'Santiago',
			email: 'gabriel.villanueva@tnhs.com',
			dateOfBirth: new Date('2008-01-25'),
			gender: 'male' as const,
			grade: 'Grade 11',
			section: 'TVL-ICT',
			address: '987 Quezon Avenue, Barangay Bula, General Santos City',
			chronicHealthConditions: ['Hypertension'],
			currentMedications: ['Losartan 50mg', 'Amlodipine 5mg'],
			healthHistory: 'Diagnosed with hypertension at age 15. Requires regular blood pressure monitoring and lifestyle modifications.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Patricia Villanueva',
					relationship: 'parent' as const,
					phoneNumber: '09226789012',
					alternatePhone: '09336789012',
					email: 'patricia.villanueva@yahoo.com',
					address: '987 Quezon Avenue, Barangay Bula, General Santos City',
					isPrimary: true,
					priority: 1
				}
			]
		},
		{
			studentId: '2023-1007',
			qrCodeId: 'QR-2023-1007',
			firstName: 'Camila',
			lastName: 'Morales',
			middleName: 'Bautista',
			email: 'camila.morales@tnhs.com',
			dateOfBirth: new Date('2008-06-18'),
			gender: 'female' as const,
			grade: 'Grade 11',
			section: 'STEM-A',
			address: '147 Magsaysay Street, Barangay Apopong, General Santos City',
			chronicHealthConditions: ['Epilepsy'],
			currentMedications: ['Levetiracetam 500mg twice daily'],
			healthHistory: 'Diagnosed with epilepsy at age 12. Last seizure was 6 months ago. Requires medication compliance.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Ricardo Morales',
					relationship: 'parent' as const,
					phoneNumber: '09237890123',
					email: 'ricardo.morales@gmail.com',
					address: '147 Magsaysay Street, Barangay Apopong, General Santos City',
					isPrimary: true,
					priority: 1
				},
				{
					name: 'Teresa Morales',
					relationship: 'parent' as const,
					phoneNumber: '09237890124',
					email: 'teresa.morales@gmail.com',
					address: '147 Magsaysay Street, Barangay Apopong, General Santos City',
					isPrimary: false,
					priority: 2
				}
			]
		},
		{
			studentId: '2023-1008',
			qrCodeId: 'QR-2023-1008',
			firstName: 'Diego',
			lastName: 'Castro',
			middleName: 'Navarro',
			email: 'diego.castro@tnhs.com',
			dateOfBirth: new Date('2007-12-03'),
			gender: 'male' as const,
			grade: 'Grade 12',
			section: 'ABM-A',
			address: '258 Roxas Boulevard, Barangay Siguel, General Santos City',
			chronicHealthConditions: ['Food Allergies'],
			currentMedications: ['EpiPen (emergency)', 'Antihistamine as needed'],
			healthHistory: 'Severe allergies to peanuts, shellfish, and eggs. Carries EpiPen at all times. Requires careful meal planning.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Marissa Castro',
					relationship: 'parent' as const,
					phoneNumber: '09248901234',
					alternatePhone: '09358901234',
					email: 'marissa.castro@yahoo.com',
					address: '258 Roxas Boulevard, Barangay Siguel, General Santos City',
					isPrimary: true,
					priority: 1
				}
			]
		},
		{
			studentId: '2023-1009',
			qrCodeId: 'QR-2023-1009',
			firstName: 'Valentina',
			lastName: 'Reyes',
			middleName: 'Domingo',
			email: 'valentina.reyes@tnhs.com',
			dateOfBirth: new Date('2008-04-27'),
			gender: 'female' as const,
			grade: 'Grade 11',
			section: 'HUMSS-B',
			address: '369 Osmena Street, Barangay City Heights, General Santos City',
			chronicHealthConditions: ['Scoliosis'],
			currentMedications: ['Pain reliever as needed'],
			healthHistory: 'Mild scoliosis diagnosed at age 13. Undergoes physical therapy and wears back brace during activities.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Antonio Reyes',
					relationship: 'parent' as const,
					phoneNumber: '09259012345',
					email: 'antonio.reyes@gmail.com',
					address: '369 Osmena Street, Barangay City Heights, General Santos City',
					isPrimary: true,
					priority: 1
				},
				{
					name: 'Gloria Reyes',
					relationship: 'parent' as const,
					phoneNumber: '09259012346',
					email: 'gloria.reyes@gmail.com',
					address: '369 Osmena Street, Barangay City Heights, General Santos City',
					isPrimary: false,
					priority: 2
				}
			]
		},
		{
			studentId: '2023-1010',
			qrCodeId: 'QR-2023-1010',
			firstName: 'Lucas',
			lastName: 'Mendoza',
			middleName: 'Flores',
			email: 'lucas.mendoza@tnhs.com',
			dateOfBirth: new Date('2008-08-14'),
			gender: 'male' as const,
			grade: 'Grade 11',
			section: 'TVL-HE',
			address: '741 Laurel Street, Barangay Tambler, General Santos City',
			chronicHealthConditions: ['ADHD'],
			currentMedications: ['Methylphenidate 10mg'],
			healthHistory: 'Diagnosed with ADHD at age 9. Requires structured environment and medication for focus and attention.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Beatriz Mendoza',
					relationship: 'parent' as const,
					phoneNumber: '09260123456',
					alternatePhone: '09370123456',
					email: 'beatriz.mendoza@yahoo.com',
					address: '741 Laurel Street, Barangay Tambler, General Santos City',
					isPrimary: true,
					priority: 1
				}
			]
		},
		{
			studentId: '2023-1011',
			qrCodeId: 'QR-2023-1011',
			firstName: 'Gabriela',
			lastName: 'Pascual',
			middleName: 'Salazar',
			email: 'gabriela.pascual@tnhs.com',
			dateOfBirth: new Date('2007-10-09'),
			gender: 'female' as const,
			grade: 'Grade 12',
			section: 'STEM-C',
			address: '852 Aguinaldo Avenue, Barangay Conel, General Santos City',
			chronicHealthConditions: ['Anemia'],
			currentMedications: ['Ferrous Sulfate 325mg', 'Vitamin C 500mg'],
			healthHistory: 'Iron deficiency anemia diagnosed at age 14. Requires iron supplementation and dietary modifications.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Eduardo Pascual',
					relationship: 'parent' as const,
					phoneNumber: '09271234567',
					email: 'eduardo.pascual@gmail.com',
					address: '852 Aguinaldo Avenue, Barangay Conel, General Santos City',
					isPrimary: true,
					priority: 1
				},
				{
					name: 'Cristina Pascual',
					relationship: 'parent' as const,
					phoneNumber: '09271234568',
					email: 'cristina.pascual@gmail.com',
					address: '852 Aguinaldo Avenue, Barangay Conel, General Santos City',
					isPrimary: false,
					priority: 2
				}
			]
		},
		{
			studentId: '2023-1012',
			qrCodeId: 'QR-2023-1012',
			firstName: 'Rafael',
			lastName: 'Gutierrez',
			middleName: 'Velasco',
			email: 'rafael.gutierrez@tnhs.com',
			dateOfBirth: new Date('2008-02-20'),
			gender: 'male' as const,
			grade: 'Grade 11',
			section: 'GAS-B',
			address: '963 Burgos Street, Barangay Tinagacan, General Santos City',
			chronicHealthConditions: [],
			currentMedications: [],
			healthHistory: 'No known chronic conditions. Participates actively in sports. Regular health checkups show good overall health.',
			doctorId,
			enrollmentDate: new Date('2023-08-15'),
			emergencyContacts: [
				{
					name: 'Josefina Gutierrez',
					relationship: 'parent' as const,
					phoneNumber: '09282345678',
					alternatePhone: '09392345678',
					email: 'josefina.gutierrez@yahoo.com',
					address: '963 Burgos Street, Barangay Tinagacan, General Santos City',
					isPrimary: true,
					priority: 1
				}
			]
		}
	];

	// Insert students and their emergency contacts
	for (const studentData of studentsData) {
		try {
			const { emergencyContacts: contacts, ...studentInfo } = studentData;

			// Insert student
			const [insertedStudent] = await db
				.insert(students)
				.values(studentInfo)
				.returning();

			console.log(`✅ Created student: ${insertedStudent.firstName} ${insertedStudent.lastName} (${insertedStudent.studentId})`);

			// Insert emergency contacts
			for (const contact of contacts) {
				await db.insert(emergencyContacts).values({
					...contact,
					studentId: insertedStudent.id
				});
			}

			console.log(`   📞 Added ${contacts.length} emergency contact(s)`);
		} catch (error) {
			console.error(`❌ Error creating student ${studentData.studentId}:`, error);
		}
	}

	console.log('\n🎉 Seeding completed!');
	console.log(`📊 Total students created: ${studentsData.length}`);
}

// Run the seed function
seedStudents()
	.then(() => {
		console.log('✨ All done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('💥 Seeding failed:', error);
		process.exit(1);
	});
