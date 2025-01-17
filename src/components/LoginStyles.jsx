import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f6f9",
  },
  title: {
    marginBottom: theme.spacing(2),
    color: "#1976d2", // Color primario de Material UI
  },
  form: {
    width: "100%",
    maxWidth: 400,
    padding: theme.spacing(4),
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
