import React, { useContext } from "react"
import tw, { css } from "twin.macro"
import ThemeContext from "../lib/context/ThemContext"
import { whiteModeColor, darkModeColor } from "../../theme-color"

const Footer = () => {
  const { isDarkMode } = useContext(ThemeContext)
  return (
    <footer css={tw`text-center py-8 bottom-0`}>
      <a
        css={css`
          color: ${isDarkMode
            ? whiteModeColor.textColor2
            : darkModeColor.textColor2};
          ${tw`text-xs font-bold`}
        `}
        href={`https://github.com/devy1540`}
      >
        &copy;dev_y
      </a>
    </footer>
  )
}

export default Footer
