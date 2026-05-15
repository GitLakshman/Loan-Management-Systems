import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  loanId: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan ID is required'],
    },
    utrNumber: {
      type: String,
      required: [true, 'UTR number is required'],
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be at least 1'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ loanId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
