import { useTheme } from "../../ThemeContext";
import "./ThemeToggle.css"

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
 
    return (
        <div className="mt-2 d-flex flex-row justify-content-start align-items-center">
          <span className="text ms-lg-5 me-lg-3 me-sm-2 ms-sm-1">{theme == "dark" ? 'Dark Mode' : 'Light Mode'}</span>
          <label className="theme-switcher d-block d-lg-block me-2">
            <input type="checkbox" checked={theme == "dark"} onChange={toggleTheme} />
            <span className="slider round"></span>
          </label>
        </div>
      );
      
}

export default ThemeToggle;