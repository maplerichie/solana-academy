use anchor_lang::prelude::*;

#[error_code]
pub enum AcademyError {
    #[msg("The provided course ID is invalid")]
    InvalidCourseId,
    #[msg("The course is already full")]
    CourseIsFull,
    #[msg("The student is already enrolled in this course")]
    AlreadyEnrolled,
    #[msg("Insufficient balance to pay school fees")]
    InsufficientSchoolFee,
    #[msg("Insufficient balance to pay school fees")]
    InsufficientCourseFee,
    #[msg("Insufficient balance to pay tuition fee")]
    InsufficientBalance,
    #[msg("Invalid mint NFT mint authority")]
    InvalidNFTAuthority,
    #[msg("Invalid student NFT")]
    InvalidStudentNFT,
}