import { Client } from "minio";
import { config } from "../config/config";

export class StorageService {
  private client: Client;
  readonly bucketName = "talenthive-cvs";
  private bucketChecked = false;

  constructor() {
    this.client = new Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: false,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
  }

  private async ensureBucket(): Promise<void> {
    if (this.bucketChecked) return;

    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName, "us-east-1");
      console.log(`✅ Bucket ${this.bucketName} created`);
    }

    this.bucketChecked = true;
  }

  /**
   * Upload a file to MinIO
   * @param buffer - File buffer (from multer)
   * @param objectPath - Path in bucket (e.g., "cvs/userId/jobId/filename.pdf")
   * @param contentType - MIME type
   * @returns Path in MinIO
   */
  public async uploadFile(
    buffer: Buffer,
    objectPath: string,
    contentType: string
  ): Promise<string> {
    try {
      await this.ensureBucket();

      await this.client.putObject(
        this.bucketName,
        objectPath,
        buffer,
        buffer.length,
        {
          "Content-Type": contentType,
        }
      );

      console.log(`✅ Uploaded file: ${objectPath}`);
      return objectPath;
    } catch (error) {
      console.error("❌ MinIO upload error:", error);
      throw new Error("Failed to upload file to storage");
    }
  }

  /**
   * Get a presigned URL to download/view a file (valid for 24h by default)
   */
  public async getPresignedUrl(
    objectPath: string,
    expirySeconds = 24 * 60 * 60
  ): Promise<string> {
    await this.ensureBucket();
    return this.client.presignedGetObject(
      this.bucketName,
      objectPath,
      expirySeconds
    );
  }

  /**
   * Check if a file exists in MinIO
   */
  public async fileExists(objectPath: string): Promise<boolean> {
    try {
      await this.ensureBucket();
      await this.client.statObject(this.bucketName, objectPath);
      return true;
    } catch (error: any) {
      if (error.code === "NotFound") {
        return false;
      }
      throw error;
    }
  }
}

export const storageService = new StorageService();
