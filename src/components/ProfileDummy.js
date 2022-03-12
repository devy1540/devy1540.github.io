import React, { useContext } from "react"
import tw, { css } from "twin.macro"
import PhotoFrame from "./PhotoFrame"
import Divider from "./Divider"
import ThemeContext from "../lib/context/ThemeContext"
import { whiteModeColor, darkModeColor } from "../../theme-color"

const Wrapper = tw.div`w-full max-w-screen-md px-4 md:px-0 mx-auto py-32 md:pt-20`
const ProfileContainer = tw.div`md:flex items-center px-2`

const ProfileDummy = () => {
  const { isDarkMode } = useContext(ThemeContext)
  return (
    <Wrapper
        css={css`
            margin-bottom: 0.41rem;
        `}
    >
        <div
            css={css`
                ${tw`mr-8 mb-10 md:mb-4`}
            `}

        >
            <ProfileContainer>
                <div
                    css={css`
                        ${tw`h-3`}
                    `}
                >

                </div>
            </ProfileContainer>
        </div>
    </Wrapper>
  )
}

export default ProfileDummy
