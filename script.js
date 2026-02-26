const btn=document.getElementById("btnBienvenido");
const inicio=document.getElementById("inicio");
const interfaz=document.getElementById("interfaz");
const horaEl = document.getElementById("hora");
const fechaEl = document.getElementById("fecha");
const contenido = document.getElementById("contenido");
const btnCalendario = document.getElementById("btnCalendario");
const btnPeso = document.getElementById("btnPeso");


window.addEventListener("load",()=>{
    btn.classList.add("mostrar");
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
    setTimeout(()=>{
        inicio.classList.add("ocultar")
        setTimeout(()=>{
            inicio.style.display="none";
            interfaz.classList.add("activo");
            interfaz.style.display="flex";
        },600);
    },4000);
});

function actualizarReloj() {
  const ahora = new Date();

  const hh = String(ahora.getHours()).padStart(2, "0");
  const mm = String(ahora.getMinutes()).padStart(2, "0");
  const ss = String(ahora.getSeconds()).padStart(2, "0");
  horaEl.textContent = `${hh}:${mm}:${ss}`;

  const d = String(ahora.getDate()).padStart(2, "0");
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const y = ahora.getFullYear();
  fechaEl.textContent = `${d}/${m}/${y}`;
}

const DIAS_SEMANA = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
let fechaSeleccionada = new Date();
let mesMostrado = new Date();

function keyDia(date){
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; 
}

function getAsistencias(){
  return JSON.parse(localStorage.getItem("asistenciasGym") || "{}");
}

function setAsistencias(obj){
  localStorage.setItem("asistenciasGym", JSON.stringify(obj));
}

function nombreMes(m){
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return meses[m];
}

function primerDiaLunes(d){
  const js = d.getDay(); 
  return (js + 6) % 7;  
}

function renderCalendario(){
  const hoy = new Date();
  const año = mesMostrado.getFullYear();
  const mes = mesMostrado.getMonth();
  const first = new Date(año, mes, 1);
  const offset = primerDiaLunes(first);
  const diasMes = new Date(año, mes + 1, 0).getDate();
  const asist = getAsistencias();

  if (
  fechaSeleccionada.getFullYear() !== año ||
  fechaSeleccionada.getMonth() !== mes
    ) {
  fechaSeleccionada = new Date(año, mes, 1);
    }

  let html = `
    <div class="calWrap">
      <div>
            <div class="calHeader">
                <button class="calNav" id="mesAnterior">◀</button>
                <div class="calTitulo">${nombreMes(mes)} ${año}</div>
                <button class="calNav" id="mesSiguiente">▶</button>
            </div>

        <div class="calGrid">
          ${DIAS_SEMANA.map(d => `<div class="diaSemana">${d}</div>`).join("")}
  `;

  for(let i=0;i<offset;i++){
    html += `<div></div>`;
  }

  for(let d=1; d<=diasMes; d++){
    const date = new Date(año, mes, d);
    const k = keyDia(date);

    const esHoy = (d === hoy.getDate());
    const clases = [
      "dia",
      esHoy ? "hoy" : "",
      (k === keyDia(fechaSeleccionada)) ? "seleccionado" : "",
      asist[k] ? "asistio" : ""
    ].filter(Boolean).join(" ");

    html += `<div class="${clases}" data-fecha="${k}">${d}</div>`;
  }

  html += `
        </div>
      </div>

      <div class="panelAsisti">
        <h3>Asistí</h3>
        <div class="infoFecha" id="infoFecha"></div>
        <button class="btnAsisti" id="btnAsisti">Marcar asistencia</button>
      </div>
    </div>
  `;

  contenido.innerHTML = html;

  actualizarPanelAsisti();
  document.getElementById("mesAnterior").addEventListener("click", () => {
    mesMostrado.setMonth(mesMostrado.getMonth() - 1);
    renderCalendario();
  });

  document.getElementById("mesSiguiente").addEventListener("click", () => {
    mesMostrado.setMonth(mesMostrado.getMonth() + 1);
    renderCalendario();
  });

  document.querySelectorAll(".dia").forEach(el => {
    el.addEventListener("click", () => {
      const k = el.dataset.fecha;
      const [yy, mm, dd] = k.split("-").map(Number);
      fechaSeleccionada = new Date(yy, mm - 1, dd);

      document.querySelectorAll(".dia").forEach(x => x.classList.remove("seleccionado"));
      el.classList.add("seleccionado");

      actualizarPanelAsisti();
    });
  });

  document.getElementById("btnAsisti").addEventListener("click", () => {
    const k = keyDia(fechaSeleccionada);
    const a = getAsistencias();

    a[k] = !a[k];
    setAsistencias(a);

    renderCalendario();
  });
}

