import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

process.env.ENCRYPTION_SECRET =
  process.env.ENCRYPTION_SECRET ||
  "bc0dbd11cd8630c0e262381817aaabbcf512f07fc35338d8fabf1cae4ad82b3b";

const { encryptSecret, decryptSecret } = loadTypeScript("src/lib/vault.ts");

test("encryptSecret and decryptSecret roundtrip correctly", () => {
  const token = "azure-devops-pat-sample-123456789";
  const encrypted = encryptSecret(token);
  assert.ok(encrypted);
  assert.notEqual(encrypted, token);

  const parts = encrypted.split(":");
  assert.equal(parts.length, 3); // iv, authTag, ciphertext

  const decrypted = decryptSecret(encrypted);
  assert.equal(decrypted, token);
});

test("encrypting twice produces different ciphertexts due to random IV", () => {
  const token = "fixed-secret";
  const enc1 = encryptSecret(token);
  const enc2 = encryptSecret(token);
  assert.notEqual(enc1, enc2);
  assert.equal(decryptSecret(enc1), token);
  assert.equal(decryptSecret(enc2), token);
});

test("null and empty inputs return null without throwing", () => {
  assert.equal(encryptSecret(null), null);
  assert.equal(encryptSecret(""), null);
  assert.equal(encryptSecret("   "), null);
  assert.equal(decryptSecret(null), null);
  assert.equal(decryptSecret(""), null);
});

test("tampered ciphertext throws verification error", () => {
  const encrypted = encryptSecret("my-secret");
  const parts = encrypted.split(":");
  // Alter auth tag
  const tampered = `${parts[0]}:00000000000000000000000000000000:${parts[2]}`;
  assert.throws(() => decryptSecret(tampered));
});
