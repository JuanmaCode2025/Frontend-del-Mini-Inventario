
export function useCurrency() {

// Formatea un número a moneda (por defecto COP)
  const formatCurrency = (valor, currency = "COP", locale = "es-CO") => {
    
    // Si valor es null o undefined, usamos 0
    const safeValue = valor ?? 0;

    // Intl.NumberFormat es una API nativa de JS para formatear números
    return new Intl.NumberFormat(locale, {
      style: "currency",   // Indica que es formato de dinero
      currency: currency ,  // Tipo de moneda
      maximumFractionDigits: 0,
    }).format(safeValue);
  };

  // Retornamos la función para poder usarla fuera
  return {
    formatCurrency
  };
}

/**
 * Composable para formateo y parseo de valores monetarios.
 * Usa la API nativa Intl.NumberFormat para garantizar localización correcta.
 *
 * @param {string} currency - Código de moneda ISO 4217. Por defecto "COP".
 * @param {string} locale   - Código de localización. Por defecto "es-CO".
 * @returns {{ formatCurrency: Function, parseCurrency: Function }}
 */
// export function useCurrency(currency = "COP", locale = "es-CO") {

//   // ── Instancia única del formatter ─────────────────────────────────────────

//   /**
//    * Se crea una sola vez por composable en lugar de en cada llamada.
//    * Intl.NumberFormat es costoso de instanciar — reutilizarlo mejora el rendimiento
//    * cuando se formatean múltiples valores (ej: listas de productos o ventas).
//    */
//   const currencyFormatter = new Intl.NumberFormat(locale, {
//     style:                "currency",
//     currency:             currency,
//     maximumFractionDigits: 0,
//   });

//   // ── Funciones públicas ────────────────────────────────────────────────────

//   /**
//    * Convierte un valor numérico a su representación como moneda localizada.
//    * Ejemplo: 15000 → "$ 15.000" (con locale es-CO y currency COP).
//    *
//    * @param {number|string|null|undefined} amount - Valor a formatear.
//    * @returns {string} Cadena formateada como moneda.
//    */
//   function formatCurrency(amount) {
//     // Conversión explícita a Number para blindar entradas tipo string ("1500")
//     // Si el valor no es convertible, Number() retorna NaN y usamos 0 como fallback
//     const safeAmount = Number(amount ?? 0);
//     return currencyFormatter.format(isNaN(safeAmount) ? 0 : safeAmount);
//   }

//   /**
//    * Convierte una cadena formateada como moneda de vuelta a un número.
//    * Útil para procesar valores que vienen de inputs con máscara de moneda.
//    * Ejemplo: "$ 15.000" → 15000.
//    *
//    * @param {string} formattedValue - Cadena con formato de moneda.
//    * @returns {number} Valor numérico limpio, o 0 si el resultado es inválido.
//    */
//   function parseCurrency(formattedValue) {
//     // Elimina todo lo que no sea dígito ni punto decimal
//     const cleaned = String(formattedValue ?? "").replace(/[^\d.]/g, "");
//     const parsed  = Number(cleaned);
//     return isNaN(parsed) ? 0 : parsed;
//   }

//   // ── API pública ───────────────────────────────────────────────────────────

//   return {
//     formatCurrency,
//     parseCurrency,
//   };
// }