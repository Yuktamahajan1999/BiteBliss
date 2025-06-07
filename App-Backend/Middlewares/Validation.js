import { body } from 'express-validator';


// Register Validation
const ValidationMiddleware = [
  body('name')
    .notEmpty().withMessage("User name must not be empty")
    .isLength({ min: 3, max: 15 }).withMessage("Name should be 3-15 characters long"),

  body('email')
    .notEmpty().withMessage("Email must not be empty")
    .isEmail().withMessage("Email is not valid"),

  body('password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }).withMessage("Password must be strong"),

  body('phoneNumber')
    .notEmpty().withMessage("Phone number must not be empty")
    .isLength({ min: 10, max: 10 })
    .isMobilePhone('en-IN')
    .isNumeric().withMessage("Enter a valid 10-digit mobile number"),

  body('role')
    .notEmpty().withMessage("Role is required")
    .isIn(['user', 'restaurantowner', 'chef', 'admin']).withMessage("Invalid role"),
];

export { ValidationMiddleware };

// Login Validation
export const loginValidation = [
  body('email')
    .notEmpty().withMessage("Email must not be empty")
    .isEmail().withMessage("Email is not valid"),

  body('password')
    .notEmpty().withMessage("Password must not be empty")
    .isStrongPassword().withMessage("Password must be strong"),
];

// Booking Validation
export const bookingValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage("Full Name is required")
    .isLength({ min: 2 }).withMessage("Full Name must be at least 2 characters"),

  body('email')
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body('phoneNumber')
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone('any').withMessage("Invalid phone number format"),

  body('bookingDate')
    .notEmpty().withMessage("Booking date is required")
    .isISO8601().withMessage("Invalid date format"),

  body('bookingTime')
    .notEmpty().withMessage("Booking time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid time format"),

  body('numberOfGuests')
    .notEmpty().withMessage("Number of guests is required")
    .isInt({ min: 1, max: 20 }).withMessage("Must be between 1 and 20 guests"),

  body('restaurantId')
    .notEmpty().withMessage('Restaurant ID is required')
    .isMongoId().withMessage('Invalid Restaurant ID'),

  body('userId')
    .optional()
    .isMongoId().withMessage('Invalid User ID')
];

// Delivery Partner Validation
export const deliveryPartnerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required'),

  body('phone')
    .isMobilePhone().withMessage('Valid phone number is required'),

  body('vehicleId')
    .optional().isString(),

  body('assignedOrderId')
    .optional().isString(),
];

// Donation Validation
export const donationValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),

  body('message')
    .optional().isString(),

  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),

  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Must be valid Mongo ID'),
];

// Dining Validation
const DiningValidation = [
  body('name')
    .notEmpty().withMessage("Name must not be empty"),

  body('email')
    .notEmpty().withMessage("Email must not be empty")
    .isEmail().withMessage("Enter a valid email"),

  body('phone')
    .notEmpty().withMessage("Phone must not be empty")
    .isMobilePhone('en-IN'),

  body('date')
    .notEmpty().withMessage("Date must not be empty")
    .isISO8601().toDate().withMessage("Enter a valid date"),

  body('time')
    .notEmpty().withMessage("Time must not be empty"),

  body('persons')
    .notEmpty().withMessage("At least 1 person required")
    .isInt({ min: 1 }),

  body('specialRequests')
    .optional().isString(),
];

export { DiningValidation };

// Restaurant Update Validation

export const restaurantUpdateValidation = [
  body('name').optional().notEmpty().withMessage("Restaurant name cannot be empty"),
  body('image').optional().notEmpty().withMessage("Image URL cannot be empty"),
  body('time').optional().notEmpty().withMessage("Opening time cannot be empty"),
  body('distance').optional().notEmpty().withMessage("Distance cannot be empty"),
  body('contact').optional().notEmpty().withMessage("Contact info cannot be empty"),
  body('gstNumber').optional().notEmpty().withMessage("GST Number cannot be empty"),
  body('legalName').optional().notEmpty().withMessage("Legal name cannot be empty"),
  body('fssaiNumber').optional().notEmpty().withMessage("FSSAI Number cannot be empty"),
  body('address').optional().notEmpty().withMessage("Address cannot be empty"),
  body('cuisine').optional().isArray({ min: 1 }).withMessage("At least one cuisine is required"),
  body('restaurantowner').optional().notEmpty().withMessage("Owner ID cannot be empty").isMongoId().withMessage("Must be a valid Mongo ID"),
];

// Restaurant Create Validation

export const restaurantCreateValidation = [
  body('name').notEmpty().withMessage("Restaurant name is required"),
  body('image').notEmpty().withMessage("Image URL is required"),
  body('time').notEmpty().withMessage("Opening time is required"),
  body('distance').notEmpty().withMessage("Distance is required"),
  body('contact').notEmpty().withMessage("Contact info is required"),
  body('gstNumber').notEmpty().withMessage("GST Number is required"),
  body('legalName').notEmpty().withMessage("Legal name is required"),
  body('fssaiNumber').notEmpty().withMessage("FSSAI Number is required"),
  body('address').notEmpty().withMessage("Address is required"),
  body('cuisine').isArray({ min: 1 }).withMessage("At least one cuisine is required"),
  body('restaurantowner').notEmpty().withMessage("Owner ID is required").isMongoId().withMessage("Must be a valid Mongo ID"),
];


// Catering Booking Validation
export const cateringBookingValidation = [
  body('name')
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 15 }).withMessage("Name should be 2 to 15 characters long"),

  body('email')
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email"),

  body('address')
    .notEmpty().withMessage("Address is required")
    .isLength({ min: 5 }).withMessage("Address should be at least 5 characters long"),

  body('date')
    .notEmpty().withMessage("Date is required")
    .isISO8601().withMessage("Enter a valid date (YYYY-MM-DD)"),

  body('phone')
    .notEmpty().withMessage("Phone number is required")
    .isLength({ min: 10, max: 10 }).withMessage("Phone number must be exactly 10 digits")
    .isMobilePhone('en-IN').withMessage("Enter a valid Indian mobile number"),

  body('chefName').
    optional()
    .isString().withMessage("Chef name must be a string"),

  body('specialRequests')
    .optional()
    .isString().withMessage("Special requests must be a string"),
  body('headCount')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage("Headcount must be a number between 1 and 20"),
];
