---
title: "๐ณ Docker ๊ธฐ์ด ๋ถํฐ Wordpress ์๋น์ค ์ง์  ๊ตฌํ ๊น์ง!"
date: 2020-12-01
tags: ["docker", "ft_server", "42seoul"]
draft: false
---

![Moby-logo.png (601ร431)](image/docker๊ธฐ์ด๋ถํฐ-wordpress์๋น์ค-์ง์ ๊ตฌํ๊น์ง/Moby-logo.png)

> ๊ท์ฌ์ด Docker Logo!

# ๐ณ Docker๋!

Docker๋ Linux Container ๊ธฐ์ ์ ์ด์ฉํ์ฌ ๋ง๋  Container ๊ธฐ์  ์ค ํ๋!

<details>
<summary>๐ฆLinux Container ๊ธฐ์ ์ด๋?</summary>

---

Linux Container๋ ๊ธฐ๋ณธ์ ์ผ๋ก ํ๋ก์ธ์ค๋ฅผ ๊ฒฉ๋ฆฌ ์ํจ๋ค๋ ๊ฐ๋์์ ์ถ๋ฐ.

์๋ฅผ ๋ค์ด `chroot` ๋ช๋ น์ด๋ ํ๋ก์ธ์ค๊ฐ ์ ๊ทผ ํ  ์ ์๋ `/` ๊ฒฝ๋ก๋ฅผ ๋ณ๊ฒฝํ์ฌ ์ ๊ทผ ํ๋ ํ์ผ์ ๋ํด์ ์ ์ด ๊ฐ๋ฅ.

ํ์ง๋ง `chroot` ๋ช๋ น์ด ๋ง์ผ๋ก๋ ๋คํธ์ํฌ ๋ฐ ํ๋ก์ธ์ค ๋ฑ์ ์ ํํ๊ธฐ ์ด๋ ต๊ธฐ ๋๋ฌธ์ `cgroups` ๊ธฐ๋ฅ์ ์ด์ฉํ์ฌ ๊ฐ์ข ๋ฆฌ์์ค์ ๋ํด์ ์ ์ด๊ฐ ๊ฐ๋ฅ.

์์ ๊ฐ์ ๊ธฐ๋ฅ๋ค์ ์ด์ฉํ๊ณ  ๋ฐ์  ์์ผ์ Linux Container ๊ธฐ์ ์ด ํ์๋จ.

Host์ ํ๋ก์ธ์ค, ๋ฆฌ์์ค ๊ฒฉ๋ฆฌ๋ฅผ ํตํ์ฌ ์ปจํ์ด๋๋ก ๊ฐ๋ ํ๊ฒฝ์ ์์ฑ.

์ด๋ฅผ ํตํด ๊ฐ์ํ์ ๋ฌ๋ฆฌ ์ด์์ฒด์ ๋ฅผ ๊ฐ์ํ ํ๊ธฐ ์ํ ์์คํ์ด ๋ณ๋๋ก ํ์๊ฐ ์๊ณ  ๊ฒฉ๋ฆฌ๋ฅผ ์ด์ฉํ์ฌ Native ์์ค์ผ๋ก ์คํ์ด ๊ฐ๋ฅํจ.

---

</details>

Docker๋ฅผ ์ด์ฉํ๊ฒ ๋๋ฉด ์์ฉ ํ๋ก๊ทธ๋จ์ Host์ ๊ฒฉ๋ฆฌ๋์ด ์คํ์ด ๋๊ณ  ์์ฉ ํ๋ก๊ทธ๋จ์ ์ํ ํ๊ฒฝ ์ ์ฒด๊ฐ ๋ฏธ๋ฆฌ ์ด๋ฏธ์ง์ ๋ํด ์ ์๊ฐ ๋์ด ์คํ์ด ๋๊ธฐ ๋๋ฌธ์ host์ ํ๊ฒฝ๊ณผ ์๊ด์์ด ์ธ์ ๋ ๋์ผํ ์คํํ  ์ ์๋ค!

๋ํ ๊ฐ์ํ์ ๋ฌ๋ฆฌ ๊ฒฉ๋ฆฌํ์ฌ ํ๋ก์ธ์ค๋ฅผ ์คํํ๋ ๊ฒ ์ด๊ธฐ ๋๋ฌธ์ ํ๋ฒํ ํ๋ก๊ทธ๋จ์ ์คํํ๊ณ  ์ข๋ฃํ๋ ๊ฒ๊ณผ ๊ฐ์ด ๋น ๋ฅธ ์คํ๊ณผ ์ข๋ฃ๊ฐ ๊ฐ๋ฅํ๋ค.

์ ์ฅ์ ๋ค์ ํตํด์ ํ๋์ ์ด๋ฏธ์ง์์ **๊ฐ๋ฐ๊ณผ ํ์คํธ ๋ฐฐํฌ** ๋ชจ๋  ๊ฒ์ด **๋น ๋ฅด๊ณ  ์ ์**ํ๊ฒ ์ด๋ฃจ์ด ์ง ์ ์๋ค.

Docker๋ ๋๋ถ๋ถ์ ์ด์ ์ฒด์ ์์ ์ง์์ ํ๋ Linux Container ๊ธฐ์ ์ด๊ธฐ ๋๋ฌธ์ Linux ์ด์ธ์ ํ๊ฒฝ, Mac, Windows์์๋ VM์์์ ๋์ํ๊ฒ ๋๋ค.

## ๐ฟ Docker Image

Docker๋ ๋ง๋ค์ด์ง Container ํ๊ฒฝ ์ํ๋ฅผ Image๋ก ์ ์ฅ์ ํ  ์ ์๋๋ก ์ง์์ ํ๋ค.

์ด๋ ๊ฒ ๋ง๋ค์ด์ง Docker Image๋ฅผ ๊ธฐ๋ฐ์ผ๋ก ์๋ก์ด ์ด๋ฏธ์ง๋ฅผ ๋ง๋ค๊ฑฐ๋ ๋ค๋ฅธ ์๋ฒ์์ ๋์ผํ๊ฒ ์คํ์ด ๊ฐ๋ฅํ๋ค.

์ด๋ฌํ Docker Image๋ฅผ ์๋ก๋ ํ์ฌ ๋ณด๊ดํ๊ณ  ๋ฒ์  ๊ด๋ฆฌ ํ๋ ๊ณณ์ด ์๋๋ฐ ๊ทธ ๊ณณ์ `registry` ๋ผ๊ณ  ํ๋ค.

