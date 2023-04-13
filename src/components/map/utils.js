// Map layer styles
import { directionDict } from "../../index.js";
import "./icons.scss";

// Predefining styles for route and stops on the map
const routeStyle = { color: "#cccccc", weight: 4, opacity: 0.3 };
const routeStyleSelected = { weight: 4, color: "#174b7f", opacity: 0.5 };

const stopsStyle = { color: "#cccccc", weight: 1.5, opacity: 0.3, radius: 4.5 };
const stopsStyleSelected = { ...stopsStyle, color: "#174b7f" };
const stopsStyleHighlighted = {
  ...stopsStyleSelected,
  opacity: 0.8,
  weight: 2.5,
  radius: 6,
};

export const getRouteStyle = (polyline, route) => {
  // If the route is selected, return the selected style
  return polyline.properties.lineabbr === route
    ? routeStyleSelected
    : routeStyle;
};

export const getStopsStyle = (circle, requestParams) => {
  const thisRoute = circle.properties.LineAbbr;
  const thisDirection = circle.properties.DirectionN;
  const shouldSelect = thisRoute === requestParams.route; // This route

  const highlightDirection =
    directionDict[requestParams.route][requestParams.direction];
  const shouldHighlight = shouldSelect && thisDirection === highlightDirection; // This route and direction

  if (shouldHighlight) return stopsStyleHighlighted;
  return shouldSelect ? stopsStyleSelected : stopsStyle;
};

export const makeBusIcon = (isSelected) => {
  const color = isSelected ? "#f04926" : "#cccccc";
  const busIconHtml = `<i class="fas fa-bus" style="color:${color}; font-size:18px;"></i>`;
  const busIcon = L.divIcon({
    html: busIconHtml,
    iconSize: [30, 30],
  });
  return busIcon;
};

export const makeBusPopupContent = (feature) => {
  return "hello";
};
