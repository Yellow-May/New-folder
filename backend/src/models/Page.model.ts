import { Schema, model, Document } from 'mongoose';

export interface IPage extends Document {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        const { _id, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Create indexes
PageSchema.index({ slug: 1 }, { unique: true });
PageSchema.index({ title: 'text' });

export const Page = model<IPage>('Page', PageSchema);

