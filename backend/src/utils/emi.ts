interface EMICalculation {
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

/**
 * Calculate flat interest for a loan
 * Formula: Interest = Principal * Rate * (Days/365)
 */
export const calculateLoanDetails = (
  loanAmount: number,
  tenureDays: number,
  annualRate: number = 8
): EMICalculation => {
  const interestRate = annualRate;
  const interestAmount = Math.round((loanAmount * annualRate * tenureDays) / (365 * 100));
  const totalRepayment = loanAmount + interestAmount;

  return {
    interestRate,
    interestAmount,
    totalRepayment,
  };
};
