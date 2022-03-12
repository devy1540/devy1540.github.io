import React from "react"
import tw, { css } from "twin.macro"
const SideWrapper = ({ children }) => {
    return (
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
            float: left;
            position: sticky;
            top: 100px;
            width: calc((100vw - 720px) / 2 - 80px);
            max-width: 250px;
            margin-left: calc((100vw - 1280px) / 2);
            word-break: break-word;
            max-height: calc(100vh - 200px);
            fontsize: 1rem;
            display: block;
            `
        }
        >
            {children}
        </div>
    )
}

export default SideWrapper