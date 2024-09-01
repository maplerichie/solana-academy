use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("2YiEtpUg9CWjHS4Ko6LvezzP9wBuyAuEzpv26AERFDSv");

#[program]
pub mod solana_academy {
    use super::*;

    pub fn initialize_academy(ctx: Context<InitializeAcademy>, name: String) -> Result<()> {
        instructions::admin::initialize_academy(ctx, name)
    }

    pub fn create_course(ctx: Context<CreateCourse>, course_data: CourseData) -> Result<()> {
        instructions::admin::create_course(ctx, course_data)
    }

    pub fn enroll_in_course(ctx: Context<EnrollInCourse>, course_id: u64) -> Result<()> {
        instructions::student::enroll_in_course(ctx, course_id)
    }

    // Add other instruction handlers here
}