function actualizarPanelAsisti(){
  const a = getAsistencias();
  const k = keyDia(fechaSeleccionada);

  const d = String(fechaSeleccionada.getDate()).padStart(2, "0");
  const m = String(fechaSeleccionada.getMonth() + 1).padStart(2, "0");
  const y = fechaSeleccionada.getFullYear();

  const info = document.getElementById("infoFecha");
  const btn = document.getElementById("btnAsisti");

  info.textContent = `Día seleccionado: ${d}/${m}/${y}`;

  if(a[k]){
    btn.classList.add("activo");
    btn.textContent = "Asistencia marcada ✅";
  }else{
    btn.classList.remove("activo");
    btn.textContent = "Marcar asistencia";
  }
}

btnCalendario.addEventListener("click", () => {
  mesMostrado = new Date();     
  fechaSeleccionada = new Date(); 
  renderCalendario();
});

const KEY_PESO = "historialPeso"; 

function getHistorialPeso(){
  return JSON.parse(localStorage.getItem(KEY_PESO) || "[]");
}

function setHistorialPeso(arr){
  localStorage.setItem(KEY_PESO, JSON.stringify(arr));
}

function clasificarIMCDetalle(imc){
  if (imc < 18.5) return {cat:"Bajo peso", detalle:"Riesgo de déficit nutricional. Si te sientes débil o bajas rápido, mejor revisar alimentación."};
  if (imc < 25)   return {cat:"Peso saludable", detalle:"Rango saludable. Mantén constancia con entrenamiento y alimentación."};
  if (imc < 30)   return {cat:"Sobrepeso", detalle:"Puede aumentar el riesgo cardiovascular. Buen objetivo: mejorar hábitos y actividad."};

  if (imc < 35)   return {cat:"Obesidad (Clase I)", detalle:"Riesgo elevado. Recomendable plan de ejercicio + dieta y control médico si aplica."};
  if (imc < 40)   return {cat:"Obesidad (Clase II)", detalle:"Riesgo alto. Ideal acompañamiento profesional para un plan sostenible."};
  return           {cat:"Obesidad (Clase III)", detalle:"Riesgo muy alto. Prioriza atención profesional (médico/nutrición)."};
}

function pesoSaludableRango(alturaM){
  const min = 18.5 * alturaM * alturaM;
  const max = 24.9 * alturaM * alturaM;
  return {min, max};
}

