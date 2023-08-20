//Funciones de uso específico
function agregarAlCarrito(producto) { //funcion para agregar al carrito, busca que exista el item y luego le suma 1 a cantidad, además lo guarda en el localStorage
  let searchCarr = carrito.some((el) => el.id === producto.id)
  searchCarr ? (producto.quantity += 1) : (producto.quantity += 1, carrito.push(producto))
  carritoStore = JSON.stringify(carrito)
  localStorage.setItem("carrito", carritoStore)
}

function fixIoQuantity(quantity) { //funcion para filtrar valores erroneos en la cantidad de entradas o salidas
  quantity > 256 ? (quantity = 256) : null  //si lo ingresado supera el maximo de IO se setea el maximo
  quantity < 0 ? (quantity = 0) : null  //si se ingresa un valor negativo se setea 0
  return (quantity)
}

function fixPointsIo(points) {
  points !== 8 && points !== 16 && points !== 32 ? (points = 8) : null //solo existen 3 tipos de modulos de 8/16/32, si se ingresa un valor distinto se fija a 8
  return (points)
}
function addModule(arr, company, quantity, points, type) {
  const findMod = selectMod(arr, company, points, type)
  const quantityMod = calculateQuant(quantity, points)

  for (let i = 0; i < quantityMod; i++) {
    agregarAlCarrito(findMod)
  }
}
function calculateQuant(quantity, points) { //Funcion para calcular la cantidad de modulos necesarios para cumplir con lo ingresado por el usuario
  const quantityModules = Math.ceil(quantity / points)
  return (quantityModules)
}
function selectMod(arr, company, points, type) {  //Funcion para buscar modulo que coincida con los parametros ingresados en el formulario de IO

  type = type.toLowerCase()
  let modType
  type === "di" ? modType = "di" : modType = "do"
  const searchMod = arr.filter((el) => el.company === company && el[modType] == points)
  return (searchMod[0])
}

function totalPrice(arr) {  //Funcion para calcular el precio de todo el carrito
  let calP = 0
  for (const totalP of arr) {
    calP += totalP.price * totalP.quantity;
  }
  return (calP)
}

function eraseAllLocalStorage() {  //borrar todo el localStorage
  localStorage.clear();
  location.reload();
}

// Inicializacion de variables globales: 
let companyData
let allHardware
let productCards = document.getElementById("jscontainer");
let preferencia
let plcBuscados
let carrito = []
let companySelected
let form
let formWeb
let stepIndex = 0
let formIoData
let companyContainer
let plcContainer
let allPlc
let allModules

//Traemos la informacion de los JSON
fetch('./data/companies.json')
  .then((companyData) => companyData.json())
  .then(data => {
    companyData = data
    fetch('./data/products.json')
      .then(resp => resp.json())
      .then(data => {
        allHardware = data
        initProgram()
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '¡Error para acceder al catalogo de productos!',
        })
      });
  })
  .catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: '¡Error para acceder al catalogo de compañias!',
    })
  });


