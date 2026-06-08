import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  PipelineStage,
  SortOrder,
  ProjectionType,
} from "mongoose";
import { CustomError } from "../utils/customError";

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  protected handleError(error: any): never {
    if (error.name === "ValidationError") {
      console.log("error", error)
      throw new CustomError(
        error.message || "Validation Error",
        400,
        // Object.values(error.errors).map((err) => ({
        //   field: (err as any).path,
        //   message: (err as any).message,
        // }))
      );
    }

    if (error.name === "CastError") {
      throw new CustomError(
        `Invalid ${error.path} format: ${error.value}`,
        400
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      throw new CustomError(
        `Duplicate entry: ${field} '${value}' already exists`,
        409
      );
    }

    if (error.name === "MongoServerError") {
      throw new CustomError(
        error.message || "Database server error",
        500
      );
    }

    if (error.name === "MongoNetworkError") {
      throw new CustomError(
        "Database connection error: Unable to reach the database server",
        503
      );
    }

    if (error.name === "DocumentNotFoundError") {
      throw new CustomError(
        "Document not found",
        404
      );
    }

    if (error.name === "MongooseError") {
      throw new CustomError(
        error.message || "Mongoose operation error",
        500
      );
    }

    // For transaction errors
    if (error.name === "TransactionError") {
      throw new CustomError(
        "Transaction failed: " + (error.message || "Unknown transaction error"),
        500
      );
    }

    // For any other unhandled errors
    throw new CustomError(
      error.message || "An unexpected database error occurred",
      500
    );
  }

  async create(data: Partial<Omit<T, keyof Document>>): Promise<T> {
    try {     
      const entity = new this.model(data);
      return await entity.save();
    } catch (error) {
      this.handleError(error);
    }
  }

  async createMany(data: Partial<Omit<T, keyof Document>>[]): Promise<T[]> {
    try {
      return await this.model.create(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(
    id: string,
    projection?: ProjectionType<T>
  ): Promise<T | null> {
    try {
      return await this.model.findById(id, projection).exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: { lean?: boolean }
  ): Promise<T | null> {
    try {
      const query = this.model.findOne(filter, projection);
      return options?.lean
        ? ((await query.lean().exec()) as T | null)
        : await query.exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async find(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T>,
    options?: {
      sort?: { [key: string]: SortOrder };
      lean?: boolean;
      limit?: number;
      skip?: number;
    }
  ): Promise<T[]> {
    try {
      let query = this.model.find(filter, projection);

      if (options?.sort) query = query.sort(options.sort);
      if (options?.skip) query = query.skip(options.skip);
      if (options?.limit) query = query.limit(options.limit);

      return options?.lean
        ? ((await query.lean().exec()) as T[])
        : await query.exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: string,
    data: UpdateQuery<T>,
    options?: { new?: boolean; runValidators?: boolean; upsert?:boolean }
  ): Promise<T | null> {
    try {
      return await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
          ...options,
        })
        .exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateMany(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
    options?: { runValidators?: boolean }
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    try {
      const result = await this.model.updateMany(filter, data, {
        runValidators: true,
        ...options,
      });
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    try {
      const result = await this.model.deleteMany(filter);
      return result.deletedCount;
    } catch (error) {
      this.handleError(error);
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      this.handleError(error);
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      return (await this.model.exists(filter)) !== null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findWithPagination(
    filter: FilterQuery<T> = {},
    page: number = 1,
    limit: number = 10,
    options?: {
      sort?: { [key: string]: SortOrder };
      projection?: ProjectionType<T>;
      lean?: boolean;
      skip?:number;
    }
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = options?.skip ?? (page - 1) * limit;
      let query = this.model.find(filter, options?.projection);

      if (options?.sort) query = query.sort(options.sort);

      const [data, total] = await Promise.all([
        options?.lean
          ? (query.skip(skip).limit(limit).lean().exec() as Promise<T[]>)
          : query.skip(skip).limit(limit).exec(),
        this.model.countDocuments(filter),
      ]);

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

 async findBatchWithPagination<T>(
  model: Model<T> | null = null,
  filter: FilterQuery<T>,
  page: number = 1,
  limit: number = 10,
  options?: {
    sort?: { [key: string]: SortOrder };
    projection?: ProjectionType<T>;
    lean?: boolean;
    skip?: number;
  }
): Promise<{
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const skip = options?.skip ?? (page - 1) * limit;

    const selectedModel = (model ?? this.model) as unknown as Model<T>;

    let query = selectedModel.find(filter, options?.projection);

    if (options?.sort) query = query.sort(options.sort);

    const [data, total] = await Promise.all([
      options?.lean
        ? (query.skip(skip).limit(limit).lean().exec() as Promise<T[]>)
        : query.skip(skip).limit(limit).exec(),
      selectedModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    this.handleError(error);
  }
}




  async aggregate(pipeline: PipelineStage[]): Promise<any[]> {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      this.handleError(error);
    }
  }

  async distinct(
    field: keyof Omit<T, keyof Document>,
    filter: FilterQuery<T> = {}
  ): Promise<any[]> {
    try {
      return await this.model.distinct(field as string, filter);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: { new?: boolean; upsert?: boolean; runValidators?: boolean }
  ): Promise<T | null> {
    try {
      return await this.model
        .findOneAndUpdate(filter, update, {
          new: true,
          runValidators: true,
          ...options,
        })
        .exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkWrite(
    operations: any[],
    options?: { ordered?: boolean }
  ): Promise<{
    ok: number;
    nModified: number;
    nUpserted: number;
    nMatched: number;
  }> {
    try {
      const result = await this.model.bulkWrite(operations, options);
      return {
        ok: result.ok,
        nModified: result.modifiedCount,
        nUpserted: result.upsertedCount,
        nMatched: result.matchedCount,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async transaction<R>(callback: () => Promise<R>): Promise<R> {
    const session = await this.model.db.startSession();
    try {
      session.startTransaction();
      const result = await callback();
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      session.endSession();
    }
  }
}