function formatFechaHora(ts){
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2,"0");
  const mi = String(d.getMinutes()).padStart(2,"0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

function renderPeso(){
  contenido.innerHTML = `
    <div class="pesoWrap">
      <div class="card">
        <h2>Peso y Altura (Masculino) — IMC</h2>

        <div class="grid2">
          <div class="campo">
            <label for="inpPeso">Peso (kg)</label>
            <input id="inpPeso" type="number" step="0.1" placeholder="Ej: 72.5">
          </div>

          <div class="campo">
            <label for="inpAltura">Altura (cm)</label>
            <input id="inpAltura" type="number" step="1" placeholder="Ej: 175">
          </div>
        </div>

        <div class="acciones">
          <button class="btnPrimario" id="btnGuardarIMC">Guardar</button>
          <button class="btnSec" id="btnLimpiarIMC">Limpiar</button>
        </div>

        <div class="resultado" id="resultadoIMC" style="display:none;">
          <div class="imc" id="txtImc">IMC: --</div>
          <div class="badge" id="txtCat"></div>
          <div class="detalle" id="txtDetalle"></div>
          <div class="detalle" id="txtRango"></div>
          <div class="detalle" id="txtCambio" style="margin-top:10px;"></div>
          <div style="margin-top:10px; font-size:12px; color:#64748b;">
            Nota: El IMC es una medida orientativa; no distingue grasa vs músculo. :contentReference[oaicite:6]{index=6}
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Historial</h2>
        <div id="historialTabla"></div>
      </div>
    </div>
  `;

  pintarHistorial();

  document.getElementById("btnGuardarIMC").addEventListener("click", () => {
    const peso = parseFloat(document.getElementById("inpPeso").value);
    const alturaCm = parseFloat(document.getElementById("inpAltura").value);

    if (!peso || !alturaCm || peso <= 0 || alturaCm <= 0){
      alert("Ingresa peso y altura válidos.");
      return;
    }

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM); 
    const info = clasificarIMCDetalle(imc);
    const rango = pesoSaludableRango(alturaM);

    const hist = getHistorialPeso();
    let cambioTxt = "Primera medición guardada.";
    if (hist.length > 0){
      const ultimo = hist[hist.length - 1];
      const diff = peso - ultimo.peso;
      if (Math.abs(diff) < 0.05) cambioTxt = "Sin cambio vs la última medición.";
      else if (diff > 0) cambioTxt = `Subiste ${diff.toFixed(1)} kg vs la última medición.`;
      else cambioTxt = `Bajaste ${Math.abs(diff).toFixed(1)} kg vs la última medición.`;
    }

    hist.push({
      ts: Date.now(),
      peso,
      alturaCm,
      imc: Number(imc.toFixed(1)),
      categoria: info.cat
    });
    setHistorialPeso(hist);

    document.getElementById("resultadoIMC").style.display = "block";
    document.getElementById("txtImc").textContent = `IMC: ${imc.toFixed(1)}`;
    document.getElementById("txtCat").textContent = info.cat;
    document.getElementById("txtDetalle").textContent = info.detalle;
    document.getElementById("txtRango").textContent =
      `Rango saludable estimado (para tu altura): ${rango.min.toFixed(1)} kg – ${rango.max.toFixed(1)} kg.`;
    document.getElementById("txtCambio").textContent = cambioTxt;

    pintarHistorial();
  });

  document.getElementById("btnLimpiarIMC").addEventListener("click", () => {
    document.getElementById("inpPeso").value = "";
    document.getElementById("inpAltura").value = "";
    document.getElementById("resultadoIMC").style.display = "none";
  });
}

function pintarHistorial(){
  const cont = document.getElementById("historialTabla");
  if (!cont) return;

  const hist = getHistorialPeso();
  if (hist.length === 0){
    cont.innerHTML = `<div style="color:#64748b; font-weight:700;">Aún no hay registros.</div>`;
    return;
  }

  let html = `
    <table class="tabla">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Peso</th>
          <th>Altura</th>
          <th>IMC</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;

  hist.slice().reverse().forEach((r, idxRev) => {
    const idx = hist.length - 1 - idxRev;
    html += `
      <tr>
        <td>${formatFechaHora(r.ts)}</td>
        <td>${r.peso.toFixed(1)} kg</td>
        <td>${r.alturaCm} cm</td>
        <td>${r.imc}</td>
        <td><button class="btnMini" data-del="${idx}">Eliminar</button></td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  cont.innerHTML = html;

  cont.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.del);
      const hist2 = getHistorialPeso();
      hist2.splice(i, 1);
      setHistorialPeso(hist2);
      pintarHistorial();
    });
  });
}

btnPeso.addEventListener("click", () => {
  renderPeso();
});