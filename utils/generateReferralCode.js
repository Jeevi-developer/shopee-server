export const generateReferralCode = (name) => {
  const prefix = name?.split(" ")[0]?.substring(0, 3).toUpperCase() || "SEL";
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomNum}`;
};
