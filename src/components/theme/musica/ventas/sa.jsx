import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Snackbar } from "@mui/material";

const HomePage = () => {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState(null);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [promocionesActivas, setPromocionesActivas] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productosResponse, categoriasResponse, carritoResponse, promocionesResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/ventas/productos/", { headers: getAuthHeader() }),
        axios.get("http://127.0.0.1:8000/ventas/categorias/", { headers: getAuthHeader() }),
        axios.get("http://127.0.0.1:8000/ventas/carritos/", { headers: getAuthHeader() }),
        axios.get("http://127.0.0.1:8000/ventas/promociones/", { headers: getAuthHeader() }),
      ]);

      setProductosDestacados(productosResponse.data);
      setProductosFiltrados(productosResponse.data);
      setCategorias(categoriasResponse.data);
      setCarrito(carritoResponse.data);
      setPromocionesActivas(promocionesResponse.data);
    } catch (err) {
      setError("Hubo un problema al cargar los datos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/ventas/productos/?search=${query}`, {
          headers: getAuthHeader(),
        });
        setProductosFiltrados(response.data);
      } catch (err) {
        setError("No se pudieron cargar los productos para la búsqueda.");
        setProductosFiltrados([]);
      }
    } else {
      setProductosFiltrados(productosDestacados);
    }
  };

  const handleCategoryFilter = (categoriaId) => {
    setSelectedCategory(categoriaId);
    if (categoriaId) {
      axios
        .get(`http://127.0.0.1:8000/ventas/productos/por_categoria/?categoria_id=${categoriaId}`, {
          headers: getAuthHeader(),
        })
        .then((response) => {
          setProductosFiltrados(response.data);
        })
        .catch((err) => setError("Error al filtrar productos por categoría."));
    } else {
      setProductosFiltrados(productosDestacados);
    }
  };

  const agregarAlCarrito = async (productoId, cantidad = 1) => {
    try {
      const carritoResponse = await axios.post(
        `http://127.0.0.1:8000/ventas/carritos/${carrito.id}/agregar_producto/`,
        { producto_id: productoId, cantidad },
        {
          headers: getAuthHeader(),
        }
      );
      setCarrito(carritoResponse.data);
      setSuccessMessage("Producto agregado al carrito.");
    } catch (err) {
      setError("No se pudo agregar el producto al carrito. Intenta nuevamente.");
    }
  };

  const verProducto = (productoId) => {
    navigate(`/ventas/producto/${productoId}`);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      <section>
        <h2>Buscar productos</h2>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </section>

      <section>
        <h2>Promociones Especiales</h2>
        {promocionesActivas.length > 0 ? (
          <ul>
            {promocionesActivas.map((promocion) => (
              <li key={promocion.id}>{promocion.descripcion}</li>
            ))}
          </ul>
        ) : (
          <p>No hay promociones activas en este momento.</p>
        )}
      </section>

      <section>
        <h2>Categorías</h2>
        <ul>
          <li onClick={() => handleCategoryFilter(null)} style={{ cursor: "pointer" }}>
            Todos los productos
          </li>
          {categorias.map((categoria) => (
            <li
              key={categoria.id}
              onClick={() => handleCategoryFilter(categoria.id)}
              style={{
                cursor: "pointer",
                fontWeight: selectedCategory === categoria.id ? "bold" : "normal",
              }}
            >
              {categoria.nombre}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Productos Populares</h2>
        <div>
          {productosPopulares.length > 0 ? (
            productosPopulares.map((producto) => (
              <div key={producto.id} onClick={() => verProducto(producto.id)}>
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <button onClick={() => agregarAlCarrito(producto.id)}>Agregar al Carrito</button>
              </div>
            ))
          ) : (
            <p>No hay productos populares en este momento.</p>
          )}
        </div>
      </section>

      <section>
        <h2>Productos Destacados</h2>
        <div>
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto) => (
              <div key={producto.id} onClick={() => verProducto(producto.id)}>
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <button onClick={() => agregarAlCarrito(producto.id)}>Agregar al Carrito</button>
              </div>
            ))
          ) : (
            <p>No hay productos destacados en este momento.</p>
          )}
        </div>
      </section>

      <section>
        <h2>Resumen del Carrito</h2>
        {carrito ? (
          <div>
            <p>Total: ${carrito.total}</p>
            <button onClick={() => navigate("/carrito")}>Ver Carrito</button>
          </div>
        ) : (
          <p>No tienes productos en el carrito.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;