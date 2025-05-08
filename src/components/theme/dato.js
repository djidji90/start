"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var axios_1 = require("axios");
var react_router_dom_1 = require("react-router-dom");
var SongCard = function (_a) {
    var song = _a.song, onLike = _a.onLike, onDownload = _a.onDownload, onStream = _a.onStream;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _b = (0, react_1.useState)([]), comments = _b[0], setComments = _b[1];
    var _c = (0, react_1.useState)(""), newComment = _c[0], setNewComment = _c[1];
    var _d = (0, react_1.useState)(""), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(""), successMessage = _f[0], setSuccessMessage = _f[1];
    // Cargar los comentarios de la canción
    (0, react_1.useEffect)(function () {
        var fetchComments = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("http://127.0.0.1:8000/api2/songs/".concat(song.id, "/comments/"))];
                    case 1:
                        response = _a.sent();
                        setComments(response.data);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        setError("No se pudieron cargar los comentarios.");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchComments();
    }, [song.id]);
    // Función para agregar un nuevo comentario
    var handleAddComment = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newComment.trim()) {
                        setError("El comentario no puede estar vacío.");
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError("");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, axios_1.default.post("http://127.0.0.1:8000/api2/songs/".concat(song.id, "/comments/"), { content: newComment }, {
                            headers: {
                                Authorization: "Bearer ".concat(localStorage.getItem("accessToken")),
                            },
                        })];
                case 2:
                    response = _a.sent();
                    setComments(__spreadArray(__spreadArray([], comments, true), [response.data], false));
                    setNewComment("");
                    setSuccessMessage("Comentario agregado exitosamente.");
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError("Error al agregar el comentario.");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Función para reaccionar con "like" en un comentario
    var handleLikeComment = function (commentId) { return __awaiter(void 0, void 0, void 0, function () {
        var response_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.post("http://127.0.0.1:8000/api2/comments/".concat(commentId, "/like/"), {}, {
                            headers: {
                                Authorization: "Bearer ".concat(localStorage.getItem("accessToken")),
                            },
                        })];
                case 1:
                    response_1 = _b.sent();
                    setComments(function (prevComments) {
                        return prevComments.map(function (comment) {
                            return comment.id === commentId ? __assign(__assign({}, comment), { likes_count: response_1.data.likes_count }) : comment;
                        });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    setError("No se pudo reaccionar al comentario.");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<material_1.Card sx={{
            display: "-ms-inline-flexbox",
            flexDirection: "column",
            borderRadius: 5,
            boxShadow: 12,
            overflow: "hidden",
        }}>
      <material_1.CardMedia component="img" height="200" image={song.image_url || "GrillzPrint.jpg"} alt={song.artist} sx={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
        }}/>
      <material_1.CardContent sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
        }}>
        <material_1.Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1, color: "#333" }}>
          Título: {song.title}
        </material_1.Typography>
        <material_1.Typography variant="subtitle1" sx={{ color: "#777", marginBottom: 0.5 }}>
          Artista: {song.artist}
        </material_1.Typography>
        <material_1.Typography variant="subtitle1" sx={{ color: "#777", marginBottom: 0.5 }}>
          Género: {song.genre}
        </material_1.Typography>
        <material_1.Typography variant="body2" sx={{ color: "#555", fontStyle: "italic" }}>
          {song.likes_count} Likes
        </material_1.Typography>
      </material_1.CardContent>
      <material_1.CardActions sx={{ justifyContent: "space-between", padding: 1 }}>
        <material_1.Box sx={{ display: "flex", gap: 1 }}>
          <material_1.IconButton onClick={function () { return onLike(song.id); }} sx={{ color: "primary.main", "&:hover": { color: "#e91e63" } }}>
            <icons_material_1.Favorite />
          </material_1.IconButton>
          <material_1.IconButton onClick={function () { return onDownload(song.id, song.title); }} sx={{ color: "primary.main", "&:hover": { color: "#00796b" } }}>
            <icons_material_1.GetApp />
          </material_1.IconButton>
          <material_1.IconButton sx={{ color: "primary.main", "&:hover": { color: "#ff9800" } }}>
            <icons_material_1.Comment />
          </material_1.IconButton>
          <material_1.IconButton onClick={function () { return onStream(song.id); }} sx={{ color: "primary.main", "&:hover": { color: "#3f51b5" } }}>
            <icons_material_1.PlayArrow />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.CardActions>

      <material_1.CardContent>
        <material_1.Typography variant="h6">Comentarios:</material_1.Typography>

        {error && <material_1.Typography color="error">{error}</material_1.Typography>}
        {successMessage && <material_1.Typography color="success">{successMessage}</material_1.Typography>}

        <material_1.Box sx={{ marginBottom: 2 }}>
          <material_1.TextField label="Escribe un comentario" fullWidth variant="outlined" value={newComment} onChange={function (e) { return setNewComment(e.target.value); }} disabled={loading} sx={{ marginBottom: 2 }}/>
          <material_1.Button variant="contained" color="primary" onClick={handleAddComment} disabled={loading}>
            {loading ? "Enviando..." : "Agregar Comentario"}
          </material_1.Button>
        </material_1.Box>

        <material_1.List>
          {comments.map(function (comment) { return (<material_1.ListItem key={comment.id}>
              <material_1.ListItemText primary={comment.user} secondary={comment.content}/>
              <material_1.Box>
                <material_1.IconButton onClick={function () { return handleLikeComment(comment.id); }} sx={{ color: "#00796b" }}>
                  <icons_material_1.ThumbUp />
                </material_1.IconButton>
                <material_1.Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  {comment.likes_count} Likes
                </material_1.Typography>
              </material_1.Box>
            </material_1.ListItem>); })}
        </material_1.List>
      </material_1.CardContent>
    </material_1.Card>);
};
exports.default = SongCard;
