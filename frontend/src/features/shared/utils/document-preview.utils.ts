/**
 * Utility per gestire preview e download di documenti tramite presigned URL
 */

export type DocumentActionMode = "preview" | "download";

/**
 * Gestisce l'apertura in preview o il download di un documento tramite presigned URL
 *
 * @param presignedUrl - URL presigned del documento
 * @param mode - Modalità: "preview" apre in nuova tab, "download" forza il download
 *
 * @example
 * // Preview (forza la visualizzazione nel browser)
 * handleDocumentAction(url, "preview");
 *
 * // Download (forza il download)
 * handleDocumentAction(url, "download");
 */
export async function handleDocumentAction(
  presignedUrl: string,
  mode: DocumentActionMode,
): Promise<void> {
  if (mode === "preview") {
    // Preview: usa fetch per ottenere il blob e creare un blob URL locale
    // Questo bypassa il Content-Disposition: attachment del presigned URL
    try {
      const response = await fetch(presignedUrl);
      if (!response.ok) {
        throw new Error("Errore nel recupero del documento");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Apri il blob URL in una nuova tab
      // Il browser aprirà PDF/immagini direttamente, altri formati potrebbero scaricare
      window.open(blobUrl, "_blank");

      // Pulisci il blob URL dopo un po' (il browser lo manterrà finché la tab è aperta)
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Errore durante la preview del documento:", error);
      // Fallback: apri direttamente l'URL (potrebbe scaricare se Content-Disposition è attachment)
      window.open(presignedUrl, "_blank");
    }
  } else {
    // Download: forza il download
    const link = document.createElement("a");
    link.href = presignedUrl;
    link.download = ""; // Forza il download invece di aprire
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
