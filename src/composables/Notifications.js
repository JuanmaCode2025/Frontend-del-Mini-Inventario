import { Notify } from 'quasar'

// Función para usar notificaciones en toda la aplicación
export function Notifications() {
  
  // Mostrar mensaje de éxito (cuando algo sale bien)
  const success = (mensaje, descripcion = '') => {
    Notify.create({
      type: 'positive',          // Tipo: positivo (verde)
      message: mensaje,          // Mensaje principal
      caption: descripcion,      // Descripción adicional (opcional)
      position: 'top-right',     // Posición en la pantalla
      timeout: 3000,             // Tiempo en milisegundos (3 segundos)
      icon: 'check_circle',      // Ícono de check
    })
  }

  // Mostrar mensaje de error (cuando algo falla)
  const error = (errorRecibido, mensajePorDefecto = 'Error del sistema') => {
    
    // Variable para guardar el mensaje de error
    let mensajeError = mensajePorDefecto;
    
    // Buscar el mensaje de error en diferentes lugares donde podría estar
    if (errorRecibido?.response?.data) {
      const datosError = errorRecibido.response.data;
      
      // Si el error viene en formato de array con mensajes
      if (datosError.errors && Array.isArray(datosError.errors) && datosError.errors[0]?.msg) {
        mensajeError = datosError.errors[0].msg;
      } 
      // Si el error viene como "msg"
      else if (datosError.msg) {
        mensajeError = datosError.msg;
      } 
      // Si el error viene como "message"
      else if (datosError.message) {
        mensajeError = datosError.message;
      } 
      // Si el error es un texto directo
      else if (typeof datosError === 'string') {
        mensajeError = datosError;
      }
    } 
    // Si es un error normal de JavaScript
    else if (errorRecibido?.message) {
      mensajeError = errorRecibido.message;
    }

    // Mostrar la notificación de error
    Notify.create({
      type: 'negative',          // Tipo: negativo (rojo)
      message: mensajeError,     // Mensaje de error encontrado
      position: 'top-right',     // Posición en la pantalla
      timeout: 5000,             // Tiempo en milisegundos (5 segundos)
      icon: 'error',             // Ícono de error
    })
  }

  // Mostrar advertencia (cuando hay que tener cuidado)
  const warning = (mensaje, descripcion = '') => {
    Notify.create({
      type: 'warning',           // Tipo: advertencia (amarillo)
      message: mensaje,          // Mensaje principal
      caption: descripcion,      // Descripción adicional (opcional)
      position: 'top-right',     // Posición en la pantalla
      timeout: 3500,             // Tiempo en milisegundos (3.5 segundos)
      icon: 'warning',           // Ícono de advertencia
    })
  }

  // Mostrar información (mensajes informativos)
  const info = (mensaje, descripcion = '') => {
    Notify.create({
      type: 'info',              // Tipo: informativo (azul)
      message: mensaje,          // Mensaje principal
      caption: descripcion,      // Descripción adicional (opcional)
      position: 'top-right',     // Posición en la pantalla
      timeout: 3000,             // Tiempo en milisegundos (3 segundos)
      icon: 'info',              // Ícono de información
    })
  }

  // Devolver las funciones para que otros componentes las usen
  return {
    success,  // Para cosas que salen bien
    error,    // Para cosas que salen mal
    warning,  // Para advertencias
    info      // Para información
  }
}