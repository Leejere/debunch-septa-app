export default function capitalizeFirstLetter(str) {
  if (!str || typeof str !== "string") return "";

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
