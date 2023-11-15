import { useTemperature } from "../../TemperatureContext";
import "./UnitToggle.css";

const UnitToggle = () => {
  const { unit, toggleUnit } = useTemperature();

  return (
    <div className="mt-2 d-flex flex-row justify-content-start align-items-center">
      <span className="text ms-xs-0 ms-sm-0 ms-md-0 ms-lg-0 ms-xl-4 me-3">Fahrenheit</span>
      <label className="unit-switcher d-block d-lg-block me-3">
        <input
          type="checkbox"
          checked={unit == "Celsius"}
          onChange={toggleUnit}
        />
        <span className="slider round"></span>
      </label>
      <span className="text">Celsius</span>
    </div>
  );
};

export default UnitToggle;
