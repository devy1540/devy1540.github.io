import React, { useState, useEffect, useContext } from "react"
import tw, { css } from "twin.macro"
import ThemeContext from "../lib/context/ThemeContext"
import { whiteModeColor, darkModeColor } from "../../theme-color"
import { Link } from "gatsby"
import { AiOutlineSearch, AiOutlineUser } from "react-icons/ai"

const Wrapper = tw.nav`
flex items-center justify-between flex-wrap max-w-screen-xl mx-auto p-5
`

var old_windows_Scrolly = 0

const Nav = () => {
  const { isDarkMode } = useContext(ThemeContext)
  const [isVisible, setIsVisible] = useState(false)

  const backgroundCSS = css`
    background: linear-gradient(
      90deg,
      ${isDarkMode
        ? darkModeColor.mainColor1 + "," + darkModeColor.mainColor2
        : whiteModeColor.mainColor1 + "," + whiteModeColor.mainColor2}
    );
  `

  const handleScroll = (_e) => {
    if (window.scrollY < old_windows_Scrolly && window.scrollY > 10) {
      old_windows_Scrolly = window.scrollY + 5
      setIsVisible(true)
    } else {
      setIsVisible(false)
      old_windows_Scrolly = window.scrollY
    }
  }

  const IconContents = () => {
    return (
      <>
        <div
          css={css`
            display: flex;
          `}
        >
          <Link
            to={`https://devy1540.notion.site/a6b71f11606a49aab4353479f8df4f77`}
            aria-label={`about page`}
            css={css`
              margin-right: 30px;
            `}
          >
            <AiOutlineUser css={tw`text-white my-auto w-8 h-8`} />
          </Link>
          <Link to={`/search`} aria-label={`search page`}>
            <AiOutlineSearch css={tw`text-white my-auto w-8 h-8`} />
          </Link>
        </div>
      </>
    )
  }
  const Content = () => {
    return (
      <>
        <Link css={tw`text-xl text-white font-bold`} to={"/"}>
          devy's Blog
        </Link>
        <IconContents />
      </>
    )
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <div css={backgroundCSS}>
        <Wrapper>
          <Content />
        </Wrapper>
      </div>
      <div
        css={[
          backgroundCSS,
          tw`fixed w-full shadow`,
          css`
            z-index: 100;
            transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
            top: ${isVisible ? "0px" : "-100px"};
          `,
        ]}
      >
        <Wrapper>
          <Content />
        </Wrapper>
      </div>
    </>
  )
}

export default Nav
