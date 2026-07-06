import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = "predictorfiles";

export function createS3Client(env = process.env) {
  return new S3Client({
    region: env.AWS_REGION || "eu-west-2",
    credentials: {
      accessKeyId: env.ID,
      secretAccessKey: env.SECRET,
    },
  });
}

export async function uploadBacktestArtifacts({
  runId,
  resultsJson,
  summaryJson,
  resultsCsv,
  format = "both",
  env = process.env,
}) {
  const client = createS3Client(env);
  const prefix = `backtests/${runId}`;
  const uploaded = [];

  const put = async (key, body, contentType) => {
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    uploaded.push(`s3://${BUCKET_NAME}/${key}`);
  };

  if (format === "json" || format === "both") {
    await put(
      `${prefix}/results.json`,
      JSON.stringify(resultsJson, null, 2),
      "application/json"
    );
    await put(
      `${prefix}/summary.json`,
      JSON.stringify(summaryJson, null, 2),
      "application/json"
    );
  }

  if ((format === "csv" || format === "both") && resultsCsv) {
    await put(`${prefix}/results.csv`, resultsCsv, "text/csv");
  }

  return uploaded;
}
