import "./styles/styles.scss";
import { createRoot } from "react-dom/client";
import Nav from "./components/other-components/Nav";
import Map from "./components/map/Map";

// Navigation bar
const navEl = document.getElementById("nav");
createRoot(navEl).render(<Nav />);

const mapEl = document.getElementById("map");
createRoot(mapEl).render(<Map />);
