import React, { useState, useEffect } from "react";
import ModuleTitle from "./ModuleTitle";
import panelStyles from "./Panel.module.scss";

export default React.memo(function () {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000); // Update every minute (60,000 milliseconds)

    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  const hour = time.getHours();
  const hourDisplay = (hour > 12 ? hour - 12 : hour)
    .toString()
    .padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0"); // Add leading zero if necessary
  const suffix = hour >= 12 ? "PM" : "AM";

  const monthName = time.toLocaleString("default", { month: "long" });
  const day = time.getDate();

  return (
    <div className={panelStyles.module}>
      <ModuleTitle
        className={panelStyles.moduleTitle}
        title={"Prediction as of"}
        modalHeading={"Prediction Time"}
        modalContent={
          "As a proof-of-concept, real-time prediction is disabled for this demo app."
        }
      ></ModuleTitle>
      <div className={panelStyles.dateTimeDisplayer}>
        <div className={panelStyles.timeDisplayer}>
          {hourDisplay}:{minutes}&nbsp;
          {suffix}
        </div>
        <div className={panelStyles.dateDisplayer}>
          {monthName}&nbsp;{day}
        </div>
      </div>
    </div>
  );
});
