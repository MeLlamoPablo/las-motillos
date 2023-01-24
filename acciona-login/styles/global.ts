import { createGlobalStyle, css } from "styled-components";
import "normalize.css";

const lightColors = css`
  body {
    --primary-color: #141414;
    --secondary-color: #5c5c5c;
    --primary-bg-color: #ffffff;
    --border-color: #c2c2c2;
    --accent-color: #ff2600;
  }
`;

const darkColors = css`
  body {
    --primary-color: var(--primary-color-dark);
    --secondary-color: var(--secondary-color-dark);
    --primary-bg-color: #333333;
    --border-color: #666666;
    --accent-color: #ae0909;
  }
`;

export const GlobalStyles = createGlobalStyle`
  html,
  body {
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
	  
	  color: var(--primary-color);
	  background: var(--primary-bg-color);
  }
  
  html, body, #__next {
    width: 100%;
    height: 100%;
  }

  * {
    box-sizing: border-box;
  }
  
  html {
    --border-radius: 0.5rem;
    --primary-color-dark: #ffffff;
    --secondary-color-dark: #C2C2C2;
  }
  
  ${lightColors};
  
  @media (prefers-color-scheme: dark) {
    html {
      color-scheme: dark;
    }
    ${darkColors};
  }
`;
