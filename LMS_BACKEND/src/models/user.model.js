const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true }
  },
  { timestamps: true }
);

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "STUDENT"],
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    country: {
      type: String,
      trim: true,
      default: ""
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    documents: [documentSchema],
    certificates: [certificateSchema],
    isOnboarded: {
      type: Boolean,
      default: false
    },
    currentStatusCityState: {
      type: String,
      trim: true,
      default: ""
    },
    visaStatus: {
      type: String,
      trim: true,
      default: ""
    },
    visaExpiryDate: {
      type: Date,
      default: null
    },
    resumeFile: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String
    },
    totalExperience: {
      type: String,
      trim: true,
      default: ""
    },
    preferredDesignation: {
      type: String,
      trim: true,
      default: ""
    },
    preferredLocations: {
      type: String,
      trim: true,
      default: ""
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    openToRelocation: {
      type: String,
      trim: true,
      default: ""
    },
    expectedSalary: {
      type: String,
      trim: true,
      default: ""
    },
    preferredJobType: {
      type: [String],
      default: []
    },
    expectedSalaryPeriod: {
      type: String,
      trim: true,
      default: ""
    },
    securityClearance: {
      type: String,
      trim: true,
      default: ""
    },
    assignedStudents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    phone: this.phone,
    country: this.country,
    address: this.address,
    isActive: this.isActive,
    documents: this.documents,
    certificates: this.certificates,
    isOnboarded: this.isOnboarded,
    currentStatusCityState: this.currentStatusCityState,
    visaStatus: this.visaStatus,
    visaExpiryDate: this.visaExpiryDate,
    resumeFile: this.resumeFile,
    totalExperience: this.totalExperience,
    preferredDesignation: this.preferredDesignation,
    preferredLocations: this.preferredLocations,
    dateOfBirth: this.dateOfBirth,
    openToRelocation: this.openToRelocation,
    expectedSalary: this.expectedSalary,
    preferredJobType: this.preferredJobType,
    expectedSalaryPeriod: this.expectedSalaryPeriod,
    securityClearance: this.securityClearance,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model("User", userSchema);
