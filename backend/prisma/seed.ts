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
      salaryMin: 50000,
      salaryMax: 70000,
      salaryCurrency: "EUR",
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
      salaryMin: 45000,
      salaryMax: 65000,
      salaryCurrency: "EUR",
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
      salaryMin: 80000,
      salaryMax: 110000,
      salaryCurrency: "USD",
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
      salaryMin: 55000,
      salaryMax: 75000,
      salaryCurrency: "EUR",
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
      salaryMin: 40000,
      salaryMax: 55000,
      salaryCurrency: "EUR",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created (ARCHIVED):", jobUX.title);

  // ============================================================================
  // ADDITIONAL JOBS (NO CANDIDATES)
  // ============================================================================

  const jobMobile = await prisma.job.create({
    data: {
      title: "Senior Mobile Developer (React Native)",
      description:
        "Build cross-platform mobile applications using React Native. Experience with Expo, native modules, and app store deployment required. Knowledge of iOS and Android ecosystems is a plus.",
      status: "PUBLISHED",
      location: "Remote",
      salaryMin: 55000,
      salaryMax: 80000,
      salaryCurrency: "EUR",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created:", jobMobile.title);

  const jobDataScientist = await prisma.job.create({
    data: {
      title: "Data Scientist",
      description:
        "Analyze large datasets and build predictive models. Strong Python skills required, experience with TensorFlow, PyTorch, and SQL. Must have excellent communication skills to present findings to stakeholders.",
      status: "PUBLISHED",
      location: "Berlin Office",
      salaryMin: 60000,
      salaryMax: 90000,
      salaryCurrency: "EUR",
      createdById: marco.id,
    },
  });
  console.log("✅ Job created:", jobDataScientist.title);

  const jobSecurityEngineer = await prisma.job.create({
    data: {
      title: "Security Engineer",
      description:
        "Protect our infrastructure and applications from security threats. Experience with penetration testing, OWASP, and security audits required. Certifications like CISSP or CEH are a plus.",
      status: "PUBLISHED",
      location: "London Office",
      salaryMin: 70000,
      salaryMax: 100000,
      salaryCurrency: "GBP",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created:", jobSecurityEngineer.title);

  const jobProductManager = await prisma.job.create({
    data: {
      title: "Technical Product Manager",
      description:
        "Lead product development from ideation to launch. Work closely with engineering, design, and business teams. Experience with agile methodologies and technical background required.",
      status: "PUBLISHED",
      location: "Milan - HQ",
      salaryMin: 55000,
      salaryMax: 75000,
      salaryCurrency: "EUR",
      createdById: marco.id,
    },
  });
  console.log("✅ Job created:", jobProductManager.title);

  const jobQAEngineer = await prisma.job.create({
    data: {
      title: "QA Engineer",
      description:
        "Ensure quality of our software products through manual and automated testing. Experience with Cypress, Playwright, or Selenium required. Strong attention to detail essential.",
      status: "PUBLISHED",
      location: "Remote",
      salaryMin: 40000,
      salaryMax: 55000,
      salaryCurrency: "EUR",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created:", jobQAEngineer.title);

  const jobMLEngineer = await prisma.job.create({
    data: {
      title: "Machine Learning Engineer",
      description:
        "Design and deploy ML models at scale. Experience with MLOps, Kubernetes, and cloud platforms (AWS/GCP). Strong Python and deep learning frameworks knowledge required.",
      status: "PUBLISHED",
      location: "Amsterdam Office",
      salaryMin: 75000,
      salaryMax: 110000,
      salaryCurrency: "EUR",
      createdById: marco.id,
    },
  });
  console.log("✅ Job created:", jobMLEngineer.title);

  const jobTechLead = await prisma.job.create({
    data: {
      title: "Tech Lead - Platform Team",
      description:
        "Lead a team of 5-8 engineers building our core platform. Hands-on coding expected (50%). Must have strong architectural skills and experience mentoring developers.",
      status: "PUBLISHED",
      location: "Milan - HQ",
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: "EUR",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created:", jobTechLead.title);

  const jobSRE = await prisma.job.create({
    data: {
      title: "Site Reliability Engineer",
      description:
        "Maintain high availability of our services. Experience with monitoring (Prometheus, Grafana), incident management, and automation. On-call rotation required.",
      status: "DRAFT",
      location: "Remote",
      salaryMin: 60000,
      salaryMax: 85000,
      salaryCurrency: "EUR",
      createdById: marco.id,
    },
  });
  console.log("✅ Job created (DRAFT):", jobSRE.title);

  const jobFrontendJunior = await prisma.job.create({
    data: {
      title: "Junior Frontend Developer",
      description:
        "Great opportunity for developers starting their career. Must have basic knowledge of HTML, CSS, JavaScript, and React. We provide mentorship and training.",
      status: "PUBLISHED",
      location: "Milan - HQ",
      salaryMin: 28000,
      salaryMax: 35000,
      salaryCurrency: "EUR",
      createdById: sara.id,
    },
  });
  console.log("✅ Job created:", jobFrontendJunior.title);

  const jobCloudArchitect = await prisma.job.create({
    data: {
      title: "Cloud Solutions Architect",
      description:
        "Design and implement cloud-native solutions on AWS. Must have AWS certifications (Solutions Architect Professional preferred). Experience with multi-region deployments required.",
      status: "PUBLISHED",
      location: "Frankfurt Office",
      salaryMin: 90000,
      salaryMax: 130000,
      salaryCurrency: "EUR",
      createdById: marco.id,
    },
  });
  console.log("✅ Job created:", jobCloudArchitect.title);

  // ============================================================================
  // TEST CV UPLOAD (for seed applications)
  // ============================================================================

  console.log("📄 Loading and uploading test CV to MinIO...");

  // Read test CV from file
  const fs = await import("fs/promises");
  const path = await import("path");

  const cvFilePath = path.join(__dirname, "seed-data", "dummy-cv.pdf");

  let testCvBuffer: Buffer;
  try {
    testCvBuffer = await fs.readFile(cvFilePath);
    console.log(`✅ Test CV loaded from: ${cvFilePath}`);
  } catch (error) {
    console.error(`❌ Error reading CV file from ${cvFilePath}`);
    console.error(
      "Please add a dummy-cv.pdf file to backend/prisma/seed-data/",
    );
    throw error;
  }

  const testCvPath = "cvs/seed-test/dummy-cv.pdf";

  // Upload to MinIO
  const { storageService } = await import("../src/services/storage.service");
  const cvUrl = await storageService.uploadFile(
    testCvBuffer,
    testCvPath,
    "application/pdf",
  );

  console.log(`✅ Test CV uploaded to MinIO: ${cvUrl}`);

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
      cvUrl: cvUrl,
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
      cvUrl: cvUrl,
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
      cvUrl: cvUrl,
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
      cvUrl: cvUrl,
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
      cvUrl: cvUrl,
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
      cvUrl: cvUrl,
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
  console.log(
    `   - Published: ${await prisma.job.count({ where: { status: "PUBLISHED" } })}`,
  );
  console.log(
    `   - Draft: ${await prisma.job.count({ where: { status: "DRAFT" } })}`,
  );
  console.log(
    `   - Archived: ${await prisma.job.count({ where: { status: "ARCHIVED" } })}`,
  );
  console.log(`   Applications: ${await prisma.application.count()}`);
  console.log(
    `   - In Progress: ${await prisma.application.count({
      where: { workflowStatus: { not: "DONE" } },
    })}`,
  );
  console.log(
    `   - Hired: ${await prisma.application.count({
      where: { finalDecision: "HIRED" },
    })}`,
  );
  console.log(
    `   - Rejected: ${await prisma.application.count({
      where: { finalDecision: "REJECTED" },
    })}`,
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
