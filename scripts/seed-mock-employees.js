/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function parseCredentialFile(text) {
  // Format: one entry per line: `email:password`
  // Lines starting with `#` are treated as comments.
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) {
        throw new Error(
          `Invalid credential line (expected email:password): ${line}`
        );
      }
      const email = line.slice(0, idx).trim();
      const password = line.slice(idx + 1).trim();
      if (!email || !password) {
        throw new Error(
          `Invalid credential line (email/password required): ${line}`
        );
      }
      return { email, password };
    });
}

function fullNameFromEmail(email) {
  const local = email.split("@")[0] ?? "";
  // Keep it simple for demo data: `employee.one` => `employee.one`
  // (You can edit the seed file later if you want prettier names.)
  return local || "Employee";
}

function isAlreadyExistsError(error) {
  const msg = (error && error.message) || "";
  return (
    msg.toLowerCase().includes("already") &&
    (msg.toLowerCase().includes("registered") ||
      msg.toLowerCase().includes("exists") ||
      msg.toLowerCase().includes("duplicate"))
  );
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing env vars. Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  const credentialPath = path.join(process.cwd(), "auth-mock-employees.txt");
  const raw = fs.readFileSync(credentialPath, "utf8");
  const credentials = parseCredentialFile(raw);

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  for (const { email, password } of credentials) {
    const full_name = fullNameFromEmail(email);

    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "employee",
          team: "General",
          full_name,
        },
      });

      if (error) {
        if (isAlreadyExistsError(error)) {
          console.log(`[seed] user exists, skipping: ${email}`);
          continue;
        }
        throw error;
      }

      console.log(`[seed] created: ${data.user.email}`);
    } catch (err) {
      // Supabase can respond with different shapes depending on the project state.
      if (isAlreadyExistsError(err)) {
        console.log(`[seed] user exists, skipping: ${email}`);
        continue;
      }
      console.error(`[seed] failed for ${email}`);
      console.error(err);
      process.exitCode = 1;
      // Continue with remaining users so one failure doesn't block the rest.
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

