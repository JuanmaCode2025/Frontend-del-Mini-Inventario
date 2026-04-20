/**
 * Composable para formateo de fechas en la aplicación.
 * Provee formatos relativos ("Hace 5 min") y formatos cortos localizados.
 *
 * @param {string} locale - Código de localización para Intl. Por defecto "es-CO".
 * @returns {{ formatRelativeDate: Function, formatShortDate: Function }}
 */
export function useDateFormatter(locale = "es-CO") {

  // ── Constantes de tiempo ──────────────────────────────────────────────────

  /** Milisegundos que contiene un minuto */
  const MS_PER_MINUTE   = 60_000;

  /** Minutos que contiene una hora */
  const MINUTES_IN_HOUR = 60;

  /** Minutos que contiene un día completo */
  const MINUTES_IN_DAY  = 1_440;

  // ── Etiquetas de UI (centralizado para facilitar i18n futura) ─────────────

  /**
   * Textos que se muestran en el formato relativo.
   * Centralizar los strings evita duplicarlos y facilita cambiar el idioma.
   */
  const LABELS = {
    now:     "Ahora",
    minutes: (n) => `Hace ${n} min`,
    hours:   (n) => `Hace ${n} h`,
    days:    (n) => `Hace ${n} días`,
    empty:   "—",
  };

  // ── Helpers internos ──────────────────────────────────────────────────────

  /**
   * Convierte un valor a Date y verifica que sea válido.
   * Centraliza la validación para no repetirla en cada función.
   *
   * @param {string|number|Date} rawDate - Valor crudo a convertir.
   * @returns {Date|null} Instancia de Date válida, o null si el valor es inválido.
   */
  function parseDate(rawDate) {
    if (!rawDate) return null;
    const date = new Date(rawDate);
    return isNaN(date.getTime()) ? null : date;
  }

  // ── Funciones públicas del composable ────────────────────────────────────

  /**
   * Formatea una fecha como tiempo relativo al momento actual.
   * Ejemplos: "Ahora", "Hace 5 min", "Hace 2 h", "Hace 3 días".
   * Para períodos mayores a un día muestra la cantidad de días transcurridos.
   *
   * @param {string|number|Date} rawDate - Fecha a formatear.
   * @returns {string} Texto relativo legible por el usuario.
   */
  function formatRelativeDate(rawDate) {
    const date = parseDate(rawDate);
    if (!date) return LABELS.empty;

    const elapsedMinutes = Math.floor((Date.now() - date) / MS_PER_MINUTE);

    if (elapsedMinutes < 1)               return LABELS.now;
    if (elapsedMinutes < MINUTES_IN_HOUR) return LABELS.minutes(elapsedMinutes);
    if (elapsedMinutes < MINUTES_IN_DAY)  return LABELS.hours(Math.floor(elapsedMinutes / MINUTES_IN_HOUR));

    // Para más de un día muestra la cantidad de días transcurridos
    return LABELS.days(Math.floor(elapsedMinutes / MINUTES_IN_DAY));
  }

  /**
   * Formatea una fecha en formato corto localizado incluyendo el año.
   * Ejemplo: "20 de mar de 2025, 06:27 p. m." (según locale es-CO).
   * El año se incluye para evitar ambigüedad en historiales de múltiples años.
   *
   * @param {string|number|Date} rawDate - Fecha a formatear.
   * @returns {string} Fecha corta localizada, o "—" si el valor es inválido.
   */
  function formatShortDate(rawDate) {
    const date = parseDate(rawDate);
    if (!date) return LABELS.empty;

    return new Intl.DateTimeFormat(locale, {
      day:    "2-digit",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  // ── API pública del composable ────────────────────────────────────────────

  return {
    formatRelativeDate,
    formatShortDate,
  };
}