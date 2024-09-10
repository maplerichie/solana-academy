import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { SolanaAcademy } from '../target/types/solana_academy';
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  Keypair,
  PublicKey,
} from '@solana/web3.js';

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

  const academyName: string = 'My test academy';
  const courseName: string = 'My academy course';
  const courseFee: number = 1 * LAMPORTS_PER_SOL;
  const program = anchor.workspace.SolanaAcademy as Program<SolanaAcademy>;

  const admin = Keypair.generate();
  const academy = Keypair.generate();
  const course = Keypair.generate();
  const student = Keypair.generate();

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
  });

  it('Initializes the Academy', async () => {
    const tx = await program.methods
      .initializeAcademy(academyName, new anchor.BN(courseFee))
      .accounts({
        academy: academy.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin, academy])
      .rpc();

    console.log('Init Academy Tx signature:', tx);

    const academyState = await program.account.academy.fetch(academy.publicKey);
    console.log('academy data structure', academyState);

    expect(academyState.name).toBe(academyName);
    expect(academyState.admin.toString()).toBe(admin.publicKey.toString());
    expect(academyState.courseCount.toNumber()).toBe(0);
  });

  it('Creates a course', async () => {
    const currentTime = Math.floor(Date.now() / 1000);

    const courseData: CourseData = {
      name: courseName,
      description: 'Sol dev course',
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

    console.log('Create course Tx signature:', tx);

    const courseState = await program.account.course.fetch(course.publicKey);
    console.log('Course onchain representation:', courseState);
    const academyState = await program.account.academy.fetch(academy.publicKey);

    expect(courseState.id.toNumber()).toBe(
      academyState.courseCount.toNumber() - 1
    );
    expect(courseState.name).toBe(courseName);
    expect(courseState.description).toBe(courseData.description);
    expect(courseState.startDate.toNumber()).toBe(currentTime);
    expect(courseState.endDate.toNumber()).toBe(
      currentTime + COURSE_DURATION_IN_SECONDS
    );
    expect(courseState.tuitionFee.toNumber()).toBe(courseFee);
    expect(academyState.courseCount.toNumber()).toBe(1);
  });

  it('Enrolls a Student in the Course', async () => {
    const courseId = new anchor.BN(0);

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

    const [enrollmentPDA] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from('enrollment'),
        course.publicKey.toBuffer(),
        student.publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log('Enrollment PDA:', enrollmentPDA.toBase58());

    const tx = await program.methods
      .enrollInCourse(courseId)
      .accounts({
        academy: academy.publicKey,
        course: course.publicKey,
        enrollment: enrollmentPDA,
        student: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();

    console.log('Enroll in Course Tx signature:', tx);

    const enrollmentState = await program.account.enrollment.fetch(enrollmentPDA);
    console.log("Enrollment onchain representation:", enrollmentState);

    expect(enrollmentState.student.toString()).toBe(student.publicKey.toString());
    expect(enrollmentState.course.toString()).toBe(course.publicKey.toString());
    expect(enrollmentState.completed.toString()).toBe("false");

    const courseState = await program.account.course.fetch(course.publicKey);
    expect(courseState.enrollmentCount.toNumber()).toBe(1);
  });
});
