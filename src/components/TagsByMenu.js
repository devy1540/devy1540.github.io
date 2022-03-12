import React from "react"
import TagByMenu from "./TagByMenu"

const Tags = ({ tags, onClick, tag: selectedTag, scrollToCenter }) => {
  return tags.map((tag, index) => (
    <TagByMenu
      tag={tag}
      selectedTag={selectedTag}
      scrollToCenter={scrollToCenter}
      key={`tag_${index}`}
      onClick={onClick}
    />
  ))
}

export default Tags
