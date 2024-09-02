use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Mint, TokenAccount};

#[derive(Accounts)]
pub struct InitializeAcademy<'info> {
    #[account(init, payer = admin, space = Academy::LEN)]
    pub academy: Account<'info, Academy>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_academy(ctx: Context<InitializeAcademy>, name: String) -> Result<()> {
    let academy = &mut ctx.accounts.academy;
    academy.name = name;
    academy.admin = ctx.accounts.admin.key();
    academy.course_count = 0;
    Ok(())
}

//TODO: what about turning courses into PDAs?
//Will you need to update the mint authority to the Course later???
#[derive(Accounts)]
pub struct CreateCourse<'info> {
    #[account(mut, has_one = admin)]
    pub academy: Account<'info, Academy>,
    #[account(init, payer = admin, space = Course::LEN)]
    pub course: Account<'info, Course>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        //these should probably be the real seeds, but simplifying to hopefully make it easier to build
        //seeds = [b"mint", academy.key().as_ref(), &academy.course_count.to_be_bytes()],
        //simplified seeds
        seeds = [b"mint", academy.key().as_ref()],
        bump,
        payer = admin, 
        mint::decimals = 0, 
        mint::authority = admin,
    )]
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}


pub fn create_course(ctx: Context<CreateCourse>, course_data: CourseData) -> Result<()> {
    let academy = &mut ctx.accounts.academy;
    let course = &mut ctx.accounts.course;

    //hard-coding the tuition fee
    msg!("Setting tuition_fee: {}", 500);

    course.id = academy.course_count;
    course.name = course_data.name;
    course.description = course_data.description;
    course.start_date = course_data.start_date;
    course.end_date = course_data.end_date;
    course.tuition_fee = 500;
    course.enrollment_count = 0;

    msg!("Course id: {}", course.id);
    msg!("Course name: {}", course.name);
    msg!("Course description: {}", course.description);
    msg!("Course start_date: {}", course.start_date);
    msg!("Course end_date: {}", course.end_date);
    msg!("Tuition_fee: {}", course.tuition_fee);
    msg!("Enrollment count {}", course.enrollment_count);

    academy.course_count += 1;

    let cpi_accounts = anchor_spl::token::InitializeMint {
        mint: ctx.accounts.mint.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    anchor_spl::token::initialize_mint(cpi_context, 0, &ctx.accounts.admin.key(), None)?;

    Ok(())
}

// Add other admin instructions here
