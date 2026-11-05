/**
 * ROTELITE - Lógica Front-end Interactiva
 * Manejo de navegación, calculadora hidráulica y envío de cotizaciones
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Elementos Generales
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const yearSpan = document.querySelector("[data-year]");
  const form = document.querySelector("#form-consulta");

  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  // 2. Sticky Header dinámico
  const handleScroll = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 15);
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // 3. Menú móvil accesible
  const setNavState = (isOpen) => {
    nav?.classList.toggle("is-open", isOpen);
    toggle?.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  toggle?.addEventListener("click", () => {
    const isCurrentlyOpen = nav?.classList.contains("is-open");
    setNavState(!isCurrentlyOpen);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavState(false));
  });

  // 4. Calculadora Hidráulica Interactiva
  const calcTipo = document.querySelector("#calc-tipo");
  const calcPersonas = document.querySelector("#calc-personas");
  const calcDias = document.querySelector("#calc-dias");
  const calcIncendio = document.querySelector("#calc-incendio");

  const personasVal = document.querySelector("#personas-val");
  const diasVal = document.querySelector("#dias-val");
  const resultadoLitros = document.querySelector("#resultado-litros");
  const resultadoDesc = document.querySelector("#resultado-descripcion");
  const consumoDiario = document.querySelector("#consumo-diario");
  const configSugerida = document.querySelector("#config-sugerida");
  const btnAplicarCotizacion = document.querySelector("#btn-aplicar-cotizacion");

  const dotaciones = {
    casa: 250,      // L por habitante por día
    edificio: 200,  // L por persona por día
    oficina: 70,    // L por empleado por día
    industria: 150  // L por operario por día
  };

  const calcularReserva = () => {
    if (!calcTipo || !calcPersonas || !calcDias) return;

    const tipo = calcTipo.value;
    const dotacion = dotaciones[tipo] || 250;
    const personas = parseInt(calcPersonas.value, 10);
    const dias = parseInt(calcDias.value, 10);
    const conSeguridad = calcIncendio?.checked ?? false;

    // Actualizar etiquetas
    if (personasVal) personasVal.textContent = personas;
    if (diasVal) diasVal.textContent = `${dias} ${dias === 1 ? 'día' : 'días'}`;

    const consumoDia = personas * dotacion;
    let totalLitros = consumoDia * dias;
    if (conSeguridad) {
      totalLitros = Math.round(totalLitros * 1.2);
    }

    // Redondear al múltiplo comercial más cercano
    let modeloRecomendado = "";
    let litrosFormateados = totalLitros.toLocaleString("es-AR");

    if (totalLitros <= 1200) {
      modeloRecomendado = "C-1000 (1.000 Litros compacta)";
    } else if (totalLitros <= 2700) {
      modeloRecomendado = "C-2500 (2.500 Litros unifamiliar)";
    } else if (totalLitros <= 5500) {
      modeloRecomendado = "C-5000 (5.000 Litros gran porte)";
    } else if (totalLitros <= 11000) {
      modeloRecomendado = "C-10000 (10.000 Litros cisterna)";
    } else {
      const cantidadTanques = Math.ceil(totalLitros / 10000);
      modeloRecomendado = `Batería modular de ${cantidadTanques} tanques C-10000 (${cantidadTanques * 10}k L)`;
    }

    if (resultadoLitros) resultadoLitros.textContent = litrosFormateados;
    if (consumoDiario) consumoDiario.textContent = `${consumoDia.toLocaleString("es-AR")} L/día`;
    if (configSugerida) configSugerida.textContent = modeloRecomendado;

    if (resultadoDesc) {
      resultadoDesc.textContent = `Sugerencia técnica: ${modeloRecomendado} con autonomía garantizada para ${personas} personas durante ${dias} día(s).`;
    }
  };

  if (calcTipo && calcPersonas && calcDias) {
    calcTipo.addEventListener("change", calcularReserva);
    calcPersonas.addEventListener("input", calcularReserva);
    calcDias.addEventListener("input", calcularReserva);
    calcIncendio?.addEventListener("change", calcularReserva);
    calcularReserva();
  }

  // Transferir cálculo al formulario de cotización
  btnAplicarCotizacion?.addEventListener("click", () => {
    const selectorTipo = document.querySelector("#form-tipo-reserva");
    const selectorCapacidad = document.querySelector("#form-capacidad-estimada");
    const campoMensaje = document.querySelector("#form-mensaje");

    if (selectorTipo && calcTipo) {
      if (calcTipo.value === "casa") selectorTipo.value = "Cisterna domiciliaria";
      else if (calcTipo.value === "edificio") selectorTipo.value = "Edificio o consorcio";
      else if (calcTipo.value === "industria") selectorTipo.value = "Uso industrial / RCI";
      else selectorTipo.value = "Asesoramiento técnico";
    }

    if (selectorCapacidad && resultadoLitros) {
      const litrosNum = parseInt(resultadoLitros.textContent.replace(/\D/g, ""), 10);
      if (litrosNum <= 1200) selectorCapacidad.value = "1.000 L";
      else if (litrosNum <= 2800) selectorCapacidad.value = "2.500 L";
      else if (litrosNum <= 5500) selectorCapacidad.value = "5.000 L";
      else if (litrosNum <= 11000) selectorCapacidad.value = "10.000 L";
      else selectorCapacidad.value = "Más de 20.000 L";
    }

    if (campoMensaje && resultadoLitros && configSugerida) {
      campoMensaje.value = `Estimado Francisco Dierna, realicé el cálculo en la web: requiero una reserva estimada de ${resultadoLitros.textContent} L (${configSugerida.textContent}) para ${calcPersonas.value} personas con ${calcDias.value} días de autonomía.`;
    }

    // Scroll suave hasta el formulario
    document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth" });
  });

  // 5. Generación de Mensaje Unificado
  const generarTextoMensaje = (formData) => {
    return [
      "🌊 *SOLICITUD DE COTIZACIÓN - ROTELITE*",
      "----------------------------------------",
      `👤 *Nombre:* ${formData.get("nombre") || "—"}`,
      `🏢 *Organización/Edificio:* ${formData.get("organizacion") || "Particular"}`,
      `📞 *Teléfono:* ${formData.get("telefono") || "—"}`,
      `✉️ *Correo:* ${formData.get("correo") || "—"}`,
      `🛠️ *Tipo de Sistema:* ${formData.get("tipo") || "No especificado"}`,
      `💧 *Capacidad Requerida:* ${formData.get("capacidad_estimada") || "A calcular"}`,
      "",
      "📝 *Detalle del Proyecto:*",
      `${formData.get("mensaje") || "Sin notas adicionales"}`,
      "----------------------------------------",
      "Enviado a través de la web oficial de Rotelite (Dirección: Francisco Dierna)"
    ].join("\n");
  };

  // 6. Validación y Envío del Formulario
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorBox = form.querySelector("[data-form-error]");
    const successBox = form.querySelector("[data-form-success]");
    const successDetail = form.querySelector("[data-success-detail]");
    const waSuccessBtn = document.querySelector("#success-wa-btn");

    const requiredFields = [...form.querySelectorAll("[required]")];
    let esValido = true;

    requiredFields.forEach((field) => {
      const vacioOInvalido = !field.checkValidity();
      field.classList.toggle("is-invalid", vacioOInvalido);
      if (vacioOInvalido) esValido = false;
    });

    if (!esValido) {
      if (errorBox) errorBox.hidden = false;
      form.querySelector(".is-invalid")?.focus();
      return;
    }

    if (errorBox) errorBox.hidden = true;

    const formData = new FormData(form);
    const mensajeCompleto = generarTextoMensaje(formData);

    // Intentar copiar al portapapeles
    try {
      await navigator.clipboard.writeText(mensajeCompleto);
    } catch {
      // Ignorar bloqueo de permisos
    }

    // Preparar enlace de WhatsApp para Francisco Dierna
    const waUrl = `https://wa.me/5491100000000?text=${encodeURIComponent(mensajeCompleto)}`;
    if (waSuccessBtn) {
      waSuccessBtn.href = waUrl;
    }

    // Mostrar estado exitoso
    [...form.children].forEach((child) => {
      if (child !== successBox) child.hidden = true;
    });
    if (successBox) successBox.hidden = false;
    if (successDetail) {
      successDetail.textContent = "El resumen del proyecto ha sido copiado en su portapapeles y está listo para ser enviado a Francisco Dierna.";
    }
  });

  // Botón directo "Enviar por WhatsApp"
  const btnWhatsApp = document.querySelector("#btn-enviar-whatsapp");
  btnWhatsApp?.addEventListener("click", () => {
    const formData = new FormData(form);
    const mensaje = generarTextoMensaje(formData);
    const waUrl = `https://wa.me/5491100000000?text=${encodeURIComponent(mensaje)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  });

  // Reiniciar formulario
  form?.querySelector("[data-reset]")?.addEventListener("click", () => {
    const successBox = form.querySelector("[data-form-success]");
    const errorBox = form.querySelector("[data-form-error]");
    form.reset();

    [...form.children].forEach((child) => {
      child.hidden = child === successBox;
    });
    if (errorBox) errorBox.hidden = true;
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    form.querySelector("input")?.focus();
  });
});
