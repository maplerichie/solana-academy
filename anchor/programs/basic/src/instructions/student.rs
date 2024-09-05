use crate::error::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct EnrollInCourse<'info> {
    #[account(mut)]
    pub academy: Account<'info, Academy>,
    #[account(mut)]
    pub course: Account<'info, Course>,
    #[account(
        init,
        payer = student,
        space = Enrollment::LEN,
        seeds = [b"enrollment", course.key().as_ref(), student.key().as_ref()],
        bump
    )]
    pub enrollment: Account<'info, Enrollment>,
    #[account(mut)]
    pub student: Signer<'info>,
    #[account(mut)]
    pub admin: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn enroll_in_course(ctx: Context<EnrollInCourse>, course_id: u64) -> Result<()> {
    let course = &mut ctx.accounts.course;
    let enrollment = &mut ctx.accounts.enrollment;
    let student = &mut ctx.accounts.student;
    let admin = &mut ctx.accounts.admin;

    if course.id != course_id {
        return Err(AcademyError::InvalidCourseId.into());
    }

    //TODO: probably need a check that the course owner is the admin

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &student.key(),
        &admin.key(),
        course.tuition_fee
    );

    msg!("***created the tx ix***");

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            student.to_account_info(),
            admin.to_account_info(),
        ],
    )?;

    msg!("***sols transferred***");

    enrollment.student = ctx.accounts.student.key();
    enrollment.course = course.key();
    enrollment.enrolled_at = Clock::get()?.unix_timestamp;
    enrollment.completed = false;

    course.enrollment_count += 1;

    msg!("A student has enrolled!");

    Ok(())
}

// Add other student instructions here
