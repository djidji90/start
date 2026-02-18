
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, styled, Button, alpha, IconButton } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import UmbrellaIcon from "@mui/icons-material/Umbrella";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import '@fontsource-variable/inter';

// ============================================
// 🎨 CONFIGURACIÓN DE MARCA (IDÉNTICA A LOGIN/REGISTER)
// ============================================
const colors = {
primary: '#FF6B35',
primaryLight: '#FF8B5C',
primaryDark: '#E55A2B',
secondary: '#2D3047',
};

const GradientText = styled(Typography)(({ theme }) => ({
background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%),
WebkitBackgroundClip: "text",
WebkitTextFillColor: "transparent",
fontFamily: "'Inter Variable', sans-serif",
}));

// ============================================
// 🔑 TU API KEY DE OPENWEATHERMAP
// ============================================
const OPENWEATHER_API_KEY = "0c6117bedab72bcd80aa6bc795a68753";

// ============================================
// 🌍 LISTA COMPLETA DE DESTINOS GUINEA ECUATORIAL (15 DESTINOS)
// ============================================
const destinos = [
// 🏛️ CAPITALES Y CIUDADES PRINCIPALES
{
id: "malabo",
nombre: "Malabo",
tipo: "capital",
descripcion: "capital económica y cultural de nuestro hermoso pais",
lat: "3.75",
lon: "8.78",
datoCurioso: "Fundada en 1827 por los británicos como Port Clarence"
},
{
id: "bata",
nombre: "Bata",
tipo: "ciudad",
descripcion: "ciudad del amor, Puerta del continente 🌊",
lat: "1.86",
lon: "9.77",
datoCurioso: "Ciudad más poblada del país, principal puerto continental"
},

// 🏡 PUEBLOS DE BIOKO NORTE (los que me diste)
{
id: "baney",
nombre: "Baney",
tipo: "pueblo",
descripcion: "baney yeyeba, capital de la isla de Bioko, que nadie se enfade 😂",
lat: "3.70",
lon: "8.91",
datoCurioso: "Conocido por sus espectaculares playas volcánicas"
},
{
id: "lea",
nombre: "lía",
tipo: "pueblo",
descripcion: "pueblo de grandes artistas seguro que tu cantante favorito ha estado ahí",
lat: "3.68",
lon: "8.85",
datoCurioso: "nos gusta hacer nfuga y bailar nzanga"
},
{
id: "rebola",
nombre: "Rebola",
tipo: "pueblo",
descripcion: "Tierra de gente fuerte y talentosa 🪺",
lat: "3.72",
lon: "8.83",
datoCurioso: "deberías visitarnos estamos a pocos kilómetros de malabo"
},
{
id: "comandachina",
nombre: "Comandachina",
tipo: "pueblo",
descripcion: "de gente muy amable situado en el corazón de bata 🫂",
lat: "3.75",
lon: "8.80",
datoCurioso: "Nombre único con historia de principios del XX"
},

// 🏡 PUEBLOS DE RÍO MUNI
{
id: "rio_campo",
nombre: "Río Campo",
tipo: "pueblo",
descripcion: "Frontera natural con Camerún te estamos esperando 🌴",
lat: "2.33",
lon: "9.82",
datoCurioso: "Sobre el río Campo, frontera natural con Camerún"
},
{
id: "akurenam",
nombre: "Akurenam",
tipo: "pueblo",
descripcion: "Corazón continental, con las chicas muy guapas ❤️",
lat: "1.23",
lon: "10.12",
datoCurioso: "Localidad del interior, rodeada de selva tropical"
},
{
id: "mongomo",
nombre: "Mongomo",
tipo: "ciudad",
descripcion: "capital de la provincia de welenzas ❤️",
lat: "1.63",
lon: "11.32",
datoCurioso: "tierra de origen de grandes artistas "
},

// 🏙️ MÁS CIUDADES IMPORTANTES
{
id: "ebebiyin",
nombre: "Ebebiyín",
tipo: "ciudad",
descripcion: "tierra de comerciantes y artistas importantes 🌿",
lat: "2.15",
lon: "11.33",
datoCurioso: "Centro comercial en la frontera con cameroun"
},
{
id: "evinayong",
nombre: "Evinayong",
tipo: "ciudad",
descripcion: "Centro del país, espectacular con una rica historia 🏔️ ",
lat: "1.45",
lon: "10.57",
datoCurioso: "Capital de la provincia de Centro Sur"
},
{
id: "luba",
nombre: "Luba",
tipo: "ciudad",
descripcion: "Puerto natural, Bioko Sur ⚓",
lat: "3.46",
lon: "8.55",
datoCurioso: "Segunda ciudad de Bioko, antiguo puerto esclavista"
},
{
id: "annobon",
nombre: "Annobón",
tipo: "isla",
descripcion: "San Antonio de Palé, hemisferio sur 🌅",
lat: "-1.43",
lon: "5.63",
datoCurioso: "Única provincia en el hemisferio sur, descubierta el 1 de enero"
},

// 🌊 PUEBLOS COSTEROS ADICIONALES
{
id: "kogo",
nombre: "Kogo",
tipo: "pueblo",
descripcion: "Estuario del Muni 🌊",
lat: "1.08",
lon: "9.70",
datoCurioso: "Puerto fluvial sobre el estuario del Muni"
},
{
id: "mbini",
nombre: "Mbini",
tipo: "pueblo",
descripcion: "Desembocadura del río Benito 🏞️",
lat: "1.58",
lon: "9.62",
datoCurioso: "En la desembocadura del río Mbini, el más largo del país"
},
{
id: "nsok",
nombre: "Nsok",
tipo: "pueblo",
descripcion: "Frontera con Gabón 🌄",
lat: "1.12",
lon: "11.25",
datoCurioso: "Localidad fronteriza en la selva continental"
},
];

