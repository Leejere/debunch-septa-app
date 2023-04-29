import React, { useState } from "react";
import navStyles from "./Nav.module.scss";

export default React.memo(function ModalText() {
  return (
    <>
      <h5 className={`${navStyles.modalQuote} modalSubtitle`}>
        Frequency is Freedom
      </h5>
      <p>
        Knowing when buses are coming, riders plan their trips without stress.
        Unfortunately, disruptions occur and affect some buses more than others,
        leading to <strong>bunching</strong>, where two buses arrive at a stop
        consecutively, accompanied by subsequent <strong>gapping</strong>, where
        riders have to wait a long time after the bunched buses left. This
        should not happen too often to a reliable bus service.
      </p>
      <h5 className="modalSubtitle">This App</h5>
      <p>
        This app is a{" "}
        <span styles={{ fontStyle: "italic" }}>proof-of-concept</span> of the
        operational approach, whereby we predict bunching on the fly (up to 20
        stops beforehand) to fine-tune the speeds of the buses to prevent before
        it happens. You can learn more about the approaches, the data, the
        methodology, and the models in our{" "}
        <a
          href="https://leejere.github.io/otis-corridor/"
          target="_blank"
          rel="noopener noreferrer"
        >
          project markdown
        </a>
        .
      </p>
      <h5 className="modalSubtitle">How the App Works</h5>
      <p>
        You can select a <strong>route</strong> and <strong>direction</strong>{" "}
        from the top panels to view all the active bus trips in the panel and on
        the map. After you select the bus of interest, a series of predictions
        will show in the bottom panel regarding whether this bus is likely to
        initiate bunching 11 to 20 stops ahead.
      </p>
      <p>
        This app has two modes,{" "}
        <span className={`${navStyles.modePlates} ${navStyles.modePlatesDemo}`}>
          Demo
        </span>{" "}
        and{" "}
        <span
          className={`${navStyles.modePlates} ${navStyles.modePlatesRealtime}`}
        >
          Real-time
        </span>
        . In the "Demo" mode, the app's functionalities are showcased using
        historical data. In the "Real-time" mode, the app uses real-time bus
        locations to make real-time predictions. However, as a proof-of-concept,{" "}
        <strong>
          the app currently cannot maintain a continuously active backend, and
          the user needs to manually initiate observation
        </strong>{" "}
        by hitting the{" "}
        <span className={`${navStyles.modePlates}`}>Start Observing</span>{" "}
        button then wait for 10 to 20 minutes before real-time predictions are
        available.
      </p>
    </>
  );
});
