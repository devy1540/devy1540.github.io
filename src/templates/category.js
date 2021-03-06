import tw from "twin.macro"
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react"
import SEO from "../components/SEO"
import Profile from "../components/Profile"
import Post from "../components/Post"
import Layout from "../components/Layout"
import { graphql, navigate } from "gatsby"
import queryString from "query-string"
import useInfiniteScroll from "../lib/hooks/useInfiniteScroll"
import useCount from "../lib/hooks/useCount"
import CategoryMenu from "../components/CategoryMenu"
import TagMenu from "../components/TagMenu"
import SideWrapper from "../components/SideWrapper"

const Wrapper = tw.div`w-full max-w-screen-md mx-auto`

export default ({ data, location }) => {
  const posts = data.allMarkdownRemark.edges
  const { countOfInitialPost } = data.site.siteMetadata.configs
  const categoryTitle = String(location.pathname).split("/").join(" ").trim()

  const [count, countRef, increaseCount] = useCount(categoryTitle)
  const bottomRef = useRef()

  const [state, setState] = useState({
    tag: "ALL",
    filteredPosts: posts,
  })

  const tags = useMemo(() => {
    var result = []
    posts.map(({ node }) => (result = [...result, ...node.frontmatter.tags]))
    for (var i = 0; i < result.length; ++i) {
      for (var j = i + 1; j < result.length; ++j) {
        if (result[i] === result[j]) result.splice(j--, 1)
      }
    }
    return result
  }, [posts])

  const setFilteredPosts = useCallback(
    (tag) => {
      if (tag === undefined) tag = state.tag
      if (tag === "ALL") {
        setState({
          tag: tag,
          filteredPosts: posts,
        })
      } else {
        setState({
          tag: tag,
          filteredPosts: posts.filter((post) =>
            post.node.frontmatter.tags.includes(tag)
          ),
        })
      }
    },
    [posts, state.tag]
  )

  useInfiniteScroll(() => {
    if (posts.length > countRef.current * countOfInitialPost) {
      increaseCount()
      setFilteredPosts()
    }
  }, bottomRef)

  const onTagClick = (tag) => {
    navigate(`?tag=${tag}`)
    setFilteredPosts(tag)
  }

  useEffect(() => {
    if (location.href) {
      const {
        query: { tag },
      } = queryString.parseUrl(location.href)
      if (tag) {
        setFilteredPosts(tag)
      }
    }
  }, [location.href, setFilteredPosts])

  return (
    <Layout>
      <SEO title={categoryTitle} />
      <Wrapper>
        <Profile />
      </Wrapper>
      <SideWrapper>
        <CategoryMenu path={location.pathname} />
        <TagMenu tags={tags} onTagClick={onTagClick} state={state} />
      </SideWrapper>
      <Wrapper>
        <h1 className="category-title" css={tw`mt-4 px-4 text-2xl font-bold`}>
          {categoryTitle}
        </h1>
        {state.filteredPosts.length === 0 && (
          <div css={tw`mx-4 text-xl`}>no post..</div>
        )}
        {state.filteredPosts
          .slice(0, count * countOfInitialPost)
          .map((post, index) => {
            return <Post post={post} key={`post_${index}`} />
          })}
      </Wrapper>
      <div ref={bottomRef} />
    </Layout>
  )
}

export const pageQuery = graphql`
  query ($categoryRegex: String) {
    site {
      siteMetadata {
        configs {
          countOfInitialPost
        }
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {
        fileAbsolutePath: { regex: $categoryRegex }
        frontmatter: { draft: { eq: false } }
      }
    ) {
      edges {
        node {
          excerpt(pruneLength: 200, truncate: true)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY??? MM??? DD???")
            title
            tags
          }
        }
      }
    }
  }
`
