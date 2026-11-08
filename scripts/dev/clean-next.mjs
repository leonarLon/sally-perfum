#!/usr/bin/env node
/**
 * Apaga a pasta .next antes do build. Com o projeto dentro do OneDrive, arquivos antigos de
 * build às vezes viram atalhos de nuvem e o Next não consegue sobrescrevê-los (EPERM).
 * Começar de uma pasta limpa evita o problema; o build fica poucos segundos mais lento.
 */
import fs from "node:fs";

try {
  fs.rmSync(".next", { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
} catch (err) {
  console.warn(`Aviso: não foi possível limpar .next (${err.code}). Apague a pasta manualmente se o build falhar.`);
}
