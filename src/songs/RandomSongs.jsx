// src/components/RandomSongs.jsx
import React from 'react';
import useRandomSongs from '../hooks/useRandomSongs';

const RandomSongs = () => {
  const {
    songs,
    loading,
    error,
    isAuthenticated,
    refresh,
    formatDuration,
    stats,
    artists,
    showContent,
    showLoading,
    showError,
    isEmpty
  } = useRandomSongs();

  // Estado: No autenticado
  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">🔐 Autenticación requerida</h2>
        <p className="text-red-600 mb-4">Inicia sesión para ver las canciones.</p>
        <button
          onClick={() => window.location.href = "/login"}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Ir al login
        </button>
      </div>
    );
  }

  // Estado: Cargando
  if (showLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando canciones aleatorias...</p>
      </div>
    );
  }

  // Estado: Error
  if (showError) {
    return (
      <div className="p-6 max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Algo salió mal</h3>
        <p className="text-yellow-700 mb-4">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            🔄 Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  // Estado: Vacío
  if (isEmpty) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">🎵</div>
        <h3 className="text-xl font-semibold mb-2">No hay canciones disponibles</h3>
        <p className="text-gray-600 mb-4">Intenta actualizar la lista.</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Buscar canciones
        </button>
      </div>
    );
  }

  // Estado: Contenido (éxito)
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header con estadísticas */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">buestra seleccion</h1>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Actualizar lista</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Canciones</div>
            <div className="text-2xl font-bold">{stats.totalSongs}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Artistas</div>
            <div className="text-2xl font-bold">{stats.totalArtists}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Duración total</div>
            <div className="text-2xl font-bold">{stats.formattedTotalDuration}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Con imágenes</div>
            <div className="text-2xl font-bold">{stats.songsWithImages}</div>
          </div>
        </div>
      </div>

      {/* Lista de artistas */}
      {artists.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">🎤 Artistas en la lista</h2>
          <div className="flex flex-wrap gap-2">
            {artists.map((artist, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {artist}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid de canciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => (
          <div key={song.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Imagen de la canción */}
            <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              {song.image_url ? (
                <img 
                  src={song.image_url} 
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl">🎵</div>
              )}
            </div>
            
            {/* Información de la canción */}
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">{song.title}</h3>
              <p className="text-gray-600 truncate">{song.artist}</p>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {song.duration && (
                    <span className="text-sm text-gray-500">
                      ⏱️ {formatDuration(song.duration)}
                    </span>
                  )}
                  {song.genre && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {song.genre}
                    </span>
                  )}
                </div>
                
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  ▶️ Reproducir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con información */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          Mostrando {songs.length} cancion{songs.length !== 1 ? 'es' : ''} · 
          Duración total: {stats.formattedTotalDuration} · 
          Actualizado hace unos instantes
        </p>
      </div>
    </div>
  );
};

export default RandomSongs;