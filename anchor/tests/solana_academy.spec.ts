import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { SolanaAcademy } from '../target/types/solana_academy';
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo
} from '@solana/spl-token';

const COURSE_DURATION_IN_SECONDS = 42 * 24 * 60 * 60;

interface CourseData {
  name: string;
  description: string;
  startDate: anchor.BN;
  endDate: anchor.BN;
  tuitionFee: anchor.BN;
}

describe('Solana Academy', () => {

  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const academyName: string = "My test academy";
  const courseName: string = "My academy course";
  const courseFee: number = 1 * LAMPORTS_PER_SOL;
  const program = anchor.workspace.SolanaAcademy as Program<SolanaAcademy>;

  const admin = Keypair.generate();
  const academy = Keypair.generate();
  const course = Keypair.generate();
  const student = Keypair.generate();

  let studentNftMint: PublicKey;
  let studentTokenAccount: PublicKey;

  // Initialize test environment with admin airdrop
  beforeAll(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        admin.publicKey,
        10 * LAMPORTS_PER_SOL
      )
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        student.publicKey,
        10 * LAMPORTS_PER_SOL
      )
    );

    studentNftMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      0
    )

    studentTokenAccount = await createAccount(
      provider.connection,
      admin,
      studentNftMint,
      student.publicKey,
    )

  });

  it('Initializes the Academy', async () => {

    const tx = await program.methods
      .initializeAcademy(academyName)
      .accounts({
        academy: academy.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin, academy])
      .rpc();

    console.log("Init Academy Tx signature:", tx);

    const academyState = await program.account.academy.fetch(academy.publicKey);
    console.log("academy data structure", academyState);

    expect(academyState.name).toBe(academyName);
    expect(academyState.admin.toString()).toBe(admin.publicKey.toString());
    expect(academyState.courseCount.toNumber()).toBe(0);
  });

  it('Enrolls a Student in the Academy', async () => {

    // Fetch academy state to get course count
    const academyState = await program.account.academy.fetch(academy.publicKey);
    const payment = academyState.enrollmentFee.toNumber();

    console.log(`The enrollment fee is `, payment);

    const tx = await program.methods
      .enrollStudentInAcademy(new anchor.BN(payment))
      .accounts({
        academy: academy.publicKey,
        student: student.publicKey,
        studentNftMint: studentNftMint,
        studentTokenAccount: studentTokenAccount,
        admin: admin.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([student, admin])
      .rpc();

    console.log('Enroll in Course Tx signature:', tx);

    const academyStateUpdated = await program.account.academy.fetch(academy.publicKey);

    expect(academyStateUpdated.name).toBe(academyName);
    expect(academyStateUpdated.admin.toString()).toBe(admin.publicKey.toString());
    expect(academyStateUpdated.courseCount.toNumber()).toBe(0);
    expect(academyStateUpdated.studentCounter.toNumber()).toBe(1);
  });

  it('Creates a course', async () => {
    const currentTime = Math.floor(Date.now() / 1000);

    const courseData: CourseData = {
      name: courseName,
      description: "Sol dev course",
      startDate: new anchor.BN(currentTime),
      endDate: new anchor.BN(currentTime + COURSE_DURATION_IN_SECONDS),
      tuitionFee: new anchor.BN(courseFee),
    };

    const tx = await program.methods
      .createCourse(courseData)
      .accounts({
        academy: academy.publicKey,
        course: course.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin, course])
      .rpc();

    console.log("Create course Tx signature:", tx);

    const courseState = await program.account.course.fetch(course.publicKey);
    console.log("Course onchain representation:", courseState);

    const academyState = await program.account.academy.fetch(academy.publicKey);

    expect(courseState.id.toNumber()).toBe(academyState.courseCount.toNumber() - 1);
    expect(courseState.name).toBe(courseName);
    expect(courseState.description).toBe(courseData.description);
    expect(courseState.startDate.toNumber()).toBe(currentTime);
    expect(courseState.endDate.toNumber()).toBe(currentTime + COURSE_DURATION_IN_SECONDS);
    expect(courseState.tuitionFee.toNumber()).toBe(courseFee);
    expect(academyState.courseCount.toNumber()).toBe(1);
  });

  it('Enrolls a Student in the Course', async () => {

    // Fetch academy state to get course count
    const academyState = await program.account.academy.fetch(academy.publicKey);
    let courseId: anchor.BN;

    if (academyState.courseCount.toNumber() > 0) {
      // Get the most recent course ID by subtracting 1 from the total count
      courseId = new anchor.BN(academyState.courseCount.toNumber() - 1);
      console.log(`Enrolling in course ID: ${courseId.toString()}`);
    } else {
      throw new Error("No courses available for enrollment.");
    }

    const [enrollmentPDA, bump] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from('enrollment'),
        course.publicKey.toBuffer(),
        student.publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log('Enrollment PDA:', enrollmentPDA.toBase58())

    const tx = await program.methods
      .enrollInCourse(courseId)
      .accounts({
        academy: academy.publicKey,
        course: course.publicKey,
        enrollment: enrollmentPDA,
        student: student.publicKey,
        admin: admin.publicKey,
        studentTokenAccount: studentTokenAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([student, admin])
      .rpc();

    console.log("Enroll in Course Tx signature:", tx);

    const enrollmentState = await program.account.enrollment.fetch(enrollmentPDA);
    console.log("Enrollment onchain representation:", enrollmentState);

    expect(enrollmentState.student.toString()).toBe(student.publicKey.toString());
    expect(enrollmentState.course.toString()).toBe(course.publicKey.toString());
    expect(enrollmentState.completed.toString()).toBe("false");
  });
});