//Informacion para imprimir en el DOM
function companyCatalog({ image, name, description, target, protocol, id }) { //Imprime en el Dom las opciones de companias disponibles
  let companyCard = `
  <div class="cardContainer">
    <img src="${image}" class="cardContainer__img" alt="Imagen del producto" width="500">
    <div class="cardContainer__data">
      <h5 class="cardContainer__data-tittle">${name}</h5>
      <p class="cardContainer__data-text">${description}</p>
      <p class="cardContainer__data-text">Objetivo: ${target}</p>
      <p class="cardContainer__data-text">Protocolos: ${protocol}</p>
      <button class="cardContainer__data-button" id="${id}">Seleccionar</button>
    </div>
  </div>
   `;
  return (companyCard)
}
function plcCatalog({ image, name, description, spectrum, protocol, memory, price, id }) {  //Imprime en el Dom los PLC que se encontraron de la marca seleccionada
  let plcCard = `
        <div class="cardContainer">
          <img src="${image}" class="cardContainer__img" alt="Imagen del producto" width="500">
          <div class="cardContainer__data">
            <h5 class="cardContainer__data-tittle">${name}</h5>
            <p class="cardContainer__data-text">${description}</p>
            <p class="cardContainer__data-text">Gama: ${spectrum}</p>
            <p class="cardContainer__data-text">Comunicacion: ${protocol}</p>
            <p class="cardContainer__data-text">Memoria: ${memory} Mb</p>
            <p class="cardContainer__data-text">Precio: $${price}</p>
            <button class="cardContainer__data-button" id="${id}">Agregar al carrito</button>
          </div>
        </div>
    `;
  return (plcCard)
}
function endInfo({ image, name, quantity, type, price, description }) { //Imprime en el Dom el resumen final de lo seleccionado
  let endCard = `
  <div class="card mb-3" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${image}" class="img-fluid rounded-start" alt="imagen">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${type}: ${name}</h5>
        <p class="card-text">${description}</p>
        <p class="card-text">x${quantity} - ud. ${price} - total ${quantity * price}</p>
      </div>
    </div>
  </div>
  </div>
`;
  return (endCard)
}
//Imprime en el Dom el formulario de entradas y salidas
const formIO = `
<div>
  <br>
  <h2>Ingrese su cantidad de entradas y salidas</h2>
  <form id="form">
        <label for="diInputs">Entradas (0-256):</label><br>
        <input type="number" id="diInputs" name="diInputs" min="0" max="256" value="0"><br>
        <label for="diPoints">Puntos (8, 16, 32):</label><br>
        <input type="number" id="diPoints" name="diPoints" min="8" max="32" value="8"><br><br>
        <label for="doOutputs">Salidas (0-256):</label><br>
        <input type="number" id="doOutputs" name="doOutputs" min="0" max="256" value="0"><br>
        <label for="doPoints">Puntos (8, 16, 32):</label><br>
        <input type="number" id="doPoints" name="doPoints" min="8" max="32" value="8"><br><br>
        
  </form>
  <button class="btn btn-primary" id="sendIO">Confirmar IO</button>
</div>
`;

//Traemos toda la informacion del localStorage
companySelected = JSON.parse(localStorage.getItem("company"))
plcSelected = JSON.parse(localStorage.getItem("plc"))
formIoData = JSON.parse(localStorage.getItem("ioSelected"))
let carritoStore = JSON.parse(localStorage.getItem("carrito"))
if (carritoStore !== null) {
  carrito = carritoStore
}

//Armamos un index para determinar en donde se quedo el usuario la ultima vez
companySelected !== null ? stepIndex += 1 : null
plcSelected !== null ? stepIndex += 2 : null
formIoData !== null ? stepIndex += 4 : null

function initProgram() {
  //Separamos en dos el array de todos los productos para mayor comodidad
  allPlc = allHardware.filter((el) => el.type === "Plc");
  allModules = allHardware.filter((el) => el.type === "Modulo");

  if (stepIndex >= 3) { //comparacion para traernos la preferencia seleccionada
    preferencia = companySelected.name
  }
  switch (stepIndex) {  //Usando el index previamente creado decidimos que imprimir en el Dom
    case 7:
      createIoData(allModules, preferencia, formIoData[0])
      break;
    case 3:
      selectPlc(plcSelected)
      break;
    case 1:
      selectCompany(companySelected)
      break;
    case 0:
      generateCompanies()
      break;
  }
}
//1er paso: crear las tarjetas de seleccion de marca.
function generateCompanies() {   //funcion que genera las tarjetas de seleccion de marca
  companyContainer = document.createElement('div');
  companyContainer.className = 'companyContainer';
  productCards.append(companyContainer)
  for (let i = 0; i < companyData.length; i++) {
    const cardHTML = document.createElement('div');
    cardHTML.innerHTML = companyCatalog(companyData[i])
    companyContainer.append(cardHTML)
    const botonParaSelec = document.getElementById(`${companyData[i].id}`);
    botonParaSelec.addEventListener('click', () => selectCompany(companyData[i]));
  }
}

