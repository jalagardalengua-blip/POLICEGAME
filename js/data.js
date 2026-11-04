// Patrulla España · datos del juego (geografía, ciudades, misiones, personal)
// Todo lo que es "contenido" vive aquí para poder ampliarlo sin tocar el motor.
window.PE_DATA = (() => {
'use strict';

// Contornos aproximados [longitud, latitud]
const POLY = {
  spain:[[-9.3,43.05],[-9.2,43.2],[-8.9,43.33],[-8.4,43.38],[-8.2,43.6],[-7.7,43.75],[-7.0,43.55],[-6.2,43.57],[-5.8,43.62],[-5.2,43.48],[-4.5,43.4],[-3.8,43.47],[-3.4,43.43],[-2.9,43.42],[-2.3,43.32],[-1.8,43.38],[-1.4,43.2],[-0.7,42.9],[0.7,42.8],[1.4,42.6],[2.2,42.4],[3.2,42.45],[3.2,41.9],[2.8,41.65],[2.2,41.38],[1.6,41.2],[1.0,41.05],[0.85,40.72],[0.6,40.6],[0.0,40.0],[-0.3,39.5],[-0.2,39.1],[0.2,38.75],[-0.1,38.55],[-0.5,38.33],[-0.7,37.95],[-0.75,37.62],[-1.3,37.55],[-1.65,37.35],[-1.9,37.0],[-2.1,36.73],[-2.6,36.83],[-3.2,36.75],[-4.0,36.73],[-4.42,36.68],[-4.75,36.48],[-5.15,36.42],[-5.35,36.16],[-5.6,36.0],[-5.95,36.2],[-6.2,36.4],[-6.3,36.52],[-6.38,36.78],[-6.5,36.95],[-6.95,37.15],[-7.4,37.18],[-7.5,37.6],[-7.0,38.2],[-7.3,38.8],[-7.0,39.6],[-7.5,39.7],[-6.9,40.3],[-6.85,41.0],[-6.2,41.6],[-6.6,41.95],[-7.4,41.85],[-8.1,42.0],[-8.85,41.88],[-8.88,42.1],[-8.7,42.25],[-8.9,42.45],[-8.95,42.75],[-9.25,42.9]],
  portugal:[[-8.85,41.88],[-8.75,41.4],[-8.65,41.0],[-8.9,40.2],[-9.1,39.6],[-9.5,38.78],[-9.2,38.65],[-8.9,38.5],[-8.8,38.0],[-8.9,37.4],[-9.0,37.0],[-8.6,37.1],[-7.9,37.0],[-7.4,37.18],[-7.5,37.6],[-7.0,38.2],[-7.3,38.8],[-7.0,39.6],[-7.5,39.7],[-6.9,40.3],[-6.85,41.0],[-6.2,41.6],[-6.6,41.95],[-7.4,41.85],[-8.1,42.0]],
  france:[[-1.8,43.38],[-1.4,43.2],[-0.7,42.9],[0.7,42.8],[1.4,42.6],[2.2,42.4],[3.2,42.45],[3.1,43.1],[4.0,43.5],[4.8,43.4],[5.0,45],[-1.6,45],[-1.3,44.3],[-1.5,43.6]],
  africa:[[-10,33.5],[-6.9,34.0],[-6.3,35.0],[-6.0,35.5],[-5.92,35.79],[-5.6,35.85],[-5.35,35.9],[-5.3,35.85],[-5.2,35.6],[-4.6,35.2],[-3.9,35.25],[-3.0,35.25],[-2.9,35.45],[-2.2,35.1],[-1.3,35.3],[0.0,35.85],[1.0,36.4],[2.5,36.6],[4.8,36.9],[4.8,33.5]],
  mallorca:[[2.35,39.58],[2.6,39.95],[3.15,39.95],[3.47,39.72],[3.25,39.35],[2.95,39.36],[2.7,39.52],[2.5,39.48]],
  menorca:[[3.8,40.0],[3.85,40.07],[4.3,39.95],[4.3,39.82],[3.95,39.92]],
  ibiza:[[1.2,38.97],[1.35,39.1],[1.62,39.05],[1.55,38.85],[1.3,38.86]],
};
const OWNLAND = ['spain','mallorca','menorca','ibiza'];

const RIVERS = {
  Guadalquivir:[[-2.8,37.95],[-3.8,37.95],[-4.8,37.85],[-5.6,37.55],[-5.98,37.39],[-6.1,37.1],[-6.35,36.85],[-6.38,36.79]],
  Ebro:[[-3.9,43.0],[-2.5,42.5],[-1.6,42.05],[-0.88,41.65],[0.0,41.3],[0.5,40.95],[0.85,40.72]],
  Tajo:[[-1.9,40.4],[-3.0,40.1],[-3.7,39.95],[-4.8,39.9],[-6.0,39.7],[-7.0,39.65]],
  Duero:[[-2.6,41.8],[-3.7,41.6],[-4.7,41.5],[-5.7,41.5],[-6.4,41.1],[-6.85,41.0]],
  Guadiana:[[-3.0,39.1],[-4.5,39.05],[-6.0,38.9],[-7.0,38.6],[-7.4,37.6],[-7.42,37.2]],
};
// [lon, lat, radio en grados, nieve]
const MOUNTAINS = [
  [0.5,42.7,.55,1],[-0.6,42.75,.5,1],[1.6,42.5,.45,1],[-4.4,40.55,.5,0],[-3.7,40.85,.4,1],[-3.3,37.05,.4,1],
  [-5.6,43.0,.55,1],[-4.4,43.1,.45,0],[-2.4,41.5,.6,0],[-5.0,38.2,.7,0],[-1.8,40.3,.5,0],[-6.5,42.4,.5,0],[-2.6,37.9,.4,0],[-5.2,36.75,.25,0]
];

const CITIES = [
  {id:'madrid',n:'Madrid',lo:-3.70,la:40.42,r:700,cost:0,hue:215},
  {id:'barcelona',n:'Barcelona',lo:2.17,la:41.39,r:540,cost:4000,hue:20},
  {id:'valencia',n:'Valencia',lo:-0.38,la:39.47,r:500,cost:3000,hue:35},
  {id:'sevilla',n:'Sevilla',lo:-5.98,la:37.39,r:470,cost:2200,hue:45},
  {id:'zaragoza',n:'Zaragoza',lo:-0.88,la:41.65,r:380,cost:1800,hue:200},
  {id:'bilbao',n:'Bilbao',lo:-2.93,la:43.26,r:300,cost:2000,hue:160},
  {id:'coruna',n:'A Coruña',lo:-8.41,la:43.36,r:280,cost:1800,hue:190},
  {id:'vigo',n:'Vigo',lo:-8.72,la:42.24,r:260,cost:2000,hue:175},
  {id:'malaga',n:'Málaga',lo:-4.42,la:36.72,r:340,cost:1500,hue:30},
  {id:'marbella',n:'Marbella',lo:-4.88,la:36.51,r:300,cost:1800,hue:330},
  {id:'algeciras',n:'Algeciras',lo:-5.45,la:36.13,r:280,cost:2500,hue:10},
  {id:'cadiz',n:'Cádiz',lo:-6.29,la:36.53,r:210,cost:2000,hue:50},
  {id:'sanlucar',n:'Sanlúcar',lo:-6.35,la:36.78,r:210,cost:1600,hue:60},
  {id:'huelva',n:'Huelva',lo:-6.95,la:37.26,r:240,cost:1600,hue:70},
  {id:'almeria',n:'Almería',lo:-2.46,la:36.84,r:260,cost:1600,hue:40},
  {id:'murcia',n:'Murcia',lo:-1.13,la:37.98,r:300,cost:1700,hue:25},
  {id:'alicante',n:'Alicante',lo:-0.48,la:38.35,r:300,cost:2000,hue:200},
  {id:'granada',n:'Granada',lo:-3.60,la:37.18,r:280,cost:1700,hue:350},
  {id:'palma',n:'Palma',lo:2.65,la:39.57,r:260,cost:3000,hue:185},
  {id:'toledo',n:'Toledo',lo:-4.02,la:39.86,r:250,cost:1400,hue:40},
  {id:'valladolid',n:'Valladolid',lo:-4.72,la:41.65,r:320,cost:1700,hue:30},
  {id:'salamanca',n:'Salamanca',lo:-5.66,la:40.97,r:270,cost:1500,hue:45},
  {id:'burgos',n:'Burgos',lo:-3.70,la:42.34,r:260,cost:1500,hue:200},
  {id:'leon',n:'León',lo:-5.57,la:42.60,r:250,cost:1500,hue:15},
  {id:'oviedo',n:'Oviedo',lo:-5.84,la:43.36,r:260,cost:1700,hue:160},
  {id:'santander',n:'Santander',lo:-3.80,la:43.46,r:250,cost:1700,hue:190},
  {id:'pamplona',n:'Pamplona',lo:-1.64,la:42.81,r:260,cost:1700,hue:350},
  {id:'caceres',n:'Cáceres',lo:-6.37,la:39.47,r:240,cost:1300,hue:35},
  {id:'badajoz',n:'Badajoz',lo:-6.97,la:38.88,r:250,cost:1400,hue:50},
  {id:'cordoba',n:'Córdoba',lo:-4.78,la:37.88,r:300,cost:1600,hue:40},
  {id:'jaen',n:'Jaén',lo:-3.79,la:37.77,r:230,cost:1300,hue:60},
  {id:'tarragona',n:'Tarragona',lo:1.25,la:41.12,r:260,cost:1800,hue:25},
  {id:'castellon',n:'Castellón',lo:-0.05,la:39.99,r:240,cost:1500,hue:210},
];

// Autovías principales [ciudad A, ciudad B, rótulo]
const HIGHWAYS = [
  ['madrid','zaragoza','A-2'],['zaragoza','barcelona','AP-2'],['madrid','valencia','A-3'],
  ['valencia','alicante','AP-7'],['alicante','murcia','A-7'],['murcia','almeria','A-7'],['almeria','granada','A-92'],
  ['granada','malaga','A-45'],['sevilla','huelva','A-49'],
  ['sevilla','cadiz','AP-4'],['cadiz','sanlucar',''],['sanlucar','sevilla',''],['cadiz','algeciras','A-48'],
  ['algeciras','marbella','AP-7'],['marbella','malaga','AP-7'],['malaga','sevilla','A-92'],['madrid','bilbao','A-1'],
  ['bilbao','zaragoza','AP-68'],['coruna','vigo','AP-9'],['murcia','madrid','A-30'],
  ['madrid','toledo','A-42'],['madrid','valladolid','A-6'],['valladolid','leon','A-60'],['leon','oviedo','AP-66'],['leon','coruna','A-6'],
  ['valladolid','burgos','A-62'],['burgos','bilbao','AP-68'],['santander','bilbao','A-8'],['oviedo','santander','A-8'],['burgos','santander','A-67'],
  ['valladolid','salamanca','A-62'],['salamanca','caceres','A-66'],['caceres','badajoz','A-58'],['madrid','caceres','A-5'],['badajoz','sevilla','A-66'],
  ['cordoba','sevilla','A-4'],['madrid','cordoba','A-4'],['cordoba','jaen','A-316'],['jaen','granada','A-44'],
  ['zaragoza','pamplona','AP-15'],['pamplona','bilbao','A-15'],['barcelona','tarragona','AP-7'],['tarragona','castellon','AP-7'],['castellon','valencia','AP-7'],
];

const UPG = {
  det:{n:'Detective',base:400,k:1.6,max:10,d:'Nuevo personaje. Interroga legalmente y pasa casos al juez',g:'p',role:'detective'},
  ana:{n:'Analista de inteligencia',base:600,k:1.7,max:5,d:'Nuevo personaje. Genera 1 dato de inteligencia cada 8 horas',g:'p',role:'analista'},
  k9:{n:'Guía canino y perro',base:1500,k:1.8,max:3,d:'Nuevo personaje con perro. Detecta droga y da indicios legales',g:'p',role:'guia'},
  mar:{n:'Unidad marítima',base:2500,k:1,max:1,d:'Patrulleras: podrás navegar por la costa',g:'p'},
  gei:{n:'Grupo de intervención',base:4000,k:1,max:1,d:'Equipo especial para operaciones de alto riesgo',g:'p'},
  cel:{n:'Ampliar calabozos',base:200,k:1.7,max:10,d:'+6 plazas de custodia',g:'i'},
  sala:{n:'Sala de interrogatorio',base:300,k:1.8,max:5,d:'+1 turno de preguntas y más colaboración',g:'i'},
  lab:{n:'Laboratorio forense',base:800,k:1.9,max:5,d:'+3 % de pruebas por hora a cada detenido',g:'i'},
  conv:{n:'Convenio con el turno de oficio',base:350,k:1.8,max:4,d:'El abogado de oficio llega antes',g:'i'},
  rec:{n:'Oficina de denuncias',base:300,k:1.9,max:10,d:'+1 €/s por cada comisaría abierta',g:'i'},
  mot:{n:'Motor de la patrulla',base:250,k:2,max:5,d:'+12 % de velocidad en coche',g:'i'},
  bot:{n:'Botas de servicio',base:150,k:2,max:5,d:'+12 % de velocidad a pie',g:'i'},
  esp:{n:'Más esposas',base:200,k:1.9,max:5,d:'Puedes llevar 1 detenido más',g:'i'},
};

const ROLES = {
  agente:{n:'Agente',body:'#1d3f8c',hat:'#0d1a3a',vest:'#d7f04a',color:'#3d8bff',
    orders:[['patrulla','Patrullar la ciudad'],['seguir','Acompañarme'],['guardia','Guardia en calabozos'],['descanso','Descansar']]},
  detective:{n:'Detective',body:'#6b4a2f',color:'#c58b52',
    orders:[['oficina','Trabajar en la oficina'],['seguir','Acompañarme'],['descanso','Descansar']]},
  analista:{n:'Analista',body:'#d9dee8',color:'#9aa7c4',orders:[['oficina','Analizar información'],['descanso','Descansar']]},
  guia:{n:'Guía canino',body:'#2f5a3a',hat:'#1c3424',vest:'#d7f04a',color:'#4fd18b',
    orders:[['oficina','Quedarse en la comisaría'],['seguir','Acompañarme con el perro'],['descanso','Descansar']]},
  jefe:{n:'Jefe de turno',body:'#0f2a5f',hat:'#0a1430',vest:'#ffc94a',color:'#ffc94a',orders:[]},
};
// Vehículos de la Tienda (nombres genéricos, sin marcas reales)
const VEHICLES = [
  {id:'compacto',st:{vel:6,acc:6,bli:4,cap:4},cat:'patrulla',n:'Compacto patrulla',price:300,cost:30,sp:1.0,d:'Coche ágil para patrullar la ciudad',model:{len:4.1,h:.95,cab:.78}},
  {id:'berlina',st:{vel:8,acc:7,bli:5,cap:5},cat:'patrulla',n:'Berlina patrulla',price:650,cost:40,sp:1.12,d:'Más rápida: los agentes llegan antes a los avisos',model:{len:4.8,h:.88,cab:.72}},
  {id:'suv',st:{vel:9,acc:7,bli:7,cap:5},cat:'patrulla',n:'Todoterreno patrulla',price:1100,cost:55,sp:1.2,d:'El más rápido y robusto de los coches',model:{len:4.7,h:1.25,cab:.88,suv:true}},
  {id:'furgo',st:{vel:5,acc:4,bli:8,cap:9},cat:'furgoneta',n:'Furgoneta de intervención',price:1500,cost:60,d:'+2 plazas de calabozo y apoyo en los registros (los sospechosos huyen más despacio)'},
  {id:'moto',st:{vel:9,acc:9,bli:1,cap:1},cat:'moto',n:'Moto de patrulla',price:400,cost:15,sp:1.25,d:'Un agente en moto se mueve muy rápido por el centro'},
  {id:'heli',st:{vel:10,acc:8,bli:5,cap:6},cat:'heli',n:'Helicóptero ligero',price:6000,cost:400,max:1,d:'Viaja al instante entre tus comisarías'},
  {id:'dron',st:{vel:7,acc:9,bli:1,cap:0},cat:'dron',n:'Dron de vigilancia',price:800,cost:20,max:3,d:'Los avisos duran más y detectas indicios desde más lejos'},
];
const VCATS = [['patrulla','Patrullas'],['furgoneta','Furgonetas'],['moto','Motos'],['heli','Helicópteros'],['dron','Drones']];
const SALARY = {agente:40,detective:70,analista:60,guia:60,jefe:0};
const DOGNAMES = ['Rayo','Lola','Thor','Kira','Bruno','Nala','Duke','Sombra'];

const CTYPES = [
  {n:'Hurto',art:'art. 234 CP',t:1.2,rw:30,s:1,w:34,life:60,minor:true},
  {n:'Daños',art:'art. 263 CP',t:1.0,rw:22,s:1,w:22,life:55,minor:true},
  {n:'Riña',art:'art. 154 CP',t:2.0,rw:50,s:2,w:18,life:50},
  {n:'Robo y huida',art:'art. 237 CP',t:1.6,rw:80,s:1,w:12,life:45,move:true},
  {n:'Robo con violencia',art:'art. 242 CP',t:3.0,rw:160,s:2,w:8,life:65},
  {n:'Venta de droga',art:'art. 368 CP',t:1.4,rw:90,s:1,w:12,life:55,intel:true},
];
const PROF = [{id:'normal',w:60},{id:'nervioso',w:9},{id:'consumidor',w:10},{id:'camello',w:8},{id:'carterista',w:6},{id:'navaja',w:3},{id:'buscado',w:4}];
const NOMBRES = 'Lucía Hugo María Martín Paula Daniel Carmen Javier Sofía Pablo Elena Alejandro Laura Sergio Marta Adrián Nerea Iván Rocío Álvaro Manuel Inés Raúl Alba Aitana Unai Noelia Rubén Itziar Óscar'.split(' ');
const APELL = 'García Fernández López Martínez Sánchez Pérez Gómez Ruiz Díaz Moreno Muñoz Álvarez Romero Navarro Torres Domínguez Vázquez Ramos Gil Serrano Ortega Delgado Castro Rubio Iglesias Medina Garrido Cortés'.split(' ');
const LOOKS = ['chaqueta vaquera','sudadera gris','traje oscuro','chándal azul','camisa de flores','abrigo largo','gorra roja','mochila negra','polo blanco','cazadora de cuero'];
const ANS = {
  normal:['Voy al trabajo, agente. Aquí tiene lo que necesite.','Vivo aquí al lado, en el número 12.','Estoy esperando a una amiga para comer.'],
  nervioso:['Eh… sí, bueno, venía de… de casa de mi madre. ¿Pasa algo?','Es que me ponen nervioso los uniformes, nada más.'],
  consumidor:['Volvía de una fiesta, agente, nada raro.','Vengo de dar una vuelta con los colegas.'],
  camello:['Estoy aquí parado, sin más. ¿No se puede estar en la calle?','Vengo de casa de un colega… bueno, de mi primo.'],
  carterista:['Paseando, mirando escaparates.','Soy turista… digo, vivo aquí, en el centro.'],
  navaja:['Vengo de pescar, de verdad.','Trabajo en el campo, agente.'],
  buscado:['Me llamo… Juan. Juan García. No llevo el DNI encima.','Tengo mucha prisa, de verdad, me están esperando.'],
};
const TIPS = [
  'Sin indicios no se cachea. Observa primero, pregunta después.',
  'Lee siempre los derechos al detener: silencio, abogado e intérprete.',
  'Nadie declara sin su abogado. Si llega tarde, espera.',
  'El plazo de 72 horas corre desde la detención, también mientras lo llevas en el coche.',
  'Un agente cansado rinde menos. Mándalo a descansar antes de que caiga.',
  'Para entrar en una nave o una vivienda necesitas orden judicial.',
  'Los guías caninos dan indicios legales: si el perro marca, puedes cachear.',
];

const MIS = [
  {id:'s1',rl:1,art:'compacto',n:'El tirón de la plaza',zona:'Madrid',pre:[],rw:900,rep:4,d:'Le han arrancado el bolso a una vecina. Habla con ella, busca al autor por su descripción y llévalo a comisaría.',steps:[
    {t:'call',txt:'Central: «Tirón en la plaza Mayor. La víctima espera junto a la fuente»'},
    {t:'talk',city:'madrid',off:[-240,-240],who:'Carmen Ruiz (víctima)',look:{body:'#7a4a8c',skin:'#f3d0b0',hair:'#8a8a8a',long:true},
      lines:['¡Agente, gracias por venir! Un chico me ha arrancado el bolso y ha salido corriendo hacia el este.','Llevaba una <b>sudadera roja</b> y el pelo muy corto. No tendría más de 25 años.'],
      ask:[['¿Qué había en el bolso?','La cartera, el móvil y las llaves de casa. Es un bolso marrón de piel.'],['¿Está usted herida?','Me he raspado la mano al caer, pero estoy bien. Por favor, encuéntrelo.']],
      txt:'Habla con la víctima en la plaza'},
    {t:'find',city:'madrid',off:[120,-240],desc:'sudadera roja, pelo corto',look:{body:'#c0202a',skin:'#e6b48e',hair:'#16100c'},flee:true,item:'un bolso marrón de piel con la cartera de Carmen Ruiz',crime:'Hurto con tirón',art:'art. 234 CP',txt:'Busca al sospechoso: sudadera roja y pelo corto'},
    {t:'deliver',txt:'Lleva al detenido a los calabozos de una comisaría'},
    {t:'interrogate',txt:'Interroga al detenido con su abogado presente'}]},
  {id:'s2',rl:2,art:'berlina',n:'Conductor ebrio en la A-42',zona:'Madrid · Toledo',pre:['s1'],rw:1300,rep:4,d:'Un coche circula haciendo eses por la autovía de Toledo. Detenlo antes de que cause un accidente.',steps:[
    {t:'call',txt:'Central: «Vehículo circulando en zigzag por la A-42 hacia Toledo»'},
    {t:'drunk',seg:['madrid','toledo'],txt:'Alcanza al coche en la A-42 y oblígale a detenerse (ponte pegado detrás)'},
    {t:'test',txt:'Haz la prueba de alcoholemia al conductor'},
    {t:'deliver',txt:'Lleva al detenido a comisaría'}]},
  {id:'s3',rl:3,art:'suv',n:'Atraco a la joyería',zona:'Toledo',pre:['s1'],rw:2200,rep:5,d:'Han atracado una joyería del casco histórico. Revisa las cámaras, habla con el dueño y captura a los atracadores.',steps:[
    {t:'goto',city:'toledo',txt:'Viaja a Toledo por la A-42'},
    {t:'talk',city:'toledo',off:[-120,-120],who:'Julián Ortega (joyero)',look:{body:'#3a3f4a',skin:'#c98e66',hair:'#5a3820'},
      lines:['Eran dos. Uno llevaba un <b>abrigo negro</b> y el otro una <b>gorra verde</b>.','Se han llevado tres relojes y un collar. Se fueron andando hacia el sur, sin prisa, para no llamar la atención.'],
      ask:[['¿Iban armados?','Uno enseñó una navaja. No llegó a usarla.'],['¿Tiene cámaras?','Sí, en la puerta. Las grabaciones están en la tienda de al lado.']],txt:'Habla con el joyero'},
    {t:'inspect',city:'toledo',pts:[[-40,-120]],names:['Grabaciones de la cámara'],txt:'Revisa las grabaciones de seguridad'},
    {t:'find',city:'toledo',off:[0,120],desc:'abrigo negro',look:{body:'#141414',skin:'#a46a45',hair:'#2f1d12'},flee:true,item:'tres relojes de oro y una navaja',crime:'Robo con intimidación',art:'art. 242 CP',txt:'Busca al primer atracador: abrigo negro'},
    {t:'find',city:'toledo',off:[120,60],desc:'gorra verde',look:{body:'#3a5a3a',skin:'#e6b48e',hair:'#16100c'},flee:true,item:'un collar de oro',crime:'Robo con intimidación',art:'art. 242 CP',txt:'Busca al segundo atracador: gorra verde'},
    {t:'deliver',txt:'Lleva a los detenidos a los calabozos'},
    {t:'court',n:1,txt:'Pasa a un atracador a disposición judicial'}]},
  {id:'m1',rl:1,art:'compacto',n:'Primer servicio',zona:'Madrid',pre:[],rw:500,rep:3,d:'Demuestra que sabes detener respetando la ley.',steps:[
    {t:'arrest',city:'madrid',n:2,txt:'Haz 2 detenciones legales en Madrid, leyendo los derechos'},
    {t:'court',n:1,txt:'Pasa a un detenido a disposición judicial desde el Centro de mando'}]},
  {id:'m2',rl:2,art:'moto',n:'Carteristas en el centro',zona:'Madrid',pre:['m1'],rw:800,rep:3,d:'Una banda actúa entre los turistas. Observa, busca indicios y cachea con motivo.',steps:[
    {t:'arrest',city:'madrid',profile:'carterista',n:2,txt:'Detén a 2 carteristas en Madrid. Observa a quien actúa raro (?) antes de cachear'}]},
  {id:'m3',rl:2,art:'berlina',n:'Rumbo a la Costa del Sol',zona:'Málaga · Marbella',pre:['m1'],rw:1200,rep:4,d:'La droga entra por el sur. Necesitas presencia en la costa.',steps:[
    {t:'own',city:'malaga'},{t:'own',city:'marbella'}]},
  {id:'m4',rl:3,art:'dron',n:'Menudeo en Marbella',zona:'Marbella',pre:['m3'],rw:1600,rep:4,d:'Los puntos de venta abastecen a toda la costa. Tira del hilo.',steps:[
    {t:'arrest',city:'marbella',profile:'camello',n:2,txt:'Detén legalmente a 2 vendedores de droga en Marbella'},{t:'intel',n:1}]},
  {id:'m5',rl:4,art:'heli',n:'Narcolanchas del Estrecho',zona:'Algeciras',pre:['m3'],rw:2600,rep:5,d:'Lanchas rápidas cruzan de noche con fardos de hachís.',steps:[
    {t:'own',city:'algeciras'},{t:'up',id:'mar'},{t:'boats',at:[-5.42,36.02],n:3,txt:'Intercepta 3 narcolanchas en el Estrecho con la patrullera'}]},
  {id:'m6',rl:5,art:'furgo',n:'La nave de Sanlúcar',zona:'Sanlúcar de Barrameda',pre:['m5'],rw:3600,rep:5,d:'Las lanchas remontan el Guadalquivir hasta una nave de alijo.',steps:[
    {t:'goto',city:'sanlucar'},
    {t:'inspect',city:'sanlucar',pts:[[60,-120],[150,40],[40,150]],names:['Embarcadero','Taller de motores','Nave agrícola'],txt:'Vigila 3 puntos sospechosos de Sanlúcar'},
    {t:'warrant',h:3},{t:'raid',city:'sanlucar',off:[170,-140],n:4,txt:'Entrada y registro en la nave: detén a todos'}]},
  {id:'m7',rl:6,art:'suv',n:'Contenedores en el puerto de Valencia',zona:'Valencia · Madrid',pre:['m3'],rw:5000,rep:6,d:'Cocaína escondida en contenedores de fruta. Hay que seguir el cargamento hasta los receptores.',steps:[
    {t:'own',city:'valencia'},{t:'up',id:'k9'},
    {t:'inspect',city:'valencia',pts:[[70,-120],[75,-40],[70,40],[65,120]],names:['Contenedor 1','Contenedor 2','Contenedor 3','Contenedor 4'],txt:'Revisa los contenedores del puerto con el perro'},
    {t:'follow',from:'valencia',to:'madrid',txt:'Entrega vigilada: sigue al camión hasta Madrid sin acercarte demasiado'},
    {t:'raid',city:'madrid',off:[-350,250],n:3,txt:'Detén a los receptores en el almacén de Madrid'}]},
  {id:'m8',rl:7,art:'berlina',n:'Blanqueo en Marbella',zona:'Marbella',pre:['m4'],rw:6000,rep:6,d:'El dinero de la droga se lava con inmobiliarias y coches de lujo.',steps:[
    {t:'up',id:'ana'},{t:'intel',n:3},
    {t:'inspect',city:'marbella',pts:[[-150,-60],[120,-100],[0,-170]],names:['Inmobiliaria','Concesionario de lujo','Sociedad patrimonial'],txt:'Revisa 3 empresas pantalla'},
    {t:'warrant',h:4},{t:'raid',city:'marbella',off:[-60,-210],n:3,txt:'Registro en la villa del cabecilla'}]},
  {id:'m9',rl:6,art:'heli',n:'Planeadoras en las Rías',zona:'Vigo',pre:['m5'],rw:4000,rep:5,d:'Las rías gallegas vuelven a ver planeadoras de noche.',steps:[
    {t:'own',city:'vigo'},{t:'boats',at:[-8.95,42.2],n:4,txt:'Intercepta 4 planeadoras frente a Vigo'}]},
  {id:'m10',rl:5,art:'furgo',n:'Narcopisos en Barcelona',zona:'Barcelona',pre:['m2'],rw:4500,rep:5,d:'Pisos ocupados se usan como puntos de venta. Los vecinos piden ayuda.',steps:[
    {t:'own',city:'barcelona'},{t:'arrest',city:'barcelona',profile:'camello',n:3,txt:'Detén legalmente a 3 vendedores en Barcelona'},
    {t:'warrant',h:2},{t:'raid',city:'barcelona',off:[-200,-120],n:3,txt:'Entrada en el narcopiso'}]},
  {id:'m11',rl:9,art:'suv',n:'Operación Costa del Sol',zona:'Málaga · Marbella · Algeciras',pre:['m6','m7','m8'],rw:15000,rep:10,d:'Golpe final contra la organización: tres registros simultáneos.',steps:[
    {t:'up',id:'gei'},{t:'veh',cat:'heli'},
    {t:'raid',city:'malaga',off:[-100,-150],n:4,txt:'Registro en Málaga'},
    {t:'raid',city:'marbella',off:[100,-150],n:4,txt:'Registro en Marbella'},
    {t:'raid',city:'algeciras',off:[-150,-120],n:5,txt:'Registro en Algeciras'}]},
];

return {VEHICLES,VCATS,SALARY,POLY,OWNLAND,RIVERS,MOUNTAINS,CITIES,HIGHWAYS,UPG,ROLES,DOGNAMES,CTYPES,PROF,NOMBRES,APELL,LOOKS,ANS,TIPS,MIS};
})();
