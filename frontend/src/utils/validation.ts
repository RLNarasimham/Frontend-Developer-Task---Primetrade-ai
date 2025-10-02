// export interface ValidationResult {
//   isValid: boolean;
//   errors: Record<string, string>;
// }

// export const validateEmail = (email: string): string | null => {
//   if (!email) return 'Email is required';
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) return 'Invalid email format';
//   return null;
// };

// export const validatePassword = (password: string): string | null => {
//   if (!password) return 'Password is required';
//   if (password.length < 6) return 'Password must be at least 6 characters';
//   return null;
// };

// export const validateFullName = (fullName: string): string | null => {
//   if (!fullName) return 'Full name is required';
//   if (fullName.trim().length < 2) return 'Full name must be at least 2 characters';
//   return null;
// };

// export const validateTaskTitle = (title: string): string | null => {
//   if (!title) return 'Title is required';
//   if (title.trim().length < 3) return 'Title must be at least 3 characters';
//   if (title.length > 100) return 'Title must be less than 100 characters';
//   return null;
// };

// export const validateTaskDescription = (description: string): string | null => {
//   if (description.length > 500) return 'Description must be less than 500 characters';
//   return null;
// };

// export const validateSignUpForm = (
//   email: string,
//   password: string,
//   fullName: string
// ): ValidationResult => {
//   const errors: Record<string, string> = {};

//   const emailError = validateEmail(email);
//   if (emailError) errors.email = emailError;

//   const passwordError = validatePassword(password);
//   if (passwordError) errors.password = passwordError;

//   const fullNameError = validateFullName(fullName);
//   if (fullNameError) errors.fullName = fullNameError;

//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors,
//   };
// };

// export const validateSignInForm = (
//   email: string,
//   password: string
// ): ValidationResult => {
//   const errors: Record<string, string> = {};

//   const emailError = validateEmail(email);
//   if (emailError) errors.email = emailError;

//   const passwordError = validatePassword(password);
//   if (passwordError) errors.password = passwordError;

//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors,
//   };
// };

// export const validateTaskForm = (
//   title: string,
//   description: string
// ): ValidationResult => {
//   const errors: Record<string, string> = {};

//   const titleError = validateTaskTitle(title);
//   if (titleError) errors.title = titleError;

//   const descriptionError = validateTaskDescription(description);
//   if (descriptionError) errors.description = descriptionError;

//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors,
//   };
// };

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

type Input = string | null | undefined;

const safeTrim = (v: Input) => (typeof v === "string" ? v.trim() : "");

export const validateEmail = (email: Input): string | null => {
  const value = safeTrim(email);
  if (!value) return "Email is required";
  if (value.length > 254) return "Email must be less than 255 characters";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Invalid email format";
  return null;
};

export const validatePassword = (password: Input): string | null => {
  const value = typeof password === "string" ? password : "";
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  if (value.length > 128) return "Password must be less than 128 characters";
  return null;
};

export const validateFullName = (fullName: Input): string | null => {
  const value = safeTrim(fullName);
  if (!value) return "Full name is required";
  if (value.length < 2) return "Full name must be at least 2 characters";
  if (value.length > 100) return "Full name must be less than 100 characters";
  return null;
};

export const validateTaskTitle = (title: Input): string | null => {
  const value = safeTrim(title);
  if (!value) return "Title is required";
  if (value.length < 3) return "Title must be at least 3 characters";
  if (value.length > 100) return "Title must be less than 100 characters";
  return null;
};

export const validateTaskDescription = (description: Input): string | null => {
  const value = typeof description === "string" ? description.trim() : "";
  if (value.length > 500) return "Description must be less than 500 characters";
  return null;
};

export const validateSignUpForm = (
  email: Input,
  password: Input,
  fullName: Input
): ValidationResult => {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  const fullNameError = validateFullName(fullName);
  if (fullNameError) errors.fullName = fullNameError;
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignInForm = (
  email: Input,
  password: Input
): ValidationResult => {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateTaskForm = (
  title: Input,
  description: Input
): ValidationResult => {
  const errors: Record<string, string> = {};
  const titleError = validateTaskTitle(title);
  if (titleError) errors.title = titleError;
  const descriptionError = validateTaskDescription(description);
  if (descriptionError) errors.description = descriptionError;
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
