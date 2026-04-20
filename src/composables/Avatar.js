/**
 * Composable para generar avatares visuales basados en el nombre de una persona.
 * Proporciona iniciales y estilos de color deterministas (el mismo nombre
 * siempre produce el mismo color), útil para listas de clientes y ventas.
 */

// ── Paleta de colores para los avatares ──────────────────────────────────────

/**
 * Se define fuera del composable porque es una constante estática
 * que no necesita recrearse en cada llamada — principio DRY.
 */
const AVATAR_PALETTE = [
  { bg: "#e3f2fd", color: "#1565c0" }, // Azul
  { bg: "#e8f5e9", color: "#2e7d32" }, // Verde
  { bg: "#f3e5f5", color: "#6a1b9a" }, // Morado
  { bg: "#fff8e1", color: "#f57c00" }, // Naranja
  { bg: "#fce4ec", color: "#c62828" }, // Rojo
  { bg: "#e0f7fa", color: "#00695c" }, // Teal
];

export function useAvatarHelper() {

  // ── Funciones públicas ──────────────────────────────────────────────────────

  /**
   * Extrae las iniciales de un nombre completo (máximo 2 caracteres).
   * Ejemplos:
   *   "Juan Pérez"   → "JP"
   *   "María"        → "MA" — No, solo toma primera letra de cada palabra → "M"
   *   "Ana María López" → "AM"
   *
   * @param {string} name - Nombre completo de la persona.
   * @returns {string} Iniciales en mayúsculas (1 o 2 caracteres).
   */
  function getInitials(name = "") {
    return (name ?? "")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Genera un estilo CSS inline para el avatar basado en el nombre.
   * El color es determinista: el mismo nombre siempre produce el mismo color,
   * lo que garantiza consistencia visual entre recargas de página.
   * El índice se calcula con el código ASCII de la primera letra del nombre.
   *
   * @param {string} name - Nombre completo de la persona.
   * @returns {string} String de estilos CSS inline listo para usar en :style.
   */
  function getAvatarStyle(name = "") {
    const idx           = ((name ?? "").charCodeAt(0) || 0) % AVATAR_PALETTE.length;
    const { bg, color } = AVATAR_PALETTE[idx];
    return `background:${bg};color:${color};font-size:0.72rem;font-weight:700`;
  }

  // ── API pública ─────────────────────────────────────────────────────────────

  return {
    getInitials,
    getAvatarStyle,
  };
}