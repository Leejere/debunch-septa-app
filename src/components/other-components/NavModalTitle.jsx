import React, { useState } from "react";

import navStyles from "./Nav.module.scss";
import { authors } from "./authors.js";

export default React.memo(function ModalTitle() {
  const authorTab = authors.map((author) => {
    return (
      <div className={navStyles.author} key={author.name}>
        <i className="fab fa-github"></i>
        <a
          href={`https://github.com/${author.githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {author.name}
        </a>
      </div>
    );
  });
  const markdownTab = (
    <div className={navStyles.author}>
      <i className="fab fa-markdown"></i>
      <a
        href="https://leejere.github.io/otis-corridor/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Project Markdown
      </a>
    </div>
  );
  return (
    <header className={navStyles.modalTitleBar}>
      <div className={navStyles.modalTitle}>SEPTA, Debunched</div>
      <div className={navStyles.authors}>{authorTab}</div>
      <div className={navStyles.authors}>{markdownTab}</div>
    </header>
  );
});
