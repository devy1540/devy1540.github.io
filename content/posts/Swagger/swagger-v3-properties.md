---
title: "[Swagger] Swagger v3 설정"
date: 2022-03-27
tags: ["Spring", "Spring Boot", "Java", "Swagger"]
draft: false
---

# 1. 개요

Spring Boot에서 Swagger v3 에 대한 설정 값을 정리할 수 있도록 한다.

# 2. 설정 값

<table>
    <tr>
        <th>properties</th>
        <th>description</th>
        <th>default</th>
    </tr>
    <tr>
        <td>springdoc.version</td>
        <td>버전 표기</td>
        <td>-</td>
    </tr>
    <tr>
        <td>springdoc.api-docs.path</td>
        <td>json 형식화 경로</td>
        <td><code>/api-docs</code></td>
    </tr>
    <tr>
        <td>springdoc.default-consumes-media-type</td>
        <td>request media type의 기본 값</td>
        <td><code>application/json</code></td>
    </tr>
    <tr>
        <td>springdoc.default-produces-media-type</td>
        <td>response media type의 기본 값</td>
        <td><code>*/*</code></td>
    </tr>
    <tr>
        <td>springdoc.swagger-ui.operations-sorter</td>
        <td>
            태그 내 정의된 api 정렬 기준
            <li>alpha: 알파벳 순</li>
            <li>method: http method 순</li>
        </td>
        <td>-</td>
    </tr>
    <tr>
        <td>springdoc.swagger-ui.tags-sorter</td>
        <td>태그 정렬 기준</td>
        <td>-</td>
    </tr>
    <tr>
        <td>springdoc.swagger-ui.path</td>
        <td>swagger html 경로</td>
        <td><code>/swagger-ui.html</code></td>
    </tr>
    <tr>
        <td>springdoc.swagger-ui.disable-swagger-default-url</td>
        <td>swagger example 문서인 petstore 문서 비활성화 여부</td>
        <td>
            <code>false</code>
        </td>
    </tr>
</table>