//2do paso crear tarjetas de seleccion de PLC. En caso de haberse seleccionado previamente lo vamos a obviar
function selectCompany(selCom) {
  preferencia = selCom.name
  companySelected = JSON.stringify(selCom)
  localStorage.setItem("company", companySelected)
  plcBuscados = allHardware.filter((el) => el.company === preferencia && el.type === "Plc")
  if (typeof companyContainer !== "undefined") { //Eliminamos del Dom las tarjetas de seleccion de marca porque ya seleccionamos una, el if es para evitar que cuando el usuario recargue la web quiera volver a eliminar algo que ya no está
    companyContainer.remove();
  }

  plcContainer = document.createElement('div');
  plcContainer.className = 'plcContainer';
  productCards.append(plcContainer)
  for (let i = 0; i < plcBuscados.length; i++) {

    const itemsCards = document.createElement('div');
    itemsCards.innerHTML = plcCatalog(plcBuscados[i])
    plcContainer.append(itemsCards)

    const botonParaAgregar = document.getElementById(`${plcBuscados[i].id}`);
    botonParaAgregar.addEventListener('click', () => selectPlc(plcBuscados[i]));

  }

}

//3er paso crear formulario de IO, donde usuario ingresa cantidad de entradas y salidas. En caso de haberse completado previamente lo vamos a obviar
function selectPlc(producto) {
  agregarAlCarrito(producto)
  const plcCard = document.getElementsByClassName("card")
  if (typeof plcContainer !== "undefined") { //Eliminamos del Dom las tarjetas de seleccion de PLC porque ya seleccionamos una, el if es para evitar que cuando el usuario recargue la web quiera volver a eliminar algo que ya no está
    plcContainer.remove();
  }
  plcSelected = JSON.stringify(producto)
  localStorage.setItem("plc", plcSelected)
  formWeb = document.createElement('div');
  formWeb.innerHTML = formIO
  productCards.append(formWeb)
  form = document.getElementById("form")
  formButton = document.getElementById("sendIO")
  formButton.addEventListener('click', () => sendIoData())

}

//4to paso crear toda la info final con lo seleccionado
function sendIoData() {
  formIoData = [{
    quantitydi: fixIoQuantity(Number(form[0].value)),
    diPoints: fixPointsIo(Number(form[1].value)),
    quantitydo: fixIoQuantity(Number(form[2].value)),
    doPoints: fixPointsIo(Number(form[3].value))
  }]
  IoSelected = JSON.stringify(formIoData)
  localStorage.setItem("ioSelected", IoSelected)
  formWeb.remove()
  plcSelected = JSON.parse(plcSelected)
  createIoData(allModules, preferencia, formIoData[0])
}

function createIoData(arr, company, { quantitydi, diPoints, quantitydo, doPoints }) {
  addModule(arr, company, quantitydi, diPoints, "di")
  addModule(arr, company, quantitydo, doPoints, "do")
  const endContainer = document.createElement('div');
  endContainer.className = 'endContainer';
  productCards.append(endContainer)
  for (let i = 0; i < carrito.length; i++) {
    const itemsCards = document.createElement('div');
    itemsCards.innerHTML = endInfo(carrito[i])
    endContainer.append(itemsCards)
  }
  const totalP = totalPrice(carrito)
  const totalPrint = document.createElement('div');
  totalPrint.className = 'endPrint';
  totalPrint.innerHTML = `
  <div class = "totalP">Total de la compra: ${totalP}
  </div>
`;
  endContainer.append(totalPrint)
}

let eraseButton = document.getElementById("eraseAll")
eraseButton.addEventListener('click', () => eraseAllLocalStorage())

