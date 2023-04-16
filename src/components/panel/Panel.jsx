import React from "react";
import panelStyles from "./Panel.module.scss";

import RouteSelector from "./RouteSelector";
import DirectionSelector from "./DirectionSelector";

export default function Panel({ requestParams, setRequestParams, stopsArray }) {
  return (
    <section className={panelStyles.container}>
      <RouteSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
      />
      <DirectionSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        stopsArray={stopsArray}
      />
    </section>
  );
}
