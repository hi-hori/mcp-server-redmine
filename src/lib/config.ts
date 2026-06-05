import { z } from "zod";
import dotenv from 'dotenv';

// .envファイルの読み込み
dotenv.config();

// 設定スキーマの定義
const ConfigSchema = z.object({
  // RedmineのAPI設定
  redmine: z.object({
    apiKey: z.string({
      required_error: "REDMINE_API_KEY environment variable is required",
    }),
    host: z
      .string({
        required_error: "REDMINE_HOST environment variable is required",
      })
      .url("REDMINE_HOST must be a valid URL"),
  }),

  // サーバー設定
  server: z.object({
    name: z.string().default("@yonaka15/mcp-server-redmine"),
    version: z.string().default("0.1.0"),
  }),

  // 読み取り専用モード（true の場合、作成・更新・削除などの書き込み系ツールを無効化する）
  readOnly: z.boolean().default(false),
});

// 設定の型定義
export type Config = z.infer<typeof ConfigSchema>;

// 環境変数からの設定読み込み
function loadConfig(): Config {
  return ConfigSchema.parse({
    redmine: {
      apiKey: process.env.REDMINE_API_KEY,
      host: process.env.REDMINE_HOST,
    },
    server: {
      name: process.env.SERVER_NAME ?? "@yonaka15/mcp-server-redmine",
      version: process.env.SERVER_VERSION ?? "0.1.0",
    },
    // REDMINE_READ_ONLY が "true"（大文字小文字無視）または "1" の場合に有効化
    readOnly: ["true", "1"].includes(
      (process.env.REDMINE_READ_ONLY ?? "").trim().toLowerCase()
    ),
  });
}

// 設定のバリデーションとエクスポート
let config: Config;
try {
  config = loadConfig();
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Configuration error:");
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error("Unknown error loading configuration:", error);
  }
  process.exit(1);
}

export default config;