import React from "react";
import septaLogo from "../../assets/septa-logo.png";
import headerPicture from "../../assets/header-picture.png";

import navStyles from "./Nav.module.scss";

export default function Nav() {
  const appName = "Will It Bunch?";
  return (
    <nav className={navStyles.nav}>
      <img className={navStyles.logo} src={septaLogo} />
      <div className={navStyles.bar}>
        <h1 className={navStyles.appName}>{appName}</h1>
        <img className={navStyles.headerPicture} src={headerPicture} />
        <span className={`material-symbols-outlined ${navStyles.infoIcon}`}>
          info
        </span>
      </div>
    </nav>
  );
}
