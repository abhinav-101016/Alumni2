export const requireProfileComplete = (req, res, next) => {

  const user = req.user;

  if (
    user.role === "alumni" &&
    user.isProfileComplete === false
  ) {

    return res.status(403).json({
      message: "Complete your alumni profile",
      redirect: "/complete-profile"
    });

  }

  next();
};