use anchor_lang::prelude::*;

#[account]
pub struct Academy {
    pub name: String,
    pub admin: Pubkey,
    pub course_count: u64,
    pub enrollment_fee: u64,
    pub student_counter: u64,
}

impl Academy {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 32;
}
