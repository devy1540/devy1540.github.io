---
title: "[TypeScript] Hello TypeScript! with Deno๐ฆ"
date: 2020-08-31 23:41
tags: ["TypeScript", "Deno"]
draft: false
---

<p align="center">
<img  style="display: inline;  witdh: 100px; height: 100px; background-color: white;" src="image/hello-typescript-with-deno/logo.svg" />
<span style="font-size: 50px;">โค</span>
<img style="display: inline; witdh: 100px; height: 100px;" src="image/hello-typescript-with-deno/Typescript_logo_2020.svg" />
</p>

# [TypeScript?](https://www.typescriptlang.org/)

TypeScript์ ๋ํด์ ์ฒ์ ๊ด์ฌ์ ๊ฐ์ง๊ฒ ๋ ๊ฒ์ React๋ฅผ ๊ณต๋ถํ๋ฉฐ ๊ฐ๋ฐ์ ํ๋ค ์ค๊ฐ ์ค๊ฐ `Type`์ ๋ํด ์ ๋๋ก ์ฒดํฌ๋ฅผ ์ํ๊ณ  ๊ทธ๋ฅ ์ฌ์ฉ์ ํ๋ค ๋ฐํ์์์ ๋ฌธ์ ๊ฐ ๋ฐ์ํ๋ค๋ ๊ฒ์ ๋์ผ๋ก ๋ณด๊ณ  ์์ ์ ํ๋ ๊ฒฝ์ฐ๊ฐ ๋ง์๋๋ฐ ์ด๋ฌํ ๋ฌธ์ ๋ฅผ ์์ฒ ์ฐจ๋จ ํ  ์ ์๋ `JavaScript` ์ `SuperSet` ์ธ์ด์ธ `TypeScript`๊ฐ ์๋ค๋ ๊ฒ์ ์๊ฒ ๋๊ณ  ๊ด์ฌ์ ๊ฐ์ง๊ฒ ๋์๋ค.

`TypeScript`๊ฐ ์์์ ์ค๋ชํ ๋ฌธ์ ๋ฅผ ์์ฒ ์ฐจ๋จ ํ  ์ ์๋ค๋ ์ด์ ๋ JS์ ๋ฌ๋ฆฌ ์ปดํ์ผ ๊ณผ์ ์์ `TypeChecker`๋ฅผ ํตํด ์๋ฅผ ๋ค์ด ์ซ์์ ๋ฌธ์๋ฅผ ๊ณฑํ๊ณ  ์๋์ง ์ ๊ฐ์ ํ์๋ฅผ ๋ฐ๊ฒฌํ๊ณ  ๋ฏธ๋ฆฌ ๊ฒฝ๊ณ ๋ฅผ ํจ์ผ๋ก์จ ๊ฐ๋ฐ์๋ ์ค์๋ฅผ ์ค์ด๊ณ  ์ํ๋ ํํ๋ก ์ ์์ ์ผ๋ก ๋์ค๊ฒ ๋  ์ ์๋ค.

์ฒ์ `TypeScript`์ ๋ํด ์์์ ๋ **์ปดํ์ผ**์ ํด ์ค๋ค๊ณ ?? `JavaScript`๋ **์ธํฐํ๋ฆฌํฐ** ์ธ์ด์ธ๋ฐ? ํ๋ฉด์ ์๋ฌธ์ ์ด ์๊ฒผ๋ค.

์ด๋ `TypeScript`๋ ์์์ ๋งํ ๊ฒ๊ณผ ๊ฐ์ด `JavaScript`์ SuperSet์ผ๋ก `TypeScript`๋ ๊ฒฐ๊ณผ๋ฌผ์ `JavaScript`๋ก ๋ง๋ค์ด ์ค๋ค.

๊ทธ ๊ณผ์ ์์ ํ์์ ๋ํด ์ฒดํฌ๋ฅผ ํด์ฃผ๊ธฐ ๋๋ฌธ์ ๋ฐํ์์ด ์๋ ์ปดํ์ผ ์์ ์์ ํ์์ ๋ํด ์๋ชป๋ ๋ถ๋ถ์ ์๊ฒ ๋๋ ๊ฒ์ด๋ค.

