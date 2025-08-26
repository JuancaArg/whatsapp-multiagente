import fetch from "node-fetch";

/**
 * Descarga un media de WhatsApp Cloud y lo devuelve en base64
 * @param {string} idMedia - ID del media (p.e. "596295676752303")
 * @returns {Promise<{ base64: string, mime_type: string, id: string }>}
 */
export async function DescargaMedia(idMedia, accessToken = process.env.META_WHATSAPP_TOKEN) {
  if (!idMedia) throw new Error("idMedia es requerido");
  if (!accessToken) throw new Error("accessToken es requerido");

  // 1) Obtener metadata (y URL firmada) del media
  const metaUrl = `https://graph.facebook.com/v22.0/${idMedia}?access_token=${accessToken}`;
  const metaRes = await fetch(metaUrl);

  const metaBody = await metaRes.json().catch(() => ({}));
  if (!metaRes.ok) {
    const msg = metaBody?.error?.message || metaRes.statusText;
    throw new Error(`No se pudo obtener metadata del media (${metaRes.status}): ${msg}`);
  }

  const { url, mime_type, id } = metaBody || {};
  if (!url) {
    throw new Error(`La respuesta no contiene "url". Respuesta: ${JSON.stringify(metaBody)}`);
  }

  // 2) Descargar binario desde lookaside, enviando el token
  //    a) Intento con Authorization header
  let mediaRes = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    redirect: "follow",
  });

  //    b) Si sigue 401/403, intento agregando ?access_token=...
  if (!mediaRes.ok && (mediaRes.status === 401 || mediaRes.status === 403)) {
    const u = new URL(url);
    // Evita duplicarlo si ya existe
    if (!u.searchParams.has("access_token")) {
      u.searchParams.set("access_token", accessToken);
    }
    mediaRes = await fetch(u.toString(), { redirect: "follow" });
  }

  if (!mediaRes.ok) {
    const errText = await mediaRes.text().catch(() => "");
    throw new Error(
      `Error al descargar media (${mediaRes.status} ${mediaRes.statusText}): ${errText.slice(0, 300)}`
    );
  }

  // 3) Convertir a base64
  const buffer = Buffer.from(await mediaRes.arrayBuffer());
  const base64 = buffer.toString("base64");

  return { base64, mime_type, id };
}