๋ํ์ ์ธ registry๋ก [**Docker Hub**](https://hub.docker.com/)๊ฐ ์๋ค.

## ๐ Dockerfile

Dockerfile์ image๋ฅผ ์์ฑํ๊ธฐ ์ํ Script ํ์ผ์ด๋ค.

Dockerfile์ Image๋ฅผ ๋ง๋ค๊ธฐ ์ํ ์์์ด ๊ธฐ์ฌ๋์ด ์๊ธฐ ๋๋ฌธ์ Build๊ฐ ๋๋ฉด ๋์ผํ Image๋ฅผ ๋ง๋ค์ด๋ด๊ฒ ๋๋ค.

์ด ์ ์ ์ด์ฉํ์ฌ ๋ฐฐํฌ ์์ Build ํ ๋์จ ๋ช ๊ธฐ๊ฐ ์ด์๋๋ ์ด๋ฏธ์ง๋ฅผ ์ด์ฉํ์ฌ ๋ฐฐํฌํ๊ธฐ ๋ณด๋ค๋ Dockerfile๋ฅผ ์ด์ฉํ์ฌ build ํ์ฌ ๋ฐฐํฌ๋ฅผ ํ๋ค.

### ๐Dockerfile ์์ฑ ๋ฌธ๋ฒ!

#### ๐ FROM

๊ธฐ๋ณธ์ ์ผ๋ก Dockerfile์ ์ด๋ค ์ด๋ฏธ์ง๋ฅผ ๊ธฐ๋ฐ์ผ๋ก ์์ํ๋ ์ง์ ๋ํด์ ์ ์๋ฅผ ์์ํ๋ค.

```dockerfile
# FROM <image-name>:<label>
FROM debian:buster
```

์์ ๊ฐ์ด `FROM` ๋ค์ ์ด๋ฏธ์ง์ ์ด๋ฆ์ด ์ค๊ณ  ๊ทธ ๋ค์์๋ ์ด๋ฏธ์ง์ label์ด ์ค๊ฒ ๋๋ค.

์ฌ๊ธฐ์ ์ด๋ฏธ์ง๋ ๊ธฐ๋ณธ์ ์ผ๋ก [\*\*Docker Hub](https://hub.docker.com/)\*\* ์ Alias๊ฐ ๋์ด ์์ด์ ๋ค๋ฅธ registry์์ ์ด๋ฏธ์ง๋ฅผ ๊ฐ์ ธ ์ฌ ๋์๋ registry์ ์ ์ฒด url๋ฅผ ํฌํจํ์ฌ ์์ฑ์ ํด์ผ ํ๋ค.

#### ๐ RUN

Dockerfile์์ ์ด๋ฏธ์ง ๋ด๋ถ์์ ์คํ ๋์ด์ผ ํ๋ ๋ช๋ น์ด๋ฅผ ์์ฑ์ ํ  ์ ์๋ค.

```dockerfile
# RUN <command>
RUN apt update -y
```

์์ ๊ฐ์ด `RUN` ๋ค์ ์คํ์ด ํ์ํ ๋ช๋ น์ด๋ฅผ ์์ฑ์ ํ์ฌ ์ฌ์ฉ์ ํ๋ค.

์ด๋ ์์ ๊ฐ์ด ์ฌ์ฉ ํ๋ ๋ฐฉ๋ฒ๋ง์ด ์๋ ๊ฒ์ด ์๋๋ผ ์ง์  ์คํ ๋์ด์ผ ํ๋ ๊ฒฝ๋ก๋ฅผ ์ง์  ์ ์ด ์ฃผ๋ ๋ฐฉ๋ฒ๊ณผ ์ธ์์ ๋ํด์ ํ์คํ๊ฒ arrayํํ๋ก ์ ์ ํด์ฃผ๋ ๋ฐฉ๋ฒ๋ ์กด์ฌ ํ๋ค.

```dockerfile
RUN /bin/bash -c 'echo "Hello World!"'
RUN ["/bin/bash", "-c" "echo 'Hello World!'"]
```

์ด๋ ๋ช๋ น์ด๋ฅผ ์คํํ ํ์ ๋ง๋ค์ด์ง๋ ์ด๋ฏธ์ง๋ฅผ ๋ ์ด์ด ๋ณ๋ก ์ ์ฅ์ ํ๊ฒ ๋์ด์ `Dockerfile`์์ ์์ ์ ํ์ฌ๋ ์ด์  ๋ ์ด์ด๋ฅผ ํ์ฉํ์ฌ ๋น ๋ฅด๊ฒ ๋น๋๊ฐ ๊ฐ๋ฅํ๋ค.

#### ๐ COPY

Docker image๋ฅผ ๋ง๋ค๋ฉด์ ๋ด๋ถ์ Sourcefile๋ฅผ ๋ณต์ฌํ์ฌ ์ด๋์ด ํ์ ํ  ๋๊ฐ ์๋๋ฐ ์ด๋ฌํ ์ํฉ์์๋ ์๋์ ๊ฐ์ด ์ฌ์ฉ์ ํ  ์ ์๋ค.

```dockerfile
# COPY <src> <dst>
COPY init.sh /
```

#### ๐ ADD

Dockerfile์๋ `COPY` ์ ์ ์ฌํ ์ฑ๊ฒฉ์ธ `ADD` ๋ช๋ น์ด๊ฐ ์กด์ฌ๋ฅผ ํ๋ค.

`ADD` ๋ `COPY` ์ ๋ฌ๋ฆฌ ํ์ผ์ src ๋ถ๋ถ์ url๋ฅผ ์ ๊ฒ ๋๋ฉด ์๋์ผ๋ก ํ์ผ์ ๋ค์ด ๋ฐ์์ ๋ณต์ฌ๋ฅผ ํ๊ณ  ์์ถ ํ์ผ์ ๊ฒฝ์ฐ์๋ ์์ถ์ ํด์ ํด์ ์ ๋ฌํ๊ฒ ๋๋ ํน์ง์ด ์กด์ฌํ๋ค.

```dockerfile
# ADD <src(url)> <dest>
ADD <https://www.docker.com/sites/default/files/d8/2019-07/Moby-logo.png> /
```

์ด๋ฌํ ํน์ฑ์ด ์กด์ฌํ๊ธฐ ๋๋ฌธ์ `COPY` ์ `ADD` ๋ฅผ ์ ์ ํ ์ ํ์ ํ์ฌ์ ์ฌ์ฉ์ ํด์ผ ํ๋ค.

#### ๐ ENV

Dockerfile์์๋ ๋ด๋ถ ์ด๋ฏธ์ง์์ ์ค์ ๋๋ ํ๊ฒฝ ๋ณ์์ ๋ํด์๋ ์๋์ ๊ฐ์ด ์ค์ ์ด ๊ฐ๋ฅํ๋ค.

```dockerfile
# ENV name=value
ENV DEV_ENV=true
```

#### ๐ WORKDIR

Dockerfile์์ ์์ ํ๋ ๊ฒฝ๋ก์ ๋ํด์ ์ ์๋ฅผ ํ  ๋์๋ `WORKDIR` ๋ฅผ ์ด์ฉํ์ฌ ์ ์๋ฅผ ํ๊ฒ ๋๋ค.

```dockerfile
# WORKDIR <dir>
WORKDIR /root
```

#### ๐ USER

`WORKDIR` ๋ฅผ ์ด์ฉํ์ฌ ์์ ๊ฒฝ๋ก๋ฅผ ์ง์ ํ๋ ๊ฒ๊ณผ ๊ฐ์ด ์์ํ๋ ์ฌ์ฉ์์ ๋ํด์๋ ์ ์๊ฐ ๊ฐ๋ฅํ๋ค.

```dockerfile
 # USER <user>[:<group>] | <UID>[:<GID>]
USER 0:0
```

๋จ ์ด๋ ์ฌ์ฉ ๋๋ user์ ๋ํด์๋ ๋ฏธ๋ฆฌ `RUN` ๋ฅผ ์ด์ฉํด์ user์ group๋ฅผ ์ถ๊ฐ๋ฅผ ํ๊ฑฐ๋ ์ด๋ฏธ์ง์ ๋ฑ๋ก์ด ๋ user์ฌ๋ง ์๋์ ํ๊ฒ ๋๋ค.

#### ๐ RUN

`RUN` ๋ฅผ ํ  ๋์ ์ฌ์ฉ์ด ๋๋ ๊ธฐ๋ณธ shell์ ๋ํด ์๋์ ๊ฐ์ด ์ ์๊ฐ ๊ฐ๋ฅ ํ๋ค.

```dockerfile
# SHELL [<executable>, <parameters>]
SHELL ["/bin/bash", "-"]
```

#### ๐ ARG

Dockerfile์ image๋ฅผ ๋ง๋ค์ด์ฃผ๋ script ์ด๋ฏ๋ก ๋์ ์ผ๋ก ํ ๋น์ด ๊ฐ๋ฅํ `ARG` ๋ฅผ ์ฌ์ฉ ๊ฐ๋ฅ์ ํ๋ค.

```dockerfile
# ARG <name>[=<default value>]
ARG user=root
```

์ด๋ `ARG` ๋ช๋ น์ด๋ก ์ ์ํ๊ฒ ๋ ํ๊ฒฝ ๋ณ์๋ ๋์ผํ `ARG` ๋ณ์๋ฅผ ์ฌ์ ์ ํ๋ค.

๋น๋ ํ  ๋ ๋ง์ฝ arg์ ๊ฐ์ ๋ณ๊ฒฝํ๊ณ  ์ถ๋ค๋ฉด ์๋์ ๊ฐ์ด ์ฌ์ฉ ํ๋ค.

```bash
$ docker build --build-arg user=jaeskim .
```

๋ง์ฝ ํ๊ฒฝ ๋ณ์๋ฅผ arg๋ฅผ ์ด์ฉํ์ฌ ์ฌ์ ์ ํ์ฌ ์ฌ์ฉ์ ํ๊ณ  ์ถ๋ค๋ฉด ์๋์ ๊ฐ์ด ์ฌ์ฉ ํ  ์ ์๋ค.

```dockerfile
ARG TEST
ENV TEST=${TEST:-hello_world}
RUN echo $TEST
```

#### ๐ EXPOSE

์ปจํ์ด๋ ๋ด๋ถ์์ ๋คํธ์ํฌ ํฌํธ๋ฅผ ์์  ๋๊ธฐ ํจ์ Docker์๊ฒ ๋ฏธ๋ฆฌ ์๋ ค์ค ์ ์๋๋ฐ ์ด๋ `EXPOSE` ๋ช๋ น์ด๋ก ์ค์ ํ๋ค.

```dockerfile
# EXPOSE <port> | <port><protocol>
EXPOSE 80
EXPOSE 443/tcps
```

๊ธฐ๋ณธ์ ์ผ๋ก protocol์ ๋ํด์ ์ ์๋ฅผ ํ์ง ์๊ฒ ๋๋ค๋ฉด tcp๋ก ์๋์ ํ๊ฒ ๋๊ณ , ์ฌ๊ธฐ์ ์ ์๋ฅผ ํ์๋ค๊ณ  ๋ฐ๋ก HOST์ port๊ฐ ์ฐ๊ฒฐ์ด ๋๋ ๊ฒ์ด ์๋๊ธฐ ๋๋ฌธ์ run time์์ port binding ์์์ด ์ํ ๋์ด์ผ ํ๋ค.

#### ๐ CMD, ENTRYPOINT

์ด์  `Dockerfile` ์์ ์ปจํ์ด๋๊ฐ ์ฌ๋ผ๊ฐ๊ณ  ์คํ์ด ๋ช๋ น์ด์ ๋ํด์ ์ ์ ํ๋ ๋ฐฉ๋ฒ์ ๋ํด ์์ ๋ณธ๋ค.

`CMD` , `ENTRYPOINT` ๋ผ๋ ๋ช๋ น์ด๋ฅผ ์ด์ฉํ์ฌ ์ ์๋ฅผ ํ๊ฒ ๋๋๋ฐ ๊ฐ ๊ฐ ์ฌ์ฉ ํ  ๋์ ๊ฐ์ด ์ฌ์ฉํ  ๋์ ์์ ์ ํจ๊ป ์ฐจ์ด๋ฅผ ์์ ๋ณธ๋ค.

```dockerfile
CMD ["echo", "hello"]
```

์์ ๊ฐ์ด ๋ง๋ค์ด์ง dockerfile๋ฅผ ๋น๋ ํ ์คํ์ ํ๊ฒ ๋๋ฉด `echo hello` ๊ฐ ์๋ ํ๋ ๊ฒ์ ๋ณผ ์ ์๋ค.

์ด ๋ `docker run test:cmd echo hi` ์ ๊ฐ์ด ๋ง์ง๋ง์ ์คํ ์ธ์๋ฅผ ์ ๋ฌ ํ๊ฒ ๋๋ฉด `echo hi` ๊ฐ ์คํ์ด ๋๊ณ  `inspect` ๋ช๋ น์ด๋ก ํ์ธ์ ํด๋ณด๋ฉด `CMD` ๋ถ๋ถ์ ์ ๋ณด๊ฐ ์๋ก ์ ์ํ ๋ด์ฉ์ผ๋ก ๋ณ๊ฒฝ์ด ๋์ด ์๋ ๊ฒ์ ๋ณผ ์ ๊ฐ ์๋ค.

์ด๋ฒ์๋ `ENTRYPOINT` ๋ช๋ น์ด๋ฅผ ๋จ๋์ผ๋ก ์ฌ์ฉ์ ํด๋ณธ๋ค.

```dockerfile
ENTRYPOINT ["echo", "hello"]
```

์์ ๊ฐ์ด ์์ฑํ dockerfile๋ฅผ ๋น๋ ํ ์คํํ๋ฉด ๋น์ฐํ๊ฒ `hello` ๊ฐ ์ถ๋ ฅ์ด ๋๋ ๊ฒ์ ๋ณผ ์ ์๋ค.

์ด ๋ `docker run test:entrypoint echo world` ๋ก ์คํ์ ํ๊ฒ ๋๋ฉด `hello echo world` ๊ฐ ๋์ค๋ ๊ฒ์ ๋ณผ ์ ์๋ค.

์ด๋ฌํ ๋์์ด ๋์จ ์ด์ ๋ฅผ `inspect` ๋ช๋ น์ด๋ฅผ ํตํด ์์๋ณธ๋ค.

```json
...
"Cmd": [
  "echo",
  "world"
],
"Image": "test:entrypoint",
"Volumes": null,
"WorkingDir": "",
"Entrypoint": [
  "echo",
  "hello"
],
...
```

dcokerfile์์ ์์ฑ๋ `ENTRYPOINT` ๋ ์ฌ์ ์ ๋์ง ์๊ณ  `CMD` ๋ถ๋ถ์ ์ฌ์ ์ ๋์์ง๋ง `ENTRYPOINT` + `CMD` ๋ถ๋ถ์ด ์ด์ด์ ธ์ ์๋์ ํ๋ค.

์ฆ `ENTRYPOINT` ์๋ ์๋น์ค๋ก ๋์๊ฐ๋ ์ดํ๋ฆฌ์ผ์ด์ ์ผ๋ก ์ ์๋ฅผ ํ๊ณ  `CMD` ๋ถ๋ถ์ ์ถ๊ฐ ์ ์ผ๋ก ์ธ์๋ฅผ ํตํด ์ ๋ณด๋ฅผ ์ ๋ฌ ํ๋ ํํ๋ก ๋ง๋ค์ด์ง๋ ๊ฒ์ด ๊ถ์ฅ ๋๋ค.

#### ๐ VOLUME

Docker์์๋ ๊ธฐ๋ณธ์ ์ผ๋ก ๋ฐ์ดํฐ๋ฅผ ์ด๋ฏธ์ง ๋ ์ด์ด์ ์ ์ฅ์ ํ๊ฒ ๋๋ฏ๋ก container๊ฐ ๋ด๋ ค๊ฐ๊ณ  ์๋ก์ด ๊ฒ์ ์ฌ๋ฆด ๋๋ง๋ค ์ด๊ธฐ ์ค์ ๋ ๋ฐ์ดํฐ๋ก ์ด๊ธฐํ ๋๋ ํ๋ฐ์ฑ์ด๋ผ๋ ํน์ง์ ๊ฐ์ง๊ณ  ์๋ค.

์ด๋ log file์ด๋ db์ ๊ฐ์ ๋ฐ์ดํฐ๋ ํ๋ฐ์ฑ์ด ์๋ ๋น ํ๋ฐ์ฑ์ผ๋ก ๊ด๋ฆฌ ๋์ด์ผ ํ๋ฏ๋ก ์๋์ ๊ฐ์ด ํน์  ํด๋๋ฅผ ๊ธฐ๋ณธ volume์ผ๋ก ์ ์ฅ์ ํ์ง ์๊ณ  ๋ฐ๋ก ์ ์ฅ์ ํ  ์ ์๋ค.

```dockerfile
# VOLUME [<dir>]
VOLUME ["/data"]
```

#### ๐ ONBUILD

๋ง์ฝ ๋ง๋ค์ด์ง image๋ฅผ ๊ฐ์ง๊ณ  FROM๋ฅผ ํ  ๋์ ๋ฏธ๋ฆฌ ์ํ ๋์ด์ผ ํ๋ ์์์ด ์์ ๋ `ONBUILD` ๋ฅผ ์ฌ์ฉํ๋ค.

์๋ฅผ ๋ค์ด์ ์๋์ ๊ฐ์ด `python build` ์ ๊ด๋ จ๋ ์ด๋ฏธ์ง๋ผ๋ฉด `FROM` ์ผ๋ก ์ฌ์ฉํ๋ฉด build๋ฅผ ํ  ๋ src ํ์ผ๋ค์ ๊ฐ์ ธ์ ์ฌ์ฉ์ ํ๊ฒ ๋ง๋ค ์ ์๋ค.

```dockerfile
# ONBUILD <INSTRUCTION>
ONBUILD ADD . /app/src
ONBUILD RUN /usr/local/bin/python-build --dir /app/src
```

#### ๐ STOPSIGNAL

๊ธฐ๋ณธ์ ์ผ๋ก Docker Container๋ฅผ ์ข๋ฃํ๊ฒ ๋๋ฉด ๋ด๋ถ์์ ์๋ํ๋ ํ๋ก์ธ์ค์๊ฒ `SIGTERM` ๋ฅผ ๋ณด๋ด๊ฒ ๋๋๋ฐ ์ด ๋ ๋ณด๋ด์ง๋ SIGNAL์ ๋ํด์ ์ ์๊ฐ ๊ฐ๋ฅํ๋ค.

```dockerfile
# STOPSIGNAL signal
STOPSIGNAL SIGKILL
```

#### ๐ HEALTHCHECK

DockerContainer๊ฐ ์ฌ๋ผ๊ฐ์ ๋ ์ค์ ๋ก ํ๋ก์ธ์ค๊ฐ ์ ์์ ์ผ๋ก ๋์ ํ๋ ์ง์ ๋ํด์ Healthcheck๊ฐ ๊ฐ๋ฅํ๋ฐ ์ด๊ฒ์ ์๋์ ๊ฐ์ด ์ฌ์ฉํ๋ค.

```dockerfile
# HEALTHCHECK [OPTIONS] CMD command
HEALTHCHECK --interval=5m --timeout=3s \\
  CMD curl -f <http://localhost/> || exit 1
```

์ฌ๊ธฐ์ ์ฌ์ฉ ๋๋ ์ต์์ ์๋์ ๊ฐ์ด ์ฌ์ฉ์ด ๋๋ค.

- `-interval=DURATION` (default: `30s`)
- `-timeout=DURATION` (default: `30s`)
- `-start-period=DURATION` (default: `0s`)
- `-retries=N` (default: `3`)

#### ๐ LABEL

์์ฑ๋ image์ ๋ํด ์ฌ๋ฌ๊ฐ์ง ์ ๋ณด๋ฅผ ๋ด์ ๋์๋ ์๋์ ๊ฐ์ด ์ฌ์ฉ์ ํ๋ค.

```dockerfile
# LABEL <name>=<value>
LABEL maintainer="jaeskim <jaeskim.student.42seoul.kr>"
```

## ๐ฅ docker ๋ช๋ น์ด

docker๋ฅผ ๊ด๋ฆฌ ํ  ๋ ์ฌ์ฉ๋๋ ๋ค์ํ ๋ช๋ น์ด๊ฐ ์กด์ฌ ํ๋๋ฐ ๊ทธ ์ค ์์ฃผ ์ฌ์ฉ๋๊ณ  ์ค์ํ ๋ช๋ น์ด์ ๋ํด์ ์์ ๋ณธ๋ค.

์ต์์ด ๋ฐฉ๋ํ์ฌ ๋ชจ๋  ๋ด์ฉ์ ์ค๋ช์ ๋ชปํ๋ฏ๋ก ํ์ํ ๊ธฐ๋ฅ์ด ์์ ๋์๋ [reference site](https://docs.docker.com/engine/reference/commandline/docker/)์์ ํ์ธ ํ์ฌ ์ฌ์ฉ์ ํ๋ค.

### โ๏ธ build

`build` ๋ช๋ น์ด๋ ๊ธฐ๋ณธ์ ์ผ๋ก `Dockerfile` ๋ฅผ ์ด์ฉํ์ฌ image๋ฅผ ๋ง๋ค ๋ ์ฌ์ฉ์ ํ๊ฒ ๋๋ค.

```bash
# docker build [OPTIONS] PATH | URL | -
$ docker build --tag test:v1 .
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-t`, `--tag` name:tag ์ ๊ฐ์ ํํ๋ก ์ธ์๋ฅผ ์ฃผ๊ณ  ์์ฑ๋๋ image์ tag๋ฅผ ์ง์ ํ๋ ์ต์์ด๋ค.
- `-f`, `--file string` ํน์  `Dockerfile` ๋ฅผ ์ง์  ํ์ฌ์ ์ด๋ฏธ์ง๋ฅผ ๋ง๋ค ๋ ์ฌ์ฉํ๋ค.
- `--build-arg` Dockerfile์ ์ ์๋ ๋ณ์์ ๋ํด์ ๊ฐ์ ์ง์ ํ  ๋ ์ฌ์ฉํ๋ค.
- `--no-cache` build ํ  ๋ cache๋ฅผ ๋จ๊ธฐ์ง ์๋๋ก ํ  ๋ ์ฌ์ฉํ๋ค.

### ๐๐ปโโ๏ธ run

`run` ๋ช๋ น์ด๋ ๋ง๋ค์ด์ง image๋ฅผ ๊ฐ์ง๊ณ  ์คํ ํ  ๋ ์ฌ์ฉ์ ํ๊ฒ ๋๋ค.

```sh
# docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
$ docker run -p 8080:80 -it --rm --name testserver test:v1 /bin/bash
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-p`, `--publish` (host_port:container_port) container ๋ด๋ถ์ port์ host์ port๋ฅผ binding ํ  ๋ ์ฌ์ฉ์ด ๋๋ค.
- `-i`, `--interactive` STDIN๋ฅผ container์ ์ฐ๊ฒฐ ํ์ฌ์ ๋์ ์ผ๋ก ๋ฐ์ ํ  ์ ์๋๋ก ํ๋ค.
- `-t`, `--tty` tty์ฒ๋ผ ์๋ ํ  ์ ์๊ฒ ํ๋ค.
- `--rm` container๊ฐ ์ข๋ฃ๋๋ฉด ์๋์ผ๋ก image๋ฅผ ์ง์์ฃผ๋ ์ต์์ด๋ค.
- `-e`, `--env` ํ๊ฒฝ๋ณ์๋ฅผ ์ ์ํ  ๋ ์ฌ์ฉํ๊ฒ ๋๋ค.
- `--name` ์ปจํ์ด๋ ์ด๋ฆ์ ์ ์ ํ๋ค.
- `-d`, `--detach` background๋ก container๊ฐ ๋์ํ๊ฒ ๋๊ณ  ID๋ฅผ ์ถ๋ ฅํ๋ค.
- `-v`, `--volume` volume๋ฅผ ๋ง์ดํธ ์ํฌ ๋ ์ฌ์ฉํ๋ค.

### โ stop

`stop` ๋ช๋ น์ด๋ container๋ฅผ ์ค์ง ์ํฌ๋ ์ฌ์ฉํ๋ค.

```sh
# docker stop [OPTIONS] CONTAINER [CONTAINER...]
$ docker stop testserver
```

- `-t`, `--time` STOPSIGNAL ์๊ทธ๋์ ๋ณด๋ด๊ณ  ๋ช์ด๊ฐ ๋๊ธฐ๋ฅผ ํ ์ง ์ค์ ํ๋ ์ต์์ด๋ค.

### ๐ฌ start

`start` ๋ช๋ น์ด๋ ๋ฉ์ถฐ์ง container๋ฅผ ๋ค์ ๋์ ์ํฌ ๋ ์ฌ์ฉํ๋ค.

```sh
# docker start [OPTIONS] CONTAINER [CONTAINER...]
docker start testserver
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-a`, `--attach` stdout/stderr ์ฐ๊ฒฐ ํ๋ค.
- `-i`, `--interactive` STDIN๋ฅผ container์ ์ฐ๊ฒฐ ํ์ฌ์ ๋์ ์ผ๋ก ๋ฐ์ ํ  ์ ์๋๋ก ํ๋ค.

### โ๏ธ attach

`attach` ๋ช๋ น์ด๋ ์คํ๋ container์ ํ๋ก์ธ์ค์ ์ฐ๊ฒฐ ํ  ๋ ์ฌ์ฉ์ ํ๋ค.

```sh
# docker attach [OPTIONS] CONTAINER
docker attach testserver
```

์ด ๋ ์ ๋ฌ ์ฐ๊ฒฐํ๊ฒ ๋๋ ํ๋ก์ธ์ค๋ cmd, entrypoint๋ก ์ ์๋ ํ๋ก์ธ์ค ์ด๋ฏ๋ก ์ฌ๊ธฐ์ `ctr-c` ๋ฅผ ๋๋ฌ ์ข๋ฃํ๋ฉด ์ปจํ์ด๋๊ฐ ๋ฉ์ถ๋ฏ๋ก `ctr-p`, `ctr-q` ๋ก deattach๋ฅผ ํ์ฌ ๋์ค๋ ๊ฒ์ด ๊ถ์ฅ์ด ๋๋ค.

### ๐ก exec

`exec` ๋ช๋ น์ด๋ ์คํ๋ container์๊ฒ ํ๋ก์ธ์ค๋ฅผ ์คํ์ ์ํฌ ๋ ์ฌ์ฉ์ ํ๋ค.

```sh
# docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
docker exec -it testserver /bin/bash
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-d`, `--detach` ์คํํ ํ๋ก์ธ์ค์ ์ฐ๊ฒฐ ์ํค์ง ์๊ณ  ๋ฐฑ๊ทธ๋ผ์ด๋๋ก ๋์ ํ๊ฒ ํ๋ค.
- `-e`, `--env` ์ปจํ์ด๋์๊ฒ ํ๊ฒฝ๋ณ์๋ฅผ ์ ๋ฌ.
- `-i`, `--interactive` STDIN๋ฅผ container์ ์ฐ๊ฒฐ ํ์ฌ์ ๋์ ์ผ๋ก ๋ฐ์ ํ  ์ ์๋๋ก ํ๋ค.
- `-t`, `--tty` tty์ฒ๋ผ ์๋ ํ  ์ ์๊ฒ ํ๋ค.
- `-u` `--user` ์คํํ๋ ํ๋ก์ธ์ค์ ์ ์ ๋ฅผ ์ ์ ํ๋ค. <name|uid>[:<group|gid>]
- `-w`, `--workdir` ์คํ๋๋ ์์ ๊ฒฝ๋ก๋ฅผ ์ง์ ํ๋ค.

### ๐ ps

`ps` ๋ช๋ น์ด๋ continaer๋ก ๋ชฉ๋ก์ ํ์ธ ํ  ๋ ์ฌ์ฉ์ ํ๋ค.

```sh
# docker ps [OPTIONS]
docker ps -a
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-a`, `--all` ๋ชจ๋  container ๋ชฉ๋ก์ ์ถ๋ ฅ! (๊ธฐ๋ณธ๊ฐ์ ์๋ ์ค์ธ continer๋ง ์ถ๋ ฅํจ)

### ๐ images

`images` ๋ช๋ น์ด๋ images์ ๋ชฉ๋ก์ ํ์ธ๐ง๐ธ ํ  ๋ ์ฌ์ฉ์ ํ๋ค.

```sh
# docker images [OPTIONS] [REPOSITORY[:TAG]]
docker images -a
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-a`, `--all` ๋ชจ๋  images ๋ชฉ๋ก์ ์ถ๋ ฅ! (๊ธฐ๋ณธ๊ฐ์ ์ค๊ฐ layer ๋จ๊ณ์ images๋ ์จ๊น)

### ๐จ inspect

`inspect` ๋ช๋ น์ด๋ container object์ ์ ๋ณด๋ฅผ ์ถ๋ ฅ ํ  ๋ ์ฌ์ฉํ๋ค.

```sh
# docker inspect [OPTIONS] NAME|ID [NAME|ID...]
docker inspect testserver
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-f`, `--format` ์ต์๊ณผ ํจ๊ป ์ฃผ์ด์ง template ํํ๋ก ์ถ๋ ฅ๋ฅผ ํ๋ค.

### ๐ rm

`rm` ๋ช๋ น์ด๋ contiainer๋ฅผ ์ ๊ฑฐ ํ  ๋ ์ฌ์ฉํ๋ค.

```sh
# docker rm [OPTIONS] CONTAINER [CONTAINER...]
docker rm testserver
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-f`, `--force` ์๋ ์ค์ธ container์ฌ๋ SIGKILL๋ฅผ ๋ณด๋ด์ด ๊ฐ์ ๋ก ์ข๋ฃํ ์ญ์ ๋ฅผ ํ๋ค.

### โจ rmi

`rmi` ๋ช๋ น์ด๋ images๋ฅผ ์ ๊ฑฐ๋ฅผ ํ  ๋ ์ฌ์ฉํ๋ค.

```sh
# docker rmi [OPTIONS] IMAGE [IMAGE...]
docker rmi test
```

๊ธฐ๋ณธ์ ์ผ๋ก ์์ ๊ฐ์ ๊ตฌ์กฐ๋ก ์๋์ด ๋๋๋ฐ ์์ฃผ ์ฌ์ฉ ๋๋ ์ต์์ ๋ํด์๋ง ์ค๋ช์ ํ๋ค.

- `-f`, `--force` ๊ฐ์ ๋ก image๋ฅผ ์ ๊ฑฐํ๋ค.

### ๐ commit

`commit` ๋ช๋ น์ด๋ container์ ์ํ๋ฅผ ๊ฐ์ง๊ณ  ์๋ก์ด ์ด๋ฏธ์ง๋ฅผ ๋ง๋ค ๋ ์ฌ์ฉํ๋ค.

```sh
# docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
docker commit testserver testserver:v2
```

- `-a`, `--author` author์ ๋ํด ์ ์ ํ๋ค.
- `-c`, `--change` ์์ฑ๋ image์ Dockerfile ๋ช๋ น์ด๋ฅผ ์ ์ฉ.
- `-m`, `--message` ์ปค๋ฐ ๋ฉ์ธ์ง ์์ฑ.
- `-p`, `--pause` commit ์์ ์ container ์ผ์ ์ค๋จ. (Default true)

# ๐ณ Docker๋ฅผ Wordpress ์๋น์ค ์ง์  ๊ตฌํ!

์ด์  ์์์ ์ ๋ฆฌํ ๋ด์ฉ์ ๋ฐํ์ผ๋ก Wordpress ์๋น์ค๋ฅผ ์ง์  ๊ตฌํ์ ํ๋ค.!

์ผ๋จ ์์ ํ๊ธฐ ์ ์ ์๋์ ๊ฐ์ ์กฐ๊ฑด์ผ๋ก ๊ตฌํ์ ํ  ์์ ์ด๋ค.

- Docker Container ์์๋ web server๋ฅผ Nginx๋ก ์ฌ์ฉ์ ํ๊ณ , base Images๋ debian buster๋ก ์ค์ ํ๋ค.
- WebServer๋ ๋์์ ์ฌ๋ฌ๊ฐ์ง ์๋น์ค๋ฅผ ์คํ ํ๋ฉฐ, ์๋น์ค์ ๋ชฉ๋ก์ WordPress, phpMyAdmin, MySQL ์ด๋ค.
- WebServer๋ SSL protocol์ด ์ ์ฉ์ด ๋์ด์ผ ํ๋ค.
- Url์ ๋ฐ๋ผ์ ๊ฐ ์๋น์ค๋ก ์ฐ๊ฒฐ์ด ๋์ด์ผ ํ๋ค.
- ๋นํ์ฑํ๊ฐ ๊ฐ๋ฅํ autoindex๋ฅผ ์ด์ฉํ์ฌ ์๋น์ค๊ฐ ๋์ ํ๋์ง์ ๋ํด ํ์ธ์ด ๊ฐ๋ฅํด์ผ ํ๋ค.

## ๐ SSL ์ค์  ํ๊ธฐ!

์ผ๋จ `Makefile`๋ฅผ ๋จผ์  ๊ฐ๋จํ๊ฒ ์์ฑ์ ํด๋ณธ๋ค.

```dockerfile
FROM debian:buster
LABEL maintainer="jaeskim <jaeskim.student.42seoul.kr>"

# init setup
RUN apt update -y; apt upgrade -y

# install dependency
RUN apt install nginx curl -y
```

์ด๋ ๊ฒ ์์ฑํ dockerfile๋ฅผ ๊ฐ์ง๊ณ  ์ผ๋จ build๋ฅผ ํ์ฌ์ ๋ด๋ถ์ ์ ๊ทผํ์ฌ์ `SSL` ์ค์ ์ ์์ํ๋ค.

```sh
$ docker build --tag ft_server:v1 .
$ docker run -it --name ft_server ft_server:v1 /bin/bash
```

`SSL` ๋ฅผ ์ ์ฉ ํ๊ธฐ ์ํด์๋ ์ธ์ฆ์๊ฐ ํ์ํ๋ฐ ์ธ์ฆ์๋ฅผ CA์ ๋ฑ๋ก์ ํ์ฌ ์ฌ์ฉ์ ํ๊ฒ ๋๋ฉด ๋น์ฉ์ด ๋ฐ์ํ๋ฏ๋ก OpenSSL๋ฅผ ์ด์ฉํ์ฌ ์์ฒด ์๋ช ์ธ์ฆ์๋ฅผ ๋ฐ๊ธ ๋ฐ์์ ๊ตฌํ์ ํ๋ค.

SSL ์ธ์ฆ์๋ฅผ ๋ฐ๊ธ ๋ฐ๊ธฐ ์ํด์๋ ์๋์ ์ ์ฐจ๊ฐ ์งํ๋์ด์ผ ํ๋ค.

1. ๊ฐ์ธํค ์์ฑ

   ```sh
   openssl genrsa -out ft_server.localhost.key 4096
   ```

2. ๊ฐ์ธํค๋ฅผ ๊ฐ์ง๊ณ  ์์ฒด ์๋ช ์ธ์ฆ์ ์์ฑ

   ```sh
   openssl req -x509 -nodes -days 365 -key ft_server.localhost.key -out ft_server.localhost.crt -subj "/C=KR/ST=SEOUL/L=Gaepo-dong/O=42Seoul/OU=jaeskim/CN=localhost"
   ```

์ด์  ์์์ ๋ง๋  `ft_server.localhost.key`, `ft_server.localhost.crt` ํ์ผ์ `/etc/ssl/certs` ์ `/etc/ssl/private` ๊ฒฝ๋ก๋ก ์ด๋์ ์์ผ์ค๋ค.

๊ฐ ์ธ์ฆ์ ํ์ผ์ ๋ํ ๊ถํ์ `644` ๋ณ๊ฒฝ์ ํ์ฌ์ root ์์ ์ ๋ง์ด ์์ ์ด ๊ฐ๋ฅํ๋๋ก ํ๋ค.

์ด์  `/etc/nginx/sites-available/default` ํ์ผ์ ์๋์ ๊ฐ์ด ์์ ์ ํ๋ค.

```nginx
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	return 301 https://$host$request_uri;
}

server {
	listen 443 ssl default_server;
	listen [::]:443 ssl default_server;

	server_name _;

	ssl_certificate /etc/ssl/certs/ft_server.localhost.crt;
	ssl_certificate_key /etc/ssl/private/ft_server.localhost.key;

	root /var/www/html;

	index index.html index.htm index.nginx-debian.html;

	location / {
		try_files $uri $uri/ =404;
	}
}
```

`443` ์ผ๋ก ๋ค์ด์จ ์์ฒญ์ ์ค์ ํ `ssl_certificate`, `ssl_certificate_key` ํ์ผ๋ค์ ์ด์ฉํ์ฌ ssl ํต์ ์ ํ๊ฒ ๋๊ณ , ๊ธฐ์กด `80` ์ผ๋ก ๋ค์ด์จ ์์ฒญ์ `https` ์์ฒญ์ redirect ํ๋๋ก ํ์๋ค.

continer ๋ด๋ถ์์ ์์ ํ ํ์ผ์ continer ์ธ๋ถ๋ก ๋ณต์ฌํ๊ธฐ ์ํ์ฌ `docker cp` ๋ช๋ น์ด๋ฅผ ์ด์ฉํ์ฌ ์ธ๋ถ๋ก ํ์ผ์ ๊ฐ์ ธ์ค๊ณ  ์์์ ํ๋ ์์๋ค์ dockerfile์ ๋ค์ ์ ์๋ฅผ ํด์ฃผ์๋ค.

```dockerfile
FROM debian:buster
LABEL maintainer="jaeskim <jaeskim.student.42seoul.kr>"

# init setup
RUN apt update -y; apt upgrade -y

# install dependency
RUN apt install nginx vim curl -y

# environment
ENV AUTO_INDEX=false

# setup SSL
RUN openssl genrsa -out ft_server.localhost.key 4096; \
	openssl req -x509 -nodes -days 365 \
	-key ft_server.localhost.key \
	-out ft_server.localhost.crt \
	-subj "/C=KR/ST=SEOUL/L=Gaepo-dong/O=42Seoul/OU=jaeskim/CN=localhost"; \
	chmod 644 ft_server.localhost.*; \
	mv ft_server.localhost.crt /etc/ssl/certs/;	\
	mv ft_server.localhost.key /etc/ssl/private/;

COPY src/nginx-sites-available-default.conf /etc/nginx/sites-available/default
```

## ๐ ๋นํ์ฑํ๊ฐ ๊ฐ๋ฅํ autoindex ๊ธฐ๋ฅ ์ถ๊ฐ!

์ด๋ฒ์๋ ๋นํ์ฑํ๊ฐ ๊ฐ๋ฅํ autoindex ๊ธฐ๋ฅ์ ์ถ๊ฐ๋ฅผ ํด๋ณธ๋ค.

`cmd` ๋ฅผ ์ด์ฉํ์ฌ ๋นํ์ฑํ ํ๋๋ก ๋ง๋ค์ด ๋ณธ๋ค.

์ผ๋จ `server.sh` ํ์ผ์ ์์ฑ์ ํ๊ณ  `ENTRYPOINT` ๋ก ์ค์ ์ ํ๋ค.

```sh
#!/bin/bash

/bin/bash -C /setup_autoindex.sh $1

service nginx start

if [ $? -eq 0 ]; then
	tail -f /var/log/nginx/access.log /var/log/nginx/error.log
f
```

๊ทธ๋ฆฌ๊ณ  `setup_autoindex.sh` ์๊ฒ ์ฒซ๋ฒ์งธ ์ธ์๋ฅผ ๊ฐ์ด ์ ๋ฌํ์ฌ `cmd` ๋ฅผ ์ด์ฉํ์ฌ ์ ์ด๊ฐ ๊ฐ๋ฅํ๋๋ก ํ๋ค.

```sh
#!/bin/bash

# setup index.html
if [ -e "/var/www/html/index.nginx-debian.html" ]; then
	mv /var/www/html/index.nginx-debian.html /var/www/html/index.html
fi

if [ "$1" == "autoindex" ]; then
	echo "autoindex on!"
	sed -i "s@autoindex off;@autoindex on;@g" /etc/nginx/sites-available/default
	sed -i "s@index index.html index.htm;@index index.htm;@g" /etc/nginx/sites-available/default
else
	echo "autoindex off!"
	sed -i "s@autoindex on;@autoindex off;@g" /etc/nginx/sites-available/default
	sed -i "s@index index.htm;@index index.html index.htm;@g" /etc/nginx/sites-available/default
fi
```

์ด์  ๋น๋๋ฅผ ํ๊ณ  `run` ๋ฅผ ๋์ ํ  ๋ `autoindex` cmd๋ฅผ ๊ฐ์ด ๋ณด๋์ ๋์ ๋ํด์ ์ ๋๋ก ๋์ ํ๋์ง๋ฅผ ํ์ธ ํด๋ณธ๋ค.

```sh
$ docker run --rm -it --env AUTO_INDEX=true -p 443:443 -p 80:80 --name ft_server ft_server:v3 autoindex
```

![image-20201201012220274](image/docker๊ธฐ์ด๋ถํฐ-wordpress์๋น์ค-์ง์ ๊ตฌํ๊น์ง/image-20201201012220274.png)

![image-20201201012247664](image/docker๊ธฐ์ด๋ถํฐ-wordpress์๋น์ค-์ง์ ๊ตฌํ๊น์ง/image-20201201012247664.png)

## ๐ฆ mysqlDB(maria DB) ์ค์น ๋ฐ ์ค์  ํ๊ธฐ!

์ด๋ฒ์๋ wordpress๋ฅผ ์ํ DB๋ฅผ ์ค์ ํด ๋ณธ๋ค.

`apt install marinade-server` ๋ช๋ น์ด๋ฅผ ์ด์ฉํ์ฌ ์ค์น๋ฅผ ํ๋ค.

์ฌ๊ธฐ์ mariadb๋ฅผ ์ฌ์ฉํ๋ ์ด์ ๋ ๊ธฐ์กด mysql์ด Oracle๋ก ์ธ์๊ฐ ๋๋ฉด์ Fork๋์ด ์งํ๋๊ณ  ์๋ opensource ํ๋ก์ ํธ ์ด๋ค. (mysql๊ณผ ๋์ผํ ์์ค์ฝ๋๋ฅผ ๊ธฐ๋ฐ์ผ๋ก ํ์ฌ ๋๋ถ๋ถ์ ์์์ด ํธํ์ด ๋๋ค.)

Maria db๋ฅผ php์ ํจ๊ป ์ฌ์ฉ์ ํ๊ธฐ ์ํด์๋ ์ฌ๋ฌ๊ฐ์ง ๋ชจ๋์ด ํ์ํ๋ฐ ์ด์ ๋ฐ๋ฅธ ๋ชจ๋์ ์ค์นํ๋ค.

```sh
$ apt install php-mysql php-mbstring
```

- php-mysql : php์์ mysql๋ช๋ น์ด๋ฅผ ์คํํ๊ธฐ ์ํ ๋ชจ๋
- php-mbstring : ํ๊ตญ์ด, ์ค๊ตญ์ด, ์ผ๋ณธ์ด์ ๊ฐ์ multibyte ๋ฌธ์์ด์ ์ฒ๋ฆฌ ํ๊ธฐ ์ํด ์ฌ์ฉ๋๋ ๋ชจ๋

์ด์  `mysql service` ๋ฅผ ์์์ํค๊ณ  SQL ๋ช๋ น์ด์ ๋ํด์ ์์ฑ์ ํด๋ณธ๋ค.

```mysql
# wordpress db ์์ฑ
CREATE DATABASE wordpress;
# wordpress db๋ฅผ ์ฌ์ฉ
USE wordpress;
# jaeskim user๋ฅผ password `testpassword`์ผ๋ก ๋ง๋ค๊ณ  localhost์์๋ง ์ ๊ทผ์ด ๊ฐ๋ฅํ๋๋ก ํจ.
CREATE USER 'jaeskim'@'localhost' IDENTIFIED BY 'testpassword';
# jaeskim์๊ฒ wordpress db์ ๋ํ ๊ถํ์ ์ ๋ถ ์์
GRANT ALL PRIVILEGES ON wordpress.* TO 'jaeskim'@'localhost' WITH GRANT OPTION;
# ๊ถํ ์ค์  ์๋ฐ์ดํธ
FLUSH PRIVILEGES;
```

์ด์  ์ด๋ ๊ฒ ์์ฑํ ๋ด์ฉ์ ๋ฐํ์ผ๋ก ์ค์  dockerfile์ ์ ์ฉ์ ํด๋ณธ๋ค.

์ด๋ db_name, db_user, db_password์ ๋ํ ํญ๋ชฉ์ `ARG` ๋ช๋ น์ด๋ฅผ ์ด์ฉํ์ฌ ๊ด๋ฆฌ๋ฅผ ํ๋ค. (์ค์ ๋ก ์ํธ์ ๊ฐ์ ์ค์ ์ ๋ณด๋ `docker secret` ๋ช๋ น์ด๋ฅผ ์ด์ฉํ์ฌ ๊ด๋ฆฌํ๋ ๊ฒ์ด ๊ถ์ฅ๋จ.)

```dockerfile
# init arg
ARG WP_DB_NAME=wordpress
ARG WP_DB_USER=jaeskim
ARG WP_DB_PASSWORD=42seoul

# setup mysqlDB(mariaDB)
RUN service mysql start; \
	mysql -e "CREATE DATABASE ${WP_DB_NAME};\
	USE ${WP_DB_NAME}; \
	CREATE USER '${WP_DB_USER}'@'localhost' IDENTIFIED BY '${WP_DB_PASSWORD}'; \
	GRANT ALL PRIVILEGES ON ${WP_DB_NAME}.* TO '${WP_DB_USER}'@'localhost' WITH GRANT OPTION; \
	FLUSH PRIVILEGES;"
```

์์ ๊ฐ์ด `mysql -e` ์ `ARG` ๋ฅผ ์ด์ฉํ์ฌ mysql ์๋น์ค ๋ถ๋ถ์ ์์ฑํ์๋ค.

## ๐ wordpress ์๋น์ค ์ค์น ๋ฐ ์ค์ ํ๊ธฐ!

์ด์ ์ ์ค์นํ `curl` ๋ฅผ ์ด์ฉํ์ฌ https://wordpress.org/latest.tar.gz ๋ฅผ ๋ค์ด ๋ฐ์์ ์ค์น๋ฅผ ํด๋ณธ๋ค!!!

์ผ๋จ wordpress๋ฅผ ์ค์น ํ๊ธฐ ์ ์ nignix์์ php๋ฅผ ๋์ ํ  ์ ์๋๋ก ๋์ ์ฃผ๋ ๋ชจ๋์ธ `php-fpm` ๋ฅผ ์ค์น ํ์ฌ ์ฌ์ฉ์ ํ๋ค.

๊ทธ๋ฆฌ๊ณ  `niginx/sites-available/default` ํ์ผ์ ์์ ํ์ฌ์ php๊ฐ ๋์ ํ๋๋ก ์์ ์ ํ๋ค.

```nginx
index index.html index.htm index.php;

location ~ \.php$ {
	include snippets/fastcgi-php.conf;
	fastcgi_pass unix:/var/run/php/php7.3-fpm.sock;
}
```

์ด์  ๊ธฐ๋ณธ์ ์ธ ์ค๋น๊ฐ ๋๋ฌ์ผ๋ ์๋์ ๋ช๋ น์ด๋ฅผ ํตํด์ wordpress๋ฅผ ๋ค์ด ๋ฐ๊ณ  ์์ถ์ ํด์  ํ๋ค.

```sh
$ curl -O https://wordpress.org/latest.tar.gz
# ๋ค์ด ํ srcs๋ก ์ด๋์ ์์ผ์ค๋ค.
$ tar -xzf latest.tar.gz -C /var/www/html/
```

์ด์  ๋ด๋ถ์ ์กด์ฌํ๋ `wp-config-sample.php` sed ๋ช๋ น์ด๋ฅผ ํตํด์ ์์ ์ ํด๋ณธ๋ค.

![image-20201201190619006](image/docker๊ธฐ์ด๋ถํฐ-wordpress์๋น์ค-์ง์ ๊ตฌํ๊น์ง/image-20201201190619006.png)

๋ด๋ถ๋ฅผ ๋ณด๊ฒ ๋๋ฉด ๊ธฐ๋ณธ์ ์ผ๋ก ์ ์ ํด์ผ ํ๋ DB ์ ๋ณด๊ฐ ์๋๋ฐ ์ด ๋ถ๋ถ์ ์๊น์ ์ mysql๋ฅผ ์ค์  ํ๋ฉด์ ์ฌ์ฉ ํ์๋ ๋ณ์๋ฅผ ์ด์ฉํ์ฌ ์์ ์ ํ๋๋ก ํ๋ค.!

```dockerfile
RUN mv /var/www/html/wordpress/wp-config-sample.php /var/www/html/wordpress/wp-config.php; \
	sed -i "s/database_name_here/${WP_DB_NAME}/g" /var/www/html/wordpress/wp-config.php; \
	sed -i "s/username_here/${WP_DB_USER}/g" /var/www/html/wordpress/wp-config.php; \
	sed -i "s/password_here/${WP_DB_PASSWORD}/g" /var/www/html/wordpress/wp-config.php
```

๊ทธ๋ฆฌ๊ณ  ์๋์ ๊ฐ์ด ์ฌ๋ฌ๊ฐ์ง key, salt ๊ฐ์ ์ ์ ํ๋ ๋ถ๋ถ์ด ์๋๋ฐ ์ด๊ฒ์ `/dev/null` ๋ฅผ ์ด์ฉํ์ฌ์ ์ฑ์์ค๋ค.

![image-20201201192914636](image/docker๊ธฐ์ด๋ถํฐ-wordpress์๋น์ค-์ง์ ๊ตฌํ๊น์ง/image-20201201192914636.png)

```sh
wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'AUTH_KEY',         'put your unique phrase here' );/define( 'AUTH_KEY', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'SECURE_AUTH_KEY',  'put your unique phrase here' );/define( 'SECURE_AUTH_KEY', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'LOGGED_IN_KEY',    'put your unique phrase here' );/define( 'LOGGED_IN_KEY', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'NONCE_KEY',        'put your unique phrase here' );/define( 'NONCE_KEY', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'AUTH_SALT',        'put your unique phrase here' );/define( 'AUTH_SALT', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );/define( 'SECURE_AUTH_SALT', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'LOGGED_IN_SALT',   'put your unique phrase here' );/define( 'LOGGED_IN_SALT', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	wp_salt=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s/define( 'NONCE_SALT',       'put your unique phrase here' );/define( 'NONCE_SALT', '$wp_salt' );/g" /var/www/html/wordpress/wp-config.php; \
	unset wp_salt
```

์ด์  ์ ๋ฒ์ ์์ฑํ `src/server.sh` ํ์ผ์ ์์ ํ์ฌ์ `mysql`, `php-fpm` ๋ฑ๋ ๊ฐ์ด ์คํ์ด ๊ฐ๋ฅํ๋๋ก ์ค์ ์ ํ๋ค.

```sh
#!/bin/bash

/bin/bash -C /setup_autoindex.sh $1

service mysql start
service php7.3-fpm start
service nginx start

if [ $? -eq 0 ]; then
	tail -f /var/log/nginx/access.log /var/log/nginx/error.log
fi
```

์ด์  dockerfile๋ก ์ ๋ฆฌํ์ฌ์ ์๋น์ค๋ฅผ ์คํํด ๋ณธ๋ค.!

```sh
$ docker run --rm -it -p 443:443 -p 80:80 --name ft_server ft_server
```

`https://localhost/wordpress` ๋ก ์ ๊ทผ์ ํด๋ณด๋ฉด ์๋์ ๊ฐ์ด wordpress๊ฐ ์ ์์ ์ผ๋ก ์ฌ๋ผ์จ ๊ฒ์ ๋ณผ ์ ์๋ค.

![image-20201201193659307](image/docker๊ธฐ์ด๋ถํฐ-wordpress์๋น์ค-์ง์ ๊ตฌํ๊น์ง/image-20201201193659307.png)

## ๐งโ๐ป phpmyadmin ์ค์น ํ๊ธฐ!

์ด์  ๋ง์ง๋ง์ผ๋ก db๊ด๋ฆฌ๋ฅผ ์ํ `phpmyadmin` ๋ฅผ ์ค์น ํด๋ณธ๋ค.

Curl ๋ช๋ น์ด๋ฅผ ์ด์ฉํ์ฌ ์ผ๋จ phpmyadmin๋ฅผ ๋ค์ด ๋ฐ๋๋ค.

```dockerfile
RUN curl -O https://files.phpmyadmin.net/phpMyAdmin/5.0.4/phpMyAdmin-5.0.4-all-languages.tar.gz
```

๊ทธ๋ฆฌ๊ณ  ์ด์  ์์ถ์ ํด์ ํ๊ณ  ์์ฑ๋ ํด๋์ ์ด๋ฆ์ ์์ ํด์ค ํ `config.sample.inc.php` ๋ฅผ ์ด์ฉํ์ฌ ๊ฐ๋จํ๊ฒ ์ค์ ์ ํด๋ณธ๋ค.

์ฌ๊ธฐ์๋ `blowfish_secret` ๋ผ๋ cookie๋ฅผ ์ํธํ ํ๊ฒ ๋๋ ํค๋ฅผ ๋ง๋ค์ด์ ๋ฃ์ด์ฃผ๊ฒ ๋๋ค.

```sh
blowfish_secret=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#\%+=' | fold -w 64 | sed 1q); \
	sed -i "s@''; /\* YOU MUST FILL IN THIS FOR COOKIE AUTH! \*/@'$blowfish_secret';@g" /var/www/html/phpmyadmin/config.inc.php; \
	unset blowfish_secret;
```

๊ทธ๋ฆฌ๊ณ  ๋ง์ง๋ง์ผ๋ก ํ์ฌ `/var/www/html` ์ด `root` ์์ ์๋ก ๋ฑ๋ก์ด ๋์ด ์์ด์ `phpmyadmin` ์์ temp directory๋ฅผ ์์ฑ์ ๋ชปํ๋ ์ด์๊ฐ ์๊ธฐ ๋๋ฌธ์ ๊ถํ์ `www-data:www-data` ๋ก ์์ ์ ํด์ค๋ค.

![image-20201201194547831](image/docker๊ธฐ์ด๋ถํฐ-wordpress์๋น์ค-์ง์ ๊ตฌํ๊น์ง/image-20201201194547831.png)

์ด์  ์ ๊ทผ์ ํ๊ฒ ๋๋ฉด ์์์ ๋ง๋ค์๋ ๊ณ์ ์ ํตํด์ ๋ก๊ทธ์ธ์ด ๊ฐ๋ฅ ํ ๋ชจ์ต์ ๋ณผ ์ ์๋ค.

---

> `42Seoul` ์์ ์งํํ **ft_server** ํ๋ก์ ํธ๋ฅผ ์ ๋ฆฌํ ๊ธ ์๋๋ค.
> ์ฌ๊ธฐ์ ์งํ๋ Dockerfile๊ณผ src ํ์ผ์ ์๋์ github์์ ํ์ธ ํ  ์ ์์ต๋๋ค.!
>
> [jaeseokim/42cursus/02_ft_server](https://github.com/JaeSeoKim/42cursus/tree/master/02_ft_server)
