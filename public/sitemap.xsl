<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sitemap xhtml"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>Sitemap</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #f8fafc;
            --fg: #0f172a;
            --muted: #64748b;
            --border: #cbd5e1;
            --surface: #ffffff;
            --link: #2563eb;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0f172a;
              --fg: #e2e8f0;
              --muted: #94a3b8;
              --border: #334155;
              --surface: #111827;
              --link: #93c5fd;
            }
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: var(--bg);
            color: var(--fg);
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 15px;
            line-height: 1.5;
          }

          main {
            width: min(1120px, calc(100% - 32px));
            margin: 48px auto;
          }

          h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }

          p {
            margin: 8px 0 24px;
            color: var(--muted);
          }

          table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border: 1px solid var(--border);
            background: var(--surface);
          }

          th,
          td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--border);
            text-align: left;
            vertical-align: top;
          }

          th {
            color: var(--muted);
            font-size: 13px;
            font-weight: 600;
          }

          tr:last-child td {
            border-bottom: 0;
          }

          a {
            color: var(--link);
            overflow-wrap: anywhere;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }

          .date {
            white-space: nowrap;
          }

          .labels {
            color: var(--muted);
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <main>
          <xsl:choose>
            <xsl:when test="sitemap:urlset">
              <h1>Sitemap</h1>
              <p>
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
                <xsl:text> URLs indexed for search engines.</xsl:text>
              </p>
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Last modified</th>
                    <th>Self</th>
                    <th>Alternates</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <xsl:variable name="loc" select="sitemap:loc"/>
                    <tr>
                      <td>
                        <a href="{sitemap:loc}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td class="date">
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                      <td class="labels">
                        <xsl:choose>
                          <xsl:when test="xhtml:link[@href = $loc and @hreflang != 'x-default']">
                            <xsl:for-each select="xhtml:link[@href = $loc and @hreflang != 'x-default']">
                              <xsl:value-of select="@hreflang"/>
                              <xsl:if test="position() != last()">
                                <xsl:text>, </xsl:text>
                              </xsl:if>
                            </xsl:for-each>
                            <xsl:if test="xhtml:link[@href = $loc and @hreflang = 'x-default']">
                              <xsl:text>, x-default</xsl:text>
                            </xsl:if>
                          </xsl:when>
                          <xsl:when test="xhtml:link[@href = $loc]">
                            <xsl:for-each select="xhtml:link[@href = $loc]">
                              <xsl:value-of select="@hreflang"/>
                              <xsl:if test="position() != last()">
                                <xsl:text>, </xsl:text>
                              </xsl:if>
                            </xsl:for-each>
                          </xsl:when>
                          <xsl:otherwise>-</xsl:otherwise>
                        </xsl:choose>
                      </td>
                      <td class="labels">
                        <xsl:choose>
                          <xsl:when test="xhtml:link[@href != $loc and @hreflang != 'x-default']">
                            <xsl:for-each select="xhtml:link[@href != $loc and @hreflang != 'x-default']">
                              <xsl:value-of select="@hreflang"/>
                              <xsl:if test="position() != last()">
                                <xsl:text>, </xsl:text>
                              </xsl:if>
                            </xsl:for-each>
                          </xsl:when>
                          <xsl:otherwise>-</xsl:otherwise>
                        </xsl:choose>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <h1>Sitemap Index</h1>
              <p>
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/>
                <xsl:text> sitemap files indexed for search engines.</xsl:text>
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Sitemap</th>
                    <th>Last modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <tr>
                      <td>
                        <a href="{sitemap:loc}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td class="date">
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
