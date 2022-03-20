import React, { useContext, useRef, useCallback } from "react"
import tw, { css } from "twin.macro"
import ThemeContext from "../lib/context/ThemeContext"
import { darkModeColor, whiteModeColor } from "../../theme-color"
import TagsByMenu from "./TagsByMenu"
import TagByMenu from "./TagByMenu"

const TagMenu = ({ onTagClick, state, tags }) => {
  const { isDarkMode } = useContext(ThemeContext)
  const containerRef = useRef(null)

  /*const scrollToCenter = useCallback(
        (tabRef) => {
            const { offsetWidth: tabWidth } = tabRef.current
            const { scrollLeft, offsetWidth: containerWidth } = containerRef.current
            const tabLeft = tabRef.current.getBoundingClientRect().left
            const containerLeft = containerRef.current.getBoundingClientRect().left
            const refineLeft = tabLeft - containerLeft
            const targetScollX =
                scrollLeft + refineLeft - containerWidth / 2 + tabWidth / 2

            containerRef.current.scroll({
                left: targetScollX,
                top: 0,
                behavior: "smooth",
            })
        },
        [containerRef]
    )*/

  return (
    <>
      <div
        css={css`
          ::-webkit-scrollbar {
            width: 4px;
          }
          ::-webkit-scrollbar-track {
            background-color: transparent;
          }
          ::-webkit-scrollbar-thumb {
            border-radius: 9999px;
            background-color: gray;
          }
          ::-webkit-scrollbar-button {
            width: 0;
            height: 0;
          }
          /* Firefox scrollbar */
          scrollbar-width: thin;
          scrollbar-color: gray transparent;
          display: none;
          @media screen and (min-width: 1280px) {
            float: left;
            position: sticky;
            top: 100px;
            width: calc((100vw - 720px) / 2 - 80px);
            max-width: 250px;
            margin-top: 100px;
            overflow: auto;
            word-break: break-word;
            max-height: calc(100vh - 200px);
            fontsize: 1rem;
            display: block;
            border-left-width: 4px;
            border-image: linear-gradient(
              180deg,
              ${isDarkMode
                ? darkModeColor.mainColor1 +
                  "," +
                  darkModeColor.mainColor2 +
                  "," +
                  darkModeColor.mainColor3
                : whiteModeColor.mainColor1 +
                  "," +
                  whiteModeColor.mainColor2 +
                  "," +
                  whiteModeColor.mainColor3}
            );
            border-image-slice: 1;
          }
        `}
      >
        <h3
          css={css`
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            ${tw`mx-4 font-bold mb-2 text-lg`}
            ${isDarkMode ? tw`text-gray-400` : tw`text-gray-700`};
          `}
        >
          Tags
        </h3>
        <div
          css={css`
            ${tw`grid-rows-4`}
          `}
        >
          <TagByMenu
            tag={"ALL"}
            selectedTag={state.tag}
            index={"default"}
            onClick={onTagClick}
          />
          <TagsByMenu
            tags={tags}
            onClick={onTagClick}
            tag={state.tag}
            // scrollToCenter={scrollToCenter}
          />
        </div>
      </div>
    </>
  )
}

export default TagMenu
