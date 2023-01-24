import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { randomBytes } from "crypto";
import addMinutes from "date-fns/addMinutes";
import isPast from "date-fns/isPast";

const db = new DynamoDBClient(
  process.env.NODE_ENV === "production"
    ? {
        region: "eu-west-1",
        credentials: {
          accessKeyId: process.env["API_AWS_ACCESS_KEY_ID"]!,
          secretAccessKey: process.env["API_AWS_SECRET_ACCESS_KEY"]!,
        },
      }
    : {
        region: "us-east-1",
        endpoint: "http://localhost:4566",
        credentials: {
          accessKeyId: "test",
          secretAccessKey: "test",
        },
      }
);

const TableName = "auth_codes";

async function generateAuthCode() {
  return new Promise<string>((resolve, reject) => {
    randomBytes(32, (err, bytes) => {
      if (err) {
        reject(err);
      } else {
        resolve(bytes.toString("hex"));
      }
    });
  });
}

export async function saveRefreshToken(refreshToken: string): Promise<string> {
  const authCode = await generateAuthCode();

  await db.send(
    new PutItemCommand({
      TableName,
      Item: {
        code: {
          S: authCode,
        },
        refreshToken: {
          S: refreshToken,
        },
        expiresAt: {
          N: addMinutes(Date.now(), 10).getTime().toString(),
        },
      },
    })
  );

  return authCode;
}

export async function readRefreshToken(
  authCode: string
): Promise<string | null> {
  const Key = {
    code: {
      S: authCode,
    },
  };

  const result = await db.send(
    new GetItemCommand({
      TableName,
      AttributesToGet: ["refreshToken", "expiresAt"],
      Key,
    })
  );

  if (
    !result.Item?.["refreshToken"]?.S ||
    !result.Item?.["expiresAt"]?.N ||
    isPast(Number(result.Item["expiresAt"].N))
  ) {
    return null;
  }

  await db.send(
    new DeleteItemCommand({
      TableName,
      Key,
    })
  );

  return result.Item["refreshToken"].S;
}
