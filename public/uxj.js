////BD///
var url_uxjs = "http://localhost:3000";

////////////////////////////
var sessionActual;
var sessionActual_id;
var ip = "";
var acciones_totales = [];
/** START SESSION */
$(document).ready(function() {
  var website = {
    url: window.location.host
  };

  var session = {
    path: window.location.pathname,
    time_in: new Date().getTime(),
    time_out: 0,
    ip: getIp()
  };

  sessionActual = session;

  guardarWebsiteSession(website, session);
});


/** ONCLICK ACTION */
$(document).click(function(event) {
  console.log(event.target.outerHTML);

  var action = {
    type: 1,
    id_element: event.target.id,
    x: event.clientX,
    y: event.clientX,
    date: new Date().getTime(),
    html: event.target.outerHTML,
    html_father: event.target.parentElement.outerHTML
  };
  acciones_totales.push(action);
  var elemento_acciones = {
    id_session: sessionActual_id,
    acciones: acciones_totales
  };
  guardarAcciones(elemento_acciones);
});

$(document).mousemove(function(event) {
  // Mover ratón
  accionMover = acciones_totales.find(a => a.type == 3);

  // No existe acción de tipo 3 registrada
  if ( accionMover == null) {
    var action = {
      type: 3,
      id_element: "",
      coordenadas: [ { x: event.pageX, y: event.pageY }],
      date : new Date().getTime(),
    };
    acciones_totales.push(action);

    // Sí existe, solo añadir la siguiente coordenada
  } else {
    accionMover.coordenadas.push( { x: event.pageX, y: event.pageY, date: new Date().getTime() } );
    accionMover.endDate = new Date().getTime();
  }
});

$(document).keypress(function(event) {
  // Mover click
  console.log(event);
  var action = {
    type: 2,
    id_element: "",
    x: 0,
    y: 0,
    date: new Date().getTime(),
    html: event.target.outerHTML,
    html_father: ""
  };
  acciones_totales.push(action);
});

function finalizarSesion() {
  var timeOUT = new Date().getTime();
  guardarFinSesion(timeOUT);
}

function getIp() {
  return JSON.parse(
    $.ajax({ type: "GET", url: "https://ipapi.co/json/", async: false })
      .responseText
  ).ip;
}

function guardarAcciones(acciones) {
  $.ajax({
    type: "POST",
    url: url_uxjs + "/actions",
    data: JSON.stringify(acciones),
    dataType: "json",
    contentType: "application/json",
    success: function() {
      console.log("Guardada acciones.");
      acciones_totales = [];
    }
  });
}

/** GUARDA SESSION */
function guardarWebsiteSession(website, session) {
  $.ajax({
    type: "POST",
    url: url_uxjs + "/page",
    data: JSON.stringify({
      url: website.url,
      path: session.path,
      time_in: session.time_in,
      time_out: session.time_out,
      ip: session.ip,
      os: session.os,
      browser: session.browser,
      ubication: session.ubication
    }),
    dataType: "json",
    contentType: "application/json",
    success: function(res) {
      console.log("Guardada sesion. Res: " + res.session._id);
      sessionActual_id = res.session._id;
    }
  });
}
