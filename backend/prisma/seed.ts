import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash.util";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================================================
  // USERS
  // ============================================================================

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@talenthive.com",
      password: await hashPassword("Admin123!"),
      firstName: "Admin",
      lastName: "TalentHive",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // 2. Recruiters
  const sara = await prisma.user.create({
    data: {
      email: "sara@talenthive.com",
      password: await hashPassword("Sara123!"),
      firstName: "Sara",
      lastName: "Rossi",
      role: "RECRUITER",
    },
  });
  console.log("✅ Recruiter created:", sara.email);

  const marco = await prisma.user.create({
    data: {
      email: "marco@talenthive.com",
      password: await hashPassword("Marco123!"),
      firstName: "Marco",
      lastName: "Bianchi",
      role: "RECRUITER",
    },
  });
  console.log("✅ Recruiter created:", marco.email);

  // 3. Candidates
  const mario = await prisma.user.create({
    data: {
      email: "mario@example.com",
      password: await hashPassword("Mario123!"),
      firstName: "Mario",
      lastName: "Verdi",
      role: "CANDIDATE",
    },
  });
  console.log("✅ Candidate created:", mario.email);

  const giulia = await prisma.user.create({
    data: {
      email: "giulia@example.com",
      password: await hashPassword("Giulia123!"),
      firstName: "Giulia",
      lastName: "Neri",
      role: "CANDIDATE",
    },
  });
  console.log("✅ Candidate created:", giulia.email);

  const luca = await prisma.user.create({
    data: {
      email: "luca@example.com",
      password: await hashPassword("Luca123!"),
      firstName: "Luca",
      lastName: "Russo",
      role: "CANDIDATE",
    },
  });
  console.log("✅ Candidate created:", luca.email);

  // ============================================================================
  // JOBS
  // ============================================================================

  const jobReact = await prisma.job.create({
    data: {
      title: "Senior React Developer",
      description:
        "We are looking for an experienced React developer with 5+ years of experience. Must have strong knowledge of React 18+, TypeScript, and modern frontend tooling (Vite, Webpack). Experience with state management (Redux, Zustand) and testing frameworks is required.",
      status: "PUBLISHED",
      location: "Milan - HQ",
      salaryRange: "€50k-€70k",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created:", jobReact.title);

  const jobBackend = await prisma.job.create({
    data: {
      title: "Backend Engineer (Node.js)",
      description:
        "Join our backend team! We need a skilled Node.js developer with experience in Express, PostgreSQL, and RESTful API design. Knowledge of Docker and CI/CD pipelines is a plus.",
      status: "PUBLISHED",
      location: "Remote",
      salaryRange: "€45k-€65k",
      createdById: marco.id,
    },
  });
  console.log("✅ Job created:", jobBackend.title);

  const jobFullstack = await prisma.job.create({
    data: {
      title: "Fullstack Developer",
      description:
        "Hybrid role covering both frontend (React) and backend (Node.js). Perfect for T-shaped developers who love working across the stack. We offer flexible working hours and remote options.",
      status: "PUBLISHED",
      location: "New York Office",
      salaryRange: "$80k-$110k",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created:", jobFullstack.title);

  const jobDevOps = await prisma.job.create({
    data: {
      title: "DevOps Engineer",
      description:
        "Looking for a DevOps engineer to manage our cloud infrastructure on AWS. Experience with Kubernetes, Terraform, and CI/CD automation required.",
      status: "DRAFT",
      location: "Remote",
      salaryRange: "€55k-€75k",
      createdById: marco.id,
    },
  });
  console.log("✅ Job created (DRAFT):", jobDevOps.title);

  const jobUX = await prisma.job.create({
    data: {
      title: "UX/UI Designer",
      description:
        "Creative designer needed to craft beautiful, user-friendly interfaces. Strong portfolio required. Experience with Figma and design systems is essential.",
      status: "ARCHIVED",
      location: "Milan - HQ",
      salaryRange: "€40k-€55k",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created (ARCHIVED):", jobUX.title);

  // ============================================================================
  // APPLICATIONS
  // ============================================================================

  // Scenario 1: Mario applies to React job - Currently in INTERVIEW
  await prisma.application.create({
    data: {
      jobId: jobReact.id,
      userId: mario.id,
      workflowStatus: "INTERVIEW",
      finalDecision: null,
      cvUrl: "cvs/mario-verdi/senior-react-dev.pdf",
      coverLetter:
        "I'm a passionate React developer with 6 years of experience. I've built multiple large-scale applications using React, TypeScript, and modern tooling. My portfolio includes e-commerce platforms and SaaS products.",
      score: 4,
      notes:
        "Strong technical background. Portfolio looks impressive. Schedule technical interview.",
    },
  });
  console.log("✅ Application: Mario → React (INTERVIEW)");

  // Scenario 2: Giulia applies to React job - HIRED!
  await prisma.application.create({
    data: {
      jobId: jobReact.id,
      userId: giulia.id,
      workflowStatus: "DONE",
      finalDecision: "HIRED",
      cvUrl: "cvs/giulia-neri/senior-react-dev.pdf",
      coverLetter:
        "Experienced frontend architect with a focus on performance and scalability. Led teams of 5+ developers in previous roles.",
      score: 5,
      notes:
        "Excellent technical interview. Very strong React knowledge. Team fit perfect. HIRE!",
    },
  });
  console.log("✅ Application: Giulia → React (HIRED)");

  // Scenario 3: Luca applies to Backend - REJECTED (lacks PostgreSQL experience)
  await prisma.application.create({
    data: {
      jobId: jobBackend.id,
      userId: luca.id,
      workflowStatus: "DONE",
      finalDecision: "REJECTED",
      cvUrl: "cvs/luca-russo/backend-engineer.pdf",
      coverLetter:
        "I'm a Node.js developer with 2 years of experience. I've worked mainly with MongoDB and Express.",
      score: 2,
      notes:
        "Lacks PostgreSQL experience which is critical for our stack. Profile too junior for this role.",
    },
  });
  console.log("✅ Application: Luca → Backend (REJECTED)");

  // Scenario 4: Mario also applies to Fullstack - NEW (just submitted)
  await prisma.application.create({
    data: {
      jobId: jobFullstack.id,
      userId: mario.id,
      workflowStatus: "NEW",
      finalDecision: null,
      cvUrl: "cvs/mario-verdi/fullstack-developer.pdf",
      coverLetter:
        "I have experience with both React and Node.js. I've built several fullstack applications from scratch.",
    },
  });
  console.log("✅ Application: Mario → Fullstack (NEW)");

  // Scenario 5: Luca applies to Fullstack - SCREENING
  await prisma.application.create({
    data: {
      jobId: jobFullstack.id,
      userId: luca.id,
      workflowStatus: "SCREENING",
      finalDecision: null,
      cvUrl: "cvs/luca-russo/fullstack-developer.pdf",
      coverLetter:
        "Looking for a hybrid role where I can learn both frontend and backend technologies.",
      notes: "CV under review. Some potential, needs more evaluation.",
    },
  });
  console.log("✅ Application: Luca → Fullstack (SCREENING)");

  // Scenario 6: Giulia applies to Backend - OFFER stage
  await prisma.application.create({
    data: {
      jobId: jobBackend.id,
      userId: giulia.id,
      workflowStatus: "OFFER",
      finalDecision: null,
      cvUrl: "cvs/giulia-neri/backend-engineer.pdf",
      coverLetter:
        "While I specialize in frontend, I have solid Node.js experience from fullstack projects.",
      score: 4,
      notes:
        "Very strong candidate. Passed technical interview. Preparing offer.",
    },
  });
  console.log("✅ Application: Giulia → Backend (OFFER)");

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   - Admins: 1`);
  console.log(`   - Recruiters: 2`);
  console.log(`   - Candidates: 3`);
  console.log(`   Jobs: ${await prisma.job.count()}`);
  console.log(`   - Published: 3`);
  console.log(`   - Draft: 1`);
  console.log(`   - Archived: 1`);
  console.log(`   Applications: ${await prisma.application.count()}`);
  console.log(
    `   - In Progress: ${await prisma.application.count({
      where: { workflowStatus: { not: "DONE" } },
    })}`
  );
  console.log(
    `   - Hired: ${await prisma.application.count({
      where: { finalDecision: "HIRED" },
    })}`
  );
  console.log(
    `   - Rejected: ${await prisma.application.count({
      where: { finalDecision: "REJECTED" },
    })}`
  );

  console.log("\n🔐 Login Credentials:");
  console.log("   Admin: admin@talenthive.com / Admin123!");
  console.log("   Recruiter (Sara): sara@talenthive.com / Sara123!");
  console.log("   Recruiter (Marco): marco@talenthive.com / Marco123!");
  console.log("   Candidate (Mario): mario@example.com / Mario123!");
  console.log("   Candidate (Giulia): giulia@example.com / Giulia123!");
  console.log("   Candidate (Luca): luca@example.com / Luca123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