// ============================================
// 🎨 COMPONENTE DE CLIMA
// ============================================
const ClimaWidget = ({ destino, weather, loading }) => {
const getWeatherEmoji = (main) => {
const emojis = {
"Clear": "☀️",
"Clouds": "☁️",
"Rain": "🌧️",
"Drizzle": "🌦️",
"Thunderstorm": "⛈️",
"Snow": "❄️",
"Mist": "🌫️",
"Fog": "🌫️",
"Haze": "🌤️",
};
return emojis[main] || "🌤️";
};

const getWeatherAnimation = (main) => {
if (main === "Clear") return { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] };
if (main === "Clouds") return { y: [0, -3, 0] };
if (main === "Rain") return { y: [0, 2, 0] };
return { scale: [1, 1.05, 1] };
};

if (loading) {
return (
<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
<motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
<Typography sx={{ fontSize: "40px" }}>🔄
</motion.div>
<Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
Consultando clima...


);
}

if (!weather) {
return (
<Box sx={{ textAlign: "center" }}>
<Typography sx={{ fontSize: "40px", mb: 1 }}>🌍
<Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
Clima no disponible


);
}

return (
<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
<motion.div
animate={getWeatherAnimation(weather.weather[0].main)}
transition={{ duration: 3, repeat: Infinity }}
>
<Typography sx={{ fontSize: "48px" }}>
{getWeatherEmoji(weather.weather[0].main)}

</motion.div>

<Box sx={{ textAlign: "left" }}> <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1, color: "white" }}> {Math.round(weather.main.temp)}° </Typography> <Typography variant="body2" sx={{ color: colors.primaryLight, fontWeight: 600, textTransform: "capitalize" }}> {weather.weather[0].description} </Typography> <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}> 💧 {weather.main.humidity}% | 💨 {Math.round(weather.wind.speed)} m/s </Typography> <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.4)", mt: 0.5 }}> Actualizado: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} </Typography> </Box> </Box> 

);
};

