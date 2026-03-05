export const updateRoleIfGraduated = async (user) => {

  if (!user) return null;

  const currentYear = new Date().getFullYear();

  if (
    user.role === "student" &&
    user.academic?.passingYear &&
    currentYear >= user.academic.passingYear
  ) {

    user.role = "alumni";

    // alumni must complete profile
    user.isProfileComplete = false;

    // require admin verification again
    user.verification.isVerifiedByAdmin = false;

    // move account to pending
    user.accountStatus = "pending";

    await user.save();
  }

  return user;
};