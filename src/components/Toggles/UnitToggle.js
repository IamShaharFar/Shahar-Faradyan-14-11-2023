import { useTemperature } from "../../TemperatureContext";
import "./UnitToggle.css";

const UnitToggle = () => {
  const { unit, toggleUnit } = useTemperature();

  return (
    <div className="mt-2 d-flex flex-row justify-content-start align-items-center">
      <span className="text ms-lg-5 me-lg-3 me-sm-2 ms-sm-1">Fahrenheit</span>
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
