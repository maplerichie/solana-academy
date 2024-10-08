use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("79zUy3DKMd4xfFpjnzBVyxaaEzD6vV6aAVzHS8U7JS1Y");

#[program]
pub mod solana_academy {
    use super::*;

    pub fn initialize_academy(
        ctx: Context<InitializeAcademy>,
        name: String,
        enrollment_fee: u64,
    ) -> Result<()> {
        instructions::admin::initialize_academy(ctx, name, enrollment_fee)
    }

    pub fn enroll_student_in_academy(ctx: Context<EnrollInAcademy>, payment: u64) -> Result<()> {
        instructions::admin::enroll_student_in_academy(ctx, payment)
    }

    pub fn create_course(ctx: Context<CreateCourse>, course_data: CourseData) -> Result<()> {
        instructions::admin::create_course(ctx, course_data)
    }

    pub fn enroll_in_course(ctx: Context<EnrollInCourse>, course_id: u64) -> Result<()> {
        instructions::student::enroll_in_course(ctx, course_id)
    }

    // Add other instruction handlers here
}
