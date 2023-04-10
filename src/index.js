import "./css/styles.scss";
import "./css/customized-bootstrap.scss";
import { createRoot } from "react-dom/client";
import Hello from "./components/Hello";
import Nav from "./components/other-components/Nav";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Nav />);
