import { useTheme } from "../../ThemeContext";
import "./ThemeToggle.css"

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
 
    return (
        <div className="mt-4 mt-xl-0 mb-4 mb-xl-0 d-flex flex-row justify-content-start align-items-center">
          <span className="text ms-xs-0 ms-sm-0 ms-md-0 ms-lg-0 ms-xl-4 me-3">{theme == "dark" ? 'Dark Mode' : 'Light Mode'}</span>
          <label className="theme-switcher d-block d-lg-block me-2">
            <input type="checkbox" checked={theme == "dark"} onChange={toggleTheme} />
            <span className="slider round"></span>
          </label>
        </div>
      );
      
}

export default ThemeToggle;