```yml
TS:
1: ํ์์คํฌ๋ฆฝํธ ์์ค -> ํ์์คํฌ๋ฆฝํธ AST
2: ํ์ ๊ฒ์ฌ๊ธฐ๊ฐ AST๋ฅผ ํ์ธ
3: ํ์์คํฌ๋ฆฝํธ AST -> ์๋ฐ์คํฌ๋ฆฝํธ ์์ค
JS:
4: ์๋ฐ์คํฌ๋ฆฝํธ ์์ค -> ์๋ฐ์คํฌ๋ฆฝํธ AST
5: AST -> ๋ฐ์ดํธ์ฝ๋
6: ๋ฐํ์์ด ๋ฐ์ดํธ์ฝ๋๋ฅผ ํ๊ฐ
```

์์ ๊ฐ์ ๋จ๊ณ๋ฅผ ๊ฑฐ์น๋ฉด์ TypeScript๊ฐ JavaScript ์์ค๋ก ์์ฑํ์ฌ ๋ธ๋ผ์ฐ์  ๊ธฐํ ์์ง์ ์ํด์ ์๋ฐ์คํฌ๋ฆฝํธ๊ฐ ์คํ์ด ๋๋ค.

๊ทธ๋ฆฌ๊ณ  `Node.js` ์์ `TypeScript`๋ฅผ ์ฌ์ฉํ๊ธฐ ์ํด์๋ `typescript tslint @types/node` ๋ฑ์ ์ถ๊ฐ์ ์ธ ๋ชจ๋์ด ์๊ตฌ๊ฐ ๋๋๋ฐ `deno` ๋ผ๋ ์๋ก์ด ์์ง์ ์ฌ์ฉํด์ ์ถ๊ฐ์ ์ธ ๋ชจ๋์ด ์์ด ์๋์ด ๊ฐ๋ฅํ๊ฒ ๋๋ค.

# [Deno?](https://deno.land/)

> ## Deno is a simple, modern and secure runtime for JavaScript and TypeScript that uses V8 and is built in Rust.

`Deno`์ ๊ณต์ ์ฌ์ดํธ์ ๋ค์ด๊ฐ๊ฒ ๋๋ฉด ์์ ๊ฐ์ด ์ค๋ช์ ํ๊ณ  ์๋ ๊ฒ์ ๋ณผ ์ ์๋ค.

`Deno`๋ `Node.js`์ ๊ฐ๋ฐ์๊ฐ ๊ธฐ์กด `Node.JS`๋ฅผ ๋ง๋ค์๋ ์ํฉ๊ณผ ์ง๊ธ์ JavaScript์ ์ํ๊ณ๊ฐ ๋ณํ๋จ์ผ๋ก์จ ๊ทผ๋ณธ์ ์ผ๋ก ๊ฐ์ง๊ณ  ์์๋ ๋จ์ ๋ค์ ๊ฐ์ ํ ํ๋ก์ ํธ ์ด๋ค.

๊ธฐ์กด `Node.js`์์ ์ฐจ์ด์ ์ ์๋์ ๋ฆฌ์คํธ๋ก ์ ๋ฆฌํด๋ณด์๋ค.

|                            | Node.js                     | Deno                 |
| -------------------------- | --------------------------- | -------------------- |
| Engine                     | V8                          | V8                   |
| Language                   | C++, javascript             | rust, typescript     |
| Package manager            | NPM                         | URLs or file paths   |
| Modules import             | CommonJs                    | ES Modules           |
| Security                   | full access                 | explicit permissions |
| TypeScript Support         | not built in                | built in             |
| async actions return value | return undefined or promise | return promise       |

`Node.js`์ `Deno`๋ ์์ ๊ฐ์ ์ฐจ์ด๋ฅผ ๊ฐ์ง๊ณ  ์๋ค. ํ์ง๋ง ์์ง ๊ฐ๋ฐ์ด `Node.js` ์ ๋ฌ๋ฆฌ ์ด๊ธฐ์ธ ์ ์ ๊ณ ๋ คํ์ฌ์ ์ฌ์ฉ์ ๊ณ ๋ คํด์ผ ํ๋ค.

๊ธฐ์กด `Node.js` ๋ TypeScript๋ฅผ ์ฐ๊ธฐ ์ํด ์ถ๊ฐ์ ์ธ ๋ชจ๋์ ์ฌ์ฉ ํด์ผ ํ๊ณ  ๋ณต์กํ ์ค์ ์ด ํ์ํ์ง๋ง Deno๋ ์์ฒด์ ์ผ๋ก TypeScript๋ฅผ ์ง์ํ๊ธฐ ๋๋ฌธ์ ์ด๋ฒ ๊ธฐํ์ ๊ฐ์ด ๊ณต๋ถํ๊ณ ์ ์ด๋ ๊ฒ ์ ๋ฆฌ ๊ธ์ ์์ฑํ๊ฒ ๋์๋ค.

