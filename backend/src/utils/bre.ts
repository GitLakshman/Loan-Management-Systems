import { EmploymentMode } from '../types';
import { BRE_RULES } from './constants';

interface BREInput {
  dob: string;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}

interface BREResult {
  eligible: boolean;
  reasons: string[];
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const checkEligibility = (data: BREInput): BREResult => {
  const reasons: string[] = [];

  // Age check (23-50)
  const age = calculateAge(data.dob);
  if (age < BRE_RULES.MIN_AGE || age > BRE_RULES.MAX_AGE) {
    reasons.push(`Age must be between ${BRE_RULES.MIN_AGE} and ${BRE_RULES.MAX_AGE}. Current age: ${age}`);
  }

  // Salary check (>= 25000)
  if (data.monthlySalary < BRE_RULES.MIN_SALARY) {
    reasons.push(`Monthly salary must be at least ₹${BRE_RULES.MIN_SALARY.toLocaleString()}. Current: ₹${data.monthlySalary.toLocaleString()}`);
  }

  // PAN validation
  if (!PAN_REGEX.test(data.pan)) {
    reasons.push('Invalid PAN format. Must match pattern: ABCDE1234F');
  }

  // Employment check
  if (data.employmentMode === EmploymentMode.UNEMPLOYED) {
    reasons.push('Unemployed applicants are not eligible for loans');
  }

  if (!BRE_RULES.VALID_EMPLOYMENT.includes(data.employmentMode as EmploymentMode)) {
    reasons.push(`Employment mode "${data.employmentMode}" is not eligible`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};