// ============================================
// 🚀 COMPONENTE PRINCIPAL
// ============================================
const ConstructionBanner = () => {
// Estados
const [destinoIndex, setDestinoIndex] = useState(0);
const [weatherData, setWeatherData] = useState({});
const [loadingWeather, setLoadingWeather] = useState({});
const [weatherError, setWeatherError] = useState({});
const [destinoAnimado, setDestinoAnimado] = useState(false);

// ========================================
// 🌤️ FETCH CLIMA PARA UN DESTINO
// ========================================
const fetchWeatherForDestino = async (destino) => {
if (weatherData[destino.id]) return; // Ya tenemos datos

setLoadingWeather(prev => ({ ...prev, [destino.id]: true })); setWeatherError(prev => ({ ...prev, [destino.id]: false })); try { const response = await axios.get( `https://api.openweathermap.org/data/2.5/weather`, { params: { lat: destino.lat, lon: destino.lon, appid: OPENWEATHER_API_KEY, units: "metric", lang: "es" } } ); setWeatherData(prev => ({ ...prev, [destino.id]: response.data })); setWeatherError(prev => ({ ...prev, [destino.id]: false })); } catch (error) { console.error(`Error fetching weather for ${destino.nombre}:`, error); setWeatherError(prev => ({ ...prev, [destino.id]: true })); } finally { setLoadingWeather(prev => ({ ...prev, [destino.id]: false })); } 

};

// ========================================
// 🗺️ CARGA INICIAL Y CAMBIO DE DESTINO
// ========================================
useEffect(() => {
// Cargar clima del destino actual
fetchWeatherForDestino(destinos[destinoIndex]);

// Precargar destinos vecinos (mejora la experiencia) const nextIndex = (destinoIndex + 1) % destinos.length; const prevIndex = (destinoIndex - 1 + destinos.length) % destinos.length; setTimeout(() => { fetchWeatherForDestino(destinos[nextIndex]); fetchWeatherForDestino(destinos[prevIndex]); }, 1000); 

}, [destinoIndex]);

// ========================================
// 🕒 ROTACIÓN AUTOMÁTICA (CADA 8 SEGUNDOS)
// ========================================
useEffect(() => {
const interval = setInterval(() => {
setDestinoAnimado(true);
setTimeout(() => {
setDestinoIndex(prev => (prev + 1) % destinos.length);
setDestinoAnimado(false);
}, 400);
}, 8000);

return () => clearInterval(interval); 

}, []);

// ========================================
// 🎮 CONTROLES MANUALES
// ========================================
const handlePrevDestino = () => {
setDestinoAnimado(true);
setTimeout(() => {
setDestinoIndex(prev => (prev - 1 + destinos.length) % destinos.length);
setDestinoAnimado(false);
}, 300);
};

const handleNextDestino = () => {
setDestinoAnimado(true);
setTimeout(() => {
setDestinoIndex(prev => (prev + 1) % destinos.length);
setDestinoAnimado(false);
}, 300);
};

const destinoActual = destinos[destinoIndex];

return (
<Box
sx={{
minHeight: "100vh",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
p: 2,
textAlign: "center",
position: "relative",
overflow: "hidden",
background: "linear-gradient(145deg, #0A0F1E 0%, #1A1F2E 100%)",
color: "white",
}}
>
{/* ========== FONDO ANIMADO ========== */}
<motion.div
animate={{
backgroundPosition: ["0% 0%", "100% 100%"],
}}
transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
style={{
position: "absolute",
inset: 0,
background: "radial-gradient(circle at 30% 50%, rgba(255,107,53,0.1) 0%, transparent 50%)",
zIndex: 0,
}}
/>

{/* ========== NOTAS FLOTANTES ========== */} {[...Array(20)].map((_, i) => ( <motion.div key={i} style={{ position: "absolute", fontSize: 24 + Math.random() * 20, color: alpha(colors.primary, 0.08), left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, zIndex: 0, }} animate={{ y: [0, -100 - Math.random() * 100], x: [0, (Math.random() - 0.5) * 150], opacity: [0, 1, 0], rotate: [0, 360], }} transition={{ duration: 12 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 8, }} > {i % 3 === 0 ? "♪" : i % 3 === 1 ? "♫" : "♩"} </motion.div> ))} {/* ========== CONTENIDO PRINCIPAL ========== */} <Box sx={{ position: "relative", zIndex: 2, maxWidth: "900px", width: "100%" }}> {/* 🚀 LOGO COHETE */} <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: -5 }} transition={{ type: "spring", duration: 1 }} style={{ marginBottom: 20 }} > <Box sx={{ fontSize: { xs: "60px", md: "80px" } }}>🚀</Box> </motion.div> {/* 🎵 TÍTULO */} <GradientText variant="h2" sx={{ fontWeight: 900, fontSize: { xs: "2.2rem", md: "3.5rem" }, mb: 2, letterSpacing: "-0.5px", }} > djidjimusic </GradientText> <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "white", textShadow: "0 2px 10px rgba(0,0,0,0.3)", }} > Construyendo la banda sonora de Guinea Ecuatorial 🇬🇶 </Typography> {/* ========== 🌤️ TARJETA DE CLIMA + DESTINO ========== */} <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} > <Box sx={{ background: "rgba(10, 15, 30, 0.7)", backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, p: { xs: 2, md: 4 }, mb: 4, boxShadow: `0 20px 40px ${alpha(colors.secondary, 0.3)}`, }} > {/* CABECERA */} <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}> <Typography variant="overline" sx={{ color: alpha(colors.primary, 0.9), fontWeight: 700, fontSize: "0.9rem", letterSpacing: 2, }} > 🇬🇶 GUINEA ECUATORIAL EN VIVO </Typography> <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}> {destinoIndex + 1} / {destinos.length} </Typography> </Box> {/* CONTENEDOR DESTINO + CLIMA */} <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "center", md: "stretch" }, gap: 3 }}> {/* 🗺️ PRÓXIMA PARADA (IZQUIERDA) */} <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", borderRight: { xs: "none", md: "1px solid rgba(255,255,255,0.1)" }, pr: { xs: 0, md: 3 }, }}> <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}> <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 0.5 }}> <LocationOnIcon sx={{ fontSize: 16 }} /> PRÓXIMA PARADA </Typography> {/* CONTROLES DE NAVEGACIÓN */} <Box sx={{ display: "flex", gap: 0.5 }}> <IconButton onClick={handlePrevDestino} size="small" sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: colors.primary, background: alpha(colors.primary, 0.1) } }} > <ArrowBackIosIcon sx={{ fontSize: 14 }} /> </IconButton> <IconButton onClick={handleNextDestino} size="small" sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: colors.primary, background: alpha(colors.primary, 0.1) } }} > <ArrowForwardIosIcon sx={{ fontSize: 14 }} /> </IconButton> </Box> </Box> <motion.div animate={{ x: destinoAnimado ? [0, -10, 10, 0] : 0, opacity: destinoAnimado ? [1, 0.8, 1] : 1 }} transition={{ duration: 0.4 }} > <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary, lineHeight: 1.2, fontSize: { xs: "2rem", md: "2.5rem" }, mb: 1, }} > {destinoActual.nombre} </Typography> <Typography variant="body1" sx={{ color: "white", fontWeight: 500, mb: 0.5 }}> {destinoActual.descripcion} </Typography> <Typography variant="caption" sx={{ display: "inline-block", color: alpha(colors.primary, 0.8), background: alpha(colors.primary, 0.1), px: 1.5, py: 0.5, borderRadius: 2, mb: 1, }}> {destinoActual.tipo === "capital" && "🏛️ CAPITAL"} {destinoActual.tipo === "ciudad" && "🏙️ CIUDAD"} {destinoActual.tipo === "pueblo" && "🏡 PUEBLO"} {destinoActual.tipo === "isla" && "🏝️ ISLA"} </Typography> <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 1, fontStyle: "italic" }}> 📍 {destinoActual.datoCurioso} </Typography> </motion.div> </Box> {/* 🌤️ CLIMA ACTUAL (DERECHA) */} <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, pl: { xs: 0, md: 3 }, }}> <ClimaWidget destino={destinoActual} weather={weatherData[destinoActual.id]} loading={loadingWeather[destinoActual.id]} /> </Box> </Box> </Box> </motion.div> {/* ========== MENSAJE DE CONSTRUCCIÓN ========== */} <Typography variant="body1" sx={{ mb: 4, color: "rgba(255,255,255,0.9)", fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.7, px: 2, }} > 

{destinoActual.nombre}, {destinoActual.descripcion.toLowerCase()} —
te mandamos un fuerte abrazo 🎵✨

{/* ========== BOTÓN TIENDA ========== */} <Button variant="contained" href="/Todo" size="large" sx={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`, color: "white", px: 5, py: 1.8, borderRadius: 3, fontWeight: 700, fontSize: "1.1rem", textTransform: "none", boxShadow: `0 8px 30px ${alpha(colors.primary, 0.4)}`, "&:hover": { background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`, transform: "translateY(-2px)", boxShadow: `0 12px 40px ${alpha(colors.primary, 0.6)}`, }, transition: "all 0.3s ease", mb: 3, }} > 🛍️ Ir a la Tienda </Button> {/* ========== FOOTER IDENTITARIO ========== */} <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", letterSpacing: 2, mb: 0.5, }} > HECHO CON 🩷 DESDE GUINEA ECUATORIAL PARA EL MUNDO 🌍 </Typography> <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", }} > </Typography> </Box> </Box> 

);
};

export default ConstructionBanner;