# Hello TypeScript! with Deno๐ฆ

์ด์  ํ๋ฒ Deno๋ฅผ ์ค์นํ์ฌ์ `Hello TypeScript! - with ๐ฆ` ๋ฌธ๊ตฌ๋ฅผ ์ถ๋ ฅ ํด๋ณธ๋ค!

> ## Installation
>
> Deno works on macOS, Linux, and Windows. Deno is a single binary executable. It has no external dependencies.
>
> Using Shell (macOS and Linux):
>
> ```
> curl -fsSL https://deno.land/x/install/install.sh | sh
> ```
>
> Using PowerShell (Windows):
>
> ```
> iwr https://deno.land/x/install/install.ps1 -useb | iex
> ```
>
> Using [Scoop](https://scoop.sh/) (Windows):
>
> ```
> scoop install deno
> ```
>
> Using [Chocolatey](https://chocolatey.org/packages/deno) (Windows):
>
> ```
> choco install deno
> ```
>
> Using [Homebrew](https://formulae.brew.sh/formula/deno) (macOS):
>
> ```
> brew install deno
> ```
>
> Using [Cargo](https://crates.io/crates/deno) (Windows, macOS, Linux):
>
> ```
> cargo install deno
> ```

Deno์์ ์ ๊ณตํ๋ ์ค์น ๋ฐฉ๋ฒ์ ํตํด ์ค์น๋ฅผ ์งํ ํ๋ค.

์ด์  `hello.ts` ๋ผ๋ ๊ฐ๋จํ ํ์ผ์ ๋ง๋ค๊ณ  ์๋์ ๊ฐ์ ๋ด์ฉ์ผ๋ก ์์ฑ์ ํด๋ณธ๋ค.

```ts
console.log("Hello TypeScript! - with ๐ฆ")
```

๊ทธ๋ฆฌ๊ณ  `deno run hello.ts` ๋ช๋ น์ด๋ฅผ ํตํด ๊ฒฐ๊ณผ๋ฌผ์ ํ์ธ ํด๋ณธ๋ค!

์ด์  TypeScript์ ์ฅ์ ์ธ `TypeChecker`๊ฐ ๋์ํ๋ ์ง ํ์ธํ๋ค.

```ts
const num = 10
const word = "test"

console.log(num * word)
```

์์ ๊ฐ์ด ์์ฑ๋ ํ์ผ์ ๋ณด๊ฒ ๋๋ฉด ์๋์ ๊ฐ์ ๊ฒฝ๊ณ ๊ฐ ๋ฐ๋ก ์ถ๋ ฅ ๋๋ ๊ฒ์ ๋ณผ ์ ์๋ค.

![image-20200901025605633](image/hello-typescript-with-deno/image-20200901025605633.png)

์ด๋ฒ์๋ `annotation`๋ฅผ ์ฌ์ฉํ์ฌ ๋ณ์์ Type๋ฅผ ์ง์  ํ์์ ๋ ์ด๋ค ์์ผ๋ก ์๋ํ๋์ง ํ์ธ ํ๋ค.

```ts
const num: number = 10
const word: number = "test"

console.log(num * word)
```

![image-20200901025947806](image/hello-typescript-with-deno/image-20200901025947806.png)

์์ ๊ฐ์ด ํ์์ ๋ํ์ฌ ์ ์๋ฅผ ํตํด ๊ฐ๋ฐ์๊ฐ ํ  ์ ์๋ ํ์์ ๋ํ ์ค์๊ฐ ์ฌ๋ผ์ง๊ฒ ๋๋ค.

---

ํ๋ฒ ๊ฐ๋จํ๊ฒ TypeScript์ Deno์ ๋ํด์ ๊ธ์ ํด๋ณด์๋๋ฐ Deno์ ์ฅ์ ๊ณผ ์ TypeScript๋ฅผ ์ฌ์ฉํด์ผ ํ๋์ง์ ๋ํด ์ข ๋ ์์๊ฐ๊ฒ ๋ ๊ฒ ๊ฐ๋ค.
