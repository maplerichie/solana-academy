import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { SolanaAcademy } from '../target/types/solana_academy';
import { LAMPORTS_PER_SOL, PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID,  } from "@solana/spl-token";


const { SystemProgram } = anchor.web3;

describe('Solana Academy', () => {

  //NOTE: This seems to require that the ANCHOR_WALLET var be set locally 
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(anchor.AnchorProvider.local());

  const academyName: String = "My test academy";
  const courseName: String = "My academy course";
  /* const courseFee: Number  = 1 * anchor.web3.LAMPORTS_PER_SOL; */
  const courseFee: Number = 1000;


  const program = anchor.workspace.SolanaAcademy as Program<SolanaAcademy>;
  const admin = anchor.web3.Keypair.generate();
  const academy = anchor.web3.Keypair.generate();

  //TODO: what about turning courses into PDAs?
  const course = anchor.web3.Keypair.generate();


  beforeAll(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        admin.publicKey,
        10 * LAMPORTS_PER_SOL
      )
    );
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

    let academyState = await program.account.academy.fetch(academy.publicKey);

    console.log("academy data structure", academyState);

    expect(academyState.name).toBe(academyName);
    expect(academyState.admin.toString()).toBe(admin.publicKey.toString());
    expect(academyState.courseCount.toNumber()).toBe(0);
  });

  it('Creates a course', async () => {

    console.log("entering the create a course test block");

    const academyState = await program.account.academy.fetch(academy.publicKey);
    
    const courseData = {
      name: courseName,
      description: "Sol dev course",
      start_date: new anchor.BN(1000),
      end_date: new anchor.BN((Date.now() / 1000) + (42 * 24 * 60 * 60)),
      tuition_fee: courseFee,
    };

    let const1 = Buffer.from("mint");

    console.log("const 1", const1);

    let const2 = academy.publicKey.toBytes();

    console.log("const 2", const2);

    //simplified PDA, should also include the course-count to be secure I think
    const [mintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("mint"),
        Buffer.from(academy.publicKey.toBytes())
      ],
      program.programId
    );

    console.log("mintpda ", mintPda);

    const tx = await program.methods
      .createCourse(courseData)
      .accounts({
        academy: academy.publicKey,
        course: course.publicKey,
        mint: mintPda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([admin, course])
      .rpc();

    console.log("Create course Tx signature:", tx);

    let courseState = await program.account.course.fetch(course.publicKey);

    console.log("Course onchain representation", courseState);

    //FIXME TODO: figure out why the numbers are not serializing/converting correctly
    expect(courseState.id.toNumber()).toBe(academyState.courseCount.toNumber() - 1)
    expect(courseState.name).toBe(courseName);
    expect(courseState.description).toBe(courseData.description);
    expect(academyState.courseCount.toNumber()).toBe(1);
    /* expect(courseState.startDate.toNumber()).toBe(startDate) */
    /* expect(courseState.endDate.toNumber()).toBe(startDate) */
    /* expect(courseState.tuitionFee.toNumber()).toBe(courseFee); */
   
  });
});


