import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "libsql://ubmk-approval-db-vip7612-maker.aws-ap-northeast-1.turso.io",
    token: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzMzNTMyNDgsImlkIjoiMDE5Y2U0MTUtNWMwMS03ZGEzLTkzODEtZjQ5ZGZmZTNjNGRkIiwicmlkIjoiZTZjOGMzYTQtNDMwYi00ODBhLThmMTMtNjdhZjM0NjA1ODI2In0.VrHhHjxPkY-zjFHw92mmhq8eka-VU6SenpA2FdOG2-zvsovghX1huNi2T-lSXC6LMSIpcYo-u0VVPJU02f62Cg",
  },
});
