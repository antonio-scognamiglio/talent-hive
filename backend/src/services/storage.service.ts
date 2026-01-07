import { Client } from "minio";
import { config } from "dotenv";

config();

export interface FileUploadResult {
  success: boolean;
  minioPath?: string;
  error?: string;
}

export class StorageService {
  private client: Client;
  readonly bucketName = "talenthive-cvs";
  private bucketChecked = false;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: parseInt(process.env.MINIO_PORT || "9000"),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
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
   * Upload a CV file to MinIO
   * @param file - Express Multer file buffer
   * @param fileName - Unique filename (e.g., candidateId-timestamp.pdf)
   */
  public async uploadCV(
    file: Express.Multer.File,
    fileName: string
  ): Promise<FileUploadResult> {
    try {
      await this.ensureBucket();

      const objectPath = `cvs/${fileName}`;

      await this.client.putObject(
        this.bucketName,
        objectPath,
        file.buffer,
        file.size,
        {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
        }
      );

      console.log(`✅ Uploaded CV: ${objectPath}`);

      return {
        success: true,
        minioPath: objectPath,
      };
    } catch (error) {
      console.error("❌ MinIO upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get a presigned URL to download/view a CV (valid for 24h by default)
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
