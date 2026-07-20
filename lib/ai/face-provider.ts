import { AwsClient } from "aws4fetch";

export type IndexedFace = {
  providerFaceId: string;
  confidence: number;
  boundingBox: { width: number; height: number; left: number; top: number };
  modelVersion: string | null;
};

export type FaceMatch = { providerFaceId: string; similarity: number };

export interface FaceProvider {
  readonly name: string;
  indexFaces(collectionId: string, externalImageId: string, image: Uint8Array): Promise<IndexedFace[]>;
  indexProbeFace(collectionId: string, externalImageId: string, image: Uint8Array): Promise<IndexedFace | null>;
  searchFaces(collectionId: string, image: Uint8Array, threshold: number): Promise<FaceMatch[]>;
  searchFacesById(collectionId: string, faceId: string, threshold: number): Promise<FaceMatch[]>;
  deleteFaces(collectionId: string, faceIds: string[]): Promise<void>;
}

type RekognitionEnv = {
  AWS_REKOGNITION_ACCESS_KEY_ID: string;
  AWS_REKOGNITION_SECRET_ACCESS_KEY: string;
  AWS_REKOGNITION_REGION: string;
};

type AwsErrorBody = { __type?: string; Code?: string; Message?: string };

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export class FaceProviderError extends Error {
  constructor(public readonly code: string, public readonly retryable: boolean) {
    super(code);
  }
}

export class RekognitionFaceProvider implements FaceProvider {
  readonly name = "aws-rekognition";
  private readonly client: AwsClient;
  private readonly endpoint: string;

  constructor(private readonly env: RekognitionEnv) {
    if (!env.AWS_REKOGNITION_ACCESS_KEY_ID || !env.AWS_REKOGNITION_SECRET_ACCESS_KEY || !env.AWS_REKOGNITION_REGION) {
      throw new FaceProviderError("FACE_PROVIDER_UNCONFIGURED", false);
    }
    this.endpoint = `https://rekognition.${env.AWS_REKOGNITION_REGION}.amazonaws.com/`;
    this.client = new AwsClient({
      accessKeyId: env.AWS_REKOGNITION_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_REKOGNITION_SECRET_ACCESS_KEY,
      service: "rekognition",
      region: env.AWS_REKOGNITION_REGION,
    });
  }

  private async call<T>(target: string, payload: Record<string, unknown>): Promise<T> {
    const response = await this.client.fetch(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-amz-json-1.1",
        "x-amz-target": `RekognitionService.${target}`,
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) return response.json<T>();
    const body: AwsErrorBody = await response.json<AwsErrorBody>().catch((): AwsErrorBody => ({}));
    const rawCode = body.__type?.split("#").pop() ?? body.Code ?? `HTTP_${response.status}`;
    throw new FaceProviderError(rawCode, response.status >= 500 || rawCode === "ThrottlingException");
  }

  private async ensureCollection(collectionId: string): Promise<void> {
    try {
      await this.call("CreateCollection", { CollectionId: collectionId });
    } catch (error) {
      if (!(error instanceof FaceProviderError) || error.code !== "ResourceAlreadyExistsException") throw error;
    }
  }

  async indexFaces(collectionId: string, externalImageId: string, image: Uint8Array): Promise<IndexedFace[]> {
    await this.ensureCollection(collectionId);
    const result = await this.call<{
      FaceModelVersion?: string;
      FaceRecords?: Array<{
        Face?: { FaceId?: string; Confidence?: number; BoundingBox?: IndexedFace["boundingBox"] };
      }>;
    }>("IndexFaces", {
      CollectionId: collectionId,
      ExternalImageId: externalImageId,
      Image: { Bytes: toBase64(image) },
      MaxFaces: 100,
      QualityFilter: "AUTO",
      DetectionAttributes: ["DEFAULT"],
    });
    return (result.FaceRecords ?? []).flatMap(({ Face }) => Face?.FaceId && Face.BoundingBox ? [{
      providerFaceId: Face.FaceId,
      confidence: Face.Confidence ?? 0,
      boundingBox: Face.BoundingBox,
      modelVersion: result.FaceModelVersion ?? null,
    }] : []);
  }

  async indexProbeFace(collectionId: string, externalImageId: string, image: Uint8Array): Promise<IndexedFace | null> {
    await this.ensureCollection(collectionId);
    const result = await this.call<{
      FaceModelVersion?: string;
      FaceRecords?: Array<{
        Face?: { FaceId?: string; Confidence?: number; BoundingBox?: IndexedFace["boundingBox"] };
      }>;
    }>("IndexFaces", {
      CollectionId: collectionId,
      ExternalImageId: externalImageId,
      Image: { Bytes: toBase64(image) },
      MaxFaces: 1,
      QualityFilter: "AUTO",
      DetectionAttributes: ["DEFAULT"],
    });
    const record = (result.FaceRecords ?? []).find(({ Face }) => Face?.FaceId && Face.BoundingBox);
    if (!record?.Face?.FaceId || !record.Face.BoundingBox) return null;
    return {
      providerFaceId: record.Face.FaceId,
      confidence: record.Face.Confidence ?? 0,
      boundingBox: record.Face.BoundingBox,
      modelVersion: result.FaceModelVersion ?? null,
    };
  }

  async searchFaces(collectionId: string, image: Uint8Array, threshold: number): Promise<FaceMatch[]> {
    try {
      const result = await this.call<{
        FaceMatches?: Array<{ Similarity?: number; Face?: { FaceId?: string } }>;
      }>("SearchFacesByImage", {
        CollectionId: collectionId,
        Image: { Bytes: toBase64(image) },
        FaceMatchThreshold: threshold,
        MaxFaces: 4096,
        QualityFilter: "AUTO",
      });
      return (result.FaceMatches ?? []).flatMap(({ Face, Similarity }) => Face?.FaceId ? [{
        providerFaceId: Face.FaceId,
        similarity: Similarity ?? 0,
      }] : []);
    } catch (error) {
      if (error instanceof FaceProviderError && error.code === "ResourceNotFoundException") return [];
      throw error;
    }
  }

  async searchFacesById(collectionId: string, faceId: string, threshold: number): Promise<FaceMatch[]> {
    try {
      const result = await this.call<{
        FaceMatches?: Array<{ Similarity?: number; Face?: { FaceId?: string } }>;
      }>("SearchFaces", {
        CollectionId: collectionId,
        FaceId: faceId,
        FaceMatchThreshold: threshold,
        MaxFaces: 4096,
      });
      return (result.FaceMatches ?? []).flatMap(({ Face, Similarity }) => Face?.FaceId ? [{
        providerFaceId: Face.FaceId,
        similarity: Similarity ?? 0,
      }] : []);
    } catch (error) {
      if (error instanceof FaceProviderError && error.code === "ResourceNotFoundException") return [];
      throw error;
    }
  }

  async deleteFaces(collectionId: string, faceIds: string[]): Promise<void> {
    if (faceIds.length === 0) return;
    try {
      await this.call("DeleteFaces", { CollectionId: collectionId, FaceIds: faceIds });
    } catch (error) {
      if (!(error instanceof FaceProviderError) || error.code !== "ResourceNotFoundException") throw error;
    }
  }
}
