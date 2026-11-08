/**
 * Descrição comercial própria da Sally, montada a partir dos fatos curados.
 * Nunca afirma notas que não estejam nos dados; quando a pirâmide não foi
 * confirmada, diz isso explicitamente.
 */
const join = (list) =>
  list.length <= 1 ? list.join("") : `${list.slice(0, -1).join(", ")} e ${list.at(-1)}`;
// Nomes próprios e termos técnicos que mantêm a grafia original.
const PROPER = ["Calábria", "Madagascar", "Sichuan", "Sambac", "Grandiflorum", "Centifolia", "Damascena",
  "Bourbon", "Granny Smith", "Ambrofi", "Serenolide", "Cashmeran", "Hedione", "Maio", "Haiti", "Chipre"];
const lower = (list) =>
  list.map((s) => PROPER.reduce((acc, w) => acc.replace(new RegExp(`\\b${w.toLowerCase()}\\b`, "gu"), w), s.toLowerCase()));

const genderLabel = { feminino: "feminina", masculino: "masculina", unissex: "unissex" };

export function buildDescription(p) {
  const parts = [];
  const tipo = p.concentration ? `${p.concentration} ` : "";
  const familia = p.olfactory_family ? `, da família olfativa ${p.olfactory_family.toLowerCase()}` : "";
  parts.push(`${p.name} é uma fragrância ${genderLabel[p.gender]} ${tipo ? `em versão ${tipo.trim()} ` : ""}de ${p.brand}${familia}.`);

  if (p.top_notes || p.heart_notes || p.base_notes) {
    const frases = [];
    if (p.top_notes) frases.push(`abre com ${join(lower(p.top_notes))}`);
    if (p.heart_notes) frases.push(`revela no coração ${join(lower(p.heart_notes))}`);
    if (p.base_notes) frases.push(`assenta sobre ${join(lower(p.base_notes))}`);
    parts.push(`A composição ${join(frases)}.`);
  } else if (p.highlights) {
    parts.push(`Entre os ingredientes em destaque estão ${join(lower(p.highlights))}. A pirâmide olfativa completa não foi confirmada por fonte confiável.`);
  } else {
    parts.push("A pirâmide olfativa ainda não foi confirmada por fonte confiável.");
  }

  if (p.occasion) parts.push(`Sugestão de uso: ${p.occasion.toLowerCase()}.`);
  return parts.join(" ");
}
