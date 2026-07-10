#!/usr/bin/env node
/**
 * Mandatory end-to-end runner: exercises every AI point of StoryForge against a
 * LIVE llama.cpp (turboquant SYCL) server + a real GGUF model.
 *
 * Usage:
 *   node scripts/e2e-llm.mjs                 # assumes a server is already up at LLAMA_URL
 *   E2E_START_SERVER=1 node scripts/e2e-llm.mjs   # auto-starts the turboquant server, then tears it down
 *
 * Env (all optional, defaults target this workstation):
 *   LLAMA_URL      default http://127.0.0.1:8080
 *   LLAMA_SERVER   default G:/Programas/llama-cpp-turboquant-SYCL/build/bin/llama-server.exe
 *   LLAMA_MODEL    default G:/Models/Qwen_Qwen3-4B-Instruct-2507-Q4_K_M.gguf
 *   ONEAPI_BIN     default C:/Program Files (x86)/Intel/oneAPI/2026.0/bin
 *   ONEAPI_CBIN    default C:/Program Files (x86)/Intel/oneAPI/compiler/2026.0/bin
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const URL = process.env.LLAMA_URL ?? "http://127.0.0.1:8080";
const SERVER = process.env.LLAMA_SERVER ?? "G:/Programas/llama-cpp-turboquant-SYCL/build/bin/llama-server.exe";
const MODEL = process.env.LLAMA_MODEL ?? "G:/Models/Qwen_Qwen3-4B-Instruct-2507-Q4_K_M.gguf";
const ONEAPI_BIN = process.env.ONEAPI_BIN ?? "C:/Program Files (x86)/Intel/oneAPI/2026.0/bin";
const ONEAPI_CBIN = process.env.ONEAPI_CBIN ?? "C:/Program Files (x86)/Intel/oneAPI/compiler/2026.0/bin";

async function isUp() {
  try {
    const res = await fetch(`${URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitUntilUp(maxSeconds) {
  for (let i = 0; i < maxSeconds; i += 4) {
    if (await isUp()) return true;
    await sleep(4000);
  }
  return false;
}

function startServer() {
  const env = {
    ...process.env,
    PATH: `${ONEAPI_BIN};${ONEAPI_CBIN};${process.env.PATH ?? ""}`,
  };
  const child = spawn(
    SERVER,
    ["-m", MODEL, "--host", "127.0.0.1", "--port", "8080", "-c", "4096", "-ngl", "99", "--no-webui"],
    { env, stdio: "ignore", detached: false },
  );
  return child;
}

function runVitest() {
  return new Promise((resolve) => {
    // shell:true is required on Windows/Node 24 to launch the npx wrapper (spawn
    // rejects .cmd targets directly with EINVAL otherwise).
    const child = spawn("npx vitest run src/__e2e__", {
      env: { ...process.env, E2E_LLM: "1", LLAMA_URL: URL },
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function main() {
  let server = null;

  const autoStart =
    process.env.E2E_START_SERVER === "1" || process.argv.includes("--start-server");

  if (!(await isUp())) {
    if (autoStart) {
      console.log(`[e2e] iniciando servidor llama.cpp: ${SERVER}`);
      server = startServer();
      const ready = await waitUntilUp(120);
      if (!ready) {
        console.error("[e2e] servidor não ficou pronto em 120s.");
        if (server) server.kill();
        process.exit(1);
      }
      console.log("[e2e] servidor pronto.");
    } else {
      console.error(
        `[e2e] Nenhum servidor em ${URL}.\n` +
          `Inicie o llama.cpp turboquant e rode de novo, ou use E2E_START_SERVER=1.`,
      );
      process.exit(1);
    }
  }

  const code = await runVitest();
  if (server) server.kill();
  process.exit(code);
}

main();
